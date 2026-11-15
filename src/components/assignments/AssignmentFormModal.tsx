"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle, Calendar, Plus, Check } from "lucide-react";
import { Assignment, AssignmentFormData, AssignmentPriority, AssignmentStatus } from "@/types/assignment";
import { useAssignments } from "@/context/AssignmentsContext";
import { getTodayDateString } from "@/lib/assignmentUtils";

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentToEdit?: Assignment | null;
}

export function AssignmentFormModal({
  isOpen,
  onClose,
  assignmentToEdit,
}: AssignmentFormModalProps) {
  const { subjects, addAssignment, editAssignment } = useAssignments();

  const isEditing = Boolean(assignmentToEdit);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<AssignmentPriority>("Medium");
  const [status, setStatus] = useState<AssignmentStatus>("Pending");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form when modal opens or target assignment changes
  useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      setIsSubmitting(false);

      if (assignmentToEdit) {
        setTitle(assignmentToEdit.title);
        setDescription(assignmentToEdit.description || "");
        setSubjectId(assignmentToEdit.subjectId);
        setAssignedDate(assignmentToEdit.assignedDate);
        setDueDate(assignmentToEdit.dueDate);
        setPriority(assignmentToEdit.priority);
        setStatus(assignmentToEdit.status);
      } else {
        const today = getTodayDateString();
        // Default due date: 7 days from today
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const y = nextWeek.getFullYear();
        const m = String(nextWeek.getMonth() + 1).padStart(2, "0");
        const d = String(nextWeek.getDate()).padStart(2, "0");
        const defaultDue = `${y}-${m}-${d}`;

        setTitle("");
        setDescription("");
        setSubjectId(subjects.length > 0 ? subjects[0].id : "");
        setAssignedDate(today);
        setDueDate(defaultDue);
        setPriority("Medium");
        setStatus("Pending");
      }
    }
  }, [isOpen, assignmentToEdit, subjects]);

  // Keyboard shortcut for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submission clicks
    if (isSubmitting) return;

    // Field validations
    if (!title.trim()) {
      setValidationError("Assignment title is required.");
      return;
    }
    if (!subjectId) {
      setValidationError("Please select a subject from the catalogue.");
      return;
    }
    if (!assignedDate) {
      setValidationError("Please specify an assigned date.");
      return;
    }
    if (!dueDate) {
      setValidationError("Please specify a due date.");
      return;
    }
    if (dueDate < assignedDate) {
      setValidationError("Due date cannot be earlier than assigned date.");
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const payload: AssignmentFormData = {
      title: title.trim(),
      description: description.trim(),
      subjectId,
      assignedDate,
      dueDate,
      priority,
      status,
    };

    let result;
    if (isEditing && assignmentToEdit) {
      result = editAssignment(assignmentToEdit.id, payload);
    } else {
      result = addAssignment(payload);
    }

    if (result.success) {
      setIsSubmitting(false);
      onClose();
    } else {
      setValidationError(result.error || "Failed to save assignment.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assignment-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg bg-surface rounded-card border border-neutral-border p-6 sm:p-7 shadow-modal space-y-5 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-neutral-border">
          <div>
            <h2 id="assignment-modal-title" className="text-[18px] font-bold text-navy">
              {isEditing ? "Edit Assignment" : "Create New Assignment"}
            </h2>
            <p className="text-xs text-neutral-secondary mt-0.5">
              {isEditing
                ? "Update assignment details, due date or priority"
                : "Add a course task to your personal academic tracker"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-input text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 rounded-input bg-semantic-error-subtle border border-semantic-error/30 text-semantic-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assignment Title */}
          <div>
            <label
              htmlFor="assignment-title"
              className="block text-xs font-semibold text-navy mb-1.5"
            >
              Assignment Title <span className="text-semantic-error">*</span>
            </label>
            <input
              id="assignment-title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Engineering Chemistry Lab Report"
              className="w-full px-3.5 py-2 text-xs rounded-input border border-neutral-border bg-neutral-light/50 text-navy placeholder:text-neutral-secondary/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:border-indigo transition-all"
            />
          </div>

          {/* Subject Dropdown */}
          <div>
            <label
              htmlFor="assignment-subject"
              className="block text-xs font-semibold text-navy mb-1.5"
            >
              Course Subject <span className="text-semantic-error">*</span>
            </label>
            <select
              id="assignment-subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-input border border-neutral-border bg-surface text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:border-indigo transition-all cursor-pointer font-medium"
            >
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  {subj.code} — {subj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates: Assigned Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="assigned-date"
                className="block text-xs font-semibold text-navy mb-1.5 flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5 text-neutral-secondary" />
                <span>Assigned Date</span>
              </label>
              <input
                id="assigned-date"
                type="date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-input border border-neutral-border bg-surface text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="due-date"
                className="block text-xs font-semibold text-navy mb-1.5 flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo" />
                <span>Due Date <span className="text-semantic-error">*</span></span>
              </label>
              <input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-input border border-neutral-border bg-surface text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all"
              />
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Low", "Medium", "High"] as AssignmentPriority[]).map((p) => {
                const isSelected = priority === p;
                let activeStyle = "";
                if (p === "High") {
                  activeStyle = isSelected
                    ? "bg-semantic-error-subtle text-semantic-error border-semantic-error font-bold"
                    : "hover:bg-semantic-error-subtle/30 text-neutral-secondary border-neutral-border";
                } else if (p === "Medium") {
                  activeStyle = isSelected
                    ? "bg-semantic-warning-subtle text-semantic-warning border-semantic-warning font-bold"
                    : "hover:bg-semantic-warning-subtle/30 text-neutral-secondary border-neutral-border";
                } else {
                  activeStyle = isSelected
                    ? "bg-indigo-subtle text-indigo border-indigo font-bold"
                    : "hover:bg-indigo-subtle/30 text-neutral-secondary border-neutral-border";
                }

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-input text-xs border transition-all text-center flex items-center justify-center gap-1.5 ${activeStyle}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p === "High"
                          ? "bg-semantic-error"
                          : p === "Medium"
                          ? "bg-semantic-warning"
                          : "bg-indigo"
                      }`}
                    />
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">
              Completion Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("Pending")}
                className={`py-2 px-3 rounded-input text-xs border transition-all text-center flex items-center justify-center gap-1.5 ${
                  status === "Pending"
                    ? "bg-semantic-warning-subtle text-semantic-warning border-semantic-warning font-bold"
                    : "hover:bg-neutral-light text-neutral-secondary border-neutral-border"
                }`}
              >
                <span>Pending</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus("Completed")}
                className={`py-2 px-3 rounded-input text-xs border transition-all text-center flex items-center justify-center gap-1.5 ${
                  status === "Completed"
                    ? "bg-semantic-success-subtle text-semantic-success border-semantic-success font-bold"
                    : "hover:bg-neutral-light text-neutral-secondary border-neutral-border"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Completed</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-secondary mt-1">
              Marked for your own study progress.
            </p>
          </div>

          {/* Description (Optional) */}
          <div>
            <label
              htmlFor="assignment-desc"
              className="block text-xs font-semibold text-navy mb-1.5"
            >
              Description / Notes <span className="text-neutral-secondary font-normal">(Optional)</span>
            </label>
            <textarea
              id="assignment-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Problems 1-8, include circuit diagrams, submit on ruled sheets..."
              className="w-full px-3.5 py-2 text-xs rounded-input border border-neutral-border bg-neutral-light/50 text-navy placeholder:text-neutral-secondary/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:border-indigo transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-input border border-neutral-border text-xs font-semibold text-navy hover:bg-neutral-light transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-input bg-indigo text-white text-xs font-semibold hover:bg-indigo-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : isEditing ? (
                <span>Save Changes</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
