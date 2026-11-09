import { Subject } from "@/types";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  sessionDate: string; // YYYY-MM-DD
  status: "present" | "absent";
  recordedAt: string;
}

export const PILOT_SUBJECTS: Subject[] = [
  {
    id: "sub-bt101",
    name: "Engineering Chemistry",
    code: "BT-101",
    branch: "Computer Science & Engineering",
    semester: 1,
  },
  {
    id: "sub-bt102",
    name: "Mathematics-I",
    code: "BT-102",
    branch: "Computer Science & Engineering",
    semester: 1,
  },
  {
    id: "sub-bt104",
    name: "Basic Electrical & Electronics",
    code: "BT-104",
    branch: "Computer Science & Engineering",
    semester: 1,
  },
  {
    id: "sub-bt105",
    name: "Engineering Graphics",
    code: "BT-105",
    branch: "Computer Science & Engineering",
    semester: 1,
  },
  {
    id: "sub-bt106",
    // Provisional code — not an official RGPV subject code
    name: "English for Communication",
    code: "BT-106 (Provisional)",
    branch: "Computer Science & Engineering",
    semester: 1,
  },
];

/**
 * Seed attendance history records for Alex Sharma (1st Year CSE)
 * Precisely calibrated to 41 attended out of 50 total classes = 82.0%
 */
export const SEED_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // BT-101 Engineering Chemistry (10 / 12 = 83.3%)
  { id: "att-101-1", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-10-21", status: "present", recordedAt: "2026-10-21T10:00:00Z" },
  { id: "att-101-2", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-10-23", status: "present", recordedAt: "2026-10-23T10:00:00Z" },
  { id: "att-101-3", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-10-25", status: "present", recordedAt: "2026-10-25T10:00:00Z" },
  { id: "att-101-4", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-10-27", status: "absent", recordedAt: "2026-10-27T10:00:00Z" },
  { id: "att-101-5", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-10-28", status: "present", recordedAt: "2026-10-28T10:00:00Z" },
  { id: "att-101-6", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-10-30", status: "present", recordedAt: "2026-10-30T10:00:00Z" },
  { id: "att-101-7", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-11-01", status: "present", recordedAt: "2026-11-01T10:00:00Z" },
  { id: "att-101-8", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-11-03", status: "present", recordedAt: "2026-11-03T10:00:00Z" },
  { id: "att-101-9", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-11-04", status: "absent", recordedAt: "2026-11-04T10:00:00Z" },
  { id: "att-101-10", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-11-05", status: "present", recordedAt: "2026-11-05T10:00:00Z" },
  { id: "att-101-11", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-11-07", status: "present", recordedAt: "2026-11-07T10:00:00Z" },
  { id: "att-101-12", studentId: "std-alex", subjectId: "sub-bt101", subjectName: "Engineering Chemistry", subjectCode: "BT-101", sessionDate: "2026-11-08", status: "present", recordedAt: "2026-11-08T10:00:00Z" },

  // BT-102 Mathematics-I (12 / 14 = 85.7%)
  { id: "att-102-1", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-10-20", status: "present", recordedAt: "2026-10-20T11:00:00Z" },
  { id: "att-102-2", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-10-22", status: "present", recordedAt: "2026-10-22T11:00:00Z" },
  { id: "att-102-3", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-10-24", status: "present", recordedAt: "2026-10-24T11:00:00Z" },
  { id: "att-102-4", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-10-26", status: "absent", recordedAt: "2026-10-26T11:00:00Z" },
  { id: "att-102-5", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-10-27", status: "present", recordedAt: "2026-10-27T11:00:00Z" },
  { id: "att-102-6", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-10-29", status: "present", recordedAt: "2026-10-29T11:00:00Z" },
  { id: "att-102-7", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-10-31", status: "present", recordedAt: "2026-10-31T11:00:00Z" },
  { id: "att-102-8", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-11-02", status: "present", recordedAt: "2026-11-02T11:00:00Z" },
  { id: "att-102-9", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-11-03", status: "present", recordedAt: "2026-11-03T11:00:00Z" },
  { id: "att-102-10", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-11-05", status: "absent", recordedAt: "2026-11-05T11:00:00Z" },
  { id: "att-102-11", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-11-06", status: "present", recordedAt: "2026-11-06T11:00:00Z" },
  { id: "att-102-12", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-11-07", status: "present", recordedAt: "2026-11-07T11:00:00Z" },
  { id: "att-102-13", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-11-08", status: "present", recordedAt: "2026-11-08T11:00:00Z" },
  { id: "att-102-14", studentId: "std-alex", subjectId: "sub-bt102", subjectName: "Mathematics-I", subjectCode: "BT-102", sessionDate: "2026-11-09", status: "present", recordedAt: "2026-11-09T09:00:00Z" },

  // BT-104 Basic Electrical & Electronics (11 / 14 = 78.6%)
  { id: "att-104-1", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-10-20", status: "present", recordedAt: "2026-10-20T12:00:00Z" },
  { id: "att-104-2", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-10-21", status: "present", recordedAt: "2026-10-21T12:00:00Z" },
  { id: "att-104-3", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-10-23", status: "absent", recordedAt: "2026-10-23T12:00:00Z" },
  { id: "att-104-4", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-10-25", status: "present", recordedAt: "2026-10-25T12:00:00Z" },
  { id: "att-104-5", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-10-27", status: "present", recordedAt: "2026-10-27T12:00:00Z" },
  { id: "att-104-6", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-10-28", status: "present", recordedAt: "2026-10-28T12:00:00Z" },
  { id: "att-104-7", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-10-30", status: "absent", recordedAt: "2026-10-30T12:00:00Z" },
  { id: "att-104-8", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-11-01", status: "present", recordedAt: "2026-11-01T12:00:00Z" },
  { id: "att-104-9", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-11-02", status: "present", recordedAt: "2026-11-02T12:00:00Z" },
  { id: "att-104-10", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-11-04", status: "present", recordedAt: "2026-11-04T12:00:00Z" },
  { id: "att-104-11", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-11-05", status: "absent", recordedAt: "2026-11-05T12:00:00Z" },
  { id: "att-104-12", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-11-06", status: "present", recordedAt: "2026-11-06T12:00:00Z" },
  { id: "att-104-13", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-11-07", status: "present", recordedAt: "2026-11-07T12:00:00Z" },
  { id: "att-104-14", studentId: "std-alex", subjectId: "sub-bt104", subjectName: "Basic Electrical & Electronics", subjectCode: "BT-104", sessionDate: "2026-11-08", status: "present", recordedAt: "2026-11-08T12:00:00Z" },

  // BT-105 Engineering Graphics (8 / 10 = 80.0%)
  { id: "att-105-1", studentId: "std-alex", subjectId: "sub-bt105", subjectName: "Engineering Graphics", subjectCode: "BT-105", sessionDate: "2026-10-22", status: "present", recordedAt: "2026-10-22T14:00:00Z" },
  { id: "att-105-2", studentId: "std-alex", subjectId: "sub-bt105", subjectName: "Engineering Graphics", subjectCode: "BT-105", sessionDate: "2026-10-24", status: "present", recordedAt: "2026-10-24T14:00:00Z" },
  { id: "att-105-3", studentId: "std-alex", subjectId: "sub-bt105", subjectName: "Engineering Graphics", subjectCode: "BT-105", sessionDate: "2026-10-26", status: "absent", recordedAt: "2026-10-26T14:00:00Z" },
  { id: "att-105-4", studentId: "std-alex", subjectId: "sub-bt105", subjectName: "Engineering Graphics", subjectCode: "BT-105", sessionDate: "2026-10-29", status: "present", recordedAt: "2026-10-29T14:00:00Z" },
  { id: "att-105-5", studentId: "std-alex", subjectId: "sub-bt105", subjectName: "Engineering Graphics", subjectCode: "BT-105", sessionDate: "2026-10-31", status: "present", recordedAt: "2026-10-31T14:00:00Z" },
  { id: "att-105-6", studentId: "std-alex", subjectId: "sub-bt105", subjectName: "Engineering Graphics", subjectCode: "BT-105", sessionDate: "2026-11-02", status: "present", recordedAt: "2026-11-02T14:00:00Z" },
  { id: "att-105-7", studentId: "std-alex", subjectId: "sub-bt105", subjectName: "Engineering Graphics", subjectCode: "BT-105", sessionDate: "2026-11-04", status: "present", recordedAt: "2026-11-04T14:00:00Z" },
  { id: "att-105-8", studentId: "std-alex", subjectId: "sub-bt105", subjectName: "Engineering Graphics", subjectCode: "BT-105", sessionDate: "2026-11-05", status: "absent", recordedAt: "2026-11-05T14:00:00Z" },
  { id: "att-105-9", studentId: "std-alex", subjectId: "sub-bt105", subjectName: "Engineering Graphics", subjectCode: "BT-105", sessionDate: "2026-11-06", status: "present", recordedAt: "2026-11-06T14:00:00Z" },
  { id: "att-105-10", studentId: "std-alex", subjectId: "sub-bt105", subjectName: "Engineering Graphics", subjectCode: "BT-105", sessionDate: "2026-11-08", status: "present", recordedAt: "2026-11-08T14:00:00Z" },
];
