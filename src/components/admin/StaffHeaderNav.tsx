"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, BookOpen } from "lucide-react";

export function StaffHeaderNav() {
  const pathname = usePathname();

  const isAssignments = pathname.startsWith("/admin/assignments");
  const isNotes = pathname.startsWith("/admin/notes");

  return (
    <div className="flex items-center gap-2 border-b border-neutral-border pb-3 mb-5">
      <Link
        href="/admin/assignments"
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-input text-xs font-bold transition-all ${
          isAssignments
            ? "bg-navy text-white shadow-xs"
            : "bg-surface text-neutral-secondary border border-neutral-border hover:bg-neutral-light hover:text-navy"
        }`}
      >
        <ClipboardList className="w-3.5 h-3.5" />
        <span>Assignments Management</span>
      </Link>

      <Link
        href="/admin/notes"
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-input text-xs font-bold transition-all ${
          isNotes
            ? "bg-navy text-white shadow-xs"
            : "bg-surface text-neutral-secondary border border-neutral-border hover:bg-neutral-light hover:text-navy"
        }`}
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>Notes Library Management</span>
      </Link>
    </div>
  );
}
