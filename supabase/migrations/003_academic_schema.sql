-- ============================================================
-- CampusIQ Stage 6.2 — Migration 003: Academic Schema
-- Tables 11-19 (attendance logs, preferences, institutional
-- attendance, assignments, notes, support queries)
-- ============================================================

-- ----------------------------------------------------------------
-- TABLE 11: student_attendance_logs
-- Student-owned personal attendance tracking (SEPARATE from
-- institutional records — not just RLS-separated, physically different tables)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_attendance_logs (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id  text NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    session_date date NOT NULL,
    status      text NOT NULL CHECK (status IN ('present', 'absent')),
    recorded_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (student_id, subject_id, session_date)
);

COMMENT ON TABLE public.student_attendance_logs IS
  'Personal attendance log maintained by the student themselves. '
  'Physically separate from institutional_attendance_records. '
  'Teachers and admins have zero access to this table.';

-- ----------------------------------------------------------------
-- TABLE 12: student_preferences
-- Per-student UI/notification preferences (mirrors localStorage)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_preferences (
    student_id                 uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme                      text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    attendance_reminders       boolean NOT NULL DEFAULT true,
    assignment_deadline_alerts boolean NOT NULL DEFAULT true,
    notes_updates              boolean NOT NULL DEFAULT true,
    updated_at                 timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.student_preferences IS
  'UI and notification preferences for each student. '
  'Mirrors the campusiq_student_preferences_v1 localStorage key.';

-- Trigger to auto-update updated_at
CREATE TRIGGER trg_student_preferences_updated_at
    BEFORE UPDATE ON public.student_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------
-- TABLE 13: institutional_attendance_sessions
-- A lecture/lab session created by a teacher for a class
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institutional_attendance_sessions (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id   text NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    class_id     uuid NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    session_date date NOT NULL,
    slot_no      integer NOT NULL DEFAULT 1 CHECK (slot_no BETWEEN 1 AND 10),
    session_type text NOT NULL DEFAULT 'institutional_lecture'
                      CHECK (session_type IN ('personal_log', 'institutional_lecture')),
    created_by   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (class_id, subject_id, session_date, slot_no)
);

COMMENT ON TABLE public.institutional_attendance_sessions IS
  'A single lecture/lab session for which attendance is taken. '
  'Created by an assigned teacher. Students are read-only on this table.';

-- ----------------------------------------------------------------
-- TABLE 14: institutional_attendance_records
-- Per-student attendance record for one session
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institutional_attendance_records (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  uuid NOT NULL REFERENCES public.institutional_attendance_sessions(id) ON DELETE CASCADE,
    student_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status      text NOT NULL CHECK (status IN ('present', 'absent')),
    recorded_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (session_id, student_id)
);

COMMENT ON TABLE public.institutional_attendance_records IS
  'Attendance record for a single student in a single institutional session. '
  'INSERT/UPDATE requires both is_teacher_assigned_to_session AND '
  'is_student_enrolled_in_session_class validation.';

-- ----------------------------------------------------------------
-- TABLE 15: assignments
-- Assignments published by teachers for enrolled students
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title        text NOT NULL,
    description  text,
    subject_id   text REFERENCES public.subjects(id) ON DELETE SET NULL,
    class_id     uuid REFERENCES public.classes(id) ON DELETE SET NULL,
    assigned_date date,
    due_date     date,
    priority     text CHECK (priority IN ('Low', 'Medium', 'High')),
    is_published boolean NOT NULL DEFAULT false,
    created_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.assignments IS
  'Academic assignments created by teachers. Students see only published assignments '
  'for their enrolled classes (enforced by RLS + is_verified_student check).';

CREATE TRIGGER trg_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------
-- TABLE 16: assignment_attachments
-- Files attached to assignments (stored in Supabase Storage)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignment_attachments (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    file_name     text NOT NULL,
    file_type     text NOT NULL CHECK (file_type IN ('pdf', 'image')),
    mime_type     text NOT NULL,
    file_size     bigint CHECK (file_size > 0),
    storage_path  text NOT NULL,
    uploaded_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.assignment_attachments IS
  'File attachments for assignments. storage_path references the '
  'assignment-attachments Supabase Storage bucket. '
  'Delivered via signed URLs only, never public.';

-- ----------------------------------------------------------------
-- TABLE 17: student_assignment_status
-- Student-managed completion tracking for assignments
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_assignment_status (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_completed  boolean NOT NULL DEFAULT false,
    completed_at  timestamptz,
    UNIQUE (assignment_id, student_id)
);

COMMENT ON TABLE public.student_assignment_status IS
  'Student-owned completion status for each assignment. '
  'Students can toggle their own status. Teachers can read (assigned class). '
  'Mirrors campusiq_student_status_v2 localStorage key.';

-- ----------------------------------------------------------------
-- TABLE 18: academic_notes
-- Notes/PDFs published by teachers for students
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academic_notes (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title        text NOT NULL,
    description  text,
    semester     integer CHECK (semester BETWEEN 1 AND 8),
    subject_id   text REFERENCES public.subjects(id) ON DELETE SET NULL,
    unit         integer CHECK (unit BETWEEN 1 AND 5),
    unit_title   text,
    file_name    text,
    file_size    bigint CHECK (file_size IS NULL OR file_size > 0),
    storage_path text NOT NULL,
    uploaded_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published boolean NOT NULL DEFAULT false,
    uploaded_at  timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.academic_notes IS
  'Academic notes/PDFs uploaded by teachers. Students see only published notes '
  '(RLS: is_verified_student() AND is_published=TRUE). '
  'storage_path references the academic-notes Supabase Storage bucket.';

CREATE TRIGGER trg_academic_notes_updated_at
    BEFORE UPDATE ON public.academic_notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------
-- TABLE 19: support_queries
-- Student help/feedback queries submitted via the app
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_queries (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category   text,
    subject    text,
    message    text NOT NULL,
    status     text NOT NULL DEFAULT 'open'
                   CHECK (status IN ('open', 'in_review', 'resolved')),
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.support_queries IS
  'Support/feedback queries from students. '
  'Students can INSERT their own queries and SELECT their own rows. '
  'Pending (unverified) students can also INSERT (for onboarding help). '
  'Only admins can UPDATE status or DELETE rows.';
