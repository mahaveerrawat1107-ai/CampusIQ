"use client";

import React from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { Assignment } from "@/types/assignment";
import { formatDisplayDate, getDueStatusText, isAssignmentOverdue } from "@/lib/assignmentUtils";
import { AttachmentList } from "@/components/attachments/AttachmentList";

interface AssignmentCardProps {
  assignment: Assignment;
  isCompleted: boolean;
  onToggleStatus: (id: string) => void;
}

export function AssignmentCard({
  assignment,
  isCompleted,
  onToggleStatus,
}: AssignmentCardProps) {
  const isOverdue = isAssignmentOverdue(assignment.dueDate, isCompleted);
  const dueInfo = getDueStatusText(assignment.dueDate, isCompleted);

  const getPriorityBadge = () => {
    switch (assignment.priority) {
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-semantic-error-subtle text-semantic-error border border-semantic-error/20">
            <span className="w-1.5 h-1.5 rounded-full bg-semantic-error" />
            High Priority
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-semantic-warning-subtle text-semantic-warning border border-semantic-warning/20">
            <span className="w-1.5 h-1.5 rounded-full bg-semantic-warning" />
            Medium Priority
          </span>
        );
      case "Low":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-subtle text-indigo border border-indigo/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo" />
            Low Priority
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-card border p-4 sm:p-5 transition-all shadow-card ${
        isCompleted
          ? "bg-surface/85 border-neutral-border/70 opacity-95"
          : isOverdue
          ? "bg-surface border-semantic-error/40 hover:border-semantic-error/60"
          : "bg-surface border-neutral-border hover:border-neutral-border/80"
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Toggle Checkbox Button */}
        <button
          type="button"
          onClick={() => onToggleStatus(assignment.id)}
          className="mt-0.5 flex-shrink-0 text-neutral-secondary hover:text-semantic-success transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo rounded-full"
          title={isCompleted ? "Mark as Pending" : "Mark as Completed"}
          aria-label={isCompleted ? "Mark as Pending" : "Mark as Completed"}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-semantic-success fill-semantic-success/15" />
          ) : (
            <Circle className="w-5 h-5 text-neutral-secondary/60 hover:text-indigo" />
          )}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header Row: Subject, Priority, Status */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-subtle text-indigo border border-indigo/20">
                {assignment.subjectCode}
              </span>
              <span className="text-xs text-neutral-secondary font-medium">
                {assignment.subjectName}
              </span>
              <span className="text-neutral-border text-xs hidden sm:inline">•</span>

              {/* Priority Badge */}
              {getPriorityBadge()}

              {/* Status / Overdue Badges */}
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-semantic-success-subtle text-semantic-success border border-semantic-success/20">
                  Completed
                </span>
              ) : isOverdue ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-semantic-error-subtle text-semantic-error border border-semantic-error/20 animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  <span>{dueInfo.text}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-semantic-warning-subtle text-semantic-warning border border-semantic-warning/20">
                  Pending
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className={`text-[15px] sm:text-[16px] font-bold leading-snug break-words ${
                isCompleted ? "text-neutral-secondary line-through" : "text-navy"
              }`}
            >
              {assignment.title}
            </h3>

            {/* Description */}
            {assignment.description && (
              <p className="text-xs text-neutral-secondary mt-1.5 leading-relaxed">
                {assignment.description}
              </p>
            )}
          </div>

          {/* Attachments Section */}
          <div className="pt-2 border-t border-neutral-border/60">
            <AttachmentList attachments={assignment.attachments || []} />
          </div>

          {/* Footer Metadata: Due Date, Assigned Date, Faculty Author */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 pt-2.5 border-t border-neutral-border/60 text-xs text-neutral-secondary">
            <div className="flex flex-wrap items-center gap-3">
              {/* Due Date */}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-secondary" />
                <span>
                  Due:{" "}
                  <strong
                    className={
                      isCompleted
                        ? "text-neutral-secondary"
                        : isOverdue
                        ? "text-semantic-error"
                        : "text-navy"
                    }
                  >
                    {formatDisplayDate(assignment.dueDate)}
                  </strong>
                </span>
              </div>

              {/* Relative timing badge */}
              {!isCompleted && !isOverdue && (
                <div className="flex items-center gap-1 text-navy font-medium">
                  <Clock className="w-3.5 h-3.5 text-neutral-secondary" />
                  <span>{dueInfo.text}</span>
                </div>
              )}
            </div>

            {/* Faculty Author */}
            {assignment.createdBy && (
              <div className="flex items-center gap-1 text-[11px] text-neutral-secondary">
                <UserCheck className="w-3 h-3 text-indigo" />
                <span>{assignment.createdBy}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
