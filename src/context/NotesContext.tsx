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
  createSampleNotePdfDataUrl,
} from "@/lib/notesStorage";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

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
  refreshNotes: () => Promise<void>;
  resetNotesToDefaultSeed: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [supabase] = useState(() => createClient());
  const [subjects] = useState<Subject[]>(PILOT_SUBJECTS);
  const [notes, setNotes] = useState<AcademicNote[]>(SEED_ACADEMIC_NOTES);
  const [isHydrated, setIsHydrated] = useState(false);

  // Fetch notes from Supabase academic_notes
  const fetchSupabaseNotes = useCallback(async () => {
    try {
      const { data: dbNotes, error } = await supabase
        .from("academic_notes")
        .select(`
          id,
          title,
          description,
          semester,
          subject_id,
          unit,
          unit_title,
          file_name,
          file_size,
          storage_path,
          uploaded_by,
          is_published,
          uploaded_at,
          updated_at
        `);

      if (!error && dbNotes && dbNotes.length > 0) {
        const mapped: AcademicNote[] = dbNotes.map((n) => {
          const subj = PILOT_SUBJECTS.find((s) => s.id === n.subject_id);
          const sizeNum = typeof n.file_size === "number" ? n.file_size : 2 * 1024 * 1024;
          const uTitle = n.unit_title || getUnitTitle(n.subject_id, n.unit || 1);

          // Get public URL from storage if bucket exists
          const { data: publicUrlData } = supabase.storage
            .from("academic-notes")
            .getPublicUrl(n.storage_path);

          return {
            id: n.id,
            title: n.title,
            description: n.description || "",
            semester: n.semester || 1,
            subjectId: n.subject_id || "sub-bt101",
            subjectName: subj?.name || "General Engineering",
            subjectCode: subj?.code || "BT-100",
            unit: n.unit || 1,
            unitTitle: uTitle,
            fileName: n.file_name || `${n.title}.pdf`,
            fileSize: sizeNum,
            fileSizeFormatted: formatFileSize(sizeNum),
            uploadedAt: n.uploaded_at,
            uploadedBy: "Faculty / Academic Dept",
            isPublished: n.is_published,
            storageKey: n.storage_path,
            dataUrl: publicUrlData?.publicUrl || createSampleNotePdfDataUrl(
              subj?.code || "BT",
              subj?.name || "Engineering Subject",
              uTitle,
              n.title,
              "Academic Faculty"
            ),
          };
        });
        setNotes(mapped);
      }
    } catch (err) {
      console.warn("Could not fetch notes from Supabase, keeping current state:", err);
    } finally {
      setIsHydrated(true);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSupabaseNotes();
  }, [fetchSupabaseNotes]);

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

  // Create note (Staff)
  const createStaffNote = async (
    data: StaffNoteFormData,
    file: File
  ): Promise<{ success: boolean; error?: string }> => {
    const fileValidation = validateNotePdfFile(file);
    if (!fileValidation.valid) {
      return { success: false, error: fileValidation.error };
    }

    const noteId = `note-${Date.now()}`;
    const storageKey = `notes/${noteId}_${file.name}`;
    const subj = subjects.find((s) => s.id === data.subjectId)!;
    const unitTitle = getUnitTitle(data.subjectId, data.unit);

    // Save locally to IndexedDB as fallback
    await saveNotePdfBlob(storageKey, file, file.name);

    // Upload to Supabase Storage if bucket is reachable
    try {
      await supabase.storage.from("academic-notes").upload(storageKey, file);
    } catch (e) {
      console.warn("Supabase storage upload bypassed:", e);
    }

    const newNote: AcademicNote = {
      id: noteId,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : "",
      semester: data.semester,
      subjectId: data.subjectId,
      subjectName: subj.name,
      subjectCode: subj.code,
      unit: data.unit,
      unitTitle,
      fileName: file.name,
      fileSize: file.size,
      fileSizeFormatted: formatFileSize(file.size),
      uploadedAt: new Date().toISOString(),
      uploadedBy: data.uploadedBy || "Faculty / Academic Dept",
      isPublished: Boolean(data.isPublished),
      storageKey,
    };

    setNotes([newNote, ...notes]);
    return { success: true };
  };

  // Edit Note
  const editStaffNote = async (
    id: string,
    data: StaffNoteFormData
  ): Promise<{ success: boolean; error?: string }> => {
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) {
      return { success: false, error: "Note not found." };
    }

    const subj = subjects.find((s) => s.id === data.subjectId)!;
    const unitTitle = getUnitTitle(data.subjectId, data.unit);

    const updated = [...notes];
    updated[index] = {
      ...updated[index],
      title: data.title.trim(),
      description: data.description ? data.description.trim() : "",
      semester: data.semester,
      subjectId: data.subjectId,
      subjectName: subj.name,
      subjectCode: subj.code,
      unit: data.unit,
      unitTitle,
      isPublished: Boolean(data.isPublished),
    };

    setNotes(updated);
    return { success: true };
  };

  // Replace PDF
  const replaceNotePdf = async (
    id: string,
    newFile: File
  ): Promise<{ success: boolean; error?: string }> => {
    const fileValidation = validateNotePdfFile(newFile);
    if (!fileValidation.valid) {
      return { success: false, error: fileValidation.error };
    }

    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) {
      return { success: false, error: "Note not found." };
    }

    const targetNote = notes[index];
    await deleteNotePdfBlob(targetNote.storageKey);

    const newStorageKey = `notes/${targetNote.id}_${newFile.name}`;
    await saveNotePdfBlob(newStorageKey, newFile, newFile.name);

    try {
      await supabase.storage.from("academic-notes").upload(newStorageKey, newFile, { upsert: true });
    } catch (e) {
      console.warn("Storage upload bypassed:", e);
    }

    const updated = [...notes];
    updated[index] = {
      ...targetNote,
      fileName: newFile.name,
      fileSize: newFile.size,
      fileSizeFormatted: formatFileSize(newFile.size),
      storageKey: newStorageKey,
      dataUrl: undefined,
    };

    setNotes(updated);
    return { success: true };
  };

  // Delete note
  const deleteStaffNote = async (id: string): Promise<{ success: boolean }> => {
    const target = notes.find((n) => n.id === id);
    if (target) {
      await deleteNotePdfBlob(target.storageKey);
    }
    setNotes(notes.filter((n) => n.id !== id));
    return { success: true };
  };

  // Toggle publish
  const toggleNotePublishStatus = (id: string) => {
    setNotes(
      notes.map((n) =>
        n.id === id ? { ...n, isPublished: !n.isPublished } : n
      )
    );
  };

  const resetNotesToDefaultSeed = () => {
    setNotes(SEED_ACADEMIC_NOTES);
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
        refreshNotes: fetchSupabaseNotes,
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
