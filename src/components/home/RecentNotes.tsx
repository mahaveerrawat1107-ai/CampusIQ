import React from "react";
import { BookOpen, FileText, ArrowRight, Download, ExternalLink } from "lucide-react";
import { MockNote } from "@/data/mockHomeData";

interface RecentNotesProps {
  notes: MockNote[];
}

export function RecentNotes({ notes }: RecentNotesProps) {
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
              Recent Notes & PDFs
            </h2>
            <p className="text-[12px] text-neutral-secondary font-medium mt-0.5">
              Course materials for 1st Year CSE
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-xs font-semibold text-indigo hover:text-indigo-hover inline-flex items-center gap-1 transition-colors"
        >
          <span>Library</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notes List */}
      <div className="divide-y divide-neutral-border/70">
        {notes.map((note) => (
          <div
            key={note.id}
            className="py-4 first:pt-4 last:pb-0 flex items-start sm:items-center justify-between gap-3 group"
          >
            {/* Left Info with PDF Icon */}
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-input bg-semantic-error-subtle text-semantic-error flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                <FileText className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-neutral-light text-navy border border-neutral-border">
                    {note.unit}
                  </span>
                  <span className="text-xs font-semibold text-neutral-secondary truncate">
                    {note.subject}
                  </span>
                </div>

                <h3 className="text-[14px] font-semibold text-navy mt-1 truncate group-hover:text-indigo transition-colors">
                  {note.title}
                </h3>

                <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-secondary">
                  <span>{note.fileName}</span>
                  <span>•</span>
                  <span>{note.fileSize}</span>
                  <span>•</span>
                  <span>{note.uploadedAt}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                className="w-8 h-8 rounded-input border border-neutral-border flex items-center justify-center text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
                title="Preview PDF"
                aria-label="Preview PDF"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-input border border-neutral-border flex items-center justify-center text-neutral-secondary hover:text-indigo hover:bg-indigo-subtle transition-colors"
                title="Download PDF"
                aria-label="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
