"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

interface DemoAccount {
  label: string;
  roleType: PrimaryRoleOption;
  subRole?: FacultySubRole;
  demoId: string;
  password: string;
  description: string;
  badge: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Student Demo",
    roleType: "student",
    demoId: "CIQ-STU-001",
    password: "student123",
    description: "Access existing student dashboard, attendance & notes",
    badge: "Active",
  },
  {
    label: "Teacher Demo",
    roleType: "faculty",
    subRole: "teacher",
    demoId: "CIQ-TEA-001",
    password: "teacher123",
    description: "Faculty lecture & assignment management placeholder",
    badge: "Upcoming",
  },
  {
    label: "Admin Demo",
    roleType: "faculty",
    subRole: "admin",
    demoId: "CIQ-ADM-001",
    password: "admin123",
    description: "Departmental administration & roster placeholder",
    badge: "Upcoming",
  },
];

export default function LoginPage() {
  const router = useRouter();

  // Primary selection: Student vs Teacher/Faculty
  const [primaryRole, setPrimaryRole] = useState<PrimaryRoleOption>("student");

  // Secondary sub-role when "Continue as Teacher" is selected:
  // Note: Backend roles remain strictly: 'student', 'teacher', 'admin'.
  // HOD is a Teacher (role: 'teacher'), NOT a separate database role.
  const [facultySubRole, setFacultySubRole] = useState<FacultySubRole>("teacher");

  // Form inputs
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Future-portal modal for Teacher / HOD / Admin
  const [futurePortalRole, setFuturePortalRole] = useState<string | null>(null);

  // Handle Quick Fill from Demo Access cards
  const handleApplyDemo = (demo: DemoAccount) => {
    setPrimaryRole(demo.roleType);
    if (demo.subRole) {
      setFacultySubRole(demo.subRole);
    }
    setIdentifier(demo.demoId);
    setPassword(demo.password);
    setErrorMessage(null);
  };

  const handlePrimaryRoleChange = (role: PrimaryRoleOption) => {
    setPrimaryRole(role);
    setErrorMessage(null);
    if (role === "student") {
      setIdentifier("CIQ-STU-001");
      setPassword("student123");
    } else {
      setIdentifier("CIQ-TEA-001");
      setPassword("teacher123");
      setFacultySubRole("teacher");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedId = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedId || !trimmedPass) {
      setErrorMessage("Please enter both your ID and password.");
      return;
    }

    setIsLoading(true);

    // Simulated auth delay for realistic feedback
    setTimeout(() => {
      setIsLoading(false);

      if (primaryRole === "student") {
        // Student Demo Access verification
        // Accept demo credential CIQ-STU-001 or standard student demo credentials
        if (
          (trimmedId.toUpperCase() === "CIQ-STU-001" && trimmedPass === "student123") ||
          trimmedId.toLowerCase().includes("student") ||
          trimmedId.startsWith("0108CS")
        ) {
          // Redirect to existing student dashboard
          router.push("/");
          return;
        }

        setErrorMessage("Invalid Student ID or password. Use demo ID: CIQ-STU-001 / student123");
        return;
      }

      // Teacher / HOD / Admin selection
      // Per instructions: "For Teacher, HOD, and Admin demo access, show a simple message: 'This portal will be available in a future update.'"
      let targetRoleLabel = "Teacher";
      if (facultySubRole === "hod") {
        targetRoleLabel = "Head of Department (HOD)";
      } else if (facultySubRole === "admin") {
        targetRoleLabel = "Institutional Administrator";
      }

      // Verify demo credentials or show portal notice
      if (
        (facultySubRole === "teacher" && trimmedId.toUpperCase() === "CIQ-TEA-001" && trimmedPass === "teacher123") ||
        (facultySubRole === "admin" && trimmedId.toUpperCase() === "CIQ-ADM-001" && trimmedPass === "admin123") ||
        (facultySubRole === "hod" && (trimmedPass === "teacher123" || trimmedPass === "admin123")) ||
        trimmedId.toUpperCase().startsWith("CIQ-")
      ) {
        setFuturePortalRole(targetRoleLabel);
      } else {
        // Also show future portal info with note
        setFuturePortalRole(targetRoleLabel);
      }
    }, 450);
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
          <span className="font-medium">System Online</span>
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
              Select your role and enter your institutional credentials to continue.
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
                  onClick={() => {
                    setFacultySubRole("teacher");
                    setIdentifier("CIQ-TEA-001");
                    setPassword("teacher123");
                  }}
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
                  onClick={() => {
                    setFacultySubRole("hod");
                    setIdentifier("CIQ-TEA-001");
                    setPassword("teacher123");
                  }}
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
                  onClick={() => {
                    setFacultySubRole("admin");
                    setIdentifier("CIQ-ADM-001");
                    setPassword("admin123");
                  }}
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

            {/* ID Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-navy"
              >
                {primaryRole === "student"
                  ? "Enrollment Number / Demo ID"
                  : facultySubRole === "admin"
                  ? "Admin ID / Demo ID"
                  : "Faculty ID / Demo ID"}
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    primaryRole === "student"
                      ? "e.g. CIQ-STU-001 or 0108CS261001"
                      : facultySubRole === "admin"
                      ? "e.g. CIQ-ADM-001"
                      : "e.g. CIQ-TEA-001"
                  }
                  required
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
                <span className="text-[11px] text-neutral-secondary">
                  Demo credentials below
                </span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
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
                <span>Verifying credentials...</span>
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
              <span>CampusIQ Session Guard • UIT RGPV Shivpuri</span>
            </p>
          </div>
        </div>

        {/* Demo Access Section (Requirement 3: Dedicated Section for Testers) */}
        <div className="bg-surface rounded-card border border-neutral-border p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-border/70">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy">
                Demo Access Credentials
              </h2>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-subtle text-indigo">
              For Evaluators &amp; QA
            </span>
          </div>

          <p className="text-xs text-neutral-secondary leading-relaxed">
            Click any account below to auto-populate credentials for instant testing:
          </p>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((demo) => {
              const isSelected =
                primaryRole === demo.roleType &&
                (demo.roleType === "student" || facultySubRole === demo.subRole);

              return (
                <button
                  key={demo.label}
                  type="button"
                  onClick={() => handleApplyDemo(demo)}
                  className={`w-full text-left p-3 rounded-input border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-indigo-subtle/50 border-indigo shadow-xs"
                      : "bg-neutral-light border-neutral-border hover:bg-neutral-light/80 hover:border-neutral-border/90"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy">
                        {demo.label}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          demo.badge === "Active"
                            ? "bg-semantic-success-subtle text-semantic-success"
                            : "bg-neutral-border text-neutral-secondary"
                        }`}
                      >
                        {demo.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-secondary">
                      <span>ID: <strong className="text-navy">{demo.demoId}</strong></span>
                      <span>•</span>
                      <span>Pass: <strong className="text-navy">{demo.password}</strong></span>
                    </div>
                    <p className="text-[11px] text-neutral-secondary">
                      {demo.description}
                    </p>
                  </div>

                  <span className="text-[11px] font-semibold text-indigo self-center flex-shrink-0">
                    Use &rarr;
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[10.5px] text-neutral-secondary text-center pt-1 leading-snug">
            Demo credentials are local test accounts for previewing flows.
            Supabase Auth handles live authenticated sessions.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 text-xs text-neutral-secondary">
        <p>
          &copy; {new Date().getFullYear()} CampusIQ • University Institute of Technology, RGPV Shivpuri
        </p>
      </footer>

      {/* ============================================================ */}
      {/* FUTURE UPDATE MODAL for Teacher / HOD / Admin                */}
      {/* Requirement 4: "For Teacher, HOD, and Admin demo access,    */}
      {/* show a simple message: 'This portal will be available in a  */}
      {/* future update.'"                                             */}
      {/* ============================================================ */}
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
                The <strong>Student Academic Workspace</strong> (Home, Attendance, Assignments, Notes Library, and Student Profile) is fully operational for testing.
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
                Switch to Student Demo Portal
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
