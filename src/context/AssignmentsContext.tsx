"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  Assignment,
  StudentAssignmentRecord,
  StaffAssignmentFormData,
  AssignmentAttachment,
} from "@/types/assignment";
import { Subject } from "@/types";
import { PILOT_SUBJECTS } from "@/data/attendanceData";
import { SEED_ASSIGNMENTS, SEED_STUDENT_STATUSES } from "@/data/assignmentData";
import { getTodayDateString, isAssignmentOverdue } from "@/lib/assignmentUtils";

export interface StudentAssignmentStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
}

export interface StaffAssignmentStats {
  total: number;
  published: number;
  draft: number;
  totalAttachments: number;
}

interface AssignmentsContextType {
  // General & Subjects
  subjects: Subject[];
  isHydrated: boolean;

  // Student-facing data & operations (Published only)
  publishedAssignments: Assignment[];
  isStudentCompleted: (assignmentId: string) => boolean;
  toggleStudentCompletion: (assignmentId: string) => void;
  studentStats: StudentAssignmentStats;
  upcomingPendingAssignments: Assignment[];

  // Staff-facing data & operations (All assignments: Published + Draft)
  allAssignments: Assignment[];
  staffStats: StaffAssignmentStats;
  createStaffAssignment: (data: StaffAssignmentFormData) => { success: boolean; error?: string };
  editStaffAssignment: (id: string, data: StaffAssignmentFormData) => { success: boolean; error?: string };
  deleteStaffAssignment: (id: string) => { success: boolean };
  togglePublishStatus: (id: string) => void;

  // Reset to default seed dataset
  resetToDefaultSeed: () => void;
}

const STORAGE_KEY_ASSIGNMENTS = "campusiq_assignments_catalog_v2";
const STORAGE_KEY_STUDENT_STATUS = "campusiq_student_status_v2";

const AssignmentsContext = createContext<AssignmentsContextType | undefined>(undefined);

export function AssignmentsProvider({ children }: { children: React.ReactNode }) {
  const [subjects] = useState<Subject[]>(PILOT_SUBJECTS);
  const [assignments, setAssignments] = useState<Assignment[]>(SEED_ASSIGNMENTS);
  const [studentStatuses, setStudentStatuses] = useState<StudentAssignmentRecord[]>(SEED_STUDENT_STATUSES);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedAssignments = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
        if (storedAssignments) {
          const parsed = JSON.parse(storedAssignments);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAssignments(parsed);
          }
        }

        const storedStatuses = localStorage.getItem(STORAGE_KEY_STUDENT_STATUS);
        if (storedStatuses) {
          const parsed = JSON.parse(storedStatuses);
          if (Array.isArray(parsed)) {
            setStudentStatuses(parsed);
          }
        }
      }
    } catch (e) {
      console.warn("Could not read local assignments storage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist assignments
  const persistAssignments = useCallback((newAssignments: Assignment[]) => {
    setAssignments(newAssignments);
    try {
      if (typeof window !== "undefined") {
        // We persist metadata and dataUrl references, never raw heavy Blobs in localStorage
        localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(newAssignments));
      }
    } catch (e) {
      console.error("Failed to save assignments catalog to local storage:", e);
    }
  }, []);

  // Persist student statuses
  const persistStudentStatuses = useCallback((newStatuses: StudentAssignmentRecord[]) => {
    setStudentStatuses(newStatuses);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_STUDENT_STATUS, JSON.stringify(newStatuses));
      }
    } catch (e) {
      console.error("Failed to save student completion statuses to local storage:", e);
    }
  }, []);

  // Check if student completed an assignment
  const isStudentCompleted = useCallback(
    (assignmentId: string): boolean => {
      const rec = studentStatuses.find((s) => s.assignmentId === assignmentId);
      return Boolean(rec && rec.isCompleted);
    },
    [studentStatuses]
  );

  // Student toggle completion
  const toggleStudentCompletion = useCallback(
    (assignmentId: string) => {
      const existing = studentStatuses.find((s) => s.assignmentId === assignmentId);
      let updated: StudentAssignmentRecord[];

      if (existing) {
        const nextState = !existing.isCompleted;
        updated = studentStatuses.map((s) =>
          s.assignmentId === assignmentId
            ? {
                ...s,
                isCompleted: nextState,
                completedAt: nextState ? new Date().toISOString() : undefined,
              }
            : s
        );
      } else {
        updated = [
          ...studentStatuses,
          {
            assignmentId,
            studentId: "std-alex",
            isCompleted: true,
            completedAt: new Date().toISOString(),
          },
        ];
      }

      persistStudentStatuses(updated);
    },
    [studentStatuses, persistStudentStatuses]
  );

  // Student-facing: ONLY PUBLISHED assignments
  const publishedAssignments = useMemo(() => {
    return assignments.filter((a) => a.isPublished);
  }, [assignments]);

  // Student Stats (Published assignments only!)
  const studentStats: StudentAssignmentStats = useMemo(() => {
    const todayStr = getTodayDateString();
    let pending = 0;
    let completed = 0;
    let overdue = 0;

    for (const a of publishedAssignments) {
      const isDone = isStudentCompleted(a.id);
      if (isDone) {
        completed += 1;
      } else {
        pending += 1;
        if (isAssignmentOverdue(a.dueDate, false, todayStr)) {
          overdue += 1;
        }
      }
    }

    return {
      total: publishedAssignments.length,
      pending,
      completed,
      overdue,
    };
  }, [publishedAssignments, isStudentCompleted]);

  // Upcoming pending assignments for Home Dashboard (max 3, nearest due date first)
  const upcomingPendingAssignments = useMemo(() => {
    return publishedAssignments
      .filter((a) => !isStudentCompleted(a.id))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 3);
  }, [publishedAssignments, isStudentCompleted]);

  // Staff Stats
  const staffStats: StaffAssignmentStats = useMemo(() => {
    let published = 0;
    let draft = 0;
    let totalAttachments = 0;

    for (const a of assignments) {
      if (a.isPublished) published += 1;
      else draft += 1;
      totalAttachments += a.attachments ? a.attachments.length : 0;
    }

    return {
      total: assignments.length,
      published,
      draft,
      totalAttachments,
    };
  }, [assignments]);

  // Validation helper for staff creation/editing
  const validateStaffData = (data: StaffAssignmentFormData): string | null => {
    if (!data.title || !data.title.trim()) {
      return "Assignment title is required.";
    }
    if (!data.subjectId) {
      return "Please select a course subject.";
    }
    const subj = subjects.find((s) => s.id === data.subjectId);
    if (!subj) {
      return "Selected subject is invalid.";
    }
    if (!data.assignedDate) {
      return "Assigned date is required.";
    }
    if (!data.dueDate) {
      return "Due date is required.";
    }
    if (data.dueDate < data.assignedDate) {
      return "Due date cannot be earlier than assigned date.";
    }
    if (!["Low", "Medium", "High"].includes(data.priority)) {
      return "Invalid priority selected.";
    }
    return null;
  };

  // Staff: Create Assignment
  const createStaffAssignment = (data: StaffAssignmentFormData) => {
    const error = validateStaffData(data);
    if (error) {
      return { success: false, error };
    }

    const subj = subjects.find((s) => s.id === data.subjectId)!;
    const newAssignment: Assignment = {
      id: `asg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : "",
      subjectId: data.subjectId,
      subjectName: subj.name,
      subjectCode: subj.code,
      assignedDate: data.assignedDate,
      dueDate: data.dueDate,
      priority: data.priority,
      isPublished: Boolean(data.isPublished),
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || "Authorized Faculty (UIT RGPV)",
    };

    const updated = [newAssignment, ...assignments];
    persistAssignments(updated);
    return { success: true };
  };

  // Staff: Edit Assignment
  const editStaffAssignment = (id: string, data: StaffAssignmentFormData) => {
    const error = validateStaffData(data);
    if (error) {
      return { success: false, error };
    }

    const subj = subjects.find((s) => s.id === data.subjectId)!;
    const index = assignments.findIndex((a) => a.id === id);
    if (index === -1) {
      return { success: false, error: "Assignment not found." };
    }

    const updated = [...assignments];
    updated[index] = {
      ...updated[index],
      title: data.title.trim(),
      description: data.description ? data.description.trim() : "",
      subjectId: data.subjectId,
      subjectName: subj.name,
      subjectCode: subj.code,
      assignedDate: data.assignedDate,
      dueDate: data.dueDate,
      priority: data.priority,
      isPublished: Boolean(data.isPublished),
      attachments: data.attachments || [],
      updatedAt: new Date().toISOString(),
    };

    persistAssignments(updated);
    return { success: true };
  };

  // Staff: Delete Assignment
  const deleteStaffAssignment = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    persistAssignments(updated);

    // Also cleanup student completion record if any
    const updatedStatuses = studentStatuses.filter((s) => s.assignmentId !== id);
    persistStudentStatuses(updatedStatuses);

    return { success: true };
  };

  // Staff: Toggle Publication
  const togglePublishStatus = (id: string) => {
    const updated = assignments.map((a) => {
      if (a.id === id) {
        return { ...a, isPublished: !a.isPublished, updatedAt: new Date().toISOString() };
      }
      return a;
    });
    persistAssignments(updated);
  };

  // Reset to seed
  const resetToDefaultSeed = () => {
    persistAssignments(SEED_ASSIGNMENTS);
    persistStudentStatuses(SEED_STUDENT_STATUSES);
  };

  return (
    <AssignmentsContext.Provider
      value={{
        subjects,
        isHydrated,

        publishedAssignments,
        isStudentCompleted,
        toggleStudentCompletion,
        studentStats,
        upcomingPendingAssignments,

        allAssignments: assignments,
        staffStats,
        createStaffAssignment,
        editStaffAssignment,
        deleteStaffAssignment,
        togglePublishStatus,

        resetToDefaultSeed,
      }}
    >
      {children}
    </AssignmentsContext.Provider>
  );
}

export function useAssignments() {
  const context = useContext(AssignmentsContext);
  if (!context) {
    throw new Error("useAssignments must be used within an AssignmentsProvider");
  }
  return context;
}
