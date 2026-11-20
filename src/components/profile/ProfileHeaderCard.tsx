"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  ShieldCheck,
  Copy,
  Check,
  Building2,
  BookOpen,
} from "lucide-react";
import { STUDENT_PROFILE_DATA } from "@/data/profileData";

export function ProfileHeaderCard() {
  const [copied, setCopied] = useState(false);

  const handleCopyEnrollment = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(STUDENT_PROFILE_DATA.enrollmentNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 sm:p-7 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-neutral-border">
        {/* Left: Avatar & Basic Information */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Avatar with Initials */}
          <div className="relative">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-navy text-white text-xl sm:text-2xl font-bold flex items-center justify-center shadow-sm flex-shrink-0">
              {STUDENT_PROFILE_DATA.avatarInitials}
            </div>
            <span
              className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-semantic-success border-2 border-surface"
              title="Active institutional enrollment"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[22px] sm:text-[24px] font-bold text-navy leading-none">
                {STUDENT_PROFILE_DATA.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-semantic-success-subtle text-semantic-success border border-semantic-success/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Active Student</span>
              </span>
            </div>

            <p className="text-xs font-medium text-neutral-secondary mt-1.5 flex flex-wrap items-center gap-1.5">
              <span>{STUDENT_PROFILE_DATA.branch}</span>
              <span>•</span>
              <span className="text-navy font-semibold">{STUDENT_PROFILE_DATA.college}</span>
            </p>

            {/* Enrollment Number with Copy Action */}
            <div className="mt-2.5 flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-input bg-neutral-light border border-neutral-border text-xs">
                <span className="text-neutral-secondary font-medium">Enrollment:</span>
                <span className="font-bold text-navy tabular-nums">
                  {STUDENT_PROFILE_DATA.enrollmentNo}
                </span>
                <button
                  type="button"
                  onClick={handleCopyEnrollment}
                  className="p-1 rounded text-neutral-secondary hover:text-navy hover:bg-surface transition-colors ml-0.5"
                  title="Copy Enrollment Number"
                  aria-label="Copy enrollment number"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-semantic-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {copied && (
                <span className="text-[11px] text-semantic-success font-medium animate-in fade-in">
                  Copied!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Semester & Section Badges */}
        <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-border/60">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-subtle text-indigo border border-indigo/20">
            <GraduationCap className="w-4 h-4" />
            <span>{STUDENT_PROFILE_DATA.semester}</span>
          </div>
          <span className="text-xs font-semibold text-neutral-secondary">
            {STUDENT_PROFILE_DATA.section} • {STUDENT_PROFILE_DATA.batch}
          </span>
        </div>
      </div>

      {/* Institutional Metadata strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 text-xs text-neutral-secondary">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo flex-shrink-0" />
          <span>Affiliated to Rajiv Gandhi Proudyogiki Vishwavidyalaya</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-semantic-success flex-shrink-0" />
          <span>B.Tech Common Curriculum (CBCS Scheme)</span>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-neutral-secondary flex-shrink-0" />
          <span>Academic Year: <strong className="text-navy">{STUDENT_PROFILE_DATA.academicYear}</strong></span>
        </div>
      </div>
    </div>
  );
}
