import { Assignment } from "@/types/assignment";

/**
 * Returns today's date in YYYY-MM-DD format (local timezone).
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks whether an assignment is overdue.
 * Rule: A completed assignment must NEVER be displayed as overdue.
 */
export function isAssignmentOverdue(
  dueDate: string,
  isCompleted: boolean,
  todayStr: string = getTodayDateString()
): boolean {
  if (isCompleted) {
    return false;
  }
  return dueDate < todayStr;
}

/**
 * Formats a YYYY-MM-DD string to a readable format (e.g. "Nov 18, 2026").
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Computes human-friendly relative time for assignment due date.
 */
export function getDueStatusText(
  dueDate: string,
  isCompleted: boolean,
  todayStr: string = getTodayDateString()
): { text: string; isOverdue: boolean; isDueSoon: boolean } {
  if (isCompleted) {
    return { text: "Completed", isOverdue: false, isDueSoon: false };
  }

  if (dueDate < todayStr) {
    const diffDays = getDiffDays(todayStr, dueDate);
    return {
      text: diffDays === 1 ? "Overdue by 1 day" : `Overdue by ${diffDays} days`,
      isOverdue: true,
      isDueSoon: false,
    };
  }

  if (dueDate === todayStr) {
    return { text: "Due today", isOverdue: false, isDueSoon: true };
  }

  const diffDays = getDiffDays(dueDate, todayStr);
  if (diffDays === 1) {
    return { text: "Due tomorrow", isOverdue: false, isDueSoon: true };
  }
  if (diffDays <= 3) {
    return { text: `Due in ${diffDays} days`, isOverdue: false, isDueSoon: true };
  }
  return { text: `Due in ${diffDays} days`, isOverdue: false, isDueSoon: false };
}

function getDiffDays(laterDateStr: string, earlierDateStr: string): number {
  const [y1, m1, d1] = laterDateStr.split("-").map(Number);
  const [y2, m2, d2] = earlierDateStr.split("-").map(Number);
  const dLater = new Date(y1, m1 - 1, d1).getTime();
  const dEarlier = new Date(y2, m2 - 1, d2).getTime();
  const diffMs = Math.abs(dLater - dEarlier);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
