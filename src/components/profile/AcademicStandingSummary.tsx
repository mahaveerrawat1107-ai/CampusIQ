"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, CalendarCheck, BookOpen, ChevronRight, TrendingUp } from "lucide-react";
import { useAttendance } from "@/context/AttendanceContext";
import { useAssignments } from "@/context/AssignmentsContext";
import { useNotes } from "@/context/NotesContext";

export function AcademicStandingSummary() {
  const { overallSummary } = useAttendance();
  const { studentStats } = useAssignments();
  const { publishedNotes } = useNotes();

  const getStatusBadge = () => {
    switch (overallSummary.status) {
      case "safe":
        return {
          label: "Attendance Safe",
          bg: "bg-semantic-success-subtle text-semantic-success border-semantic-success/20",
        };
      case "warning":
        return {
          label: "Attendance Warning",
          bg: "bg-semantic-warning-subtle text-semantic-warning border-semantic-warning/20",
        };
      case "critical":
        return {
          label: "Attendance Critical",
          bg: "bg-semantic-error-subtle text-semantic-error border-semantic-error/20",
        };
      default:
        return {
          label: "Active",
          bg: "bg-neutral-light text-neutral-secondary border-neutral-border",
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-navy leading-none">
              Academic Standing Snapshot
            </h3>
            <p className="text-xs text-neutral-secondary mt-0.5">
              Live status derived from your active semester records
            </p>
          </div>
        </div>

        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}
        >
          {statusBadge.label}
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Attendance Card */}
        <Link
          href="/attendance"
          className="group p-4 rounded-input bg-neutral-light/50 border border-neutral-border hover:border-indigo/40 hover:bg-neutral-light transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-secondary uppercase tracking-wider">
              Overall Attendance
            </span>
            <CalendarCheck className="w-4 h-4 text-indigo group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-navy tabular-nums">
                {overallSummary.percentage.toFixed(1)}%
              </span>
              <span className="text-xs text-neutral-secondary">
                ({overallSummary.attended}/{overallSummary.total} classes)
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-secondary group-hover:text-indigo">
              <span>View Attendance Log</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>

        {/* Assignments Card */}
        <Link
          href="/assignments"
          className="group p-4 rounded-input bg-neutral-light/50 border border-neutral-border hover:border-indigo/40 hover:bg-neutral-light transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-secondary uppercase tracking-wider">
              Assignments Progress
            </span>
            <CheckSquare className="w-4 h-4 text-indigo group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-navy tabular-nums">
                {studentStats.completed}/{studentStats.total}
              </span>
              <span className="text-xs text-neutral-secondary">
                ({studentStats.pending} pending)
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-secondary group-hover:text-indigo">
              <span>Manage Assignments</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>

        {/* Notes Library Card */}
        <Link
          href="/notes"
          className="group p-4 rounded-input bg-neutral-light/50 border border-neutral-border hover:border-indigo/40 hover:bg-neutral-light transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-secondary uppercase tracking-wider">
              Notes Available
            </span>
            <BookOpen className="w-4 h-4 text-indigo group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-navy tabular-nums">
                {publishedNotes.length}
              </span>
              <span className="text-xs text-neutral-secondary">
                verified syllabus notes
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-secondary group-hover:text-indigo">
              <span>Browse Notes Library</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
