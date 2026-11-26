"use client";

import React from "react";
import {
  GraduationCap,
  Building2,
  Calendar,
  Layers,
  Award,
  Hash,
  BookCheck,
} from "lucide-react";
import { STUDENT_PROFILE_DATA } from "@/data/profileData";
import { useAuth } from "@/context/AuthContext";

export function AcademicInfoCard() {
  const { profile } = useAuth();
  const enrollmentNo = profile?.enrollment_no || STUDENT_PROFILE_DATA.enrollmentNo;

  const academicFields = [
    {
      icon: Building2,
      label: "College / Institution",
      value: STUDENT_PROFILE_DATA.college,
      subValue: STUDENT_PROFILE_DATA.collegeFull,
    },
    {
      icon: Layers,
      label: "Degree & Branch",
      value: "B.Tech — Computer Science & Engineering",
      subValue: "Undergraduate 4-Year Technical Program",
    },
    {
      icon: GraduationCap,
      label: "Current Semester & Standing",
      value: STUDENT_PROFILE_DATA.semester,
      subValue: "1st Year Common Engineering Curriculum",
    },
    {
      icon: BookCheck,
      label: "Assigned Section & Batch",
      value: `${STUDENT_PROFILE_DATA.section} (Batch ${STUDENT_PROFILE_DATA.batch})`,
      subValue: "Morning Lecture Group",
    },
    {
      icon: Hash,
      label: "RGPV Enrollment Number",
      value: enrollmentNo,
      subValue: "Official University Registration Identifier",
    },
    {
      icon: Calendar,
      label: "Academic Session",
      value: STUDENT_PROFILE_DATA.academicYear,
      subValue: `Admitted: ${STUDENT_PROFILE_DATA.admissionDate}`,
    },
  ];

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-navy leading-none">
              Academic Information
            </h3>
            <p className="text-xs text-neutral-secondary mt-0.5">
              Institutional records for UIT RGPV Shivpuri
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-neutral-light text-navy border border-neutral-border">
          Semester 1
        </span>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {academicFields.map((field, idx) => {
          const Icon = field.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-input bg-neutral-light/50 border border-neutral-border/70 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-input bg-surface border border-neutral-border flex items-center justify-center text-neutral-secondary flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-indigo" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-neutral-secondary uppercase tracking-wider block">
                  {field.label}
                </span>
                <p className="text-xs font-bold text-navy mt-0.5 truncate">
                  {field.value}
                </p>
                <p className="text-[11px] text-neutral-secondary mt-0.5 truncate">
                  {field.subValue}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
