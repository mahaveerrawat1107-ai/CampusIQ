"use client";

import React, { useMemo } from "react";
import { Sparkles, Calendar } from "lucide-react";

interface DashboardHeaderProps {
  studentName: string;
}

export function DashboardHeader({ studentName }: DashboardHeaderProps) {
  // Compute greeting dynamically based on user local time
  const { greeting, formattedDate } = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();

    let greet = "Good morning";
    if (hours >= 12 && hours < 17) {
      greet = "Good afternoon";
    } else if (hours >= 17 && hours < 22) {
      greet = "Good evening";
    } else if (hours >= 22 || hours < 5) {
      greet = "Good night";
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const dateStr = now.toLocaleDateString("en-US", options);

    return { greeting: greet, formattedDate: dateStr };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-border/60">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Overview</span>
          </span>
        </div>
        <h1 className="text-[26px] sm:text-[28px] font-bold text-navy tracking-tight leading-tight">
          {greeting}, {studentName}
        </h1>
        <p className="text-[14px] text-neutral-secondary mt-1">
          Here is your academic progress and upcoming deadlines for today.
        </p>
      </div>

      <div className="self-start sm:self-center flex items-center gap-2 px-3.5 py-1.5 rounded-input bg-surface border border-neutral-border text-xs font-medium text-neutral-secondary shadow-card">
        <Calendar className="w-4 h-4 text-neutral-secondary" />
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}
