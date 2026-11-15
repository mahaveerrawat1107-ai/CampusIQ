"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Plus,
  ArrowLeft,
  Calendar,
  FileText,
  Trash2,
  Globe,
  EyeOff,
  Search,
  BookOpen,
  FolderOpen,
  FileEdit,
  RefreshCw,
  Eye,
  Download,
} from "lucide-react";
import { useNotes } from "@/context/NotesContext";
import { AcademicNote } from "@/types/notes";
import { formatDisplayDate } from "@/lib/assignmentUtils";
import { triggerNoteDownload, getNotePdfBlob } from "@/lib/notesStorage";
import { StaffHeaderNav } from "@/components/admin/StaffHeaderNav";
import { StaffNoteModal } from "@/components/admin/StaffNoteModal";
import { StaffReplacePdfModal } from "@/components/admin/StaffReplacePdfModal";
import { StaffDeleteNoteModal } from "@/components/admin/StaffDeleteNoteModal";
import { NotePdfViewerModal } from "@/components/notes/NotePdfViewerModal";
import { getSubjectUnits } from "@/data/notesCatalogue";

export default function StaffNotesPage() {
  const {
    allNotes,
    subjects,
    staffStats,
    toggleNotePublishStatus,
    deleteStaffNote,
  } = useNotes();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all, published, draft

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<AcademicNote | null>(null);
  const [replacingPdfNote, setReplacingPdfNote] = useState<AcademicNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<AcademicNote | null>(null);
  const [previewingNote, setPreviewingNote] = useState<AcademicNote | null>(null);

  const currentSubjectUnits = useMemo(() => {
    if (subjectFilter === "all") return [];
    return getSubjectUnits(subjectFilter);
  }, [subjectFilter]);

  const filteredNotes = useMemo(() => {
    return allNotes.filter((n) => {
      if (
        searchQuery.trim() &&
        !n.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) &&
        !n.fileName.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ) {
        return false;
      }
      if (subjectFilter !== "all" && n.subjectId !== subjectFilter) {
        return false;
      }
      if (unitFilter !== "all" && n.unit !== unitFilter) {
        return false;
      }
      if (statusFilter === "published" && !n.isPublished) {
        return false;
      }
      if (statusFilter === "draft" && n.isPublished) {
        return false;
      }
      return true;
    });
  }, [allNotes, searchQuery, subjectFilter, unitFilter, statusFilter]);

  const handleDownload = async (note: AcademicNote) => {
    if (note.dataUrl) {
      triggerNoteDownload(note.dataUrl, note.fileName);
      return;
    }
    const blob = await getNotePdfBlob(note.storageKey);
    if (blob) {
      triggerNoteDownload(blob, note.fileName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Header Sub-Nav: Assignments / Notes */}
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
              Academic Notes Curation
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-navy tracking-tight leading-tight">
            Notes Library Management
          </h1>
          <p className="text-[13px] sm:text-[14px] text-neutral-secondary mt-1">
            Upload official PDF lecture notes, organize by syllabus unit, and control student access.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-center flex-shrink-0">
          <Link
            href="/notes"
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
            <span>Upload Notes (PDF)</span>
          </button>
        </div>
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-4 rounded-card bg-semantic-warning-subtle/50 border border-semantic-warning/30 text-xs text-navy leading-relaxed space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-navy">
          <ShieldAlert className="w-4 h-4 text-semantic-warning" />
          <span>Notice: Authorized Faculty Notes Console</span>
        </div>
        <p className="text-neutral-secondary">
          Students have read-only access to published notes. All academic resources are uploaded, replaced, or unpublished exclusively by authorized staff. Notes stored here survive browser refresh and persist in local browser storage.
        </p>
      </div>

      {/* Staff KPI Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Notes */}
        <div className="bg-surface rounded-card border border-neutral-border p-4 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-secondary">
            Total Documents
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-navy leading-none tabular-nums">
              {staffStats.total}
            </span>
            <span className="text-xs text-neutral-secondary font-medium">PDFs</span>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-2">All uploaded course resources</p>
        </div>

        {/* Published Live */}
        <div className="bg-surface rounded-card border border-neutral-border p-4 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-secondary">
            Published Live
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-semantic-success leading-none tabular-nums">
              {staffStats.published}
            </span>
            <span className="text-[10px] font-semibold text-semantic-success bg-semantic-success-subtle px-1.5 py-0.5 rounded-full">
              Student visible
            </span>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-2">Available in Notes Library</p>
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

        {/* Subjects Covered */}
        <div className="bg-surface rounded-card border border-neutral-border p-4 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-secondary">
            Subjects Covered
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-indigo leading-none tabular-nums">
              {staffStats.totalSubjects}
            </span>
            <span className="text-xs text-neutral-secondary font-medium">courses</span>
          </div>
          <p className="text-[11px] text-neutral-secondary mt-2">Semester 1 CSE courses</p>
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
            placeholder="Search notes by document title or filename..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-input border border-neutral-border bg-neutral-light/50 text-navy placeholder:text-neutral-secondary/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={subjectFilter}
          onChange={(e) => {
            setSubjectFilter(e.target.value);
            setUnitFilter("all");
          }}
          className="px-3 py-2 rounded-input border border-neutral-border bg-surface text-xs font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo cursor-pointer min-w-[160px]"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} — {s.name}
            </option>
          ))}
        </select>

        {/* Contextual Unit Filter */}
        {subjectFilter !== "all" && (
          <select
            value={unitFilter}
            onChange={(e) =>
              setUnitFilter(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            className="px-3 py-2 rounded-input border border-neutral-border bg-surface text-xs font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-indigo cursor-pointer min-w-[130px]"
          >
            <option value="all">All Units</option>
            {currentSubjectUnits.map((u) => (
              <option key={u.unitNumber} value={u.unitNumber}>
                Unit {u.unitNumber}
              </option>
            ))}
          </select>
        )}

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

      {/* Staff Notes Table / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs text-neutral-secondary">
          <span>
            Showing <strong className="text-navy">{filteredNotes.length}</strong> of{" "}
            <strong className="text-navy">{allNotes.length}</strong> total course notes
          </span>
          <span className="text-[11px]">Click &quot;Unpublish&quot; to hide from students</span>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="bg-surface rounded-card border border-neutral-border p-10 text-center shadow-card">
            <FolderOpen className="w-10 h-10 text-neutral-secondary/60 mx-auto mb-2.5" />
            <h3 className="text-sm font-bold text-navy">No academic notes found</h3>
            <p className="text-xs text-neutral-secondary mt-1 max-w-sm mx-auto">
              No notes match your filters. Click &quot;Upload Notes (PDF)&quot; above to add new syllabus reference documents.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`bg-surface rounded-card border p-4 sm:p-5 shadow-card transition-all ${
                  note.isPublished
                    ? "border-neutral-border hover:border-neutral-border/80"
                    : "border-neutral-border/70 bg-neutral-light/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Note Details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Publication Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          note.isPublished
                            ? "bg-semantic-success-subtle text-semantic-success border-semantic-success/20"
                            : "bg-neutral-light text-neutral-secondary border-neutral-border"
                        }`}
                      >
                        {note.isPublished ? (
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
                        {note.subjectCode}
                      </span>
                      <span className="text-xs text-neutral-secondary font-medium">
                        {note.subjectName}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-light text-navy border border-neutral-border">
                        Unit {note.unit}
                      </span>
                    </div>

                    <h3 className="text-[16px] font-bold text-navy">
                      {note.title}
                    </h3>

                    <p className="text-xs text-neutral-secondary font-medium">
                      {note.unitTitle}
                    </p>

                    {note.description && (
                      <p className="text-xs text-neutral-secondary line-clamp-2">
                        {note.description}
                      </p>
                    )}

                    {/* File metadata row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-xs text-neutral-secondary">
                      <div className="flex items-center gap-1.5 font-medium text-navy">
                        <FileText className="w-3.5 h-3.5 text-semantic-error" />
                        <span>{note.fileName}</span>
                        <span className="text-neutral-secondary font-normal">({note.fileSizeFormatted})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-secondary" />
                        <span>Uploaded: {formatDisplayDate(note.uploadedAt.split("T")[0])}</span>
                      </div>
                      <div className="text-[11px] text-neutral-secondary">
                        By: {note.uploadedBy}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center sm:flex-col sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-border">
                    {/* Publish / Unpublish Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleNotePublishStatus(note.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input text-xs font-semibold border transition-colors ${
                        note.isPublished
                          ? "bg-surface border-neutral-border text-neutral-secondary hover:text-navy hover:bg-neutral-light"
                          : "bg-semantic-success-subtle border-semantic-success/30 text-semantic-success hover:bg-semantic-success hover:text-white"
                      }`}
                      title={note.isPublished ? "Unpublish to hide from students" : "Publish live to students"}
                    >
                      {note.isPublished ? (
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
                      {/* Preview PDF */}
                      <button
                        type="button"
                        onClick={() => setPreviewingNote(note)}
                        className="p-1.5 rounded-input text-neutral-secondary hover:text-indigo hover:bg-neutral-light transition-colors"
                        title="Preview PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Download PDF */}
                      <button
                        type="button"
                        onClick={() => handleDownload(note)}
                        className="p-1.5 rounded-input text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Replace PDF */}
                      <button
                        type="button"
                        onClick={() => setReplacingPdfNote(note)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-neutral-secondary hover:text-indigo hover:border-indigo/40 transition-colors"
                        title="Replace PDF file without losing note metadata"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace PDF</span>
                      </button>

                      {/* Edit Metadata */}
                      <button
                        type="button"
                        onClick={() => setEditingNote(note)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors"
                        title="Edit title, subject, unit, and description"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Note */}
                      <button
                        type="button"
                        onClick={() => setDeletingNote(note)}
                        className="p-1.5 rounded-input text-neutral-secondary hover:text-semantic-error hover:bg-neutral-light transition-colors"
                        title="Delete note"
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
      <StaffNoteModal
        isOpen={isCreateModalOpen || Boolean(editingNote)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingNote(null);
        }}
        noteToEdit={editingNote}
      />

      {/* Replace PDF Modal */}
      <StaffReplacePdfModal
        isOpen={Boolean(replacingPdfNote)}
        onClose={() => setReplacingPdfNote(null)}
        note={replacingPdfNote}
      />

      {/* Delete Confirmation Modal */}
      <StaffDeleteNoteModal
        isOpen={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        note={deletingNote}
        onConfirm={async () => {
          if (deletingNote) {
            await deleteStaffNote(deletingNote.id);
          }
        }}
      />

      {/* PDF Preview Modal */}
      <NotePdfViewerModal
        note={previewingNote}
        isOpen={Boolean(previewingNote)}
        onClose={() => setPreviewingNote(null)}
      />
    </div>
  );
}
