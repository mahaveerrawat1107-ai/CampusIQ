"use client";

import React from "react";
import { BookOpen, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { useAttendance } from "@/context/AttendanceContext";

export function SubjectAttendanceGrid() {
  const { subjectSummaries } = useAttendance();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h2 className="text-[18px] font-bold text-navy leading-none">
            Subject-Wise Attendance
          </h2>
          <p className="text-xs text-neutral-secondary mt-1">
            Pre-seeded courses for UIT RGPV Shivpuri (B.Tech 1st Year CSE)
          </p>
        </div>
        <span className="text-[11px] font-medium text-neutral-secondary self-start sm:self-center">
          Requirement: 75% per subject
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjectSummaries.map((item) => {
          const isSafe = item.status === "safe";
          const isWarning = item.status === "warning";

          return (
            <div
              key={item.subject.id}
              className="bg-surface rounded-card border border-neutral-border p-5 shadow-card hover:border-neutral-border/80 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header: Code, Title, Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-subtle text-indigo border border-indigo/20">
                        {item.subject.code}
                      </span>
                      <span className="text-xs text-neutral-secondary font-medium">
                        Semester 1
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-navy mt-1.5 truncate">
                      {item.subject.name}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex-shrink-0 ${
                      isSafe
                        ? "bg-semantic-success-subtle text-semantic-success border-semantic-success/20"
                        : isWarning
                        ? "bg-semantic-warning-subtle text-semantic-warning border-semantic-warning/20"
                        : "bg-semantic-error-subtle text-semantic-error border-semantic-error/20"
                    }`}
                  >
                    {isSafe ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Safe</span>
                      </>
                    ) : isWarning ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>Warning</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Critical</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Percentage & Fraction */}
                <div className="my-3 flex items-baseline justify-between">
                  <span className="text-[28px] font-bold text-navy leading-none tabular-nums">
                    {item.percentage}%
                  </span>
                  <div className="text-right text-xs">
                    <span className="font-bold text-navy tabular-nums">
                      {item.attended}
                    </span>
                    <span className="text-neutral-secondary font-medium">
                      {" "}
                      / {item.total} classes
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-neutral-light rounded-full overflow-hidden border border-neutral-border/60 mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSafe
                        ? "bg-semantic-success"
                        : isWarning
                        ? "bg-semantic-warning"
                        : "bg-semantic-error"
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Footer advice */}
              <div className="pt-3 border-t border-neutral-border/70 text-xs text-neutral-secondary">
                {isSafe ? (
                  <span>
                    <strong className="text-navy">{item.safeBunks}</strong> safe
                    bunk{item.safeBunks !== 1 ? "s" : ""} remaining above 75%.
                  </span>
                ) : (
                  <span>
                    Attend next{" "}
                    <strong className="text-semantic-error">
                      {item.classesNeeded}
                    </strong>{" "}
                    class{item.classesNeeded !== 1 ? "es" : ""} to reach 75%.
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
