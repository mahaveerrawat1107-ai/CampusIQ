export interface StudentInfo {
  name: string;
  enrollmentNo: string;
  branch: string;
  semester: string;
  college: string;
}

export interface AttendanceData {
  percentage: number;
  attended: number;
  total: number;
  target: number;
  status: "Safe" | "Warning" | "Critical";
  statusNote: string;
}

export interface MockAssignment {
  id: string;
  title: string;
  subject: string;
  subjectCode: string;
  dueDate: string;
  daysRemaining: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed";
}

export interface MockNote {
  id: string;
  subject: string;
  unit: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
}

export const mockStudent: StudentInfo = {
  name: "Alex Sharma",
  enrollmentNo: "0192CS261042",
  branch: "Computer Science & Engineering",
  semester: "1st Semester (1st Year)",
  college: "UIT RGPV Shivpuri",
};

export const mockAttendance: AttendanceData = {
  percentage: 82,
  attended: 41,
  total: 50,
  target: 75,
  status: "Safe",
  statusNote: "You can safely miss 4 classes while staying above the 75% target.",
};

export const mockQuickStats = {
  pendingAssignments: 4,
  newNotesCount: 3,
};

export const mockUpcomingAssignments: MockAssignment[] = [
  {
    id: "asg-1",
    title: "Engineering Chemistry Lab Report & Analysis",
    subject: "Engineering Chemistry",
    subjectCode: "BT-101",
    dueDate: "Nov 12, 2026",
    daysRemaining: "Due in 3 days",
    priority: "High",
    status: "Pending",
  },
  {
    id: "asg-2",
    title: "Superposition & Thevenin Theorems Problem Set",
    subject: "Basic Electrical & Electronics",
    subjectCode: "BT-104",
    dueDate: "Nov 15, 2026",
    daysRemaining: "Due in 6 days",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: "asg-3",
    title: "Matrix Eigenvalues & Cayley-Hamilton Proofs",
    subject: "Mathematics-I",
    subjectCode: "BT-102",
    dueDate: "Nov 18, 2026",
    daysRemaining: "Due next week",
    priority: "Low",
    status: "Pending",
  },
];

export const mockRecentNotes: MockNote[] = [
  {
    id: "note-1",
    subject: "Mathematics-I",
    unit: "Unit 2",
    title: "Linear Algebra, Rank of Matrix & Eigenvalues",
    fileName: "Math1_Unit2_Eigenvalues.pdf",
    fileSize: "2.4 MB",
    uploadedAt: "Added yesterday",
  },
  {
    id: "note-2",
    subject: "Basic Electrical & Electronics",
    unit: "Unit 1",
    title: "DC Circuit Analysis & Network Theorems",
    fileName: "BEEE_Unit1_NetworkTheorems.pdf",
    fileSize: "3.1 MB",
    uploadedAt: "Added 3 days ago",
  },
  {
    id: "note-3",
    subject: "Engineering Chemistry",
    unit: "Unit 1",
    title: "Water Softening, Zeolite & Ion Exchange",
    fileName: "Chem_Unit1_WaterTreatment.pdf",
    fileSize: "1.8 MB",
    uploadedAt: "Added 4 days ago",
  },
];
