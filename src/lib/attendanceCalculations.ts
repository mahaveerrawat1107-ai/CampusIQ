/**
 * CampusIQ Attendance Calculation Engine
 * Implements mathematically verified formulas for 75% attendance tracking.
 *
 * Business Rules (confirmed):
 *   Safe:     attendance >= 75%
 *   Warning:  attendance >= 70% and < 75%
 *   Critical: attendance < 70%
 */

export interface AttendanceMetrics {
  percentage: number; // rounded to 1 decimal place
  attended: number;
  total: number;
  target: number; // defaults to 75
  status: "safe" | "warning" | "critical";
  safeBunks: number;      // Max additional classes that can be missed while staying >= target
  classesNeeded: number;  // Min consecutive classes to attend to reach target (only relevant when < target)
  statusMessage: string;
}

const TARGET_PERCENTAGE = 75;

/**
 * Calculates attendance metrics based on attended (P) and total (T) classes.
 *
 * Status rules:
 *   Safe     => rawPercentage >= 75
 *   Warning  => rawPercentage >= 70 and < 75
 *   Critical => rawPercentage < 70
 *
 * Safe bunk formula (only applied when >= target):
 *   b = floor((P / 0.75) - T)
 *
 * Recovery formula (only applied when < target):
 *   x = ceil((0.75 * T - P) / 0.25)
 */
export function calculateAttendanceMetrics(
  attended: number,
  total: number,
  target: number = TARGET_PERCENTAGE
): AttendanceMetrics {
  // Edge case: no classes recorded yet
  if (total <= 0 || attended < 0) {
    return {
      percentage: 0,
      attended: 0,
      total: 0,
      target,
      status: "safe",
      safeBunks: 0,
      classesNeeded: 0,
      statusMessage:
        "No classes recorded yet. Log your first session to track attendance.",
    };
  }

  // Clamp attended to never exceed total
  const validAttended = Math.min(attended, total);
  const rawPercentage = (validAttended / total) * 100;
  const percentage = Math.round(rawPercentage * 10) / 10; // 1 decimal
  const ratio = target / 100;

  // ── Above or at target (>= 75%) ──────────────────────────────────────────
  if (rawPercentage >= target) {
    // b = floor((P / r) - T)
    const rawBunks = Math.floor(validAttended / ratio - total);
    const safeBunks = Math.max(0, rawBunks);

    // Status is always "safe" when percentage >= 75%
    // (safeBunks === 0 simply means you are right at the boundary, still safe)
    const status: "safe" = "safe";

    const message =
      safeBunks === 0
        ? `You are right at the 75% boundary. Missing the next class will drop you below the requirement.`
        : `You can safely miss ${safeBunks} more class${safeBunks > 1 ? "es" : ""} while staying above ${target}%.`;

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
  }

  // ── Below target (< 75%) ─────────────────────────────────────────────────
  // x = ceil((r * T - P) / (1 - r))
  const rawNeeded = Math.ceil((ratio * total - validAttended) / (1 - ratio));
  const classesNeeded = Math.max(0, rawNeeded);

  // Warning: 70–74.9%  |  Critical: < 70%
  const status: "warning" | "critical" = rawPercentage >= 70 ? "warning" : "critical";

  const message =
    classesNeeded === 0
      ? `Your attendance is already above the 75% requirement.`
      : `Attend the next ${classesNeeded} consecutive class${classesNeeded > 1 ? "es" : ""} without missing any to reach ${target}%.`;

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

/**
 * Simulates a future attendance scenario by adding classes attended/missed.
 */
export function simulateAttendance(
  currentAttended: number,
  currentTotal: number,
  additionalAttended: number,
  additionalMissed: number,
  target: number = TARGET_PERCENTAGE
): AttendanceMetrics {
  const newAttended = currentAttended + Math.max(0, additionalAttended);
  const newTotal =
    currentTotal + Math.max(0, additionalAttended) + Math.max(0, additionalMissed);
  return calculateAttendanceMetrics(newAttended, newTotal, target);
}
