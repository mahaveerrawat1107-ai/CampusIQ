"use client";

import React from "react";
import Link from "next/link";
import {
  ClipboardList,
  Calendar,
  Clock,
  ArrowRight,
  Circle,
  CheckCircle2,
  Check,
} from "lucide-react";
import { useAssignments } from "@/context/AssignmentsContext";
import { formatDisplayDate, getDueStatusText, isAssignmentOverdue } from "@/lib/assignmentUtils";
import { AssignmentPriority } from "@/types/assignment";

export function UpcomingAssignments() {
  const { upcomingPendingAssignments, stats, toggleAssignmentStatus } = useAssignments();

  const getPriorityBadge = (priority: AssignmentPriority) => {
    switch (priority) {
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-semantic-error-subtle text-semantic-error border border-semantic-error/20">
            <span className="w-1.5 h-1.5 rounded-full bg-semantic-error" />
            High
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-semantic-warning-subtle text-semantic-warning border border-semantic-warning/20">
            <span className="w-1.5 h-1.5 rounded-full bg-semantic-warning" />
            Medium
          </span>
        );
      case "Low":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-subtle text-indigo border border-indigo/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo" />
            Low
          </span>
        );
    }
  };

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-navy leading-none">
              Upcoming Assignments
            </h2>
            <p className="text-[12px] text-neutral-secondary font-medium mt-0.5">
              Next due academic tasks
            </p>
          </div>
        </div>

        <Link
          href="/assignments"
          className="text-xs font-semibold text-indigo hover:text-indigo-hover inline-flex items-center gap-1 transition-colors group focus-visible:ring-2 focus-visible:ring-indigo rounded"
        >
          <span>View all assignments</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Assignment List */}
      {upcomingPendingAssignments.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-10 h-10 rounded-full bg-semantic-success-subtle text-semantic-success flex items-center justify-center mx-auto mb-2.5">
            <Check className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-navy">All caught up!</h3>
          <p className="text-xs text-neutral-secondary mt-1">
            You have no pending assignments right now.
          </p>
          <Link
            href="/assignments"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo hover:text-indigo-hover mt-3"
          >
            <span>Open Assignments Tracker</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-neutral-border/70">
          {upcomingPendingAssignments.map((item) => {
            const dueInfo = getDueStatusText(item);
            const isOverdue = isAssignmentOverdue(item);

            return (
              <div
                key={item.id}
                className="py-4 first:pt-4 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 group"
              >
                {/* Left Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleAssignmentStatus(item.id)}
                    className="mt-0.5 w-5 h-5 rounded border border-neutral-border flex items-center justify-center text-neutral-secondary hover:text-semantic-success hover:border-semantic-success transition-colors flex-shrink-0"
                    title="Mark as completed"
                    aria-label={`Mark ${item.title} as completed`}
                  >
                    <Circle className="w-3.5 h-3.5 text-neutral-border group-hover:text-neutral-secondary" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <Link
                      href="/assignments"
                      className="text-[14px] font-semibold text-navy hover:text-indigo transition-colors leading-snug block truncate"
                    >
                      {item.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-neutral-secondary">
                      <span className="font-semibold text-navy">
                        {item.subjectName}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-secondary" />
                        <span>{formatDisplayDate(item.dueDate)}</span>
                      </span>
                      <span>•</span>
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          isOverdue ? "text-semantic-error" : "text-navy"
                        }`}
                      >
                        <Clock className="w-3 h-3 text-neutral-secondary" />
                        <span>{dueInfo.text}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Meta Badges */}
                <div className="flex items-center gap-2 self-start sm:self-center pl-8 sm:pl-0 flex-shrink-0">
                  {getPriorityBadge(item.priority)}
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-light text-neutral-secondary border border-neutral-border">
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer count indicator */}
      {upcomingPendingAssignments.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-neutral-border flex items-center justify-between text-xs text-neutral-secondary">
          <span>
            Showing {Math.min(3, stats.pending)} of {stats.pending} pending assignment
            {stats.pending !== 1 ? "s" : ""}
          </span>
          <Link
            href="/assignments"
            className="font-semibold text-indigo hover:text-indigo-hover inline-flex items-center gap-1"
          >
            {stats.pending > 3 ? (
              <>
                <span>See {stats.pending - 3} more in Assignments</span>
                <ArrowRight className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Manage in Assignments</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </Link>
        </div>
      )}
    </div>
  );
}
