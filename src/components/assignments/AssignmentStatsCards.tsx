"use client";

import React from "react";
import { ClipboardList, Clock, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { useAssignments } from "@/context/AssignmentsContext";

export function AssignmentStatsCards() {
  const { studentStats, resetToDefaultSeed } = useAssignments();

  return (
    <div className="space-y-3">
      {/* Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Assignments */}
        <div className="bg-surface rounded-card border border-neutral-border p-4 sm:p-5 shadow-card hover:border-neutral-border/80 transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-neutral-secondary">
                Total
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-[28px] sm:text-[32px] font-bold text-navy leading-none tabular-nums">
                  {studentStats.total}
                </span>
                <span className="text-[11px] font-medium text-neutral-secondary">
                  tasks
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-3 pt-2.5 border-t border-neutral-border/70">
            Published course tasks
          </p>
        </div>

        {/* Pending Assignments */}
        <div className="bg-surface rounded-card border border-neutral-border p-4 sm:p-5 shadow-card hover:border-neutral-border/80 transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-neutral-secondary">
                Pending
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-[28px] sm:text-[32px] font-bold text-semantic-warning leading-none tabular-nums">
                  {studentStats.pending}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-semantic-warning bg-semantic-warning-subtle px-1.5 py-0.5 rounded-full">
                  Action required
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-input bg-semantic-warning-subtle text-semantic-warning flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-3 pt-2.5 border-t border-neutral-border/70">
            Awaiting personal completion
          </p>
        </div>

        {/* Completed Assignments */}
        <div className="bg-surface rounded-card border border-neutral-border p-4 sm:p-5 shadow-card hover:border-neutral-border/80 transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-neutral-secondary">
                Completed
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-[28px] sm:text-[32px] font-bold text-semantic-success leading-none tabular-nums">
                  {studentStats.completed}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-semantic-success bg-semantic-success-subtle px-1.5 py-0.5 rounded-full">
                  Done
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-input bg-semantic-success-subtle text-semantic-success flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-3 pt-2.5 border-t border-neutral-border/70">
            Self-marked completed
          </p>
        </div>

        {/* Overdue Assignments */}
        <div className="bg-surface rounded-card border border-neutral-border p-4 sm:p-5 shadow-card hover:border-neutral-border/80 transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-neutral-secondary">
                Overdue
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span
                  className={`text-[28px] sm:text-[32px] font-bold leading-none tabular-nums ${
                    studentStats.overdue > 0 ? "text-semantic-error" : "text-navy"
                  }`}
                >
                  {studentStats.overdue}
                </span>
                {studentStats.overdue > 0 ? (
                  <span className="text-[10px] sm:text-[11px] font-semibold text-semantic-error bg-semantic-error-subtle px-1.5 py-0.5 rounded-full">
                    Past due
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-medium text-neutral-secondary">
                    None overdue
                  </span>
                )}
              </div>
            </div>
            <div
              className={`w-9 h-9 rounded-input flex items-center justify-center flex-shrink-0 ${
                studentStats.overdue > 0
                  ? "bg-semantic-error-subtle text-semantic-error"
                  : "bg-neutral-light text-neutral-secondary"
              }`}
            >
              <AlertCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-3 pt-2.5 border-t border-neutral-border/70">
            Pending past deadline
          </p>
        </div>
      </div>

      {/* Student notice bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 text-xs text-neutral-secondary">
        <span>
          <strong>Academic Student Workspace:</strong> Assignments are published by course faculty. Marking an item as completed helps organize your personal study workflow.
        </span>
        <button
          type="button"
          onClick={resetToDefaultSeed}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-secondary hover:text-indigo transition-colors"
          title="Reset assignments to default demo dataset"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset demo data</span>
        </button>
      </div>
    </div>
  );
}
