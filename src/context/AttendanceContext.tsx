"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Subject } from "@/types";
import { PILOT_SUBJECTS } from "@/data/attendanceData";
import { AttendanceRecord, mapAttendanceLogRow } from "@/types/attendance";
import { useAuth } from "@/context/AuthContext";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import {
  calculateAttendanceMetrics,
  AttendanceMetrics,
} from "@/lib/attendanceCalculations";

export interface SubjectSummaryWithMeta extends AttendanceMetrics {
  subject: Subject;
}

export interface SaveAttendanceResult {
  success: boolean;
  createdCount: number;
  updatedCount: number;
  message: string;
}

interface AttendanceContextType {
  subjects: Subject[];
  records: AttendanceRecord[];
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  overallSummary: AttendanceMetrics;
  subjectSummaries: SubjectSummaryWithMeta[];
  saveAttendance: (
    sessionDate: string,
    marks: Array<{ subjectId: string; status: "present" | "absent" }>
  ) => Promise<SaveAttendanceResult>;
  deleteRecord: (id: string) => Promise<{ success: boolean; message: string }>;
  refreshAttendance: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [subjects] = useState<Subject[]>(PILOT_SUBJECTS);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const [supabase] = useState(() => createBrowserClient());

  // Subject quick-lookup map
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    for (const subj of subjects) {
      map.set(subj.id, subj);
    }
    return map;
  }, [subjects]);

  // Load records from Supabase for authenticated student
  const refreshAttendance = useCallback(async () => {
    if (!user) {
      setRecords([]);
      setIsLoading(false);
      setIsHydrated(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from("student_attendance_logs")
        .select("*")
        .eq("student_id", user.id)
        .order("session_date", { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }

      if (data) {
        const mappedRecords: AttendanceRecord[] = data.map((row) =>
          mapAttendanceLogRow(row, subjectMap)
        );
        setRecords(mappedRecords);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load attendance records.";
      console.error("Attendance fetch error:", msg);
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  }, [user, supabase, subjectMap]);

  useEffect(() => {
    refreshAttendance();
  }, [refreshAttendance]);

  // Compute overall summary across all subjects
  const overallSummary = useMemo(() => {
    let totalPresent = 0;
    const totalHeld = records.length;

    for (const r of records) {
      if (r.status === "present") {
        totalPresent += 1;
      }
    }

    return calculateAttendanceMetrics(totalPresent, totalHeld, 75);
  }, [records]);

  // Compute per-subject summaries
  const subjectSummaries = useMemo(() => {
    return subjects.map((subj) => {
      const subjRecords = records.filter((r) => r.subjectId === subj.id);
      const totalHeld = subjRecords.length;
      let present = 0;
      for (const r of subjRecords) {
        if (r.status === "present") present += 1;
      }

      const metrics = calculateAttendanceMetrics(present, totalHeld, 75);
      return {
        ...metrics,
        subject: subj,
      };
    });
  }, [subjects, records]);

  // Mark/save attendance for a given date (Create / Update in Supabase)
  const saveAttendance = async (
    sessionDate: string,
    marks: Array<{ subjectId: string; status: "present" | "absent" }>
  ): Promise<SaveAttendanceResult> => {
    if (!user) {
      return {
        success: false,
        createdCount: 0,
        updatedCount: 0,
        message: "You must be signed in to save attendance.",
      };
    }

    if (!sessionDate || marks.length === 0) {
      return {
        success: false,
        createdCount: 0,
        updatedCount: 0,
        message: "No subjects selected or invalid date.",
      };
    }

    try {
      setError(null);

      // Check which marks are updates vs new inserts
      const existingDateRecords = records.filter((r) => r.sessionDate === sessionDate);
      const existingSubjectIds = new Set(existingDateRecords.map((r) => r.subjectId));

      let updatedCount = 0;
      let createdCount = 0;

      for (const m of marks) {
        if (existingSubjectIds.has(m.subjectId)) {
          updatedCount++;
        } else {
          createdCount++;
        }
      }

      // Prepare payload with student_id = auth.uid()
      const payload = marks.map((m) => ({
        student_id: user.id,
        subject_id: m.subjectId,
        session_date: sessionDate,
        status: m.status,
      }));

      // Upsert using the PostgreSQL UNIQUE constraint (student_id, subject_id, session_date)
      const { error: upsertErr } = await supabase
        .from("student_attendance_logs")
        .upsert(payload, { onConflict: "student_id,subject_id,session_date" });

      if (upsertErr) {
        throw upsertErr;
      }

      // Re-fetch clean state from Supabase to guarantee consistency
      await refreshAttendance();

      return {
        success: true,
        createdCount,
        updatedCount,
        message:
          updatedCount > 0 && createdCount > 0
            ? `Logged ${createdCount} new class(es) and updated ${updatedCount} existing record(s).`
            : updatedCount > 0
            ? `Updated ${updatedCount} attendance record(s).`
            : `Logged ${createdCount} attendance session(s) successfully.`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save attendance.";
      console.error("Attendance save error:", msg);
      setError(msg);
      return {
        success: false,
        createdCount: 0,
        updatedCount: 0,
        message: msg,
      };
    }
  };

  // Delete an attendance record from Supabase
  const deleteRecord = async (id: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: "Authentication required." };
    }

    try {
      const { error: deleteErr } = await supabase
        .from("student_attendance_logs")
        .delete()
        .eq("id", id)
        .eq("student_id", user.id);

      if (deleteErr) {
        throw deleteErr;
      }

      // Update state locally
      setRecords((prev) => prev.filter((r) => r.id !== id));
      return { success: true, message: "Attendance record deleted." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete record.";
      console.error("Attendance delete error:", msg);
      return { success: false, message: msg };
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        subjects,
        records,
        isLoading,
        isHydrated,
        error,
        overallSummary,
        subjectSummaries,
        saveAttendance,
        deleteRecord,
        refreshAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
}
