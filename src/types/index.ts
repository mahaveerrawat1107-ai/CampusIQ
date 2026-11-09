/**
 * CampusIQ Core Type Definitions
 * Aligned with the approved MVP data model.
 */

export type Role = "student" | "admin";

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  enrollmentNo: string;
  collegeName: string;
  branch: string;
  semester: number;
  academicYear: string;
  role: Role;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  branch: string;
  semester: number;
}

export interface AttendanceEntry {
  id: string;
  studentId: string;
  subjectId: string;
  sessionDate: string; // ISO date YYYY-MM-DD
  sessionNo: number; // Session 1, 2, etc. to prevent duplicate records
  status: "present" | "absent";
  recordedAt: string;
}

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  presentCount: number;
  totalCount: number;
  percentage: number;
  status: "safe" | "warning" | "critical"; // Safe >= 75%, warning 70-74.9%, critical < 70%
  classesNeededFor75: number;
  safeBunksRemaining: number;
}

export type AssignmentPriority = "low" | "medium" | "high";

export type AssignmentStatus = "pending" | "completed" | "due_soon" | "overdue";

export interface Assignment {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  priority: AssignmentPriority;
  attachmentPath?: string;
  publishedBy: string;
}

export interface StudentAssignmentStatus {
  assignmentId: string;
  studentId: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface AcademicResource {
  id: string;
  title: string;
  description?: string;
  semester: number;
  subjectId: string;
  subjectName: string;
  unit: number;
  storagePath: string;
  fileSize: number; // In bytes
  fileType: "pdf";
  uploadedBy: string;
  uploadedAt: string;
}
