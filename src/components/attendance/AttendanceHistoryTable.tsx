"use client";

import React, { useState, useMemo } from "react";
import {
  History,
  CheckCircle2,
  XCircle,
  Trash2,
  Calendar,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useAttendance } from "@/context/AttendanceContext";

const PAGE_SIZE = 10;

export function AttendanceHistoryTable() {
  const { records, subjects, deleteRecord } = useAttendance();

  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filtered + sorted records (most recent first)
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (subjectFilter !== "all" && r.subjectId !== subjectFilter) return false;
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
      );
  }, [records, subjectFilter, statusFilter]);

  // Reset visible count when filters change
  const handleSubjectFilter = (val: string) => {
    setSubjectFilter(val);
    setVisibleCount(PAGE_SIZE);
  };
  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setVisibleCount(PAGE_SIZE);
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    setDeletingId(id);
    const res = await deleteRecord(id);
    setDeletingId(null);
    if (!res.success) {
      setDeleteError(res.message);
    }
  };

  const visibleRecords = filteredRecords.slice(0, visibleCount);
  const hasMore = filteredRecords.length > visibleCount;

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
              {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""} found
              {subjectFilter !== "all" || statusFilter !== "all" ? " (filtered)" : ""}
            </p>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={subjectFilter}
            onChange={(e) => handleSubjectFilter(e.target.value)}
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

          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-input border border-neutral-border bg-neutral-light text-xs font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo cursor-pointer"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present only</option>
            <option value="absent">Absent only</option>
          </select>
        </div>
      </div>

      {/* Delete Feedback Error */}
      {deleteError && (
        <div className="mt-4 p-3 rounded-input bg-semantic-error-subtle border border-semantic-error/30 text-semantic-error text-xs flex items-center justify-between">
          <span>{deleteError}</span>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="text-xs font-semibold underline hover:text-navy"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* History List */}
      {filteredRecords.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-light text-neutral-secondary flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-navy">No records found</h3>
          <p className="text-xs text-neutral-secondary mt-1 max-w-sm mx-auto">
            No attendance entries match your current filters. Try adjusting filters or log a new session above.
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-neutral-border/70">
            {visibleRecords.map((record) => {
              const isPresent = record.status === "present";

              return (
                <div
                  key={record.id}
                  className="py-3.5 first:pt-4 last:pb-0 flex items-center justify-between gap-3"
                >
                  {/* Left: Status icon, Subject, Date */}
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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-navy truncate">
                          {record.subjectName}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-light text-neutral-secondary border border-neutral-border">
                          {record.subjectCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-neutral-secondary">
                        <Calendar className="w-3 h-3" />
                        <span>{record.sessionDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status pill + Delete */}
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
                      onClick={() => handleDelete(record.id)}
                      disabled={deletingId === record.id}
                      className="p-1 rounded text-neutral-secondary hover:text-semantic-error hover:bg-neutral-light transition-colors disabled:opacity-40"
                      title="Delete this record"
                      aria-label="Delete attendance record"
                    >
                      <Trash2 className={`w-3.5 h-3.5 ${deletingId === record.id ? "animate-pulse text-semantic-error" : ""}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Footer */}
          {hasMore && (
            <div className="mt-4 pt-4 border-t border-neutral-border text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-input border border-neutral-border bg-neutral-light text-xs font-semibold text-navy hover:text-indigo hover:bg-surface hover:border-indigo/40 transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>
                  Load {Math.min(PAGE_SIZE, filteredRecords.length - visibleCount)} more
                  {" "}({filteredRecords.length - visibleCount} remaining)
                </span>
              </button>
            </div>
          )}

          {!hasMore && filteredRecords.length > PAGE_SIZE && (
            <div className="mt-3 text-center text-xs text-neutral-secondary">
              All {filteredRecords.length} records displayed.
            </div>
          )}
        </>
      )}
    </div>
  );
}
