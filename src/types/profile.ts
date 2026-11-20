export interface StudentProfileData {
  id: string;
  name: string;
  enrollmentNo: string;
  college: string;
  collegeFull: string;
  branch: string;
  semester: string;
  semesterNumber: number;
  section: string;
  batch: string;
  academicYear: string;
  email: string;
  phone: string;
  avatarInitials: string;
  status: "active" | "inactive";
  admissionDate: string;
}

export interface StudentPreferences {
  theme: "light" | "dark" | "system";
  attendanceReminders: boolean;
  assignmentDeadlineAlerts: boolean;
  notesUpdates: boolean;
}

export interface SupportFaqItem {
  id: string;
  question: string;
  answer: string;
  category: "Attendance" | "Notes" | "Assignments" | "Account";
}
