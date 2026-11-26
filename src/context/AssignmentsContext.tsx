"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  Assignment,
  StudentAssignmentRecord,
  StaffAssignmentFormData,
  AssignmentAttachment,
  AssignmentPriority,
} from "@/types/assignment";
import { Subject } from "@/types";
import { PILOT_SUBJECTS } from "@/data/attendanceData";
import { SEED_ASSIGNMENTS, SEED_STUDENT_STATUSES } from "@/data/assignmentData";
import { getTodayDateString, isAssignmentOverdue } from "@/lib/assignmentUtils";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

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
  toggleStudentCompletion: (assignmentId: string) => Promise<void>;
  studentStats: StudentAssignmentStats;
  upcomingPendingAssignments: Assignment[];

  // Staff-facing data & operations (All assignments: Published + Draft)
  allAssignments: Assignment[];
  staffStats: StaffAssignmentStats;
  createStaffAssignment: (data: StaffAssignmentFormData) => { success: boolean; error?: string };
  editStaffAssignment: (id: string, data: StaffAssignmentFormData) => { success: boolean; error?: string };
  deleteStaffAssignment: (id: string) => { success: boolean };
  togglePublishStatus: (id: string) => void;

  // Reset / Refresh
  refreshAssignments: () => Promise<void>;
  resetToDefaultSeed: () => void;
}

const AssignmentsContext = createContext<AssignmentsContextType | undefined>(undefined);

export function AssignmentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [supabase] = useState(() => createClient());
  const [subjects] = useState<Subject[]>(PILOT_SUBJECTS);
  const [assignments, setAssignments] = useState<Assignment[]>(SEED_ASSIGNMENTS);
  const [studentStatuses, setStudentStatuses] = useState<StudentAssignmentRecord[]>(SEED_STUDENT_STATUSES);
  const [isHydrated, setIsHydrated] = useState(false);

  // Fetch from Supabase
  const fetchSupabaseAssignments = useCallback(async () => {
    try {
      // 1. Fetch assignments
      const { data: dbAssignments, error: aErr } = await supabase
        .from("assignments")
        .select(`
          id,
          title,
          description,
          subject_id,
          class_id,
          assigned_date,
          due_date,
          priority,
          is_published,
          created_by,
          created_at,
          updated_at,
          assignment_attachments (
            id,
            file_name,
            file_type,
            mime_type,
            file_size,
            storage_path,
            uploaded_at
          )
        `);

      if (!aErr && dbAssignments && dbAssignments.length > 0) {
        const mapped: Assignment[] = dbAssignments.map((db) => {
          const subj = PILOT_SUBJECTS.find((s) => s.id === db.subject_id);
          const attachments: AssignmentAttachment[] = (db.assignment_attachments || []).map((att: any) => ({
            id: att.id,
            name: att.file_name,
            fileType: att.file_type as any,
            mimeType: att.mime_type,
            fileSize: att.file_size || 0,
            fileSizeFormatted: `${((att.file_size || 0) / (1024 * 1024)).toFixed(1)} MB`,
            uploadedAt: att.uploaded_at,
            storageKey: att.storage_path,
          }));

          let mappedPriority: AssignmentPriority = "Medium";
          if (db.priority) {
            const p = db.priority.toLowerCase();
            if (p === "high" || p === "urgent") mappedPriority = "High";
            else if (p === "low") mappedPriority = "Low";
          }

          return {
            id: db.id,
            title: db.title,
            description: db.description || "",
            subjectId: db.subject_id || "",
            subjectName: subj?.name || "General Subject",
            subjectCode: subj?.code || "GEN",
            assignedDate: db.assigned_date || getTodayDateString(),
            dueDate: db.due_date || getTodayDateString(),
            priority: mappedPriority,
            isPublished: db.is_published,
            attachments,
            createdAt: db.created_at,
            updatedAt: db.updated_at,
            createdBy: "Faculty / Academic Dept",
          };
        });
        setAssignments(mapped);
      }

      // 2. Fetch student completion statuses
      if (user) {
        const { data: dbStatuses, error: sErr } = await supabase
          .from("student_assignment_status")
          .select("assignment_id, student_id, is_completed, completed_at")
          .eq("student_id", user.id);

        if (!sErr && dbStatuses) {
          setStudentStatuses(
            dbStatuses.map((s) => ({
              assignmentId: s.assignment_id,
              studentId: s.student_id,
              isCompleted: s.is_completed,
              completedAt: s.completed_at || undefined,
            }))
          );
        }
      }
    } catch (err) {
      console.warn("Could not fetch assignments from Supabase, preserving active state:", err);
    } finally {
      setIsHydrated(true);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchSupabaseAssignments();
  }, [fetchSupabaseAssignments]);

  // Check if student completed an assignment
  const isStudentCompleted = useCallback(
    (assignmentId: string): boolean => {
      const rec = studentStatuses.find((s) => s.assignmentId === assignmentId);
      return Boolean(rec && rec.isCompleted);
    },
    [studentStatuses]
  );

  // Student toggle completion with Supabase cloud persistence & optimistic update
  const toggleStudentCompletion = useCallback(
    async (assignmentId: string) => {
      const existing = studentStatuses.find((s) => s.assignmentId === assignmentId);
      const nextState = existing ? !existing.isCompleted : true;
      const completedAt = nextState ? new Date().toISOString() : undefined;

      // Optimistic update
      let updated: StudentAssignmentRecord[];
      if (existing) {
        updated = studentStatuses.map((s) =>
          s.assignmentId === assignmentId
            ? { ...s, isCompleted: nextState, completedAt }
            : s
        );
      } else {
        updated = [
          ...studentStatuses,
          {
            assignmentId,
            studentId: user?.id || "student",
            isCompleted: true,
            completedAt,
          },
        ];
      }
      setStudentStatuses(updated);

      // Persist to Supabase if authenticated
      if (user) {
        try {
          const { error } = await supabase
            .from("student_assignment_status")
            .upsert(
              {
                assignment_id: assignmentId,
                student_id: user.id,
                is_completed: nextState,
                completed_at: completedAt,
              },
              { onConflict: "assignment_id,student_id" }
            );

          if (error) {
            console.error("Failed to persist assignment status to Supabase:", error);
            // Rollback optimistic update
            setStudentStatuses(studentStatuses);
          }
        } catch (err) {
          console.error("Exception persisting assignment status:", err);
          setStudentStatuses(studentStatuses);
        }
      }
    },
    [studentStatuses, user, supabase]
  );

  // Student-facing: ONLY PUBLISHED assignments
  const publishedAssignments = useMemo(() => {
    return assignments.filter((a) => a.isPublished);
  }, [assignments]);

  // Student Stats (Published assignments only)
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
      totalAttachments += (a.attachments || []).length;
    }

    return {
      total: assignments.length,
      published,
      draft,
      totalAttachments,
    };
  }, [assignments]);

  // Validation
  const validateStaffData = (data: StaffAssignmentFormData): string | null => {
    if (!data.title || data.title.trim().length === 0) return "Assignment title is required.";
    if (!data.subjectId) return "Target subject is required.";
    if (!data.dueDate) return "Submission due date is required.";
    if (!data.assignedDate) return "Assigned issue date is required.";
    return null;
  };

  // Staff: Create Assignment
  const createStaffAssignment = (data: StaffAssignmentFormData) => {
    const error = validateStaffData(data);
    if (error) return { success: false, error };

    const subj = subjects.find((s) => s.id === data.subjectId)!;
    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
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
      createdBy: data.createdBy || "CSE Faculty",
    };

    setAssignments([newAssignment, ...assignments]);
    return { success: true };
  };

  // Staff: Edit Assignment
  const editStaffAssignment = (id: string, data: StaffAssignmentFormData) => {
    const error = validateStaffData(data);
    if (error) return { success: false, error };

    const subj = subjects.find((s) => s.id === data.subjectId)!;
    const index = assignments.findIndex((a) => a.id === id);
    if (index === -1) return { success: false, error: "Assignment not found." };

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

    setAssignments(updated);
    return { success: true };
  };

  // Staff: Delete Assignment
  const deleteStaffAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id));
    setStudentStatuses(studentStatuses.filter((s) => s.assignmentId !== id));
    return { success: true };
  };

  // Staff: Toggle Publication
  const togglePublishStatus = (id: string) => {
    setAssignments(
      assignments.map((a) =>
        a.id === id
          ? { ...a, isPublished: !a.isPublished, updatedAt: new Date().toISOString() }
          : a
      )
    );
  };

  const resetToDefaultSeed = () => {
    setAssignments(SEED_ASSIGNMENTS);
    setStudentStatuses(SEED_STUDENT_STATUSES);
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

        refreshAssignments: fetchSupabaseAssignments,
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
