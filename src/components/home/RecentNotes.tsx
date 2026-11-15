"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, FileText, ArrowRight, Eye, Check } from "lucide-react";
import { useNotes } from "@/context/NotesContext";
import { formatDisplayDate } from "@/lib/assignmentUtils";
import { AcademicNote } from "@/types/notes";
import { NotePdfViewerModal } from "@/components/notes/NotePdfViewerModal";

export function RecentNotes() {
  const { publishedNotes } = useNotes();
  const [activeNoteForPreview, setActiveNoteForPreview] = useState<AcademicNote | null>(null);

  const topNotes = publishedNotes.slice(0, 3);

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-input bg-semantic-success-subtle text-semantic-success flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-navy leading-none">
              Recent Notes &amp; PDFs
            </h2>
            <p className="text-[12px] text-neutral-secondary font-medium mt-0.5">
              Course materials for 1st Year CSE
            </p>
          </div>
        </div>

        <Link
          href="/notes"
          className="text-xs font-semibold text-indigo hover:text-indigo-hover inline-flex items-center gap-1 transition-colors group focus-visible:ring-2 focus-visible:ring-indigo rounded"
        >
          <span>Open Library</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Notes List */}
      {topNotes.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-xs text-neutral-secondary">
            No published course notes available yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-border/70">
          {topNotes.map((note) => (
            <div
              key={note.id}
              className="py-4 first:pt-4 last:pb-0 flex items-start sm:items-center justify-between gap-3 group"
            >
              {/* Left Info with PDF Icon */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-input bg-semantic-error-subtle text-semantic-error flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                  <FileText className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-neutral-light text-navy border border-neutral-border">
                      Unit {note.unit}
                    </span>
                    <span className="text-xs font-semibold text-neutral-secondary truncate">
                      {note.subjectCode} • {note.subjectName}
                    </span>
                  </div>

                  <Link
                    href="/notes"
                    className="text-[14px] font-semibold text-navy mt-1 truncate group-hover:text-indigo transition-colors block"
                    title={note.title}
                  >
                    {note.title}
                  </Link>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-secondary">
                    <span className="truncate max-w-[140px] sm:max-w-none">{note.fileName}</span>
                    <span>•</span>
                    <span className="font-semibold text-navy">{note.fileSizeFormatted}</span>
                    <span>•</span>
                    <span>{formatDisplayDate(note.uploadedAt.split("T")[0])}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveNoteForPreview(note)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-input border border-neutral-border text-[11px] font-semibold text-neutral-secondary hover:text-indigo hover:bg-neutral-light transition-colors"
                  title="Preview note in PDF viewer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer count */}
      {topNotes.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-neutral-border flex items-center justify-between text-xs text-neutral-secondary">
          <span>
            Showing {Math.min(3, publishedNotes.length)} of {publishedNotes.length} published document
            {publishedNotes.length !== 1 ? "s" : ""}
          </span>
          <Link
            href="/notes"
            className="font-semibold text-indigo hover:text-indigo-hover inline-flex items-center gap-1"
          >
            <span>Browse All in Library</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* PDF Preview Modal */}
      <NotePdfViewerModal
        note={activeNoteForPreview}
        isOpen={Boolean(activeNoteForPreview)}
        onClose={() => setActiveNoteForPreview(null)}
      />
    </div>
  );
}
