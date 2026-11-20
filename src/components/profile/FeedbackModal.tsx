"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, X, CheckCircle2, Send, HelpCircle } from "lucide-react";
import { STUDENT_PROFILE_DATA } from "@/data/profileData";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [category, setCategory] = useState<string>("Attendance Query");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setSubject("");
      setMessage("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg bg-surface rounded-card border border-neutral-border p-6 shadow-modal space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 id="feedback-modal-title" className="text-[17px] font-bold text-navy leading-none">
                Academic Support & Feedback
              </h3>
              <p className="text-xs text-neutral-secondary mt-1">
                Direct query to UIT RGPV Academic Cell
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-input text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-semantic-success-subtle text-semantic-success mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-[16px] font-bold text-navy">
              Message Recorded Successfully
            </h4>
            <p className="text-xs text-neutral-secondary max-w-sm mx-auto leading-relaxed">
              Your inquiry has been logged for <span className="font-semibold text-navy">{STUDENT_PROFILE_DATA.name}</span> ({STUDENT_PROFILE_DATA.enrollmentNo}). In the production system, this notifies Dr. S.K. Jain and the academic coordinator cell.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-input bg-indigo text-white text-xs font-semibold hover:bg-indigo-hover transition-colors shadow-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-input bg-neutral-light/70 border border-neutral-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-navy">{STUDENT_PROFILE_DATA.name}</span>
                <span className="text-neutral-secondary">•</span>
                <span className="text-neutral-secondary">{STUDENT_PROFILE_DATA.enrollmentNo}</span>
              </div>
              <span className="text-[11px] font-medium text-neutral-secondary">
                {STUDENT_PROFILE_DATA.section}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-medium text-navy bg-surface border border-neutral-border rounded-input px-3 py-2.5 focus:outline-none focus:border-indigo"
              >
                <option value="Attendance Query">Attendance & Leave Discrepancy</option>
                <option value="Assignment Issue">Assignment Submission / Deadline Query</option>
                <option value="Notes Problem">Syllabus Notes / PDF Missing</option>
                <option value="General Suggestion">Portal Feedback / Technical Issue</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy block">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Attendance missing for Mathematics-I on Nov 18"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full text-xs font-medium text-navy bg-surface border border-neutral-border rounded-input px-3 py-2.5 focus:outline-none focus:border-indigo"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy block">
                Description / Message
              </label>
              <textarea
                rows={4}
                placeholder="Please describe your academic inquiry, discrepancy details, or suggestion..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full text-xs font-medium text-navy bg-surface border border-neutral-border rounded-input p-3 focus:outline-none focus:border-indigo resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-border">
              <span className="text-[11px] text-neutral-secondary flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-indigo" />
                Response time: ~24–48 hours
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-input border border-neutral-border text-xs font-semibold text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-input bg-indigo text-white text-xs font-semibold hover:bg-indigo-hover transition-colors shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
