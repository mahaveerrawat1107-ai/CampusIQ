export type AssignmentPriority = "Low" | "Medium" | "High";

export type AssignmentStatus = "Pending" | "Completed";

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
  status: AssignmentStatus;
  createdAt: string;
}

export interface AssignmentFormData {
  title: string;
  description: string;
  subjectId: string;
  assignedDate: string;
  dueDate: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
}
