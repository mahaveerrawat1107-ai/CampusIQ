"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Sparkles,
  Info,
} from "lucide-react";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import { AcademicInfoCard } from "@/components/profile/AcademicInfoCard";
import { AcademicStandingSummary } from "@/components/profile/AcademicStandingSummary";
import { AccountSettingsCard } from "@/components/profile/AccountSettingsCard";
import { AppearancePreferencesCard } from "@/components/profile/AppearancePreferencesCard";
import { HelpSupportSection } from "@/components/profile/HelpSupportSection";
import { LogoutConfirmModal } from "@/components/profile/LogoutConfirmModal";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { signOut } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    setLoggedOutNotice(true);
    try {
      await signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    setTimeout(() => {
      window.location.href = "/login";
    }, 800);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Module: Student Profile</span>
            </span>
            <span className="text-neutral-border text-xs">•</span>
            <span className="text-xs text-neutral-secondary font-medium">
              Institutional Profile &amp; Preferences
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-navy tracking-tight leading-tight">
            Student Profile
          </h1>
          <p className="text-[13px] sm:text-[14px] text-neutral-secondary mt-1">
            Manage your academic credentials, notification preferences, display options, and campus support resources.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors shadow-card"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Logout Notice Feedback */}
      {loggedOutNotice && (
        <div className="p-3.5 rounded-card bg-indigo-subtle border border-indigo/20 flex items-center justify-between gap-3 text-xs text-indigo animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo flex-shrink-0" />
            <span>
              Session simulated log out completed. In the production deployment, this will securely invalidate your university SSO token.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLoggedOutNotice(false)}
            className="text-indigo/70 hover:text-indigo font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <ProfileHeaderCard />

      {/* Live Academic Standing Snapshot */}
      <AcademicStandingSummary />

      {/* Two Column Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Institutional Academic & Account Settings */}
        <div className="space-y-6">
          <AcademicInfoCard />
          <AccountSettingsCard />
        </div>

        {/* Right Column: Appearance, Help & Support, Sign Out */}
        <div className="space-y-6">
          <AppearancePreferencesCard />
          <HelpSupportSection />

          {/* Session & Sign Out Card */}
          <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                <LogOut className="w-4 h-4 text-semantic-error" />
                <span>Session &amp; Sign Out</span>
              </h3>
              <p className="text-xs text-neutral-secondary mt-1">
                Active pilot session for Alex Sharma (UIT RGPV Shivpuri). End your active view on this browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-input bg-surface border border-semantic-error/40 text-semantic-error text-xs font-semibold hover:bg-semantic-error-subtle transition-colors flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pilot System Notice */}
      <div className="p-4 rounded-input bg-neutral-light/50 border border-neutral-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-secondary">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo flex-shrink-0" />
          <span>
            CampusIQ Pilot v1.0 • UIT RGPV Shivpuri • Stage 5 Student Profile Module
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/attendance" className="hover:text-indigo transition-colors">
            Attendance
          </Link>
          <span>•</span>
          <Link href="/assignments" className="hover:text-indigo transition-colors">
            Assignments
          </Link>
          <span>•</span>
          <Link href="/notes" className="hover:text-indigo transition-colors">
            Notes Library
          </Link>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
