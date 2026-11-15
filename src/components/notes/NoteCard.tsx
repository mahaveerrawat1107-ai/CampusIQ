"use client";

import React from "react";
import { FileText, Download, Eye, Calendar, UserCheck } from "lucide-react";
import { AcademicNote } from "@/types/notes";
import { formatDisplayDate } from "@/lib/assignmentUtils";
import { triggerNoteDownload, getNotePdfBlob } from "@/lib/notesStorage";

interface NoteCardProps {
  note: AcademicNote;
  onPreview: (note: AcademicNote) => void;
}

export function NoteCard({ note, onPreview }: NoteCardProps) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="bg-surface rounded-card border border-neutral-border p-4 sm:p-5 shadow-card hover:border-neutral-border/80 transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Unit Tag, Subject Code & PDF Badge */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-subtle text-indigo border border-indigo/20">
              {note.subjectCode}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-light text-navy border border-neutral-border">
              Unit {note.unit}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-semantic-error bg-semantic-error-subtle px-2 py-0.5 rounded-full border border-semantic-error/20 flex-shrink-0">
            <FileText className="w-3 h-3" />
            <span>PDF</span>
          </span>
        </div>

        {/* Title */}
        <h4
          onClick={() => onPreview(note)}
          className="text-[15px] font-bold text-navy group-hover:text-indigo transition-colors cursor-pointer leading-snug"
        >
          {note.title}
        </h4>

        {/* Description */}
        {note.description && (
          <p className="text-xs text-neutral-secondary mt-1.5 leading-relaxed line-clamp-2">
            {note.description}
          </p>
        )}

        {/* File Metadata */}
        <div className="mt-3 p-2.5 rounded-input bg-neutral-light/60 border border-neutral-border/70 flex items-center justify-between text-xs text-neutral-secondary">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-3.5 h-3.5 text-neutral-secondary flex-shrink-0" />
            <span className="truncate font-medium text-navy text-[11px]">{note.fileName}</span>
          </div>
          <span className="text-[11px] font-bold text-navy flex-shrink-0 pl-2">
            {note.fileSizeFormatted}
          </span>
        </div>
      </div>

      {/* Footer Info & Action Buttons */}
      <div className="mt-4 pt-3 border-t border-neutral-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-secondary">
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-neutral-secondary" />
            <span>{formatDisplayDate(note.uploadedAt.split("T")[0])}</span>
          </div>

          {note.uploadedBy && (
            <div className="flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-indigo" />
              <span className="truncate max-w-[150px]">{note.uploadedBy}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => onPreview(note)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input bg-indigo-subtle border border-indigo/20 text-indigo text-xs font-semibold hover:bg-indigo hover:text-white transition-colors"
            title="Preview PDF"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors shadow-xs"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
