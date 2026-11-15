"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  AlertCircle,
  Upload,
  FileText,
  Plus,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { AcademicNote, StaffNoteFormData } from "@/types/notes";
import { useNotes } from "@/context/NotesContext";
import { getSubjectUnits } from "@/data/notesCatalogue";
import { validateNotePdfFile, formatFileSize } from "@/lib/notesStorage";

interface StaffNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: AcademicNote | null;
}

export function StaffNoteModal({
  isOpen,
  onClose,
  noteToEdit,
}: StaffNoteModalProps) {
  const { subjects, createStaffNote, editStaffNote } = useNotes();
  const isEditing = Boolean(noteToEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [semester] = useState(1);
  const [subjectId, setSubjectId] = useState("");
  const [unit, setUnit] = useState<number>(1);
  const [isPublished, setIsPublished] = useState(true);
  const [uploadedBy, setUploadedBy] = useState("Dr. P.K. Mishra (Dept. of Chemistry)");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contextual units based on selected subject
  const currentUnits = getSubjectUnits(subjectId || (subjects[0] ? subjects[0].id : "sub-bt101"));

  useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      setIsSubmitting(false);

      if (noteToEdit) {
        setTitle(noteToEdit.title);
        setDescription(noteToEdit.description || "");
        setSubjectId(noteToEdit.subjectId);
        setUnit(noteToEdit.unit);
        setIsPublished(noteToEdit.isPublished);
        setUploadedBy(noteToEdit.uploadedBy || "Faculty Instructor (UIT RGPV)");
        setSelectedFile(null);
      } else {
        const defaultSubj = subjects.length > 0 ? subjects[0].id : "sub-bt101";
        setTitle("");
        setDescription("");
        setSubjectId(defaultSubj);
        setUnit(1);
        setIsPublished(true);
        setUploadedBy("Faculty Instructor (UIT RGPV)");
        setSelectedFile(null);
      }
    }
  }, [isOpen, noteToEdit, subjects]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateNotePdfFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || "Invalid file.");
      setSelectedFile(null);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title.trim()) {
      setValidationError("Note title is required.");
      return;
    }
    if (!subjectId) {
      setValidationError("Please select a subject from the catalogue.");
      return;
    }
    if (!unit || unit < 1 || unit > 5) {
      setValidationError("Please select a syllabus unit.");
      return;
    }

    if (!isEditing && !selectedFile) {
      setValidationError("Please attach a PDF document for this note.");
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const payload: StaffNoteFormData = {
      title: title.trim(),
      description: description.trim(),
      semester,
      subjectId,
      unit,
      isPublished,
      uploadedBy: uploadedBy.trim(),
    };

    let result;
    if (isEditing && noteToEdit) {
      result = await editStaffNote(noteToEdit.id, payload);
    } else {
      result = await createStaffNote(payload, selectedFile!);
    }

    if (result.success) {
      setIsSubmitting(false);
      onClose();
    } else {
      setValidationError(result.error || "Failed to save note.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-note-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy/50 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-2xl bg-surface rounded-card border border-neutral-border p-6 sm:p-7 shadow-modal space-y-5 my-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-neutral-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-subtle text-indigo">
                Staff Notes Console
              </span>
            </div>
            <h2 id="staff-note-modal-title" className="text-[19px] font-bold text-navy">
              {isEditing ? "Edit Academic Note Metadata" : "Upload New Academic Notes (PDF)"}
            </h2>
            <p className="text-xs text-neutral-secondary mt-0.5">
              Faculty curation interface for UIT RGPV Shivpuri (B.Tech 1st Year CSE)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-input text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
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
          {/* Note Title */}
          <div>
            <label
              htmlFor="staff-note-title"
              className="block text-xs font-semibold text-navy mb-1.5"
            >
              Document / Note Title <span className="text-semantic-error">*</span>
            </label>
            <input
              id="staff-note-title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Linear Algebra, Rank of Matrix & Eigenvalues"
              className="w-full px-3.5 py-2 text-xs rounded-input border border-neutral-border bg-neutral-light/50 text-navy placeholder:text-neutral-secondary/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all"
            />
          </div>

          {/* Hierarchy: Semester, Subject & Contextual Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                Semester
              </label>
              <input
                type="text"
                disabled
                value="Semester 1 (1st Year)"
                className="w-full px-3 py-2 text-xs rounded-input border border-neutral-border bg-neutral-light text-neutral-secondary font-medium cursor-not-allowed"
              />
            </div>

            {/* Subject Dropdown */}
            <div>
              <label
                htmlFor="staff-note-subject"
                className="block text-xs font-semibold text-navy mb-1.5"
              >
                Course Subject <span className="text-semantic-error">*</span>
              </label>
              <select
                id="staff-note-subject"
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setUnit(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-input border border-neutral-border bg-surface text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all cursor-pointer font-medium"
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.code} — {subj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Contextual Unit Selection */}
            <div>
              <label
                htmlFor="staff-note-unit"
                className="block text-xs font-semibold text-navy mb-1.5"
              >
                Syllabus Unit <span className="text-semantic-error">*</span>
              </label>
              <select
                id="staff-note-unit"
                value={unit}
                onChange={(e) => setUnit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-input border border-neutral-border bg-surface text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all cursor-pointer font-medium"
              >
                {currentUnits.map((u) => (
                  <option key={u.unitNumber} value={u.unitNumber}>
                    Unit {u.unitNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contextual Unit Title Preview Banner */}
          <div className="p-2.5 rounded-input bg-indigo-subtle/50 border border-indigo/20 text-xs text-navy flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo flex-shrink-0" />
            <span>
              Target Syllabus Unit:{" "}
              <strong>{currentUnits.find((u) => u.unitNumber === unit)?.title || `Unit ${unit}`}</strong>
            </span>
          </div>

          {/* Faculty Instructor Name */}
          <div>
            <label
              htmlFor="staff-note-author"
              className="block text-xs font-semibold text-navy mb-1.5"
            >
              Author / Publishing Faculty
            </label>
            <input
              id="staff-note-author"
              type="text"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              placeholder="e.g. Dr. A. Gupta (Dept. of Applied Mathematics)"
              className="w-full px-3 py-2 text-xs rounded-input border border-neutral-border bg-surface text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="staff-note-desc"
              className="block text-xs font-semibold text-navy mb-1.5"
            >
              Description &amp; Syllabus Coverage <span className="text-neutral-secondary font-normal">(Optional)</span>
            </label>
            <textarea
              id="staff-note-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of lecture sub-topics, solved numericals, or revision questions..."
              className="w-full px-3.5 py-2 text-xs rounded-input border border-neutral-border bg-neutral-light/50 text-navy placeholder:text-neutral-secondary/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all resize-none"
            />
          </div>

          {/* Publication Status Selector */}
          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">
              Publication Visibility
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPublished(true)}
                className={`py-2 px-3 rounded-input text-xs border transition-all text-center flex items-center justify-center gap-1.5 ${
                  isPublished
                    ? "bg-semantic-success-subtle text-semantic-success border-semantic-success font-bold"
                    : "hover:bg-neutral-light text-neutral-secondary border-neutral-border"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Published (Visible to Students)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPublished(false)}
                className={`py-2 px-3 rounded-input text-xs border transition-all text-center flex items-center justify-center gap-1.5 ${
                  !isPublished
                    ? "bg-neutral-light text-navy border-neutral-border font-bold"
                    : "hover:bg-neutral-light text-neutral-secondary border-neutral-border"
                }`}
              >
                <span>Draft (Hidden from Students)</span>
              </button>
            </div>
          </div>

          {/* PDF File Uploader (Required when creating) */}
          {!isEditing ? (
            <div className="pt-2 border-t border-neutral-border">
              <label className="block text-xs font-semibold text-navy mb-1">
                Upload PDF Document <span className="text-semantic-error">*</span>
              </label>
              <p className="text-[11px] text-neutral-secondary mb-2">
                PDF format only. Maximum file size: 15 MB.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="note-pdf-upload"
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
                      Click to browse and upload course PDF
                    </p>
                    <p className="text-[11px] text-neutral-secondary">
                      Only valid PDF documents are accepted
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-input bg-neutral-light border border-neutral-border text-xs text-neutral-secondary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-semantic-error" />
                <span>
                  Current file: <strong className="text-navy">{noteToEdit?.fileName}</strong> ({noteToEdit?.fileSizeFormatted})
                </span>
              </div>
              <span className="text-[11px] text-indigo font-semibold">
                Use &quot;Replace PDF&quot; in table to update file
              </span>
            </div>
          )}

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
                <span>Saving Note...</span>
              ) : isEditing ? (
                <span>Save Changes</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload &amp; Save Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
