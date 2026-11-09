import { ArrowRight, CheckCircle2, Layers } from "lucide-react";

export default function RootPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg bg-surface border border-neutral-border rounded-card p-8 shadow-card">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-subtle text-indigo text-xs font-semibold mb-6">
          <Layers className="w-3.5 h-3.5" />
          <span>Stage 0: Foundation Complete</span>
        </div>

        {/* Brand & Title */}
        <h1 className="text-[28px] leading-[1.25] font-bold text-navy tracking-tight mb-2">
          CampusIQ
        </h1>
        <p className="text-[15px] leading-[1.5] text-neutral-secondary mb-6">
          &ldquo;Your college. Your academics. One organized workspace.&rdquo;
        </p>

        {/* Foundation Checklist */}
        <div className="space-y-3 border-t border-neutral-border pt-6 mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-secondary">
            Design System & Foundation Setup
          </div>

          <div className="flex items-center gap-3 text-[14px] text-navy">
            <CheckCircle2 className="w-4 h-4 text-semantic-success flex-shrink-0" />
            <span>Manrope typography configured & loaded</span>
          </div>

          <div className="flex items-center gap-3 text-[14px] text-navy">
            <CheckCircle2 className="w-4 h-4 text-semantic-success flex-shrink-0" />
            <span>Approved color tokens & 8px spacing rules active</span>
          </div>

          <div className="flex items-center gap-3 text-[14px] text-navy">
            <CheckCircle2 className="w-4 h-4 text-semantic-success flex-shrink-0" />
            <span>Next.js 14 App Router, TypeScript & Lucide icons ready</span>
          </div>

          <div className="flex items-center gap-3 text-[14px] text-navy">
            <CheckCircle2 className="w-4 h-4 text-semantic-success flex-shrink-0" />
            <span>Target institution: UIT RGPV Shivpuri (1st Year CSE)</span>
          </div>
        </div>

        {/* Next Stage Note */}
        <div className="p-4 rounded-input bg-neutral-light border border-neutral-border">
          <p className="text-xs font-semibold text-navy mb-1">Awaiting Founder Approval</p>
          <p className="text-xs text-neutral-secondary leading-relaxed">
            Ready to implement <strong>CampusIQ Home Page — Stage 1: Static UI</strong> upon your confirmation.
          </p>
        </div>
      </div>
    </main>
  );
}
