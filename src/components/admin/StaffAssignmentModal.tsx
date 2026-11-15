"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  AlertCircle,
  Calendar,
  Plus,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Eye,
  CheckCircle2,
} from "lucide-react";
import {
  Assignment,
  StaffAssignmentFormData,
  AssignmentPriority,
  AssignmentAttachment,
} from "@/types/assignment";
import { useAssignments } from "@/context/AssignmentsContext";
import { getTodayDateString } from "@/lib/assignmentUtils";
import {
  validateAttachmentFile,
  formatFileSize,
  saveAttachmentBlob,
  ALLOWED_EXTENSIONS,
} from "@/lib/attachmentStorage";

interface StaffAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentToEdit?: Assignment | null;
}

export function StaffAssignmentModal({
  isOpen,
  onClose,
  assignmentToEdit,
}: StaffAssignmentModalProps) {
  const { subjects, createStaffAssignment, editStaffAssignment } = useAssignments();

  const isEditing = Boolean(assignmentToEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<AssignmentPriority>("Medium");
  const [isPublished, setIsPublished] = useState(true);
  const [createdBy, setCreatedBy] = useState("Dr. Faculty (CSE Dept)");
  const [attachments, setAttachments] = useState<AssignmentAttachment[]>([]);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      setUploadError(null);
      setIsSubmitting(false);

      if (assignmentToEdit) {
        setTitle(assignmentToEdit.title);
        setDescription(assignmentToEdit.description || "");
        setSubjectId(assignmentToEdit.subjectId);
        setAssignedDate(assignmentToEdit.assignedDate);
        setDueDate(assignmentToEdit.dueDate);
        setPriority(assignmentToEdit.priority);
        setIsPublished(assignmentToEdit.isPublished);
        setCreatedBy(assignmentToEdit.createdBy || "Authorized Faculty (UIT RGPV)");
        setAttachments(assignmentToEdit.attachments || []);
      } else {
        const today = getTodayDateString();
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
        setIsPublished(true);
        setCreatedBy("Prof. Faculty (CSE Department)");
        setAttachments([]);
      }
    }
  }, [isOpen, assignmentToEdit, subjects]);

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

  // Handle file uploads safely with IndexedDB persistence
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);

    const newAttachments: AssignmentAttachment[] = [...attachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateAttachmentFile(file);

      if (!validation.valid) {
        setUploadError(validation.error || "File upload failed.");
        continue;
      }

      const storageKey = `att_blob_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const saved = await saveAttachmentBlob(storageKey, file, {
        name: file.name,
        mimeType: file.type,
      });

      if (!saved) {
        setUploadError(
          `Could not store attachment "${file.name}" in local IndexedDB. Upload was aborted.`
        );
        continue;
      }

      // Convert image files to data URL for instant rendering if possible, otherwise rely on IndexedDB key
      let dataUrl: string | undefined = undefined;
      if (validation.fileType === "image" && file.size < 2 * 1024 * 1024) {
        dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(undefined);
          reader.readAsDataURL(file);
        });
      }

      newAttachments.push({
        id: `att-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        fileType: validation.fileType!,
        mimeType: file.type,
        fileSize: file.size,
        fileSizeFormatted: formatFileSize(file.size),
        uploadedAt: new Date().toISOString(),
        storageKey,
        dataUrl,
      });
    }

    setAttachments(newAttachments);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title.trim()) {
      setValidationError("Assignment title is required.");
      return;
    }
    if (!subjectId) {
      setValidationError("Please select a subject.");
      return;
    }
    if (!assignedDate) {
      setValidationError("Assigned date is required.");
      return;
    }
    if (!dueDate) {
      setValidationError("Due date is required.");
      return;
    }
    if (dueDate < assignedDate) {
      setValidationError("Due date cannot be earlier than assigned date.");
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const payload: StaffAssignmentFormData = {
      title: title.trim(),
      description: description.trim(),
      subjectId,
      assignedDate,
      dueDate,
      priority,
      isPublished,
      createdBy: createdBy.trim(),
      attachments,
    };

    let result;
    if (isEditing && assignmentToEdit) {
      result = editStaffAssignment(assignmentToEdit.id, payload);
    } else {
      result = createStaffAssignment(payload);
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
      aria-labelledby="staff-assignment-modal-title"
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
                Staff Portal Prototype
              </span>
            </div>
            <h2 id="staff-assignment-modal-title" className="text-[19px] font-bold text-navy">
              {isEditing ? "Edit Course Assignment" : "Publish New Course Assignment"}
            </h2>
            <p className="text-xs text-neutral-secondary mt-0.5">
              Authorized faculty interface for UIT RGPV Shivpuri (B.Tech 1st Year CSE)
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
          {/* Assignment Title */}
          <div>
            <label
              htmlFor="staff-assignment-title"
              className="block text-xs font-semibold text-navy mb-1.5"
            >
              Assignment Title <span className="text-semantic-error">*</span>
            </label>
            <input
              id="staff-assignment-title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 2: Thevenin and Norton Theorem Problem Set"
              className="w-full px-3.5 py-2 text-xs rounded-input border border-neutral-border bg-neutral-light/50 text-navy placeholder:text-neutral-secondary/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:border-indigo transition-all"
            />
          </div>

          {/* Subject & Faculty Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="staff-assignment-subject"
                className="block text-xs font-semibold text-navy mb-1.5"
              >
                Course Subject <span className="text-semantic-error">*</span>
              </label>
              <select
                id="staff-assignment-subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-input border border-neutral-border bg-surface text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all cursor-pointer font-medium"
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.code} — {subj.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="staff-assignment-author"
                className="block text-xs font-semibold text-navy mb-1.5"
              >
                Publishing Faculty / Instructor
              </label>
              <input
                id="staff-assignment-author"
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="e.g. Dr. P.K. Mishra"
                className="w-full px-3 py-2 text-xs rounded-input border border-neutral-border bg-surface text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all"
              />
            </div>
          </div>

          {/* Dates: Assigned & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="staff-assigned-date"
                className="block text-xs font-semibold text-navy mb-1.5 flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5 text-neutral-secondary" />
                <span>Assigned Date</span>
              </label>
              <input
                id="staff-assigned-date"
                type="date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-input border border-neutral-border bg-surface text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="staff-due-date"
                className="block text-xs font-semibold text-navy mb-1.5 flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo" />
                <span>Due Date <span className="text-semantic-error">*</span></span>
              </label>
              <input
                id="staff-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-input border border-neutral-border bg-surface text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all"
              />
            </div>
          </div>

          {/* Priority & Publication Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Priority */}
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
                      className={`py-1.5 px-2 rounded-input text-xs border transition-all text-center flex items-center justify-center gap-1.5 ${activeStyle}`}
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

            {/* Publication Status */}
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                Visibility / Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublished(true)}
                  className={`py-1.5 px-3 rounded-input text-xs border transition-all text-center flex items-center justify-center gap-1.5 ${
                    isPublished
                      ? "bg-semantic-success-subtle text-semantic-success border-semantic-success font-bold"
                      : "hover:bg-neutral-light text-neutral-secondary border-neutral-border"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Published</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublished(false)}
                  className={`py-1.5 px-3 rounded-input text-xs border transition-all text-center flex items-center justify-center gap-1.5 ${
                    !isPublished
                      ? "bg-neutral-light text-navy border-neutral-border font-bold"
                      : "hover:bg-neutral-light text-neutral-secondary border-neutral-border"
                  }`}
                >
                  <span>Draft</span>
                </button>
              </div>
              <p className="text-[11px] text-neutral-secondary mt-1">
                {isPublished ? "Visible to students on dashboard." : "Hidden from students (draft mode)."}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="staff-assignment-desc"
              className="block text-xs font-semibold text-navy mb-1.5"
            >
              Assignment Instructions &amp; Description
            </label>
            <textarea
              id="staff-assignment-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail required experiments, question numbers, formatting guidelines..."
              className="w-full px-3.5 py-2 text-xs rounded-input border border-neutral-border bg-neutral-light/50 text-navy placeholder:text-neutral-secondary/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:border-indigo transition-all resize-none"
            />
          </div>

          {/* Attachments Section */}
          <div className="pt-2 border-t border-neutral-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-xs font-semibold text-navy">
                  Assignment Attachments
                </label>
                <p className="text-[11px] text-neutral-secondary">
                  Attach reference PDFs, lab sheets, or technical diagrams (PDF, JPG, PNG, WEBP — Max 10 MB each)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS.join(",")}
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors shadow-xs disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? "Uploading..." : "Upload Files"}</span>
              </button>
            </div>

            {uploadError && (
              <div className="p-2.5 mb-2 rounded-input bg-semantic-error-subtle border border-semantic-error/30 text-semantic-error text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* List of Attached Files */}
            {attachments.length === 0 ? (
              <div className="p-4 rounded-input border border-neutral-border/80 border-dashed text-center text-xs text-neutral-secondary bg-neutral-light/40">
                No attachments uploaded yet. Click &quot;Upload Files&quot; above to attach course reference material.
              </div>
            ) : (
              <div className="space-y-1.5">
                {attachments.map((att) => {
                  const isPdf = att.fileType === "pdf";
                  return (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2 rounded-input bg-neutral-light border border-neutral-border text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                            isPdf
                              ? "bg-semantic-error-subtle text-semantic-error"
                              : "bg-indigo-subtle text-indigo"
                          }`}
                        >
                          {isPdf ? (
                            <FileText className="w-3 h-3" />
                          ) : (
                            <ImageIcon className="w-3 h-3" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-navy truncate">{att.name}</p>
                          <p className="text-[10px] text-neutral-secondary">
                            {att.fileSizeFormatted}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1 rounded text-neutral-secondary hover:text-semantic-error transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="px-4 py-2 rounded-input border border-neutral-border text-xs font-semibold text-navy hover:bg-neutral-light transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-input bg-indigo text-white text-xs font-semibold hover:bg-indigo-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Publishing...</span>
              ) : isEditing ? (
                <span>Update Assignment</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
