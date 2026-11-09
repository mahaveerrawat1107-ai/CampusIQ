"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Check,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
} from "lucide-react";
import { useAttendance } from "@/context/AttendanceContext";

export function MarkAttendanceCard() {
  const { subjects, records, saveAttendance } = useAttendance();

  // Date selection (default to today's date formatted as YYYY-MM-DD)
  const todayIso = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

  // Status mapping: { [subjectId]: "present" | "absent" | undefined }
  const [selectedMarks, setSelectedMarks] = useState<
    Record<string, "present" | "absent" | undefined>
  >({});

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Check which subjects already have a recorded entry for the selected date
  const existingRecordsForDate = useMemo(() => {
    return records.filter((r) => r.sessionDate === selectedDate);
  }, [records, selectedDate]);

  // When date changes or user clicks to edit, pre-populate existing marks if any
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setFeedback(null);

    // Pre-populate marks from existing records on that date
    const dateRecords = records.filter((r) => r.sessionDate === newDate);
    const populated: Record<string, "present" | "absent" | undefined> = {};
    for (const r of dateRecords) {
      populated[r.subjectId] = r.status;
    }
    setSelectedMarks(populated);
  };

  const handleToggle = (subjectId: string, status: "present" | "absent") => {
    setFeedback(null);
    setSelectedMarks((prev) => {
      // If already clicked, clicking again deselects it (sets to undefined)
      if (prev[subjectId] === status) {
        const next = { ...prev };
        delete next[subjectId];
        return next;
      }
      return {
        ...prev,
        [subjectId]: status,
      };
    });
  };

  const handleSave = () => {
    // Gather marked subjects
    const marksToSave: Array<{ subjectId: string; status: "present" | "absent" }> = [];
    for (const [subjectId, status] of Object.entries(selectedMarks)) {
      if (status) {
        marksToSave.push({ subjectId, status });
      }
    }

    if (marksToSave.length === 0) {
      setFeedback({
        type: "error",
        message: "Please mark at least one subject as Present or Absent before saving.",
      });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const result = saveAttendance(selectedDate, marksToSave);
      setIsSaving(false);
      setFeedback({
        type: result.success ? "success" : "error",
        message: result.message,
      });
    }, 200);
  };

  const activeMarkCount = Object.values(selectedMarks).filter(Boolean).length;

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-border">
        <div>
          <h2 className="text-[18px] font-bold text-navy leading-none">
            Mark Class Attendance
          </h2>
          <p className="text-xs text-neutral-secondary mt-1">
            Log your lectures and labs for the day. Unrecorded subjects will not be counted as absent.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-neutral-secondary absolute left-3 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-input border border-neutral-border bg-neutral-light text-xs font-semibold text-navy focus-visible:ring-2 focus-visible:ring-indigo outline-none cursor-pointer"
              aria-label="Session Date"
            />
          </div>
        </div>
      </div>

      {/* Duplicate / Existing Record Advisory */}
      {existingRecordsForDate.length > 0 && (
        <div className="mt-4 p-3 rounded-input bg-indigo-subtle/50 border border-indigo/20 text-xs text-navy flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo flex-shrink-0" />
          <span>
            <strong>{existingRecordsForDate.length} record(s)</strong> already exist for {selectedDate}. Any changes will update existing records without creating duplicates.
          </span>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mt-4 p-3 rounded-input border text-xs font-medium flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-semantic-success-subtle text-semantic-success border-semantic-success/20"
              : "bg-semantic-error-subtle text-semantic-error border-semantic-error/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Subject Toggles Grid */}
      <div className="my-5 space-y-3">
        {subjects.map((subj) => {
          const currentStatus = selectedMarks[subj.id];
          const isPresent = currentStatus === "present";
          const isAbsent = currentStatus === "absent";
          const hasExisting = existingRecordsForDate.some((r) => r.subjectId === subj.id);

          return (
            <div
              key={subj.id}
              className="p-3.5 rounded-card-sm border border-neutral-border bg-neutral-light flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-surface border border-neutral-border text-navy">
                    {subj.code}
                  </span>
                  {hasExisting && (
                    <span className="text-[10px] font-semibold text-neutral-secondary">
                      (Logged)
                    </span>
                  )}
                </div>
                <h4 className="text-[14px] font-semibold text-navy mt-1 truncate">
                  {subj.name}
                </h4>
              </div>

              {/* Present / Absent Segmented Toggle */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggle(subj.id, "present")}
                  className={`px-3 py-1.5 rounded-input text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isPresent
                      ? "bg-semantic-success text-white shadow-xs"
                      : "bg-surface border border-neutral-border text-neutral-secondary hover:text-navy hover:bg-neutral-light"
                  }`}
                  aria-pressed={isPresent}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Present</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggle(subj.id, "absent")}
                  className={`px-3 py-1.5 rounded-input text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isAbsent
                      ? "bg-semantic-error text-white shadow-xs"
                      : "bg-surface border border-neutral-border text-neutral-secondary hover:text-navy hover:bg-neutral-light"
                  }`}
                  aria-pressed={isAbsent}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Absent</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-neutral-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span className="text-xs text-neutral-secondary font-medium">
          {activeMarkCount > 0
            ? `${activeMarkCount} of ${subjects.length} subject(s) marked for ${selectedDate}`
            : "Select Present or Absent for today's attended classes"}
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || activeMarkCount === 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-input bg-indigo text-white text-xs font-semibold hover:bg-indigo-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving..." : "Save Attendance"}</span>
        </button>
      </div>
    </div>
  );
}
