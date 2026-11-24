"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAttendance } from "@/context/AttendanceContext";

export function AttendanceSummaryCard() {
  const { overallSummary, refreshAttendance, isLoading } = useAttendance();
  const { percentage, attended, total, target, status, safeBunks, classesNeeded, statusMessage } =
    overallSummary;

  const isSafe = status === "safe";
  const isWarning = status === "warning";

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 sm:p-7 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-neutral-border">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-input flex items-center justify-center flex-shrink-0 ${
              isSafe
                ? "bg-semantic-success-subtle text-semantic-success"
                : isWarning
                ? "bg-semantic-warning-subtle text-semantic-warning"
                : "bg-semantic-error-subtle text-semantic-error"
            }`}
          >
            {isSafe ? (
              <ShieldCheck className="w-5 h-5" />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-navy leading-none">
              Overall Academic Attendance
            </h2>
            <p className="text-xs text-neutral-secondary mt-1">
              Combined records for 1st Year CSE (Semester 1)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isSafe
                ? "bg-semantic-success-subtle text-semantic-success border-semantic-success/20"
                : isWarning
                ? "bg-semantic-warning-subtle text-semantic-warning border-semantic-warning/20"
                : "bg-semantic-error-subtle text-semantic-error border-semantic-error/20"
            }`}
          >
            {isSafe ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Safe Zone (&ge; {target}%)</span>
              </>
            ) : isWarning ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Warning Zone ({percentage}%)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Critical Zone (&lt; 70%)</span>
              </>
            )}
          </span>

          {/* Refresh button to sync with Supabase */}
          <button
            type="button"
            onClick={() => refreshAttendance()}
            disabled={isLoading}
            className="p-1.5 rounded-input border border-neutral-border text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors disabled:opacity-50"
            title="Refresh attendance from Supabase"
            aria-label="Refresh attendance from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6 items-center">
        {/* Overall Percentage */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-secondary">
            Current Standing
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[44px] font-bold text-navy leading-none tabular-nums tracking-tight">
              {percentage}%
            </span>
            <span className="text-xs font-medium text-neutral-secondary">
              of held classes
            </span>
          </div>
        </div>

        {/* Classes Attended vs Held */}
        <div className="sm:border-l sm:border-neutral-border sm:pl-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-secondary">
            Classes Record
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[28px] font-bold text-navy leading-none tabular-nums">
              {attended}
            </span>
            <span className="text-[18px] text-neutral-secondary font-medium">
              / {total}
            </span>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-1">
            Present classes / Total recorded
          </p>
        </div>

        {/* 75% Requirement Math */}
        <div className="sm:border-l sm:border-neutral-border sm:pl-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-secondary">
            75% Requirement
          </span>
          <div className="mt-1">
            {isSafe ? (
              <div>
                <span className="text-[28px] font-bold text-semantic-success leading-none tabular-nums">
                  {safeBunks}
                </span>
                <span className="text-xs text-neutral-secondary ml-2 font-medium">
                  safe bunks remaining
                </span>
              </div>
            ) : (
              <div>
                <span className="text-[28px] font-bold text-semantic-error leading-none tabular-nums">
                  {classesNeeded}
                </span>
                <span className="text-xs text-neutral-secondary ml-2 font-medium">
                  consecutive classes needed
                </span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-neutral-secondary mt-1">
            Based on official 75% target threshold
          </p>
        </div>
      </div>

      {/* Progress Bar with 75% Marker */}
      <div className="space-y-2 mb-5">
        <div className="relative w-full h-3 bg-neutral-light rounded-full overflow-hidden border border-neutral-border/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isSafe
                ? "bg-semantic-success"
                : isWarning
                ? "bg-semantic-warning"
                : "bg-semantic-error"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-secondary font-medium">
          <span>0%</span>
          <span className="font-bold text-navy flex items-center gap-1">
            <span>Minimum Target: {target}%</span>
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* Insight Callout */}
      <div
        className={`p-3.5 rounded-input border text-xs leading-relaxed flex items-start gap-3 ${
          isSafe
            ? "bg-neutral-light border-neutral-border text-navy"
            : "bg-semantic-warning-subtle/50 border-semantic-warning/30 text-navy"
        }`}
      >
        <CheckCircle2
          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
            isSafe ? "text-semantic-success" : "text-semantic-warning"
          }`}
        />
        <div>
          <span className="font-semibold text-navy">
            {isSafe ? "Status Note: " : "Action Advisory: "}
          </span>
          <span className="text-neutral-secondary">{statusMessage}</span>
        </div>
      </div>
    </div>
  );
}
