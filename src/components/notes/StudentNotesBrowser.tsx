"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Filter,
  FileText,
  FolderOpen,
  ChevronDown,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import { useNotes } from "@/context/NotesContext";
import { AcademicNote } from "@/types/notes";
import { NoteCard } from "./NoteCard";
import { NotePdfViewerModal } from "./NotePdfViewerModal";
import { getSubjectUnits } from "@/data/notesCatalogue";

export function StudentNotesBrowser() {
  const { publishedNotes, subjects } = useNotes();

  // Filter states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Preview modal state
  const [activeNoteForPreview, setActiveNoteForPreview] = useState<AcademicNote | null>(null);

  // Subject units contextual to selection
  const currentSubjectUnits = useMemo(() => {
    if (selectedSubjectId === "all") return [];
    return getSubjectUnits(selectedSubjectId);
  }, [selectedSubjectId]);

  // Handle subject change (resets unit filter to 'all')
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedUnit("all");
  };

  // Filtered notes based on subject, unit, and search
  const filteredNotes = useMemo(() => {
    return publishedNotes.filter((note) => {
      // Subject filter
      if (selectedSubjectId !== "all" && note.subjectId !== selectedSubjectId) {
        return false;
      }
      // Unit filter
      if (selectedUnit !== "all" && note.unit !== selectedUnit) {
        return false;
      }
      // Search query filter (title or description or unitTitle)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesDesc = note.description.toLowerCase().includes(query);
        const matchesUnit = note.unitTitle.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesUnit) {
          return false;
        }
      }
      return true;
    });
  }, [publishedNotes, selectedSubjectId, selectedUnit, searchQuery]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedSubjectId !== "all" ||
    selectedUnit !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSubjectId("all");
    setSelectedUnit("all");
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Hierarchy Breadcrumb & Search */}
      <div className="bg-surface rounded-card border border-neutral-border p-4 sm:p-5 shadow-card space-y-4">
        {/* Hierarchy Context Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-border/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-secondary">Academic Hierarchy:</span>
            <div className="flex items-center gap-1.5 font-bold text-navy">
              <span className="px-2 py-0.5 rounded bg-indigo-subtle text-indigo border border-indigo/20">
                Semester 1
              </span>
              <span className="text-neutral-secondary font-normal">→</span>
              <span className="px-2 py-0.5 rounded bg-neutral-light text-navy border border-neutral-border">
                {selectedSubjectId === "all"
                  ? "All 5 Subjects"
                  : subjects.find((s) => s.id === selectedSubjectId)?.code}
              </span>
              <span className="text-neutral-secondary font-normal">→</span>
              <span className="px-2 py-0.5 rounded bg-neutral-light text-navy border border-neutral-border">
                {selectedUnit === "all" ? "All Units (1–5)" : `Unit ${selectedUnit}`}
              </span>
            </div>
          </div>

          <div className="text-neutral-secondary text-[11px] font-medium">
            Showing <strong className="text-navy">{filteredNotes.length}</strong> published document{filteredNotes.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Search Row */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search academic notes by title, topic, or keyword (e.g. Eigenvalues, Water Softening)..."
            className="w-full pl-9 pr-9 py-2.5 text-xs rounded-input border border-neutral-border bg-neutral-light/50 text-navy placeholder:text-neutral-secondary/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-secondary hover:text-navy"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Subject Filter Pills */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-secondary">
            Select Course Subject
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubjectChange("all")}
              className={`px-3 py-1.5 rounded-input text-xs font-semibold border transition-all ${
                selectedSubjectId === "all"
                  ? "bg-navy text-white border-navy shadow-xs"
                  : "bg-surface text-neutral-secondary border-neutral-border hover:bg-neutral-light hover:text-navy"
              }`}
            >
              All Subjects ({publishedNotes.length})
            </button>

            {subjects.map((subj) => {
              const isSelected = selectedSubjectId === subj.id;
              const count = publishedNotes.filter((n) => n.subjectId === subj.id).length;

              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => handleSubjectChange(subj.id)}
                  className={`px-3 py-1.5 rounded-input text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo text-white border-indigo shadow-xs"
                      : "bg-surface text-neutral-secondary border-neutral-border hover:bg-neutral-light hover:text-navy"
                  }`}
                >
                  <span>{subj.code}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-neutral-light text-neutral-secondary"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contextual Unit Filter Pills (when subject selected or generic) */}
        {selectedSubjectId !== "all" && (
          <div className="space-y-1.5 pt-2 border-t border-neutral-border/70">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-secondary">
                Filter by Syllabus Unit
              </label>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] text-indigo hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedUnit("all")}
                className={`px-2.5 py-1 rounded-input text-xs font-semibold border transition-all ${
                  selectedUnit === "all"
                    ? "bg-navy text-white border-navy"
                    : "bg-neutral-light text-neutral-secondary border-neutral-border hover:bg-surface hover:text-navy"
                }`}
              >
                All Units
              </button>

              {currentSubjectUnits.map((u) => {
                const isSelected = selectedUnit === u.unitNumber;
                const unitCount = publishedNotes.filter(
                  (n) => n.subjectId === selectedSubjectId && n.unit === u.unitNumber
                ).length;

                return (
                  <button
                    key={u.unitNumber}
                    type="button"
                    onClick={() => setSelectedUnit(u.unitNumber)}
                    className={`px-2.5 py-1 rounded-input text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-indigo text-white border-indigo"
                        : "bg-neutral-light text-neutral-secondary border-neutral-border hover:bg-surface hover:text-navy"
                    }`}
                  >
                    <span>Unit {u.unitNumber}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-neutral-border/80 text-neutral-secondary"}`}>
                      {unitCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notes Results Viewport */}
      {filteredNotes.length === 0 ? (
        <div className="bg-surface rounded-card border border-neutral-border p-12 text-center shadow-card space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-light text-neutral-secondary flex items-center justify-center mx-auto">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy">No Published Notes Available</h3>
            <p className="text-xs text-neutral-secondary mt-1 max-w-md mx-auto leading-relaxed">
              {searchQuery.trim()
                ? `No notes match "${searchQuery}". Try using broader keywords or clearing your filters.`
                : selectedUnit !== "all"
                ? `No lecture notes have been published for Unit ${selectedUnit} in this subject yet. Course faculty will upload materials as lectures progress.`
                : "No notes have been uploaded for this course yet. Check back soon for syllabus materials."}
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-input bg-neutral-light border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* If All Subjects selected, group by Subject */}
          {selectedSubjectId === "all" ? (
            subjects
              .filter((subj) =>
                filteredNotes.some((n) => n.subjectId === subj.id)
              )
              .map((subj) => {
                const subjectNotes = filteredNotes.filter((n) => n.subjectId === subj.id);

                return (
                  <div key={subj.id} className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-subtle text-indigo border border-indigo/20">
                          {subj.code}
                        </span>
                        <h3 className="text-[16px] font-bold text-navy">
                          {subj.name}
                        </h3>
                      </div>
                      <span className="text-xs text-neutral-secondary font-medium">
                        {subjectNotes.length} document{subjectNotes.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subjectNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onPreview={(n) => setActiveNoteForPreview(n)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
          ) : (
            /* Specific Subject View: Group by Unit (Units 1 to 5) */
            <div className="space-y-6">
              {currentSubjectUnits
                .filter((unit) =>
                  selectedUnit === "all" ? true : unit.unitNumber === selectedUnit
                )
                .map((unit) => {
                  const unitNotes = filteredNotes.filter((n) => n.unit === unit.unitNumber);

                  return (
                    <div
                      key={unit.unitNumber}
                      className="bg-surface rounded-card border border-neutral-border p-5 shadow-card space-y-4"
                    >
                      {/* Unit Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-border">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-subtle text-indigo">
                              Unit {unit.unitNumber}
                            </span>
                            <h3 className="text-[15px] font-bold text-navy">
                              {unit.title}
                            </h3>
                          </div>
                          {unit.description && (
                            <p className="text-xs text-neutral-secondary mt-1">
                              {unit.description}
                            </p>
                          )}
                        </div>

                        <span className="text-xs text-neutral-secondary font-medium self-start sm:self-center flex-shrink-0">
                          {unitNotes.length} document{unitNotes.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Notes under this unit */}
                      {unitNotes.length === 0 ? (
                        <div className="py-6 text-center text-xs text-neutral-secondary bg-neutral-light/50 rounded-input border border-neutral-border/60">
                          No notes published for this unit yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {unitNotes.map((note) => (
                            <NoteCard
                              key={note.id}
                              note={note}
                              onPreview={(n) => setActiveNoteForPreview(n)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Interactive PDF Preview Modal */}
      <NotePdfViewerModal
        note={activeNoteForPreview}
        isOpen={Boolean(activeNoteForPreview)}
        onClose={() => setActiveNoteForPreview(null)}
      />
    </div>
  );
}
