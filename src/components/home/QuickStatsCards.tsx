"use client";

import React from "react";
import Link from "next/link";
import { ClipboardList, BookOpen, ArrowRight } from "lucide-react";
import { useAssignments } from "@/context/AssignmentsContext";
import { useNotes } from "@/context/NotesContext";

export function QuickStatsCards() {
  const { studentStats } = useAssignments();
  const { publishedNotes } = useNotes();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Pending Assignments Card */}
      <div className="bg-surface rounded-card border border-neutral-border p-5 shadow-card hover:border-neutral-border/80 transition-colors flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider text-neutral-secondary">
              Assignments
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[32px] font-bold text-navy leading-none tabular-nums">
                {studentStats.pending}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  studentStats.pending > 0
                    ? "text-semantic-warning bg-semantic-warning-subtle"
                    : "text-semantic-success bg-semantic-success-subtle"
                }`}
              >
                {studentStats.pending > 0 ? "Action required" : "All caught up"}
              </span>
            </div>
            <p className="text-xs text-neutral-secondary mt-1.5">
              Published tasks remaining
            </p>
          </div>

          <div className="w-10 h-10 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-border">
          <Link
            href="/assignments"
            className="w-full flex items-center justify-between text-xs font-semibold text-neutral-secondary hover:text-indigo transition-colors group focus-visible:ring-2 focus-visible:ring-indigo rounded"
          >
            <span>Track assignments</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Published Notes Card */}
      <div className="bg-surface rounded-card border border-neutral-border p-5 shadow-card hover:border-neutral-border/80 transition-colors flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider text-neutral-secondary">
              Notes Library
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[32px] font-bold text-navy leading-none tabular-nums">
                {publishedNotes.length}
              </span>
              <span className="text-xs font-semibold text-indigo bg-indigo-subtle px-2 py-0.5 rounded-full">
                Semester 1
              </span>
            </div>
            <p className="text-xs text-neutral-secondary mt-1.5">
              Published syllabus PDFs
            </p>
          </div>

          <div className="w-10 h-10 rounded-input bg-semantic-success-subtle text-semantic-success flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-border">
          <Link
            href="/notes"
            className="w-full flex items-center justify-between text-xs font-semibold text-neutral-secondary hover:text-indigo transition-colors group focus-visible:ring-2 focus-visible:ring-indigo rounded"
          >
            <span>Browse notes</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
