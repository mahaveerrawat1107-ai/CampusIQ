"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  ClipboardList,
  X,
  Layers,
} from "lucide-react";
import { Assignment, AssignmentPriority } from "@/types/assignment";
import { useAssignments } from "@/context/AssignmentsContext";
import { AssignmentCard } from "./AssignmentCard";
import { AssignmentFormModal } from "./AssignmentFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { isAssignmentOverdue } from "@/lib/assignmentUtils";

type StatusFilter = "all" | "Pending" | "Completed" | "Overdue";
type PriorityFilter = "all" | AssignmentPriority;
type SortOption = "nearest_due" | "furthest_due" | "priority_high" | "title_asc";

export function AssignmentList() {
  const { assignments, subjects, toggleAssignmentStatus, deleteAssignment } =
    useAssignments();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("nearest_due");

  // Modal states
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const priorityWeights: Record<AssignmentPriority, number> = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  // Filtered & Sorted list
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((item) => {
        // Search query filter (title)
        if (
          searchQuery.trim() &&
          !item.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
        ) {
          return false;
        }

        // Subject filter
        if (subjectFilter !== "all" && item.subjectId !== subjectFilter) {
          return false;
        }

        // Status filter
        if (statusFilter === "Pending" && item.status !== "Pending") {
          return false;
        }
        if (statusFilter === "Completed" && item.status !== "Completed") {
          return false;
        }
        if (statusFilter === "Overdue" && !isAssignmentOverdue(item)) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== "all" && item.priority !== priorityFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "nearest_due":
            return a.dueDate.localeCompare(b.dueDate);
          case "furthest_due":
            return b.dueDate.localeCompare(a.dueDate);
          case "priority_high":
            return priorityWeights[b.priority] - priorityWeights[a.priority];
          case "title_asc":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [
    assignments,
    searchQuery,
    subjectFilter,
    statusFilter,
    priorityFilter,
    sortBy,
  ]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    subjectFilter !== "all" ||
    statusFilter !== "all" ||
    priorityFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSubjectFilter("all");
    setStatusFilter("all");
    setPriorityFilter("all");
    setSortBy("nearest_due");
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsEditModalOpen(true);
  };

  const handleDelete = (assignment: Assignment) => {
    setDeletingAssignment(assignment);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search + Filter Dropdowns */}
      <div className="bg-surface rounded-card border border-neutral-border p-4 shadow-card space-y-3">
        {/* Search Row */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments by title..."
            className="w-full pl-9 pr-9 py-2 text-xs rounded-input border border-neutral-border bg-neutral-light/50 text-navy placeholder:text-neutral-secondary/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-secondary hover:text-navy"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 flex-1 min-w-[140px] sm:min-w-[180px]">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-input border border-neutral-border bg-surface text-xs font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo cursor-pointer"
              aria-label="Filter by subject"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[120px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-2.5 py-1.5 rounded-input border border-neutral-border bg-surface text-xs font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending only</option>
              <option value="Completed">Completed only</option>
              <option value="Overdue">Overdue only</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex-1 min-w-[110px]">
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as PriorityFilter)
              }
              className="w-full px-2.5 py-1.5 rounded-input border border-neutral-border bg-surface text-xs font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo cursor-pointer"
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex-1 min-w-[140px]">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-secondary hidden sm:inline" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-2.5 py-1.5 rounded-input border border-neutral-border bg-surface text-xs font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo cursor-pointer"
                aria-label="Sort assignments"
              >
                <option value="nearest_due">Nearest Due Date</option>
                <option value="furthest_due">Furthest Due Date</option>
                <option value="priority_high">Highest Priority</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-2.5 py-1.5 rounded-input border border-neutral-border bg-neutral-light text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors inline-flex items-center gap-1 flex-shrink-0"
              title="Clear all active filters"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-neutral-secondary">
        <div>
          Showing{" "}
          <strong className="text-navy">{filteredAssignments.length}</strong> of{" "}
          <strong className="text-navy">{assignments.length}</strong> assignments
          {hasActiveFilters && " (filtered)"}
        </div>
      </div>

      {/* Assignment Items List */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-surface rounded-card border border-neutral-border p-10 text-center shadow-card">
          <div className="w-12 h-12 rounded-full bg-neutral-light text-neutral-secondary flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-navy">No assignments found</h3>
          <p className="text-xs text-neutral-secondary mt-1 max-w-sm mx-auto leading-relaxed">
            {hasActiveFilters
              ? "No assignments match your search query or filter settings. Try adjusting or clearing your filters."
              : "No course assignments have been recorded yet. Click 'Add Assignment' above to create one."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-4 px-3.5 py-2 rounded-input bg-neutral-light border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onToggleStatus={toggleAssignmentStatus}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AssignmentFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAssignment(null);
        }}
        assignmentToEdit={editingAssignment}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAssignment(null);
        }}
        assignment={deletingAssignment}
        onConfirm={() => {
          if (deletingAssignment) {
            deleteAssignment(deletingAssignment.id);
          }
        }}
      />
    </div>
  );
}
