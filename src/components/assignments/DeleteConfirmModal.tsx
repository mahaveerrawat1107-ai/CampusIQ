"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Assignment } from "@/types/assignment";

interface DeleteConfirmModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  assignment,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !assignment) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-surface rounded-card border border-neutral-border p-6 shadow-modal space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-input bg-semantic-error-subtle text-semantic-error flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
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

        <div>
          <h3 id="delete-modal-title" className="text-[17px] font-bold text-navy">
            Delete Assignment
          </h3>
          <p className="text-xs text-neutral-secondary mt-1.5 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-navy">
              &quot;{assignment.title}&quot;
            </span>
            ? This action cannot be undone.
          </p>
        </div>

        <div className="p-3 rounded-input bg-neutral-light border border-neutral-border text-xs text-neutral-secondary space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-secondary">Subject:</span>
            <span className="font-semibold text-navy">{assignment.subjectCode} — {assignment.subjectName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-secondary">Due Date:</span>
            <span className="font-semibold text-navy">{assignment.dueDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-secondary">Status:</span>
            <span className="font-semibold text-navy">{assignment.status}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-input border border-neutral-border text-xs font-semibold text-navy hover:bg-neutral-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-input bg-semantic-error text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
