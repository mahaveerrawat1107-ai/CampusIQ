"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";

type PrimaryRoleOption = "student" | "faculty";
type FacultySubRole = "teacher" | "hod" | "admin";

export default function LoginPage() {
  const router = useRouter();

  // Primary selection: Student vs Teacher/Faculty
  const [primaryRole, setPrimaryRole] = useState<PrimaryRoleOption>("student");

  // Secondary sub-role when "Continue as Teacher" is selected:
  // Note: Backend roles remain strictly: 'student', 'teacher', 'admin'.
  // HOD is a Teacher (role: 'teacher'), NOT a separate database role.
  const [facultySubRole, setFacultySubRole] = useState<FacultySubRole>("teacher");

  // Form inputs (Email & Password for genuine Supabase Auth)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Future-portal modal for Teacher / HOD
  const [futurePortalRole, setFuturePortalRole] = useState<string | null>(null);

  const handlePrimaryRoleChange = (role: PrimaryRoleOption) => {
    setPrimaryRole(role);
    setErrorMessage(null);
    if (role === "faculty") {
      setFacultySubRole("teacher");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid institutional email address.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createBrowserClient();

      // Real Supabase Authentication via password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPass,
      });

      if (signInError) {
        setIsLoading(false);
        setErrorMessage(signInError.message || "Invalid login credentials.");
        return;
      }

      if (!data.user) {
        setIsLoading(false);
        setErrorMessage("Authentication failed: No user returned.");
        return;
      }

      // Fetch user's actual database role from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, verification_status")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        console.warn("User profile could not be loaded immediately:", profileError?.message);
      }

      const userRole = profile?.role || "student";

      // If user attempted faculty login but is in teacher/hod portal (upcoming)
      if (primaryRole === "faculty" && (facultySubRole === "teacher" || facultySubRole === "hod")) {
        let targetRoleLabel = "Teacher";
        if (facultySubRole === "hod") {
          targetRoleLabel = "Head of Department (HOD)";
        }
        setIsLoading(false);
        setFuturePortalRole(targetRoleLabel);
        return;
      }

      // Route based on genuine database role
      setIsLoading(false);
      if (userRole === "admin") {
        router.push("/admin/assignments");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred during login.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar / Branding */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[19px] text-navy tracking-tight leading-none">
                CampusIQ
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-subtle text-indigo leading-none">
                v1.0
              </span>
            </div>
            <p className="text-xs text-neutral-secondary mt-0.5 font-medium leading-none">
              UIT RGPV Shivpuri • Academic Workspace
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-secondary bg-surface px-3 py-1.5 rounded-full border border-neutral-border shadow-xs">
          <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse" />
          <span className="font-medium">Supabase Auth Connected</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="max-w-md w-full mx-auto my-8 space-y-6">
        <div className="bg-surface rounded-card border border-neutral-border p-6 sm:p-8 shadow-card space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-[22px] sm:text-[24px] font-bold text-navy tracking-tight">
              Sign In to CampusIQ
            </h1>
            <p className="text-xs text-neutral-secondary max-w-xs mx-auto leading-relaxed">
              Enter your institutional email and password to access your workspace.
            </p>
          </div>

          {/* Primary Role Selector: Student vs Continue as Teacher */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-secondary">
              Select Portal Entry
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-light rounded-input border border-neutral-border">
              <button
                type="button"
                onClick={() => handlePrimaryRoleChange("student")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-input-sm text-xs font-semibold transition-all ${
                  primaryRole === "student"
                    ? "bg-surface text-indigo shadow-xs border border-neutral-border font-bold"
                    : "text-neutral-secondary hover:text-navy"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Continue as Student</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrimaryRoleChange("faculty")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-input-sm text-xs font-semibold transition-all ${
                  primaryRole === "faculty"
                    ? "bg-surface text-indigo shadow-xs border border-neutral-border font-bold"
                    : "text-neutral-secondary hover:text-navy"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Continue as Teacher</span>
              </button>
            </div>
          </div>

          {/* Secondary Sub-role Selector: Displayed only when "Continue as Teacher" is chosen */}
          {primaryRole === "faculty" && (
            <div className="p-3 bg-neutral-light/70 rounded-input border border-neutral-border space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-secondary">
                  Faculty &amp; Staff Role
                </span>
                <span className="text-[10px] text-neutral-secondary font-medium">
                  Select your assigned capacity
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {/* 1. Teacher */}
                <button
                  type="button"
                  onClick={() => setFacultySubRole("teacher")}
                  className={`py-2 px-2 text-center rounded-input-sm text-xs font-medium transition-all ${
                    facultySubRole === "teacher"
                      ? "bg-indigo text-white font-semibold shadow-xs"
                      : "bg-surface text-navy border border-neutral-border hover:border-indigo/50"
                  }`}
                >
                  Teacher
                </button>

                {/* 2. HOD (Faculty role with Departmental authority; not a separate database role) */}
                <button
                  type="button"
                  onClick={() => setFacultySubRole("hod")}
                  className={`py-2 px-2 text-center rounded-input-sm text-xs font-medium transition-all ${
                    facultySubRole === "hod"
                      ? "bg-indigo text-white font-semibold shadow-xs"
                      : "bg-surface text-navy border border-neutral-border hover:border-indigo/50"
                  }`}
                >
                  HOD
                </button>

                {/* 3. Admin */}
                <button
                  type="button"
                  onClick={() => setFacultySubRole("admin")}
                  className={`py-2 px-2 text-center rounded-input-sm text-xs font-medium transition-all ${
                    facultySubRole === "admin"
                      ? "bg-indigo text-white font-semibold shadow-xs"
                      : "bg-surface text-navy border border-neutral-border hover:border-indigo/50"
                  }`}
                >
                  Admin
                </button>
              </div>

              <p className="text-[10.5px] text-neutral-secondary leading-snug pt-0.5">
                {facultySubRole === "teacher" && (
                  <span>Assigned subjects, attendance sessions &amp; coursework management.</span>
                )}
                {facultySubRole === "hod" && (
                  <span>Department head overview (Teacher permission tier with department scope).</span>
                )}
                {facultySubRole === "admin" && (
                  <span>Institutional management, teacher invitations &amp; class schedules.</span>
                )}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-input bg-semantic-error-subtle border border-semantic-error/30 text-semantic-error text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-navy"
              >
                Institutional Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex.sharma@uitrgpv.ac.in"
                  required
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 text-xs rounded-input bg-surface border border-neutral-border text-navy placeholder:text-neutral-secondary/60 focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-navy"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-input bg-surface border border-neutral-border text-navy placeholder:text-neutral-secondary/60 focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-secondary hover:text-navy p-1 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-input bg-indigo hover:bg-indigo-hover text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <span>Authenticating with Supabase...</span>
              ) : (
                <>
                  <span>
                    {primaryRole === "student"
                      ? "Sign In to Student Workspace"
                      : `Continue as ${
                          facultySubRole === "admin"
                            ? "Admin"
                            : facultySubRole === "hod"
                            ? "HOD"
                            : "Teacher"
                        }`}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="pt-2 border-t border-neutral-border text-center">
            <p className="text-[11px] text-neutral-secondary flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-neutral-secondary/80" />
              <span>CampusIQ Session Guard • Supabase Cloud Authentication</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 text-xs text-neutral-secondary">
        <p>
          &copy; {new Date().getFullYear()} CampusIQ • University Institute of Technology, RGPV Shivpuri
        </p>
      </footer>

      {/* Future Update Modal for Teacher / HOD */}
      {futurePortalRole && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            className="w-full max-w-sm bg-surface rounded-card border border-neutral-border p-6 shadow-card space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-subtle text-indigo mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-light border border-neutral-border text-neutral-secondary">
                {futurePortalRole} Portal
              </span>
              <h3 className="text-[18px] font-bold text-navy">
                Coming Soon
              </h3>
              <p className="text-xs text-neutral-secondary font-medium leading-relaxed pt-1">
                This portal will be available in a future update.
              </p>
            </div>

            <div className="p-3 rounded-input bg-neutral-light border border-neutral-border text-[11px] text-neutral-secondary text-left space-y-1">
              <p className="font-semibold text-navy">Current Active Scope:</p>
              <p>
                The <strong>Student Academic Workspace</strong> is fully operational.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFuturePortalRole(null);
                  handlePrimaryRoleChange("student");
                }}
                className="w-full py-2.5 px-4 rounded-input bg-indigo hover:bg-indigo-hover text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Switch to Student Portal
              </button>
              <button
                type="button"
                onClick={() => setFuturePortalRole(null)}
                className="w-full py-2 px-4 rounded-input border border-neutral-border text-xs font-medium text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
