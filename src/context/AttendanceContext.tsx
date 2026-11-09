"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Subject } from "@/types";
import {
  AttendanceRecord,
  PILOT_SUBJECTS,
  SEED_ATTENDANCE_RECORDS,
} from "@/data/attendanceData";
import {
  calculateAttendanceMetrics,
  AttendanceMetrics,
} from "@/lib/attendanceCalculations";

export interface SubjectSummaryWithMeta extends AttendanceMetrics {
  subject: Subject;
}

interface SaveAttendanceResult {
  success: boolean;
  createdCount: number;
  updatedCount: number;
  message: string;
}

interface AttendanceContextType {
  subjects: Subject[];
  records: AttendanceRecord[];
  isHydrated: boolean;
  overallSummary: AttendanceMetrics;
  subjectSummaries: SubjectSummaryWithMeta[];
  saveAttendance: (
    sessionDate: string,
    marks: Array<{ subjectId: string; status: "present" | "absent" }>
  ) => SaveAttendanceResult;
  deleteRecord: (id: string) => void;
  resetToDefaultSeed: () => void;
}

const STORAGE_KEY = "campusiq_attendance_records_v1";

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [subjects] = useState<Subject[]>(PILOT_SUBJECTS);
  const [records, setRecords] = useState<AttendanceRecord[]>(SEED_ATTENDANCE_RECORDS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted records from localStorage after client hydration
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRecords(parsed);
          }
        }
      }
    } catch (e) {
      console.warn("Could not read local attendance storage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage whenever records change (only after initial hydration)
  const persistRecords = (newRecords: AttendanceRecord[]) => {
    setRecords(newRecords);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
      }
    } catch (e) {
      console.error("Failed to save attendance records to local storage:", e);
    }
  };

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

  // Mark/save attendance for a given date
  const saveAttendance = (
    sessionDate: string,
    marks: Array<{ subjectId: string; status: "present" | "absent" }>
  ): SaveAttendanceResult => {
    if (!sessionDate || marks.length === 0) {
      return {
        success: false,
        createdCount: 0,
        updatedCount: 0,
        message: "No subjects selected or invalid date.",
      };
    }

    const updatedRecords = [...records];
    let createdCount = 0;
    let updatedCount = 0;

    for (const mark of marks) {
      const subj = subjects.find((s) => s.id === mark.subjectId);
      if (!subj) continue;

      // Find if entry for this subject and date already exists
      const existingIndex = updatedRecords.findIndex(
        (r) => r.subjectId === mark.subjectId && r.sessionDate === sessionDate
      );

      if (existingIndex >= 0) {
        // Edit existing record (duplicate prevention)
        updatedRecords[existingIndex] = {
          ...updatedRecords[existingIndex],
          status: mark.status,
          recordedAt: new Date().toISOString(),
        };
        updatedCount += 1;
      } else {
        // Create new record
        const newRecord: AttendanceRecord = {
          id: `att-${mark.subjectId}-${sessionDate}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          studentId: "std-alex",
          subjectId: mark.subjectId,
          subjectName: subj.name,
          subjectCode: subj.code,
          sessionDate,
          status: mark.status,
          recordedAt: new Date().toISOString(),
        };
        updatedRecords.unshift(newRecord);
        createdCount += 1;
      }
    }

    persistRecords(updatedRecords);

    const message =
      createdCount > 0 && updatedCount > 0
        ? `Saved ${createdCount} new class${createdCount > 1 ? "es" : ""} and updated ${updatedCount} existing record${updatedCount > 1 ? "s" : ""}.`
        : createdCount > 0
        ? `Successfully recorded ${createdCount} class${createdCount > 1 ? "es" : ""} for ${sessionDate}.`
        : `Updated ${updatedCount} record${updatedCount > 1 ? "s" : ""} for ${sessionDate}.`;

    return {
      success: true,
      createdCount,
      updatedCount,
      message,
    };
  };

  const deleteRecord = (id: string) => {
    const filtered = records.filter((r) => r.id !== id);
    persistRecords(filtered);
  };

  const resetToDefaultSeed = () => {
    persistRecords(SEED_ATTENDANCE_RECORDS);
  };

  return (
    <AttendanceContext.Provider
      value={{
        subjects,
        records,
        isHydrated,
        overallSummary,
        subjectSummaries,
        saveAttendance,
        deleteRecord,
        resetToDefaultSeed,
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
