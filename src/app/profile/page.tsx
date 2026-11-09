import React from "react";
import Link from "next/link";
import { User, ArrowLeft, Clock, GraduationCap, ShieldCheck } from "lucide-react";
import { mockStudent } from "@/data/mockHomeData";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Module: Student Profile</span>
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-navy tracking-tight leading-tight">
            Student Profile
          </h1>
          <p className="text-[14px] text-neutral-secondary mt-1">
            Account settings, institutional enrollment details, and preferences.
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

      {/* Profile Overview Card */}
      <div className="bg-surface rounded-card border border-neutral-border p-8 shadow-card max-w-2xl">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-border">
          <div className="w-16 h-16 rounded-full bg-navy text-white text-xl font-bold flex items-center justify-center shadow-sm">
            AS
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-navy leading-none">
              {mockStudent.name}
            </h2>
            <p className="text-xs font-medium text-neutral-secondary mt-1.5 flex items-center gap-2">
              <span>{mockStudent.college}</span>
              <span>•</span>
              <span className="text-navy font-semibold">{mockStudent.branch}</span>
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-subtle text-indigo">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{mockStudent.semester}</span>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-light text-neutral-secondary border border-neutral-border mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>Stage 5 Feature • Profile Settings in Progress</span>
        </div>

        <h3 className="text-[16px] font-bold text-navy mb-2">
          Account & Academic Information
        </h3>
        <p className="text-[14px] text-neutral-secondary leading-relaxed mb-6">
          Full profile editing, semester selection, enrollment identifier verification, and account management will be configured in Stage 5.
        </p>

        {/* Demo Fields */}
        <div className="p-4 rounded-input bg-neutral-light border border-neutral-border mb-6 space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-neutral-border/60">
            <span className="text-neutral-secondary font-medium">Enrollment No:</span>
            <span className="font-semibold text-navy tabular-nums">{mockStudent.enrollmentNo}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-border/60">
            <span className="text-neutral-secondary font-medium">Institution:</span>
            <span className="font-semibold text-navy">{mockStudent.college}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-secondary font-medium">Status:</span>
            <span className="font-semibold text-semantic-success flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Active Pilot Student
            </span>
          </div>
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
