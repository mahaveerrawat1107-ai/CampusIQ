"use client";

import React, { useState } from "react";
import { Sun, Moon, Laptop, Check, Sparkles } from "lucide-react";

export function AppearancePreferencesCard() {
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "system">("light");

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-navy leading-none">
              Appearance &amp; Display Theme
            </h3>
            <p className="text-xs text-neutral-secondary mt-0.5">
              Interface style and daylight readability preferences
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-indigo-subtle text-indigo border border-indigo/20">
          Clean Light Standard
        </span>
      </div>

      {/* Theme Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Light Mode (Active Default) */}
        <button
          type="button"
          onClick={() => setSelectedTheme("light")}
          className={`p-4 rounded-card border text-left transition-all relative ${
            selectedTheme === "light"
              ? "bg-surface border-indigo ring-2 ring-indigo/20 shadow-xs"
              : "bg-neutral-light/50 border-neutral-border hover:bg-surface hover:border-neutral-border/80"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-input bg-semantic-warning-subtle text-semantic-warning flex items-center justify-center">
              <Sun className="w-3.5 h-3.5" />
            </div>
            {selectedTheme === "light" && (
              <span className="w-4 h-4 rounded-full bg-indigo text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-navy">Light Mode</p>
          <p className="text-[11px] text-neutral-secondary mt-0.5">
            High-contrast minimal design tuned for classroom daylight readability.
          </p>
        </button>

        {/* Dark Mode (Preview / Roadmap) */}
        <button
          type="button"
          onClick={() => setSelectedTheme("dark")}
          className={`p-4 rounded-card border text-left transition-all relative ${
            selectedTheme === "dark"
              ? "bg-surface border-indigo ring-2 ring-indigo/20 shadow-xs"
              : "bg-neutral-light/50 border-neutral-border hover:bg-surface hover:border-neutral-border/80"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-input bg-navy text-white flex items-center justify-center">
              <Moon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-neutral-light text-neutral-secondary border border-neutral-border">
              Preview
            </span>
          </div>
          <p className="text-xs font-bold text-navy">Dark Mode</p>
          <p className="text-[11px] text-neutral-secondary mt-0.5">
            Reduced glare for evening and late-night study sessions (in development).
          </p>
        </button>

        {/* System Match */}
        <button
          type="button"
          onClick={() => setSelectedTheme("system")}
          className={`p-4 rounded-card border text-left transition-all relative ${
            selectedTheme === "system"
              ? "bg-surface border-indigo ring-2 ring-indigo/20 shadow-xs"
              : "bg-neutral-light/50 border-neutral-border hover:bg-surface hover:border-neutral-border/80"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center">
              <Laptop className="w-3.5 h-3.5" />
            </div>
            {selectedTheme === "system" && (
              <span className="w-4 h-4 rounded-full bg-indigo text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-navy">System Default</p>
          <p className="text-[11px] text-neutral-secondary mt-0.5">
            Automatically synchronize with operating system appearance settings.
          </p>
        </button>
      </div>

      {/* Explanatory note */}
      <div className="p-3 rounded-input bg-neutral-light border border-neutral-border/70 text-xs text-neutral-secondary flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo flex-shrink-0 mt-0.5" />
        <span>
          <strong>Design System Note:</strong> CampusIQ uses high-contrast light mode tokens (#292D45 navy, #635BFF indigo accent, and #FFFFFF surfaces) calibrated for tabular academic attendance numbers and document PDF inspection.
        </span>
      </div>
    </div>
  );
}
