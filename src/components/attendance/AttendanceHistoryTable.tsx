"use client";

import React, { useState, useMemo } from "react";
import {
  History,
  CheckCircle2,
  XCircle,
  Filter,
  Trash2,
  Calendar,
  Layers,
} from "lucide-react";
import { useAttendance } from "@/context/AttendanceContext";

export function AttendanceHistoryTable() {
  const { records, subjects, deleteRecord } = useAttendance();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  // Filtered records sorted in reverse chronological order
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (selectedSubjectFilter !== "all" && r.subjectId !== selectedSubjectFilter) {
          return false;
        }
        if (selectedStatusFilter !== "all" && r.status !== selectedStatusFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  }, [records, selectedSubjectFilter, selectedStatusFilter]);

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-input bg-neutral-light text-navy flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-navy leading-none">
              Attendance History Log
            </h2>
            <p className="text-xs text-neutral-secondary mt-1">
              {filteredRecords.length} recorded session{filteredRecords.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <div className="relative">
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded-input border border-neutral-border bg-neutral-light text-xs font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo cursor-pointer"
              aria-label="Filter by subject"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-input border border-neutral-border bg-neutral-light text-xs font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present only</option>
              <option value="absent">Absent only</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table / List */}
      {filteredRecords.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-light text-neutral-secondary flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-navy">No records found</h3>
          <p className="text-xs text-neutral-secondary mt-1 max-w-sm mx-auto">
            No attendance entries match your current filter settings. Try changing filters or logging new classes above.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-border/70 max-h-96 overflow-y-auto">
          {filteredRecords.map((record) => {
            const isPresent = record.status === "present";

            return (
              <div
                key={record.id}
                className="py-3.5 first:pt-4 last:pb-0 flex items-center justify-between gap-3 group"
              >
                {/* Left: Date & Subject */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isPresent
                        ? "bg-semantic-success-subtle text-semantic-success"
                        : "bg-semantic-error-subtle text-semantic-error"
                    }`}
                  >
                    {isPresent ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy truncate">
                        {record.subjectName}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-neutral-light text-neutral-secondary border border-neutral-border">
                        {record.subjectCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-secondary">
                      <Calendar className="w-3 h-3 text-neutral-secondary" />
                      <span>{record.sessionDate}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Pill & Delete Button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isPresent
                        ? "bg-semantic-success-subtle text-semantic-success border-semantic-success/20"
                        : "bg-semantic-error-subtle text-semantic-error border-semantic-error/20"
                    }`}
                  >
                    {isPresent ? "Present" : "Absent"}
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteRecord(record.id)}
                    className="p-1 rounded text-neutral-secondary hover:text-semantic-error hover:bg-neutral-light transition-colors"
                    title="Delete record"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
