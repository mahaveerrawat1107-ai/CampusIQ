"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { AssignmentStatsCards } from "@/components/assignments/AssignmentStatsCards";
import { AssignmentList } from "@/components/assignments/AssignmentList";
import { AssignmentFormModal } from "@/components/assignments/AssignmentFormModal";

export default function AssignmentsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Academic Workspace</span>
            </span>
            <span className="text-neutral-border text-xs">•</span>
            <span className="text-xs text-neutral-secondary font-medium">
              1st Year CSE (Semester 1)
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-navy tracking-tight leading-tight">
            Assignments
          </h1>
          <p className="text-[13px] sm:text-[14px] text-neutral-secondary mt-1">
            Organize course deadlines, prioritize pending tasks, and track personal completion.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-center flex-shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors shadow-card"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to</span> Dashboard
          </Link>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-input bg-indigo text-white text-xs font-semibold hover:bg-indigo-hover transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* A. Assignment Dashboard Summary Stats Cards */}
      <section aria-label="Assignment Overview Statistics">
        <AssignmentStatsCards />
      </section>

      {/* B. Assignment List with Search, Filters & Interactive Cards */}
      <section aria-label="Assignment List and Filters">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-navy">
            All Course Assignments
          </h2>
          <span className="text-xs text-neutral-secondary font-medium">
            Pre-calibrated for UIT RGPV Shivpuri
          </span>
        </div>
        <AssignmentList />
      </section>

      {/* Create Assignment Modal */}
      <AssignmentFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
