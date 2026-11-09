import React from "react";
import {
  ClipboardList,
  Calendar,
  Clock,
  ArrowRight,
  Circle,
  AlertTriangle,
} from "lucide-react";
import { MockAssignment } from "@/data/mockHomeData";

interface UpcomingAssignmentsProps {
  assignments: MockAssignment[];
}

export function UpcomingAssignments({ assignments }: UpcomingAssignmentsProps) {
  const getPriorityBadge = (priority: MockAssignment["priority"]) => {
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

        <button
          type="button"
          className="text-xs font-semibold text-indigo hover:text-indigo-hover inline-flex items-center gap-1 transition-colors"
        >
          <span>View all ({assignments.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Assignment List */}
      <div className="divide-y divide-neutral-border/70">
        {assignments.map((item) => (
          <div
            key={item.id}
            className="py-4 first:pt-4 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 group"
          >
            {/* Left Info */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="mt-0.5 w-5 h-5 rounded border border-neutral-border flex items-center justify-center text-transparent hover:text-neutral-secondary transition-colors"
                title="Mark personal completion"
                aria-label="Mark personal completion"
              >
                <Circle className="w-3.5 h-3.5 text-neutral-border hover:text-indigo" />
              </button>

              <div>
                <h3 className="text-[14px] font-semibold text-navy group-hover:text-indigo transition-colors leading-snug">
                  {item.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-neutral-secondary">
                  <span className="font-semibold text-navy">
                    {item.subject}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-secondary" />
                    <span>{item.dueDate}</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-medium text-navy">
                    <Clock className="w-3 h-3 text-neutral-secondary" />
                    <span>{item.daysRemaining}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Meta Badges */}
            <div className="flex items-center gap-2 self-start sm:self-center pl-8 sm:pl-0">
              {getPriorityBadge(item.priority)}
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-light text-neutral-secondary border border-neutral-border">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
