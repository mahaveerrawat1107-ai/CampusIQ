"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Assignment, AssignmentFormData } from "@/types/assignment";
import { Subject } from "@/types";
import { PILOT_SUBJECTS } from "@/data/attendanceData";
import { SEED_ASSIGNMENTS } from "@/data/assignmentData";
import { getTodayDateString, isAssignmentOverdue } from "@/lib/assignmentUtils";

export interface AssignmentStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
}

interface AssignmentsContextType {
  assignments: Assignment[];
  subjects: Subject[];
  isHydrated: boolean;
  stats: AssignmentStats;
  upcomingPendingAssignments: Assignment[];
  addAssignment: (data: AssignmentFormData) => { success: boolean; error?: string };
  editAssignment: (id: string, data: AssignmentFormData) => { success: boolean; error?: string };
  deleteAssignment: (id: string) => { success: boolean };
  toggleAssignmentStatus: (id: string) => void;
  resetToDefaultSeed: () => void;
}

const STORAGE_KEY = "campusiq_assignments_v1";

const AssignmentsContext = createContext<AssignmentsContextType | undefined>(undefined);

export function AssignmentsProvider({ children }: { children: React.ReactNode }) {
  const [subjects] = useState<Subject[]>(PILOT_SUBJECTS);
  const [assignments, setAssignments] = useState<Assignment[]>(SEED_ASSIGNMENTS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted records from localStorage after client hydration
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAssignments(parsed);
          }
        }
      }
    } catch (e) {
      console.warn("Could not read local assignments storage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage
  const persistAssignments = useCallback((newAssignments: Assignment[]) => {
    setAssignments(newAssignments);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssignments));
      }
    } catch (e) {
      console.error("Failed to save assignments to local storage:", e);
    }
  }, []);

  // Stats calculation
  const stats: AssignmentStats = useMemo(() => {
    const todayStr = getTodayDateString();
    let pending = 0;
    let completed = 0;
    let overdue = 0;

    for (const a of assignments) {
      if (a.status === "Completed") {
        completed += 1;
      } else {
        pending += 1;
        if (isAssignmentOverdue(a, todayStr)) {
          overdue += 1;
        }
      }
    }

    return {
      total: assignments.length,
      pending,
      completed,
      overdue,
    };
  }, [assignments]);

  // Upcoming pending assignments for Home Dashboard (max 3, nearest due date first)
  const upcomingPendingAssignments = useMemo(() => {
    return assignments
      .filter((a) => a.status === "Pending")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 3);
  }, [assignments]);

  // Validation helper
  const validateAssignmentData = (data: AssignmentFormData): string | null => {
    if (!data.title || !data.title.trim()) {
      return "Assignment title is required.";
    }
    if (!data.subjectId) {
      return "Please select a subject.";
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
      return "Due date cannot be earlier than the assigned date.";
    }
    if (!["Low", "Medium", "High"].includes(data.priority)) {
      return "Invalid priority selected.";
    }
    return null;
  };

  const addAssignment = (data: AssignmentFormData) => {
    const error = validateAssignmentData(data);
    if (error) {
      return { success: false, error };
    }

    const subj = subjects.find((s) => s.id === data.subjectId)!;
    const newAssignment: Assignment = {
      id: `asg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : "",
      subjectId: data.subjectId,
      subjectName: subj.name,
      subjectCode: subj.code,
      assignedDate: data.assignedDate,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
      createdAt: new Date().toISOString(),
    };

    const updated = [newAssignment, ...assignments];
    persistAssignments(updated);
    return { success: true };
  };

  const editAssignment = (id: string, data: AssignmentFormData) => {
    const error = validateAssignmentData(data);
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
      status: data.status,
    };

    persistAssignments(updated);
    return { success: true };
  };

  const deleteAssignment = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    persistAssignments(updated);
    return { success: true };
  };

  const toggleAssignmentStatus = (id: string) => {
    const updated = assignments.map((a) => {
      if (a.id === id) {
        const nextStatus = a.status === "Completed" ? "Pending" : "Completed";
        return { ...a, status: nextStatus as "Pending" | "Completed" };
      }
      return a;
    });
    persistAssignments(updated);
  };

  const resetToDefaultSeed = () => {
    persistAssignments(SEED_ASSIGNMENTS);
  };

  return (
    <AssignmentsContext.Provider
      value={{
        assignments,
        subjects,
        isHydrated,
        stats,
        upcomingPendingAssignments,
        addAssignment,
        editAssignment,
        deleteAssignment,
        toggleAssignmentStatus,
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
