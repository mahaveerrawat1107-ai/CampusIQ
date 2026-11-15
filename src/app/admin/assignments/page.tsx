"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Plus,
  ArrowLeft,
  Calendar,
  Paperclip,
  CheckCircle2,
  FileEdit,
  Trash2,
  Globe,
  EyeOff,
  Search,
  ArrowUpDown,
  BookOpen,
  FolderOpen,
} from "lucide-react";
import { useAssignments } from "@/context/AssignmentsContext";
import { Assignment, AssignmentPriority } from "@/types/assignment";
import { formatDisplayDate } from "@/lib/assignmentUtils";
import { StaffAssignmentModal } from "@/components/admin/StaffAssignmentModal";
import { StaffDeleteModal } from "@/components/admin/StaffDeleteModal";
import { StaffHeaderNav } from "@/components/admin/StaffHeaderNav";

export default function StaffAssignmentsPage() {
  const {
    allAssignments,
    subjects,
    staffStats,
    togglePublishStatus,
    deleteStaffAssignment,
  } = useAssignments();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all, published, draft

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);

  const filteredAssignments = useMemo(() => {
    return allAssignments.filter((a) => {
      if (
        searchQuery.trim() &&
        !a.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ) {
        return false;
      }
      if (subjectFilter !== "all" && a.subjectId !== subjectFilter) {
        return false;
      }
      if (statusFilter === "published" && !a.isPublished) {
        return false;
      }
      if (statusFilter === "draft" && a.isPublished) {
        return false;
      }
      return true;
    });
  }, [allAssignments, searchQuery, subjectFilter, statusFilter]);

  const getPriorityBadge = (priority: AssignmentPriority) => {
    switch (priority) {
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-semantic-error-subtle text-semantic-error border border-semantic-error/20">
            High
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-semantic-warning-subtle text-semantic-warning border border-semantic-warning/20">
            Medium
          </span>
        );
      case "Low":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-subtle text-indigo border border-indigo/20">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Sub-Navigation */}
      <StaffHeaderNav />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-navy text-white flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Staff Portal Prototype</span>
            </span>
            <span className="text-neutral-border text-xs">•</span>
            <span className="text-xs text-neutral-secondary font-medium">
              UIT RGPV Faculty Console
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-navy tracking-tight leading-tight">
            Assignment Management
          </h1>
          <p className="text-[13px] sm:text-[14px] text-neutral-secondary mt-1">
            Publish academic assignments, upload course reference files, and manage publication state.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-center flex-shrink-0">
          <Link
            href="/assignments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors shadow-card"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Student View</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-input bg-indigo text-white text-xs font-semibold hover:bg-indigo-hover transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-4 rounded-card bg-semantic-warning-subtle/50 border border-semantic-warning/30 text-xs text-navy leading-relaxed space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-navy">
          <ShieldAlert className="w-4 h-4 text-semantic-warning" />
          <span>Notice: Authorized Staff Interface Prototype</span>
        </div>
        <p className="text-neutral-secondary">
          This is an interactive frontend prototype of the future teacher/staff portal. Authentication and server-side RBAC have not yet been connected. Actions performed here persist in local browser storage and demonstrate staff-to-student publishing workflows.
        </p>
      </div>

      {/* Staff KPI Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Managed Assignments */}
        <div className="bg-surface rounded-card border border-neutral-border p-4 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-secondary">
            Total Tasks
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-navy leading-none tabular-nums">
              {staffStats.total}
            </span>
            <span className="text-xs text-neutral-secondary font-medium">courses</span>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-2">All managed assignments</p>
        </div>

        {/* Published */}
        <div className="bg-surface rounded-card border border-neutral-border p-4 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-secondary">
            Published Live
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-semantic-success leading-none tabular-nums">
              {staffStats.published}
            </span>
            <span className="text-[10px] font-semibold text-semantic-success bg-semantic-success-subtle px-1.5 py-0.5 rounded-full">
              Live for students
            </span>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-2">Visible on student portal</p>
        </div>

        {/* Drafts */}
        <div className="bg-surface rounded-card border border-neutral-border p-4 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-secondary">
            Drafts / Hidden
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-neutral-secondary leading-none tabular-nums">
              {staffStats.draft}
            </span>
            <span className="text-[10px] font-semibold text-neutral-secondary bg-neutral-light px-1.5 py-0.5 rounded-full">
              Unpublished
            </span>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-2">Hidden from student views</p>
        </div>

        {/* Total Attachments */}
        <div className="bg-surface rounded-card border border-neutral-border p-4 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-secondary">
            Attached Files
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-indigo leading-none tabular-nums">
              {staffStats.totalAttachments}
            </span>
            <span className="text-xs text-neutral-secondary font-medium">resources</span>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-2">PDFs and diagrams stored</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-card border border-neutral-border p-4 shadow-card flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-neutral-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by assignment title..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-input border border-neutral-border bg-neutral-light/50 text-navy placeholder:text-neutral-secondary/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-2 rounded-input border border-neutral-border bg-surface text-xs font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo cursor-pointer min-w-[160px]"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} — {s.name}
            </option>
          ))}
        </select>

        {/* Visibility Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-input border border-neutral-border bg-surface text-xs font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo cursor-pointer min-w-[140px]"
        >
          <option value="all">All Visibilities</option>
          <option value="published">Published Only</option>
          <option value="draft">Drafts Only</option>
        </select>
      </div>

      {/* Staff Assignments List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs text-neutral-secondary">
          <span>
            Showing <strong className="text-navy">{filteredAssignments.length}</strong> of{" "}
            <strong className="text-navy">{allAssignments.length}</strong> total course assignments
          </span>
          <span className="text-[11px]">Click &quot;Unpublish&quot; to hide from students</span>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="bg-surface rounded-card border border-neutral-border p-10 text-center shadow-card">
            <FolderOpen className="w-10 h-10 text-neutral-secondary/60 mx-auto mb-2.5" />
            <h3 className="text-sm font-bold text-navy">No assignments found</h3>
            <p className="text-xs text-neutral-secondary mt-1 max-w-sm mx-auto">
              No assignments match your search or filter criteria. Click &quot;Create Assignment&quot; to publish new coursework.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`bg-surface rounded-card border p-4 sm:p-5 shadow-card transition-all ${
                  assignment.isPublished
                    ? "border-neutral-border hover:border-neutral-border/80"
                    : "border-neutral-border/70 bg-neutral-light/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Publication Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          assignment.isPublished
                            ? "bg-semantic-success-subtle text-semantic-success border-semantic-success/20"
                            : "bg-neutral-light text-neutral-secondary border-neutral-border"
                        }`}
                      >
                        {assignment.isPublished ? (
                          <>
                            <Globe className="w-3 h-3" />
                            <span>Published (Live)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Draft (Hidden)</span>
                          </>
                        )}
                      </span>

                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-subtle text-indigo border border-indigo/20">
                        {assignment.subjectCode}
                      </span>
                      <span className="text-xs text-neutral-secondary font-medium">
                        {assignment.subjectName}
                      </span>

                      {getPriorityBadge(assignment.priority)}
                    </div>

                    <h3 className="text-[16px] font-bold text-navy">
                      {assignment.title}
                    </h3>

                    {assignment.description && (
                      <p className="text-xs text-neutral-secondary line-clamp-2">
                        {assignment.description}
                      </p>
                    )}

                    {/* Metadata: Dates & Attachments */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-xs text-neutral-secondary">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-secondary" />
                        <span>Due: <strong className="text-navy">{formatDisplayDate(assignment.dueDate)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Assigned: {formatDisplayDate(assignment.assignedDate)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-indigo font-medium">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{assignment.attachments?.length || 0} attachment(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center sm:flex-col sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-border">
                    {/* Publish / Unpublish Toggle */}
                    <button
                      type="button"
                      onClick={() => togglePublishStatus(assignment.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input text-xs font-semibold border transition-colors ${
                        assignment.isPublished
                          ? "bg-surface border-neutral-border text-neutral-secondary hover:text-navy hover:bg-neutral-light"
                          : "bg-semantic-success-subtle border-semantic-success/30 text-semantic-success hover:bg-semantic-success hover:text-white"
                      }`}
                      title={assignment.isPublished ? "Unpublish to hide from students" : "Publish live to students"}
                    >
                      {assignment.isPublished ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Unpublish</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5" />
                          <span>Publish Live</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingAssignment(assignment)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors"
                        title="Edit assignment details and attachments"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingAssignment(assignment)}
                        className="p-1.5 rounded-input text-neutral-secondary hover:text-semantic-error hover:bg-neutral-light transition-colors"
                        title="Delete assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <StaffAssignmentModal
        isOpen={isCreateModalOpen || Boolean(editingAssignment)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAssignment(null);
        }}
        assignmentToEdit={editingAssignment}
      />

      {/* Delete Confirmation Modal */}
      <StaffDeleteModal
        isOpen={Boolean(deletingAssignment)}
        onClose={() => setDeletingAssignment(null)}
        assignment={deletingAssignment}
        onConfirm={() => {
          if (deletingAssignment) {
            deleteStaffAssignment(deletingAssignment.id);
          }
        }}
      />
    </div>
  );
}
