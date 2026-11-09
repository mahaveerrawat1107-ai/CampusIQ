/**
 * CampusIQ Attendance Calculation Engine
 * Implements mathematically verified formulas for 75% attendance tracking.
 */

export interface AttendanceMetrics {
  percentage: number; // 0 to 100, formatted to 1 decimal
  attended: number;
  total: number;
  target: number; // Defaults to 75
  status: "safe" | "warning" | "critical";
  safeBunks: number; // Max additional classes that can be missed while staying >= target
  classesNeeded: number; // Min consecutive classes to attend to reach target
  statusMessage: string;
}

const TARGET_PERCENTAGE = 75;
const TARGET_RATIO = 0.75;

/**
 * Calculates attendance metrics based on attended (P) and total (T) classes.
 */
export function calculateAttendanceMetrics(
  attended: number,
  total: number,
  target: number = TARGET_PERCENTAGE
): AttendanceMetrics {
  // Edge Case: No classes recorded yet
  if (total <= 0 || attended < 0) {
    return {
      percentage: 0,
      attended: 0,
      total: 0,
      target,
      status: "safe",
      safeBunks: 0,
      classesNeeded: 0,
      statusMessage: "No classes recorded yet. Log your first session to track attendance.",
    };
  }

  // Sanity check: attended cannot exceed total
  const validAttended = Math.min(attended, total);
  const rawPercentage = (validAttended / total) * 100;
  const percentage = Math.round(rawPercentage * 10) / 10; // 1 decimal place

  const ratio = target / 100;

  if (percentage >= target) {
    // Student is at or above target (>= 75%)
    // Formula: b = floor((P / r) - T)
    const rawBunks = Math.floor(validAttended / ratio - total);
    const safeBunks = Math.max(0, rawBunks);

    let status: "safe" | "warning" = "safe";
    let message = "";

    if (safeBunks === 0) {
      status = "warning";
      message = "You are right on the edge of 75%. Missing the next class will drop your attendance.";
    } else {
      status = "safe";
      message = `You can safely miss ${safeBunks} class${safeBunks > 1 ? "es" : ""} while staying above ${target}%.`;
    }

    return {
      percentage,
      attended: validAttended,
      total,
      target,
      status,
      safeBunks,
      classesNeeded: 0,
      statusMessage: message,
    };
  } else {
    // Student is below target (< 75%)
    // Formula: x = ceil((r * T - P) / (1 - r))
    const rawNeeded = Math.ceil((ratio * total - validAttended) / (1 - ratio));
    const classesNeeded = Math.max(0, rawNeeded);

    const status: "warning" | "critical" = percentage >= 70 ? "warning" : "critical";
    const message = `You must attend ${classesNeeded} consecutive class${classesNeeded > 1 ? "es" : ""} to reach ${target}%.`;

    return {
      percentage,
      attended: validAttended,
      total,
      target,
      status,
      safeBunks: 0,
      classesNeeded,
      statusMessage: message,
    };
  }
}

/**
 * Validates and simulates future attendance scenarios
 */
export function simulateAttendance(
  currentAttended: number,
  currentTotal: number,
  additionalAttended: number,
  additionalMissed: number,
  target: number = TARGET_PERCENTAGE
): AttendanceMetrics {
  const newAttended = currentAttended + Math.max(0, additionalAttended);
  const newTotal = currentTotal + Math.max(0, additionalAttended) + Math.max(0, additionalMissed);
  return calculateAttendanceMetrics(newAttended, newTotal, target);
}
