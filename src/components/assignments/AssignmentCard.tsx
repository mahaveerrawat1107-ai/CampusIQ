"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import { Assignment } from "@/types/assignment";
import { formatDisplayDate, getDueStatusText, isAssignmentOverdue } from "@/lib/assignmentUtils";

interface AssignmentCardProps {
  assignment: Assignment;
  onToggleStatus: (id: string) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
}

export function AssignmentCard({
  assignment,
  onToggleStatus,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  const isCompleted = assignment.status === "Completed";
  const isOverdue = isAssignmentOverdue(assignment);
  const dueInfo = getDueStatusText(assignment);

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
          ? "bg-surface/80 border-neutral-border/70 opacity-95"
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
        <div className="flex-1 min-w-0">
          {/* Header Row: Subject & Badges */}
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

          {/* Description (if provided) */}
          {assignment.description && (
            <p className="text-xs text-neutral-secondary mt-1.5 leading-relaxed line-clamp-2">
              {assignment.description}
            </p>
          )}

          {/* Metadata Row: Assigned Date, Due Date, Relative Status */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-neutral-border/60 text-xs text-neutral-secondary">
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

            {/* Assigned Date */}
            <div className="text-[11px] text-neutral-secondary/80 hidden sm:block">
              Assigned: {formatDisplayDate(assignment.assignedDate)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 self-start flex-shrink-0 pt-0.5">
          <button
            type="button"
            onClick={() => onEdit(assignment)}
            className="p-1.5 rounded-input text-neutral-secondary hover:text-indigo hover:bg-neutral-light transition-colors"
            title="Edit assignment"
            aria-label={`Edit ${assignment.title}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(assignment)}
            className="p-1.5 rounded-input text-neutral-secondary hover:text-semantic-error hover:bg-neutral-light transition-colors"
            title="Delete assignment"
            aria-label={`Delete ${assignment.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
