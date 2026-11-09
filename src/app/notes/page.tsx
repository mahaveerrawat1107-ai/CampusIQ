import React from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, Clock } from "lucide-react";

export default function NotesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-semantic-warning flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Module: Notes Library</span>
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-navy tracking-tight leading-tight">
            Academic Notes Library
          </h1>
          <p className="text-[14px] text-neutral-secondary mt-1">
            Course resources organized by Semester → Subject → Unit → PDF.
          </p>
        </div>

        <Link
          href="/"
          className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors shadow-card"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Feature In Progress Card */}
      <div className="bg-surface rounded-card border border-neutral-border p-8 shadow-card max-w-2xl">
        <div className="w-12 h-12 rounded-card-sm bg-semantic-warning-subtle text-semantic-warning flex items-center justify-center mb-5">
          <BookOpen className="w-6 h-6" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-light text-neutral-secondary border border-neutral-border mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>Stage 4 Feature • Development in Progress</span>
        </div>

        <h2 className="text-[18px] font-bold text-navy mb-2">
          Structured Course PDFs & Search
        </h2>
        <p className="text-[14px] text-neutral-secondary leading-relaxed mb-6">
          This module will provide a streamlined PDF browsing and preview experience for UIT RGPV Shivpuri syllabus units, eliminating the need to search multiple chat groups.
        </p>

        <div className="p-4 rounded-input bg-neutral-light border border-neutral-border mb-6 space-y-2 text-xs">
          <div className="font-semibold text-navy">Planned Capabilities:</div>
          <ul className="list-disc list-inside text-neutral-secondary space-y-1">
            <li>Browse hierarchy: Semester 1 → Subject → Unit → PDF documents.</li>
            <li>Subject and keyword search with unit filtering.</li>
            <li>In-app mobile PDF preview with secure signed download links.</li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-input bg-indigo text-white text-xs font-semibold hover:bg-indigo-hover transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
