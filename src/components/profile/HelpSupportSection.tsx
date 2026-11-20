"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { SUPPORT_FAQS } from "@/data/profileData";
import { FeedbackModal } from "./FeedbackModal";

export function HelpSupportSection() {
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);

  const categories = ["All", "Attendance", "Assignments", "Notes", "Account"];

  const filteredFaqs =
    selectedCategory === "All"
      ? SUPPORT_FAQS
      : SUPPORT_FAQS.filter((f) => f.category === selectedCategory);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-surface rounded-card border border-neutral-border p-6 shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-navy leading-none">
              Help, Guidelines & Institutional Support
            </h3>
            <p className="text-xs text-neutral-secondary mt-0.5">
              University guidance, academic cell contacts, and support queries
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsFeedbackModalOpen(true)}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input bg-indigo text-white text-xs font-semibold hover:bg-indigo-hover transition-colors shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Contact Academic Cell</span>
        </button>
      </div>

      {/* Academic Coordinator Contact Card */}
      <div className="p-4 sm:p-5 rounded-input bg-gradient-to-r from-neutral-light via-surface to-indigo-subtle/30 border border-neutral-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Designated Academic Authority</span>
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface border border-neutral-border text-navy">
            UIT RGPV Shivpuri
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-navy">
              Dr. S.K. Jain
            </h4>
            <p className="text-xs text-neutral-secondary">
              Head of Department & Academic Coordinator, Computer Science & Engineering
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-secondary">
            <a
              href="mailto:academics.uitrgpv@rgpv.ac.in"
              className="inline-flex items-center gap-1.5 text-indigo hover:underline font-semibold"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>academics.uitrgpv@rgpv.ac.in</span>
            </a>
            <span className="hidden sm:inline text-neutral-border">•</span>
            <span className="inline-flex items-center gap-1 text-navy font-medium">
              <MapPin className="w-3.5 h-3.5 text-neutral-secondary" />
              <span>Room 108, Academic Block A</span>
            </span>
            <span className="hidden sm:inline text-neutral-border">•</span>
            <span className="inline-flex items-center gap-1 text-neutral-secondary">
              <Clock className="w-3.5 h-3.5" />
              <span>Mon–Fri (10 AM – 4 PM)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo" />
            <span>Frequently Asked Questions</span>
          </h4>

          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-navy text-white shadow-sm"
                    : "bg-neutral-light text-neutral-secondary hover:text-navy hover:bg-neutral-border/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-neutral-border rounded-input overflow-hidden transition-colors bg-surface"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-neutral-light/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-subtle text-indigo flex-shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-xs font-bold text-navy truncate sm:whitespace-normal">
                      {faq.question}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-neutral-secondary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-secondary flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-neutral-secondary leading-relaxed border-t border-neutral-border/60 bg-neutral-light/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}
