"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Mail,
  Phone,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { STUDENT_PROFILE_DATA, DEFAULT_STUDENT_PREFERENCES } from "@/data/profileData";
import { StudentPreferences } from "@/types/profile";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

export function AccountSettingsCard() {
  const { user, profile } = useAuth();
  const [supabase] = useState(() => createClient());
  const [preferences, setPreferences] = useState<StudentPreferences>(DEFAULT_STUDENT_PREFERENCES);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Load preferences from Supabase student_preferences on mount / user change
  useEffect(() => {
    async function loadPreferences() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("student_preferences")
          .select("theme, attendance_reminders, assignment_deadline_alerts, notes_updates")
          .eq("student_id", user.id)
          .maybeSingle();

        if (data && !error) {
          setPreferences({
            theme: (data.theme as "light" | "dark" | "system") || "system",
            attendanceReminders: data.attendance_reminders ?? true,
            assignmentDeadlineAlerts: data.assignment_deadline_alerts ?? true,
            notesUpdates: data.notes_updates ?? true,
          });
        }
      } catch (e) {
        console.warn("Could not load preferences from Supabase:", e);
      }
    }
    loadPreferences();
  }, [user, supabase]);

  const handleToggle = async (key: keyof Omit<StudentPreferences, "theme">) => {
    const nextVal = !preferences[key];
    const updated = {
      ...preferences,
      [key]: nextVal,
    };
    setPreferences(updated);

    if (user) {
      try {
        const { error } = await supabase
          .from("student_preferences")
          .upsert({
            student_id: user.id,
            theme: updated.theme,
            attendance_reminders: updated.attendanceReminders,
            assignment_deadline_alerts: updated.assignmentDeadlineAlerts,
            notes_updates: updated.notesUpdates,
            updated_at: new Date().toISOString(),
          }, { onConflict: "student_id" });

        if (error) {
          console.error("Failed to save preferences to Supabase:", error);
        } else {
          setSaveSuccessMessage("Notification preferences saved to cloud.");
          setTimeout(() => setSaveSuccessMessage(null), 2500);
        }
      } catch (e) {
        console.error("Could not persist preferences:", e);
      }
    }
  };

  const studentEmail = user?.email || profile?.email || STUDENT_PROFILE_DATA.email;
  const studentPhone = profile?.phone || STUDENT_PROFILE_DATA.phone;

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-navy leading-none">
              Account &amp; Notification Settings
            </h3>
            <p className="text-xs text-neutral-secondary mt-0.5">
              Personal contact details and academic reminder preferences
            </p>
          </div>
        </div>

        {saveSuccessMessage && (
          <span className="text-[11px] font-medium text-semantic-success flex items-center gap-1 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saved</span>
          </span>
        )}
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-3.5 rounded-input bg-neutral-light/50 border border-neutral-border/70 flex items-center gap-3">
          <div className="w-8 h-8 rounded-input bg-surface border border-neutral-border flex items-center justify-center text-neutral-secondary flex-shrink-0">
            <Mail className="w-4 h-4 text-indigo" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-neutral-secondary uppercase tracking-wider block">
              Official Student Email
            </span>
            <p className="text-xs font-bold text-navy truncate mt-0.5">
              {studentEmail}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-input bg-neutral-light/50 border border-neutral-border/70 flex items-center gap-3">
          <div className="w-8 h-8 rounded-input bg-surface border border-neutral-border flex items-center justify-center text-neutral-secondary flex-shrink-0">
            <Phone className="w-4 h-4 text-semantic-success" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-neutral-secondary uppercase tracking-wider block">
              Registered Phone Number
            </span>
            <p className="text-xs font-bold text-navy tabular-nums mt-0.5">
              {studentPhone}
            </p>
          </div>
        </div>
      </div>

      {/* Academic Alert Toggles */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-navy uppercase tracking-wider">
          Academic Alert Preferences
        </h4>

        {/* Attendance Alert */}
        <div className="p-3.5 rounded-input border border-neutral-border/80 flex items-center justify-between gap-4 bg-surface hover:bg-neutral-light/30 transition-colors">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-semantic-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-navy">
                75% Attendance Threshold Warnings
              </p>
              <p className="text-[11px] text-neutral-secondary mt-0.5">
                Receive warnings when course attendance approaches the 75% RGPV requirement.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={preferences.attendanceReminders}
            onClick={() => handleToggle("attendanceReminders")}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-shrink-0 cursor-pointer ${
              preferences.attendanceReminders ? "bg-indigo" : "bg-neutral-border"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                preferences.attendanceReminders ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Assignment Alert */}
        <div className="p-3.5 rounded-input border border-neutral-border/80 flex items-center justify-between gap-4 bg-surface hover:bg-neutral-light/30 transition-colors">
          <div className="flex items-start gap-3">
            <Bell className="w-4 h-4 text-indigo flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-navy">
                Assignment Deadline Reminders
              </p>
              <p className="text-[11px] text-neutral-secondary mt-0.5">
                Upcoming pending tasks reminder notifications prior to due date deadlines.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={preferences.assignmentDeadlineAlerts}
            onClick={() => handleToggle("assignmentDeadlineAlerts")}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-shrink-0 cursor-pointer ${
              preferences.assignmentDeadlineAlerts ? "bg-indigo" : "bg-neutral-border"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                preferences.assignmentDeadlineAlerts ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Notes Update Alert */}
        <div className="p-3.5 rounded-input border border-neutral-border/80 flex items-center justify-between gap-4 bg-surface hover:bg-neutral-light/30 transition-colors">
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-semantic-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-navy">
                New Syllabus Notes Notifications
              </p>
              <p className="text-[11px] text-neutral-secondary mt-0.5">
                Notify when faculty publishes new unit PDFs or experiment guides for your courses.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={preferences.notesUpdates}
            onClick={() => handleToggle("notesUpdates")}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-shrink-0 cursor-pointer ${
              preferences.notesUpdates ? "bg-indigo" : "bg-neutral-border"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                preferences.notesUpdates ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
