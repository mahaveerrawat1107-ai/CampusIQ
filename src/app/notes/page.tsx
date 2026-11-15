"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, ShieldAlert, ArrowUpRight } from "lucide-react";
import { StudentNotesBrowser } from "@/components/notes/StudentNotesBrowser";

export default function NotesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-semantic-warning flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Academic Workspace</span>
            </span>
            <span className="text-neutral-border text-xs">•</span>
            <span className="text-xs text-neutral-secondary font-medium">
              1st Year CSE (Semester 1)
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-navy tracking-tight leading-tight">
            Notes Library
          </h1>
          <p className="text-[13px] sm:text-[14px] text-neutral-secondary mt-1">
            Browse official syllabus resources organized hierarchically: Semester → Subject → Unit → PDF.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-center flex-shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors shadow-card"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to</span> Dashboard
          </Link>

          <Link
            href="/admin/notes"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-input bg-indigo-subtle border border-indigo/30 text-indigo text-xs font-semibold hover:bg-indigo hover:text-white transition-colors shadow-xs"
            title="Switch to Staff Notes Management Console"
          >
            <span>Staff Portal Prototype</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Coursework Rule Banner */}
      <div className="p-3.5 rounded-card bg-surface border border-indigo/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-indigo-subtle text-indigo flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-navy">Curated Academic Library: </span>
            <span className="text-neutral-secondary">
              Academic notes are uploaded and maintained exclusively by authorized UIT RGPV faculty. Students have verified read-only access to preview and download official PDFs.
            </span>
          </div>
        </div>

        <Link
          href="/admin/notes"
          className="self-start sm:self-center font-bold text-indigo hover:underline flex items-center gap-1 flex-shrink-0"
        >
          <span>Staff Notes Upload</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main Hierarchical Notes Browser */}
      <section aria-label="Student Notes Library Browser">
        <StudentNotesBrowser />
      </section>
    </div>
  );
}
