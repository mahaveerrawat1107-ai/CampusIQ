import { StudentProfileData, StudentPreferences, SupportFaqItem } from "@/types/profile";

export const STUDENT_PROFILE_DATA: StudentProfileData = {
  id: "std-alex-0192",
  name: "Alex Sharma",
  enrollmentNo: "0192CS261042",
  college: "UIT RGPV Shivpuri",
  collegeFull: "University Institute of Technology, RGPV Shivpuri (M.P.)",
  branch: "Computer Science & Engineering",
  semester: "1st Semester (1st Year)",
  semesterNumber: 1,
  section: "Section A",
  batch: "2026–2030",
  academicYear: "2026–2027",
  email: "alex.sharma@uitrgpv.ac.in",
  phone: "+91 98765 43210",
  avatarInitials: "AS",
  status: "active",
  admissionDate: "August 2026",
};

export const DEFAULT_STUDENT_PREFERENCES: StudentPreferences = {
  theme: "light",
  attendanceReminders: true,
  assignmentDeadlineAlerts: true,
  notesUpdates: true,
};

export const SUPPORT_FAQS: SupportFaqItem[] = [
  {
    id: "faq-1",
    category: "Attendance",
    question: "How is the 75% attendance requirement calculated?",
    answer:
      "CampusIQ uses the mathematical formula floor((attended / 0.75) - total) to calculate safe bunks when attendance is >= 75%, and ceil((0.75 * total - attended) / 0.25) to calculate the consecutive classes needed to recover when below 75%. Safe zone is >= 75%, Warning is 70% to 74.9%, and Critical is < 70%.",
  },
  {
    id: "faq-2",
    category: "Assignments",
    question: "Who creates and publishes assignments?",
    answer:
      "Assignments are published exclusively by course instructors and academic faculty. Students have read-only access to view task requirements, download attachments, and mark personal completion progress.",
  },
  {
    id: "faq-3",
    category: "Assignments",
    question: "Does marking an assignment complete count as teacher submission?",
    answer:
      "No. Marking an assignment as 'Completed' is for your own personal study tracking and deadline organization. Official submissions follow your department's physical or laboratory protocol.",
  },
  {
    id: "faq-4",
    category: "Notes",
    question: "How do I preview or download syllabus PDF notes?",
    answer:
      "Visit the Notes Library page, filter by your course subject and unit (Units 1 to 5), and click 'Preview' to view the PDF directly inside CampusIQ, or 'Download' to save the file to your device.",
  },
  {
    id: "faq-5",
    category: "Account",
    question: "Where is my attendance and study data stored?",
    answer:
      "In this pilot version, your attendance logs, completion marks, and cached documents are stored securely in your browser's local storage and IndexedDB. In future stages, this will be synchronized to the institutional cloud.",
  },
];
