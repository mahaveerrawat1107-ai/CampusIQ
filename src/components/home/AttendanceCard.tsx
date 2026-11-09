import React from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { AttendanceData } from "@/data/mockHomeData";

interface AttendanceCardProps {
  data: AttendanceData;
}

export function AttendanceCard({ data }: AttendanceCardProps) {
  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-input bg-semantic-success-subtle text-semantic-success flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-navy leading-none">
                Attendance Status
              </h2>
              <span className="text-[12px] text-neutral-secondary font-medium mt-0.5 inline-block">
                All Recorded Subjects
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-semantic-success-subtle text-semantic-success border border-semantic-success/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Safe (Above {data.target}%)</span>
          </span>
        </div>

        {/* Main Percentage Display & Numerator/Denominator */}
        <div className="my-5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[36px] sm:text-[40px] font-bold text-navy leading-none tabular-nums tracking-tight">
              {data.percentage}%
            </span>
            <span className="text-xs font-medium text-neutral-secondary">
              overall
            </span>
          </div>

          <div className="text-right">
            <div className="text-[15px] font-bold text-navy tabular-nums">
              {data.attended} <span className="text-neutral-secondary font-normal">/</span> {data.total}
            </div>
            <p className="text-[11px] text-neutral-secondary font-medium">
              Attended / Total classes
            </p>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="w-full h-2.5 bg-neutral-light rounded-full overflow-hidden border border-neutral-border/60">
            <div
              className="h-full bg-semantic-success rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(data.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-neutral-secondary font-medium">
            <span>0%</span>
            <span className="font-semibold text-neutral-secondary">
              Target: {data.target}%
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Safe Bunk Insight Box */}
        <div className="p-3 rounded-input bg-neutral-light border border-neutral-border text-xs text-navy leading-relaxed flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-semantic-success flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-navy">Target cushion: </span>
            <span className="text-neutral-secondary">{data.statusNote}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Action Link & Disclaimer */}
      <div className="mt-5 pt-4 border-t border-neutral-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-[11px] text-neutral-secondary italic">
          *Self-reported estimate based on your logged classes.
        </span>

        <Link
          href="/attendance"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo hover:text-indigo-hover transition-colors group focus-visible:ring-2 focus-visible:ring-indigo rounded"
        >
          <span>View attendance details</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
