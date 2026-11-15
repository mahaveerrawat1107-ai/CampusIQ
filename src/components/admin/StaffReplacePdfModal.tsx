"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { AcademicNote } from "@/types/notes";
import { useNotes } from "@/context/NotesContext";
import { validateNotePdfFile, formatFileSize } from "@/lib/notesStorage";

interface StaffReplacePdfModalProps {
  note: AcademicNote | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StaffReplacePdfModal({
  note,
  isOpen,
  onClose,
}: StaffReplacePdfModalProps) {
  const { replaceNotePdf } = useNotes();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !note) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateNotePdfFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file format.");
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleReplace = async () => {
    if (!selectedFile) {
      setError("Please select a new PDF document.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await replaceNotePdf(note.id, selectedFile);
    if (result.success) {
      setIsSubmitting(false);
      onClose();
    } else {
      setError(result.error || "Failed to replace PDF file.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="replace-pdf-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg bg-surface rounded-card border border-neutral-border p-6 shadow-modal space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-neutral-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-subtle text-indigo">
                {note.subjectCode} • {note.unitTitle}
              </span>
            </div>
            <h3 id="replace-pdf-modal-title" className="text-[18px] font-bold text-navy">
              Replace Academic PDF File
            </h3>
            <p className="text-xs text-neutral-secondary mt-0.5">
              Update the stored PDF while preserving existing note metadata and unit assignment.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-input text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Note Info */}
        <div className="p-3 rounded-input bg-neutral-light border border-neutral-border text-xs text-neutral-secondary space-y-1">
          <div className="flex justify-between">
            <span>Document Title:</span>
            <strong className="text-navy">{note.title}</strong>
          </div>
          <div className="flex justify-between">
            <span>Current File:</span>
            <span className="font-semibold text-navy">{note.fileName} ({note.fileSizeFormatted})</span>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-input bg-semantic-error-subtle border border-semantic-error/30 text-semantic-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* File Picker */}
        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5">
            Select Replacement PDF <span className="text-semantic-error">*</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="replace-pdf-input"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-border hover:border-indigo/50 rounded-card p-5 text-center cursor-pointer bg-neutral-light/30 hover:bg-neutral-light/60 transition-colors"
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-navy">
                <FileText className="w-4 h-4 text-semantic-error" />
                <span>{selectedFile.name}</span>
                <span className="text-neutral-secondary font-medium">
                  ({formatFileSize(selectedFile.size)})
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-6 h-6 text-indigo mx-auto mb-1" />
                <p className="text-xs font-semibold text-navy">
                  Click to choose new replacement PDF
                </p>
                <p className="text-[11px] text-neutral-secondary">
                  PDF format only • Maximum 15 MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-input border border-neutral-border text-xs font-semibold text-navy hover:bg-neutral-light transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleReplace}
            disabled={!selectedFile || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-input bg-indigo text-white text-xs font-semibold hover:bg-indigo-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
            <span>{isSubmitting ? "Replacing File..." : "Confirm & Replace PDF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
