import React from "react";
import Link from "next/link";
import { CalendarCheck2, ArrowLeft, Sparkles, GraduationCap } from "lucide-react";
import { AttendanceSummaryCard } from "@/components/attendance/AttendanceSummaryCard";
import { SubjectAttendanceGrid } from "@/components/attendance/SubjectAttendanceGrid";
import { MarkAttendanceCard } from "@/components/attendance/MarkAttendanceCard";
import { AttendanceCalculatorCard } from "@/components/attendance/AttendanceCalculatorCard";
import { AttendanceHistoryTable } from "@/components/attendance/AttendanceHistoryTable";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      {/* A. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-semantic-success flex items-center gap-1.5">
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Academic Attendance Tracker</span>
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-subtle border border-indigo/20 text-indigo flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success animate-pulse" />
              <span>Live Cloud Sync</span>
            </span>
          </div>

          <h1 className="text-[26px] sm:text-[28px] font-bold text-navy tracking-tight leading-tight">
            Attendance
          </h1>
          <p className="text-[14px] text-neutral-secondary mt-1">
            Track your classes and stay above the 75% attendance requirement.
          </p>

          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-secondary">
            <GraduationCap className="w-3.5 h-3.5 text-indigo" />
            <span className="font-semibold text-navy">UIT RGPV Shivpuri</span>
            <span>•</span>
            <span>B.Tech CSE • Semester 1</span>
          </div>
        </div>

        <Link
          href="/"
          className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors shadow-card"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* B. Overall Attendance Summary */}
      <AttendanceSummaryCard />

      {/* C. Subject-Wise Attendance */}
      <SubjectAttendanceGrid />

      {/* D. Mark Attendance & F. Calculator (Two-column layout on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <MarkAttendanceCard />
        </div>
        <div className="lg:col-span-5">
          <AttendanceCalculatorCard />
        </div>
      </div>

      {/* E. Attendance History Table */}
      <AttendanceHistoryTable />
    </div>
  );
}
