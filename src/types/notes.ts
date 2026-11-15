export interface SubjectUnit {
  unitNumber: number; // 1 to 5
  title: string;
  description?: string;
}

export interface AcademicNote {
  id: string;
  title: string;
  description: string;
  semester: number; // 1
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  unit: number; // 1 to 5
  unitTitle: string; // e.g. "Unit 1: Water & Its Treatment"
  fileName: string;
  fileSize: number; // in bytes
  fileSizeFormatted: string; // e.g. "1.8 MB"
  uploadedAt: string; // ISO date string
  uploadedBy: string; // e.g. "Dr. P.K. Mishra (Dept. of Chemistry)"
  isPublished: boolean; // Published (visible to students) vs Draft (staff only)
  storageKey: string; // IndexedDB key for PDF blob
  dataUrl?: string; // Pre-seeded valid SVG-PDF data URL
}

export interface StaffNoteFormData {
  title: string;
  description: string;
  semester: number;
  subjectId: string;
  unit: number;
  isPublished: boolean;
  uploadedBy?: string;
}
