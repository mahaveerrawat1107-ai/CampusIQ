"use client";

import React, { useEffect } from "react";
import { LogOut, X, AlertCircle } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-surface rounded-card border border-neutral-border p-6 shadow-modal space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-input bg-semantic-error-subtle text-semantic-error flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-input text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 id="logout-modal-title" className="text-[18px] font-bold text-navy">
            Log Out of CampusIQ?
          </h3>
          <p className="text-xs text-neutral-secondary mt-1.5 leading-relaxed">
            In this local student pilot version, authentication is simulated. Logging out will end your current active view. Your locally saved attendance history and personal study records remain safely preserved on this device.
          </p>
        </div>

        <div className="p-3 rounded-input bg-neutral-light border border-neutral-border text-xs text-neutral-secondary flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-indigo flex-shrink-0 mt-0.5" />
          <span>
            Prototype note: Institutional single sign-on (SSO) and remote session invalidation will be integrated in future phases.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-input border border-neutral-border text-xs font-semibold text-navy hover:bg-neutral-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-input bg-semantic-error text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Confirm Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
