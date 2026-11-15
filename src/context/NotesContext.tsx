"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { AcademicNote, StaffNoteFormData } from "@/types/notes";
import { Subject } from "@/types";
import { PILOT_SUBJECTS } from "@/data/attendanceData";
import { SEED_ACADEMIC_NOTES } from "@/data/notesData";
import { getUnitTitle } from "@/data/notesCatalogue";
import {
  saveNotePdfBlob,
  deleteNotePdfBlob,
  validateNotePdfFile,
  formatFileSize,
} from "@/lib/notesStorage";

export interface StaffNotesStats {
  total: number;
  published: number;
  draft: number;
  totalSubjects: number;
}

interface NotesContextType {
  subjects: Subject[];
  isHydrated: boolean;

  // Student view (Published notes only)
  publishedNotes: AcademicNote[];

  // Staff view (All notes: published + draft)
  allNotes: AcademicNote[];
  staffStats: StaffNotesStats;

  // Staff Actions
  createStaffNote: (data: StaffNoteFormData, file: File) => Promise<{ success: boolean; error?: string }>;
  editStaffNote: (id: string, data: StaffNoteFormData) => Promise<{ success: boolean; error?: string }>;
  replaceNotePdf: (id: string, newFile: File) => Promise<{ success: boolean; error?: string }>;
  deleteStaffNote: (id: string) => Promise<{ success: boolean }>;
  toggleNotePublishStatus: (id: string) => void;
  resetNotesToDefaultSeed: () => void;
}

const STORAGE_KEY_NOTES = "campusiq_notes_catalog_v1";

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [subjects] = useState<Subject[]>(PILOT_SUBJECTS);
  const [notes, setNotes] = useState<AcademicNote[]>(SEED_ACADEMIC_NOTES);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY_NOTES);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotes(parsed);
          }
        }
      }
    } catch (e) {
      console.warn("Could not read local notes storage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist metadata to localStorage
  const persistNotes = useCallback((newNotes: AcademicNote[]) => {
    setNotes(newNotes);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(newNotes));
      }
    } catch (e) {
      console.error("Failed to save notes catalog to local storage:", e);
    }
  }, []);

  // Published notes for student view
  const publishedNotes = useMemo(() => {
    return notes.filter((n) => n.isPublished);
  }, [notes]);

  // Staff summary statistics
  const staffStats: StaffNotesStats = useMemo(() => {
    let published = 0;
    let draft = 0;
    const subjectsSet = new Set<string>();

    for (const n of notes) {
      if (n.isPublished) published += 1;
      else draft += 1;
      subjectsSet.add(n.subjectId);
    }

    return {
      total: notes.length,
      published,
      draft,
      totalSubjects: subjectsSet.size,
    };
  }, [notes]);

  // Create new note with PDF upload
  const createStaffNote = async (
    data: StaffNoteFormData,
    file: File
  ): Promise<{ success: boolean; error?: string }> => {
    if (!data.title || !data.title.trim()) {
      return { success: false, error: "Note title is required." };
    }
    if (!data.subjectId) {
      return { success: false, error: "Please select a course subject." };
    }
    if (!data.unit || data.unit < 1 || data.unit > 5) {
      return { success: false, error: "Please select a valid syllabus unit (1 to 5)." };
    }
    if (!file) {
      return { success: false, error: "Please upload a PDF document for this note." };
    }

    const validation = validateNotePdfFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const storageKey = `note_blob_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const saved = await saveNotePdfBlob(storageKey, file, file.name);

    if (!saved) {
      return {
        success: false,
        error: "Failed to persist PDF file in local storage. Please try again.",
      };
    }

    const subj = subjects.find((s) => s.id === data.subjectId)!;
    const unitTitle = getUnitTitle(data.subjectId, data.unit);

    const newNote: AcademicNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : "",
      semester: data.semester || 1,
      subjectId: data.subjectId,
      subjectName: subj.name,
      subjectCode: subj.code,
      unit: data.unit,
      unitTitle,
      fileName: file.name,
      fileSize: file.size,
      fileSizeFormatted: formatFileSize(file.size),
      uploadedAt: new Date().toISOString(),
      uploadedBy: data.uploadedBy || "Faculty Instructor (UIT RGPV)",
      isPublished: Boolean(data.isPublished),
      storageKey,
    };

    const updated = [newNote, ...notes];
    persistNotes(updated);
    return { success: true };
  };

  // Edit note metadata (preserves existing stored PDF!)
  const editStaffNote = async (
    id: string,
    data: StaffNoteFormData
  ): Promise<{ success: boolean; error?: string }> => {
    if (!data.title || !data.title.trim()) {
      return { success: false, error: "Note title is required." };
    }
    if (!data.subjectId) {
      return { success: false, error: "Please select a course subject." };
    }
    if (!data.unit || data.unit < 1 || data.unit > 5) {
      return { success: false, error: "Please select a valid unit." };
    }

    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) {
      return { success: false, error: "Academic note not found." };
    }

    const subj = subjects.find((s) => s.id === data.subjectId)!;
    const unitTitle = getUnitTitle(data.subjectId, data.unit);

    const updated = [...notes];
    updated[index] = {
      ...updated[index],
      title: data.title.trim(),
      description: data.description ? data.description.trim() : "",
      semester: data.semester || 1,
      subjectId: data.subjectId,
      subjectName: subj.name,
      subjectCode: subj.code,
      unit: data.unit,
      unitTitle,
      isPublished: Boolean(data.isPublished),
    };

    persistNotes(updated);
    return { success: true };
  };

  // Replace PDF file of an existing note
  const replaceNotePdf = async (
    id: string,
    newFile: File
  ): Promise<{ success: boolean; error?: string }> => {
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) {
      return { success: false, error: "Academic note not found." };
    }

    const validation = validateNotePdfFile(newFile);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const oldKey = notes[index].storageKey;
    const newStorageKey = `note_blob_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const saved = await saveNotePdfBlob(newStorageKey, newFile, newFile.name);

    if (!saved) {
      return {
        success: false,
        error: "Failed to persist new PDF file in local storage.",
      };
    }

    // Clean up old blob if it wasn't a static seed
    if (oldKey && !oldKey.startsWith("notes_blob_seed_")) {
      deleteNotePdfBlob(oldKey).catch(() => {});
    }

    const updated = [...notes];
    updated[index] = {
      ...updated[index],
      fileName: newFile.name,
      fileSize: newFile.size,
      fileSizeFormatted: formatFileSize(newFile.size),
      uploadedAt: new Date().toISOString(),
      storageKey: newStorageKey,
      dataUrl: undefined, // Cleared because replaced with real file
    };

    persistNotes(updated);
    return { success: true };
  };

  // Delete note (cleans up associated PDF blob)
  const deleteStaffNote = async (id: string): Promise<{ success: boolean }> => {
    const target = notes.find((n) => n.id === id);
    if (target && target.storageKey && !target.storageKey.startsWith("notes_blob_seed_")) {
      deleteNotePdfBlob(target.storageKey).catch(() => {});
    }

    const updated = notes.filter((n) => n.id !== id);
    persistNotes(updated);
    return { success: true };
  };

  // Toggle publish / unpublish status
  const toggleNotePublishStatus = (id: string) => {
    const updated = notes.map((n) => {
      if (n.id === id) {
        return { ...n, isPublished: !n.isPublished };
      }
      return n;
    });
    persistNotes(updated);
  };

  // Reset to default seed dataset
  const resetNotesToDefaultSeed = () => {
    persistNotes(SEED_ACADEMIC_NOTES);
  };

  return (
    <NotesContext.Provider
      value={{
        subjects,
        isHydrated,

        publishedNotes,
        allNotes: notes,
        staffStats,

        createStaffNote,
        editStaffNote,
        replaceNotePdf,
        deleteStaffNote,
        toggleNotePublishStatus,
        resetNotesToDefaultSeed,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
