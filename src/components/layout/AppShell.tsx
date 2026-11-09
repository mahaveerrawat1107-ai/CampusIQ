"use client";

import React from "react";
import {
  Home,
  CalendarCheck2,
  ClipboardList,
  BookOpen,
  User,
  Bell,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  id: "home" | "attendance" | "assignments" | "notes" | "profile";
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: "Home", id: "home", icon: Home },
  { name: "Attendance", id: "attendance", icon: CalendarCheck2 },
  { name: "Assignments", id: "assignments", icon: ClipboardList, badge: 4 },
  { name: "Notes Library", id: "notes", icon: BookOpen, badge: 3 },
  { name: "Profile", id: "profile", icon: User },
];

export function AppShell({ children }: AppShellProps) {
  const activeTab = "home";

  return (
    <div className="min-h-screen bg-background text-navy flex">
      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR (hidden on mobile/tablet portrait)          */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex flex-col fixed top-0 bottom-0 left-0 w-64 bg-surface border-r border-neutral-border z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-border">
          <div className="w-9 h-9 rounded-xl bg-indigo flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[18px] text-navy tracking-tight leading-none">
                CampusIQ
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-subtle text-indigo leading-none">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-secondary mt-0.5 font-medium leading-none">
              UIT RGPV Shivpuri
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-secondary">
            Academic Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;

            return (
              <button
                key={item.id}
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-input text-[14px] font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-subtle text-indigo font-semibold shadow-xs"
                    : "text-neutral-secondary hover:text-navy hover:bg-neutral-light"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-indigo" : "text-neutral-secondary"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-indigo text-white"
                        : "bg-neutral-light text-neutral-secondary"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Student Summary */}
        <div className="p-4 border-t border-neutral-border">
          <div className="flex items-center gap-3 p-2 rounded-input bg-neutral-light border border-neutral-border">
            <div className="w-8 h-8 rounded-full bg-indigo text-white font-semibold text-xs flex items-center justify-center flex-shrink-0">
              AS
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-navy truncate">
                Alex Sharma
              </p>
              <p className="text-[11px] text-neutral-secondary truncate">
                1st Year CSE • Sem 1
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN CONTENT WRAPPER                                         */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-surface/95 backdrop-blur-xs border-b border-neutral-border px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Brand / Desktop Title */}
          <div className="flex items-center gap-2">
            <div className="lg:hidden w-8 h-8 rounded-lg bg-indigo flex items-center justify-center text-white flex-shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="lg:hidden font-bold text-[17px] text-navy tracking-tight">
                CampusIQ
              </span>
              <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-secondary font-medium">
                <span>UIT RGPV Shivpuri</span>
                <span>•</span>
                <span className="text-navy font-semibold">
                  B.Tech CSE (Semester 1)
                </span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Notification button (decorative with dot indicator) */}
            <button
              type="button"
              className="relative w-9 h-9 rounded-input border border-neutral-border flex items-center justify-center text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo ring-2 ring-surface" />
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-border">
              <div className="w-9 h-9 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
                AS
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-navy leading-none">
                  Alex Sharma
                </p>
                <p className="text-[11px] text-neutral-secondary mt-1 leading-none font-medium">
                  Student
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ============================================================ */}
      {/* MOBILE BOTTOM NAVIGATION (Fixed, thumb-friendly)            */}
      {/* ============================================================ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-neutral-border z-40 flex items-center justify-around px-2 shadow-card"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors relative min-w-[48px] ${
                isActive ? "text-indigo" : "text-neutral-secondary hover:text-navy"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-indigo stroke-[2.25px]" : "stroke-[1.75px]"
                  }`}
                />
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-indigo text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] leading-none ${
                  isActive ? "font-bold text-indigo" : "font-medium"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
