import { Subject } from "@/types";
import { PILOT_SUBJECTS } from "@/data/attendanceData";

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

// Maps a raw row from student_attendance_logs (snake_case) to AttendanceRecord (camelCase)
export function mapAttendanceLogRow(
  row: {
    id: string;
    student_id: string;
    subject_id: string;
    session_date: string;
    status: "present" | "absent";
    recorded_at: string;
  },
  subjectMap: Map<string, Subject>
): AttendanceRecord {
  const subj = subjectMap.get(row.subject_id);
  return {
    id: row.id,
    studentId: row.student_id,
    subjectId: row.subject_id,
    subjectName: subj?.name || row.subject_id,
    subjectCode: subj?.code || row.subject_id,
    sessionDate: row.session_date,
    status: row.status,
    recordedAt: row.recorded_at,
  };
}
