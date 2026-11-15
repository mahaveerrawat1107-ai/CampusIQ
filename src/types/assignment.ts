export type AssignmentPriority = "Low" | "Medium" | "High";

export type AttachmentFileType = "pdf" | "image";

export interface AssignmentAttachment {
  id: string;
  name: string;
  fileType: AttachmentFileType;
  mimeType: string;
  fileSize: number; // in bytes
  fileSizeFormatted: string; // e.g. "1.4 MB"
  uploadedAt: string; // ISO string
  storageKey: string; // IndexedDB key
  dataUrl?: string; // fallback / seed data URL
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  assignedDate: string; // YYYY-MM-DD
  dueDate: string;      // YYYY-MM-DD
  priority: AssignmentPriority;
  isPublished: boolean; // Published to students or Draft
  attachments: AssignmentAttachment[];
  createdAt: string;
  updatedAt?: string;
  createdBy: string;    // e.g. "Prof. R.K. Sharma (CSE Dept)"
}

export interface StudentAssignmentRecord {
  assignmentId: string;
  studentId: string; // e.g. "std-alex"
  isCompleted: boolean;
  completedAt?: string;
}

export interface StaffAssignmentFormData {
  title: string;
  description: string;
  subjectId: string;
  assignedDate: string;
  dueDate: string;
  priority: AssignmentPriority;
  isPublished: boolean;
  attachments: AssignmentAttachment[];
  createdBy?: string;
}
