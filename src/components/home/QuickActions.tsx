import React from "react";
import {
  CalendarCheck2,
  ClipboardList,
  BookOpen,
  ArrowUpRight,
  PlusCircle,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Log Class Attendance",
      description: "Record present or absent for today's lectures & labs",
      icon: CalendarCheck2,
      badge: "Quick Entry",
      accentColor: "text-semantic-success",
      bgColor: "bg-semantic-success-subtle",
    },
    {
      title: "Review Assignments",
      description: "Check deadlines, submission priorities & personal status",
      icon: ClipboardList,
      badge: "4 Pending",
      accentColor: "text-indigo",
      bgColor: "bg-indigo-subtle",
    },
    {
      title: "Browse Subject Notes",
      description: "Access semester PDFs by subject and unit",
      icon: BookOpen,
      badge: "3 New",
      accentColor: "text-semantic-warning",
      bgColor: "bg-semantic-warning-subtle",
    },
  ];

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card">
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-navy leading-none">
          Quick Academic Shortcuts
        </h2>
        <p className="text-[12px] text-neutral-secondary font-medium mt-1">
          Jump straight into your daily academic tasks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;

          return (
            <button
              key={act.title}
              type="button"
              className="p-4 rounded-card-sm border border-neutral-border hover:border-indigo/40 bg-neutral-light hover:bg-surface text-left transition-all duration-150 flex flex-col justify-between group shadow-xs hover:shadow-subtle"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-input ${act.bgColor} ${act.accentColor} flex items-center justify-center`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface border border-neutral-border text-navy">
                    {act.badge}
                  </span>
                </div>

                <h3 className="text-[14px] font-semibold text-navy group-hover:text-indigo transition-colors">
                  {act.title}
                </h3>
                <p className="text-xs text-neutral-secondary mt-1 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-neutral-border/60 flex items-center justify-between text-xs font-semibold text-indigo">
                <span>Open module</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
