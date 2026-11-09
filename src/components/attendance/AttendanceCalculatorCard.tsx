"use client";

import React, { useState } from "react";
import { Calculator, CheckCircle2, AlertTriangle, ArrowRight, Info } from "lucide-react";
import { useAttendance } from "@/context/AttendanceContext";
import { simulateAttendance } from "@/lib/attendanceCalculations";

export function AttendanceCalculatorCard() {
  const { overallSummary } = useAttendance();
  const { attended, total } = overallSummary;

  // Simulator inputs
  const [futureAttended, setFutureAttended] = useState<number>(5);
  const [futureMissed, setFutureMissed] = useState<number>(1);

  // Projected metrics
  const projection = simulateAttendance(
    attended,
    total,
    futureAttended,
    futureMissed,
    75
  );

  const isSafe = projection.status === "safe";

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-border">
        <div className="w-8 h-8 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center">
          <Calculator className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-navy leading-none">
            75% Target Calculator & Simulator
          </h2>
          <p className="text-xs text-neutral-secondary mt-1">
            Test future attendance scenarios and verify recovery plans
          </p>
        </div>
      </div>

      {/* Mathematical Rules Info Box */}
      <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-input bg-neutral-light border border-neutral-border text-xs leading-relaxed">
          <div className="font-semibold text-navy flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-semantic-success" />
            <span>Safe Bunk Formula (When &ge; 75%)</span>
          </div>
          <code className="block bg-surface px-2 py-1 rounded text-[11px] font-mono text-navy border border-neutral-border mb-1">
            b = floor((P / 0.75) - T)
          </code>
          <p className="text-neutral-secondary">
            Calculates the maximum future classes that can be missed while remaining at or above the 75% threshold.
          </p>
        </div>

        <div className="p-4 rounded-input bg-neutral-light border border-neutral-border text-xs leading-relaxed">
          <div className="font-semibold text-navy flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-semantic-warning" />
            <span>Recovery Formula (When &lt; 75%)</span>
          </div>
          <code className="block bg-surface px-2 py-1 rounded text-[11px] font-mono text-navy border border-neutral-border mb-1">
            x = ceil((0.75 * T - P) / 0.25)
          </code>
          <p className="text-neutral-secondary">
            Calculates the minimum additional consecutive classes you must attend without missing any to reach 75%.
          </p>
        </div>
      </div>

      {/* Interactive Scenario Simulator */}
      <div className="pt-4 border-t border-neutral-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-navy mb-3">
          Interactive &ldquo;What-If&rdquo; Simulator
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-secondary mb-1">
              Future classes to ATTEND:
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={futureAttended}
              onChange={(e) => setFutureAttended(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-input border border-neutral-border bg-neutral-light text-sm font-semibold text-navy focus-visible:ring-2 focus-visible:ring-indigo outline-none tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-secondary mb-1">
              Future classes to MISS:
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={futureMissed}
              onChange={(e) => setFutureMissed(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-input border border-neutral-border bg-neutral-light text-sm font-semibold text-navy focus-visible:ring-2 focus-visible:ring-indigo outline-none tabular-nums"
            />
          </div>
        </div>

        {/* Projected Outcome Card */}
        <div
          className={`p-4 rounded-input border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
            isSafe
              ? "bg-semantic-success-subtle/40 border-semantic-success/30"
              : "bg-semantic-warning-subtle/40 border-semantic-warning/30"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-navy uppercase tracking-wider">
                Simulated Result
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isSafe
                    ? "bg-semantic-success text-white"
                    : "bg-semantic-warning text-white"
                }`}
              >
                {isSafe ? "Above 75% Safe" : "Below 75% Warning"}
              </span>
            </div>
            <p className="text-xs text-neutral-secondary mt-1">
              Projected total:{" "}
              <strong className="text-navy">
                {projection.attended} / {projection.total} classes
              </strong>
            </p>
          </div>

          <div className="flex items-baseline gap-3 self-start sm:self-center">
            <span className="text-[32px] font-bold text-navy tabular-nums leading-none">
              {projection.percentage}%
            </span>
            <div className="text-right text-xs">
              {isSafe ? (
                <span className="font-semibold text-semantic-success">
                  {projection.safeBunks} safe bunks
                </span>
              ) : (
                <span className="font-semibold text-semantic-error">
                  Need {projection.classesNeeded} classes
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
