-- ==========================================================================
-- START OF FILE: 001_institutional_schema.sql
-- ==========================================================================

-- ============================================================
-- CampusIQ Migration 001: Institutional Schema
-- Domain A: Colleges · Departments · Classes · Subjects · Class-Subject Mapping
-- Tables created: 5
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE 1: colleges
-- Single-college pilot anchor. Extensible for multi-tenancy later.
-- Initial row: UIT RGPV Shivpuri (seeded in migration 008).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.colleges (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code        text        NOT NULL,
  name        text        NOT NULL,
  city        text        NOT NULL DEFAULT 'Shivpuri',
  state       text        NOT NULL DEFAULT 'Madhya Pradesh',
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT colleges_code_unique UNIQUE (code)
);

COMMENT ON TABLE  public.colleges      IS 'College anchor for multi-tenancy. Initial pilot: UIT RGPV Shivpuri.';
COMMENT ON COLUMN public.colleges.code IS 'Short code, e.g. UIT_RGPV_SHIVPURI. Used as a stable slug.';

-- ============================================================
-- TABLE 2: departments
-- Academic departments within a college (e.g., CSE, ECE, ME).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.departments (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id  uuid        NOT NULL REFERENCES public.colleges(id)    ON DELETE RESTRICT,
  code        text        NOT NULL,
  name        text        NOT NULL,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT departments_college_code_unique UNIQUE (college_id, code)
);

COMMENT ON TABLE  public.departments             IS 'Academic departments within a college.';
COMMENT ON COLUMN public.departments.code        IS 'Short code, e.g. CSE. Unique within a college.';

-- ============================================================
-- TABLE 3: classes
-- Academic cohort: defined by semester, section, batch, academic year.
-- One class = one section of students studying together.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.classes (
  id              uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id   uuid        NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  semester        integer     NOT NULL CHECK (semester BETWEEN 1 AND 8),
  section         text        NOT NULL,
  batch           text        NOT NULL,
  academic_year   text        NOT NULL,
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT classes_unique UNIQUE (department_id, semester, section, batch, academic_year)
);

COMMENT ON TABLE  public.classes              IS 'Academic cohort: semester, section, batch, year. One row = one class section.';
COMMENT ON COLUMN public.classes.batch        IS 'e.g. 2026-2030 (admission year to graduation year).';
COMMENT ON COLUMN public.classes.academic_year IS 'e.g. 2026-2027.';

-- ============================================================
-- TABLE 4: subjects
-- Master syllabus catalog. Text PRIMARY KEY for frontend compatibility
-- with existing IDs: sub-bt101, sub-bt102, sub-bt104, sub-bt105, sub-bt106.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id              text        NOT NULL PRIMARY KEY,
  department_id   uuid        NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  code            text        NOT NULL,
  name            text        NOT NULL,
  semester        integer     NOT NULL CHECK (semester BETWEEN 1 AND 8),
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subjects_code_unique UNIQUE (code)
);

COMMENT ON TABLE  public.subjects    IS 'Master subject catalog. Text PK matches existing frontend IDs (sub-bt101, etc.).';
COMMENT ON COLUMN public.subjects.id IS 'e.g. sub-bt101. Kept as text for backwards compatibility with frontend constants.';

-- ============================================================
-- TABLE 5: class_subjects
-- Curricular junction: which subjects are taught in which class / year.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.class_subjects (
  id              uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id        uuid        NOT NULL REFERENCES public.classes(id)   ON DELETE RESTRICT,
  subject_id      text        NOT NULL REFERENCES public.subjects(id)  ON DELETE RESTRICT,
  semester        integer     NOT NULL CHECK (semester BETWEEN 1 AND 8),
  academic_year   text        NOT NULL,
  is_mandatory    boolean     NOT NULL DEFAULT true,
  CONSTRAINT class_subjects_unique UNIQUE (class_id, subject_id, academic_year)
);

COMMENT ON TABLE public.class_subjects IS 'Maps which subjects are taught in each class section per academic year.';


-- ==========================================================================
-- START OF FILE: 002_identity_schema.sql
-- ==========================================================================

-- ============================================================
-- CampusIQ Migration 002: Identity & Access Schema
-- Domain B: Profiles · Enrollments · Invitations · Scoping Tables
-- Tables created: 5  |  Triggers: 1  |  Functions: 1
-- Depends on: migration 001
-- ============================================================

-- ============================================================
-- TABLE 6: profiles
-- Primary user identity table extending auth.users.
-- Auto-created by the handle_new_user trigger.
-- Role is ALWAYS 'student' by default regardless of client metadata.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  uuid        NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id          uuid                 REFERENCES public.colleges(id)    ON DELETE RESTRICT,
  department_id       uuid                 REFERENCES public.departments(id) ON DELETE RESTRICT,
  email               text        NOT NULL,
  full_name           text        NOT NULL,
  role                text        NOT NULL DEFAULT 'student'
                                  CHECK (role IN ('student', 'teacher', 'admin')),
  verification_status text        NOT NULL DEFAULT 'pending'
                                  CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  enrollment_no       text,
  phone               text,
  avatar_initials     text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_email_unique UNIQUE (email)
);

COMMENT ON TABLE  public.profiles                    IS 'User profiles linked to auth.users. Created automatically by trigger. Role is always student at signup.';
COMMENT ON COLUMN public.profiles.role               IS 'student | teacher | admin. Never trust client-supplied role metadata — always set via trigger or admin-only RPC.';
COMMENT ON COLUMN public.profiles.verification_status IS 'pending: awaiting registrar check. verified: confirmed enrollment. rejected: denied.';
COMMENT ON COLUMN public.profiles.enrollment_no      IS 'RGPV university enrollment number. Null for teachers and admins.';

-- Partial unique index for enrollment_no (NULL values excluded from uniqueness check)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_enrollment_no_key
  ON public.profiles(enrollment_no)
  WHERE enrollment_no IS NOT NULL;

-- Auto-update updated_at on any profile row change
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TABLE 7: approved_enrollments
-- Official registrar-uploaded student roster.
-- Source of truth for student identity verification.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.approved_enrollments (
  id                  uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id          uuid        NOT NULL REFERENCES public.colleges(id)     ON DELETE RESTRICT,
  enrollment_no       text        NOT NULL,
  full_name           text        NOT NULL,
  institutional_email text        NOT NULL,
  department_id       uuid        NOT NULL REFERENCES public.departments(id)  ON DELETE RESTRICT,
  default_class_id    uuid                 REFERENCES public.classes(id)      ON DELETE SET NULL,
  verification_status text        NOT NULL DEFAULT 'pending'
                                  CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by         uuid                 REFERENCES public.profiles(id)     ON DELETE SET NULL,
  verified_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT approved_enrollments_no_unique    UNIQUE (enrollment_no),
  CONSTRAINT approved_enrollments_email_unique UNIQUE (institutional_email)
);

COMMENT ON TABLE  public.approved_enrollments                    IS 'Official university enrollment roster. Admin-managed only. Used for student identity verification at signup.';
COMMENT ON COLUMN public.approved_enrollments.verification_status IS 'pending: not yet verified. verified: confirmed by registrar. rejected: disputed/invalid.';

-- ============================================================
-- TABLE 8: teacher_invitations
-- Cryptographically secure single-use faculty invitations.
-- Raw tokens are NEVER stored. Only SHA-256 hex hashes are stored.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teacher_invitations (
  id              uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id      uuid        NOT NULL REFERENCES public.colleges(id)     ON DELETE RESTRICT,
  department_id   uuid        NOT NULL REFERENCES public.departments(id)  ON DELETE RESTRICT,
  email           text        NOT NULL,
  full_name       text        NOT NULL,
  token_hash      text        NOT NULL,
  status          text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by      uuid        NOT NULL REFERENCES public.profiles(id)     ON DELETE RESTRICT,
  expires_at      timestamptz NOT NULL,
  used_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teacher_invitations_token_unique UNIQUE (token_hash),
  -- One pending invitation per email at a time (revoked/expired invitations do not block re-invitation)
  CONSTRAINT teacher_invitations_email_pending_unique UNIQUE (email, status)
);

COMMENT ON TABLE  public.teacher_invitations            IS 'Single-use faculty invitations. token_hash = SHA-256(raw_token). Raw token only ever sent via email, never stored.';
COMMENT ON COLUMN public.teacher_invitations.token_hash IS 'SHA-256 hex digest of the raw random token. Raw token is never persisted in the database.';
COMMENT ON COLUMN public.teacher_invitations.used_at    IS 'Set to now() when invitation is accepted. NULL = not yet used.';

-- ============================================================
-- TABLE 9: student_class_enrollments
-- Normalized student-to-class junction.
-- Students may appear in multiple classes (semester transitions, electives).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.student_class_enrollments (
  id              uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id        uuid        NOT NULL REFERENCES public.classes(id)  ON DELETE RESTRICT,
  semester        integer     NOT NULL CHECK (semester BETWEEN 1 AND 8),
  academic_year   text        NOT NULL,
  is_active       boolean     NOT NULL DEFAULT true,
  enrolled_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_class_enrollments_unique UNIQUE (student_id, class_id, academic_year)
);

COMMENT ON TABLE public.student_class_enrollments IS 'Normalized student-to-class enrollment. Supports semester promotions, elective splits, and batch carry-forwards.';

-- ============================================================
-- TABLE 10: teacher_subject_assignments
-- Scoping: binds a teacher to specific subjects and class sections.
-- Teachers may ONLY access data within their assigned scope.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teacher_subject_assignments (
  id              uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id      uuid        NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  subject_id      text        NOT NULL REFERENCES public.subjects(id)  ON DELETE RESTRICT,
  class_id        uuid        NOT NULL REFERENCES public.classes(id)   ON DELETE RESTRICT,
  academic_year   text        NOT NULL,
  is_active       boolean     NOT NULL DEFAULT true,
  assigned_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teacher_subject_assignments_unique UNIQUE (teacher_id, subject_id, class_id, academic_year)
);

COMMENT ON TABLE public.teacher_subject_assignments IS 'Scoped teacher assignments. Data access for teachers is restricted to rows matching their assigned (subject_id, class_id).';

-- ============================================================
-- handle_new_user TRIGGER
-- Creates a public.profiles row automatically on new auth.users insert.
-- Role is always 'student' regardless of any client-supplied metadata.
-- Teacher and admin role elevation happens through separate secure RPCs only.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_initials text;
  v_name     text;
BEGIN
  -- Derive full name from metadata, fallback to email prefix
  v_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    split_part(NEW.email, '@', 1)
  );

  -- Compute up-to-2-character initials (First + Last name initial)
  v_initials := UPPER(
    SUBSTRING(v_name, 1, 1) ||
    COALESCE(SUBSTRING(TRIM(SPLIT_PART(v_name, ' ', 2)), 1, 1), '')
  );

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    verification_status,
    avatar_initials
  ) VALUES (
    NEW.id,
    NEW.email,
    v_name,
    'student',      -- ALWAYS student, never trusts client metadata
    'pending',      -- ALWAYS pending, verification is a separate gated process
    v_initials
  )
  ON CONFLICT (id) DO NOTHING; -- Idempotent: ignore if profile row already exists

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users (runs in the auth schema)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS
  'Auto-creates public.profiles on new signup. Role is hardcoded to student. '
  'Teacher/admin provisioning uses separate secure admin-only RPCs.';


-- ==========================================================================
-- START OF FILE: 003_academic_schema.sql
-- ==========================================================================

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


-- ==========================================================================
-- START OF FILE: 004_ai_schema.sql
-- ==========================================================================

-- ============================================================
-- CampusIQ Stage 6.2 — Migration 004: AI Schema
-- Tables 20-21 (AI conversations and messages)
-- ============================================================

-- ----------------------------------------------------------------
-- TABLE 20: ai_conversations
-- Top-level container for a user's AI chat session
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title      text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_conversations IS
  'A single AI chat session owned by one user. '
  'RLS enforces user_id = auth.uid() on ALL operations. '
  'ai_messages.conversation_id FKs to this table, '
  'and message ownership is verified through the parent conversation.';

CREATE TRIGGER trg_ai_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------
-- TABLE 21: ai_messages
-- Individual messages in an AI conversation
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role            text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content         text NOT NULL,
    metadata        jsonb,
    created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_messages IS
  'Individual messages in an AI conversation. '
  'conversation_id and user_id are immutable after INSERT '
  '(enforced by trg_ai_messages_immutable_keys trigger). '
  'Ownership for all DML is verified via the parent ai_conversations '
  'row (c.user_id = auth.uid()), preventing impersonation attacks.';

-- ----------------------------------------------------------------
-- IMMUTABILITY TRIGGER FUNCTION
-- Prevents conversation_id or user_id from being changed on UPDATE
-- (defined here because it is specific to ai_messages;
--  the SECURITY DEFINER wrapper is in migration 005)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_ai_message_key_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.conversation_id IS DISTINCT FROM OLD.conversation_id THEN
        RAISE EXCEPTION
            'ai_messages.conversation_id is immutable after insert'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION
            'ai_messages.user_id is immutable after insert'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_ai_message_key_mutation() FROM PUBLIC;

COMMENT ON FUNCTION public.prevent_ai_message_key_mutation() IS
  'BEFORE UPDATE trigger on ai_messages. '
  'Raises an exception if conversation_id or user_id is changed, '
  'preventing ownership hijacking or impersonation attacks.';

-- Attach immutability trigger to ai_messages
CREATE TRIGGER trg_ai_messages_immutable_keys
    BEFORE UPDATE ON public.ai_messages
    FOR EACH ROW EXECUTE FUNCTION public.prevent_ai_message_key_mutation();


-- ==========================================================================
-- START OF FILE: 005_security_functions.sql
-- ==========================================================================

-- ============================================================
-- CampusIQ Stage 6.2 — Migration 005: Security Functions & View
-- 7 SECURITY DEFINER helper functions + class_student_directory view
-- (prevent_ai_message_key_mutation is in migration 004)
-- ============================================================

-- ----------------------------------------------------------------
-- FUNCTION 1: is_admin()
-- Returns TRUE if the calling user has role='admin'
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated;

COMMENT ON FUNCTION public.is_admin() IS
  'Returns TRUE when the authenticated user has role=''admin''. '
  'Used in RLS policies. SECURITY DEFINER to prevent bypass.';

-- ----------------------------------------------------------------
-- FUNCTION 2: is_teacher()
-- Returns TRUE if the calling user has role='teacher'
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'teacher'
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_teacher() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_teacher() TO authenticated;

COMMENT ON FUNCTION public.is_teacher() IS
  'Returns TRUE when the authenticated user has role=''teacher''. '
  'Used in RLS policies. SECURITY DEFINER to prevent bypass.';

-- ----------------------------------------------------------------
-- FUNCTION 3: is_verified_student()
-- Returns TRUE if the caller is a verified student
-- (role='student' AND verification_status='verified')
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_verified_student()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'student'
          AND verification_status = 'verified'
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_verified_student() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_verified_student() TO authenticated;

COMMENT ON FUNCTION public.is_verified_student() IS
  'Returns TRUE only when the calling student is verified. '
  'Pending students are explicitly excluded from academic resources '
  'by using this function in RLS policies.';

-- ----------------------------------------------------------------
-- FUNCTION 4: get_my_enrolled_class_ids()
-- Returns the set of class UUIDs the calling student is actively enrolled in
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_enrolled_class_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT class_id
    FROM public.student_class_enrollments
    WHERE student_id = auth.uid()
      AND is_active = TRUE;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_enrolled_class_ids() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_my_enrolled_class_ids() TO authenticated;

COMMENT ON FUNCTION public.get_my_enrolled_class_ids() IS
  'Returns active class UUIDs for the calling student. '
  'Used in RLS USING clauses: class_id = ANY(ARRAY(SELECT get_my_enrolled_class_ids())).';

-- ----------------------------------------------------------------
-- FUNCTION 5: is_teacher_assigned_to_class(target_class_id uuid)
-- Returns TRUE if the calling teacher has an active assignment to the given class
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_teacher_assigned_to_class(target_class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.teacher_subject_assignments
        WHERE teacher_id = auth.uid()
          AND class_id   = target_class_id
          AND is_active  = TRUE
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_teacher_assigned_to_class(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_teacher_assigned_to_class(uuid) TO authenticated;

COMMENT ON FUNCTION public.is_teacher_assigned_to_class(uuid) IS
  'Returns TRUE when the calling teacher has at least one active subject '
  'assignment in the target class.';

-- ----------------------------------------------------------------
-- FUNCTION 6: is_teacher_assigned_to_session(target_session_id uuid)
-- Returns TRUE if the calling teacher is assigned to the subject+class
-- of the given institutional attendance session
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_teacher_assigned_to_session(target_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.institutional_attendance_sessions  s
        JOIN public.teacher_subject_assignments        tsa
          ON  tsa.subject_id = s.subject_id
          AND tsa.class_id   = s.class_id
          AND tsa.teacher_id = auth.uid()
          AND tsa.is_active  = TRUE
        WHERE s.id = target_session_id
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_teacher_assigned_to_session(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_teacher_assigned_to_session(uuid) TO authenticated;

COMMENT ON FUNCTION public.is_teacher_assigned_to_session(uuid) IS
  'Returns TRUE when the calling teacher is assigned to the subject+class '
  'referenced by the target attendance session. '
  'Used in RLS WITH CHECK for institutional_attendance_records INSERT/UPDATE.';

-- ----------------------------------------------------------------
-- FUNCTION 7: is_student_enrolled_in_session_class(target_student_id uuid, target_session_id uuid)
-- Returns TRUE if the target student is actively enrolled in the
-- same class as the given attendance session
-- (Used to validate both student_id AND session_id on attendance INSERT/UPDATE)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_student_enrolled_in_session_class(
    target_student_id uuid,
    target_session_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.institutional_attendance_sessions s
        JOIN public.student_class_enrollments         sce
          ON  sce.class_id   = s.class_id
          AND sce.student_id = target_student_id
          AND sce.is_active  = TRUE
        WHERE s.id = target_session_id
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_student_enrolled_in_session_class(uuid, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_student_enrolled_in_session_class(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.is_student_enrolled_in_session_class(uuid, uuid) IS
  'Returns TRUE when the target student is actively enrolled in the class '
  'associated with the target attendance session. '
  'Combined with is_teacher_assigned_to_session in WITH CHECK for '
  'institutional_attendance_records to prevent phantom record injection.';

-- ----------------------------------------------------------------
-- VIEW: class_student_directory
-- Restricted read-only view exposing only safe student fields
-- to teachers who need to see their class roster.
-- Teachers should query this view INSTEAD of profiles directly.
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW public.class_student_directory AS
SELECT
    p.id            AS student_id,
    p.full_name,
    p.enrollment_no,
    p.avatar_initials,
    p.email,
    sce.class_id,
    sce.semester,
    c.section,
    c.batch
FROM public.profiles p
JOIN public.student_class_enrollments sce
  ON  sce.student_id = p.id
  AND sce.is_active  = TRUE
JOIN public.classes c
  ON  c.id = sce.class_id
WHERE p.role = 'student';

-- Grant SELECT on the view to authenticated role;
-- underlying RLS on profiles, student_class_enrollments, classes
-- is enforced at the row level (view is SECURITY INVOKER by default)
GRANT SELECT ON public.class_student_directory TO authenticated;

COMMENT ON VIEW public.class_student_directory IS
  'Restricted student directory for teacher roster access. '
  'Exposes only: student_id, full_name, enrollment_no, avatar_initials, '
  'email, class_id, semester, section, batch. '
  'Sensitive columns (phone, date_of_birth, etc.) are excluded. '
  'Teachers should query this view rather than profiles directly.';


-- ==========================================================================
-- START OF FILE: 006_rls_policies.sql
-- ==========================================================================

-- ============================================================
-- CampusIQ Stage 6.2 — Migration 006: Row Level Security Policies
-- Enable RLS on all 21 tables + define all access policies
-- Depends on: migrations 001-005 (functions must exist first)
-- ============================================================

-- ============================================================
-- STEP 1: Enable RLS on every table
-- ============================================================
ALTER TABLE public.colleges                           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes                            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects                           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles                           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_enrollments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_invitations                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_class_enrollments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subject_assignments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_preferences                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_attendance_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_attendance_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_attachments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assignment_status          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_notes                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_queries                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages                        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DOMAIN A: Institutional Reference Data
-- colleges, departments, classes, subjects, class_subjects
-- ============================================================

-- colleges: readable by all authenticated; managed by admin only
CREATE POLICY "colleges_select_authenticated"
    ON public.colleges FOR SELECT
    TO authenticated USING (TRUE);

CREATE POLICY "colleges_admin_all"
    ON public.colleges FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- departments: readable by all authenticated; managed by admin only
CREATE POLICY "departments_select_authenticated"
    ON public.departments FOR SELECT
    TO authenticated USING (TRUE);

CREATE POLICY "departments_admin_all"
    ON public.departments FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- subjects: readable by all authenticated; managed by admin only
CREATE POLICY "subjects_select_authenticated"
    ON public.subjects FOR SELECT
    TO authenticated USING (TRUE);

CREATE POLICY "subjects_admin_all"
    ON public.subjects FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- classes: students see their enrolled classes; teachers see assigned classes; admin sees all
CREATE POLICY "classes_select_student"
    ON public.classes FOR SELECT
    TO authenticated
    USING (
        public.is_verified_student()
        AND id = ANY(ARRAY(SELECT public.get_my_enrolled_class_ids()))
    );

CREATE POLICY "classes_select_teacher"
    ON public.classes FOR SELECT
    TO authenticated
    USING (
        public.is_teacher()
        AND public.is_teacher_assigned_to_class(id)
    );

CREATE POLICY "classes_select_admin"
    ON public.classes FOR SELECT
    TO authenticated USING (public.is_admin());

CREATE POLICY "classes_admin_insert_update_delete"
    ON public.classes FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- class_subjects: same visibility as classes
CREATE POLICY "class_subjects_select_student"
    ON public.class_subjects FOR SELECT
    TO authenticated
    USING (
        public.is_verified_student()
        AND class_id = ANY(ARRAY(SELECT public.get_my_enrolled_class_ids()))
    );

CREATE POLICY "class_subjects_select_teacher"
    ON public.class_subjects FOR SELECT
    TO authenticated
    USING (
        public.is_teacher()
        AND public.is_teacher_assigned_to_class(class_id)
    );

CREATE POLICY "class_subjects_select_admin"
    ON public.class_subjects FOR SELECT
    TO authenticated USING (public.is_admin());

CREATE POLICY "class_subjects_admin_insert_update_delete"
    ON public.class_subjects FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- DOMAIN B: Identity & Enrollment
-- profiles, approved_enrollments, teacher_invitations,
-- student_class_enrollments, teacher_subject_assignments
-- ============================================================

-- profiles: each user sees own row; teachers use class_student_directory view; admin sees all
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    TO authenticated USING (id = auth.uid());

CREATE POLICY "profiles_select_admin"
    ON public.profiles FOR SELECT
    TO authenticated USING (public.is_admin());

-- Students update only safe personal fields (enforced at application layer too)
-- RLS allows UPDATE on own row; column-level restrictions via application
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_update"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "profiles_admin_delete"
    ON public.profiles FOR DELETE
    TO authenticated USING (public.is_admin());

-- INSERT is handled exclusively by the handle_new_user() trigger on auth.users
-- No direct INSERT policy needed (trigger runs as SECURITY DEFINER)

-- approved_enrollments: admin only — no student or teacher access
CREATE POLICY "approved_enrollments_admin_all"
    ON public.approved_enrollments FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- teacher_invitations: admin only — invitation acceptance via secure RPC, not direct SELECT
CREATE POLICY "teacher_invitations_admin_all"
    ON public.teacher_invitations FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- student_class_enrollments: students see own; teachers see assigned class; admin sees all
CREATE POLICY "sce_select_student_own"
    ON public.student_class_enrollments FOR SELECT
    TO authenticated USING (student_id = auth.uid());

CREATE POLICY "sce_select_teacher"
    ON public.student_class_enrollments FOR SELECT
    TO authenticated
    USING (
        public.is_teacher()
        AND public.is_teacher_assigned_to_class(class_id)
    );

CREATE POLICY "sce_select_admin"
    ON public.student_class_enrollments FOR SELECT
    TO authenticated USING (public.is_admin());

CREATE POLICY "sce_admin_insert_update_delete"
    ON public.student_class_enrollments FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- teacher_subject_assignments: teachers see own; admin sees all
CREATE POLICY "tsa_select_teacher_own"
    ON public.teacher_subject_assignments FOR SELECT
    TO authenticated USING (teacher_id = auth.uid());

CREATE POLICY "tsa_select_admin"
    ON public.teacher_subject_assignments FOR SELECT
    TO authenticated USING (public.is_admin());

CREATE POLICY "tsa_admin_insert_update_delete"
    ON public.teacher_subject_assignments FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- DOMAIN C: Student Personal Data
-- student_attendance_logs, student_preferences
-- Teachers and admins have ZERO access to these tables
-- ============================================================

-- student_attendance_logs: students full CRUD on own rows ONLY
CREATE POLICY "sal_student_own_select"
    ON public.student_attendance_logs FOR SELECT
    TO authenticated USING (student_id = auth.uid());

CREATE POLICY "sal_student_own_insert"
    ON public.student_attendance_logs FOR INSERT
    TO authenticated WITH CHECK (student_id = auth.uid());

CREATE POLICY "sal_student_own_update"
    ON public.student_attendance_logs FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "sal_student_own_delete"
    ON public.student_attendance_logs FOR DELETE
    TO authenticated USING (student_id = auth.uid());

-- student_preferences: students full CRUD on own row ONLY
CREATE POLICY "sp_student_own_select"
    ON public.student_preferences FOR SELECT
    TO authenticated USING (student_id = auth.uid());

CREATE POLICY "sp_student_own_insert"
    ON public.student_preferences FOR INSERT
    TO authenticated WITH CHECK (student_id = auth.uid());

CREATE POLICY "sp_student_own_update"
    ON public.student_preferences FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "sp_student_own_delete"
    ON public.student_preferences FOR DELETE
    TO authenticated USING (student_id = auth.uid());

-- ============================================================
-- DOMAIN D: Institutional Academic Data
-- institutional_attendance_sessions, institutional_attendance_records,
-- assignments, assignment_attachments, student_assignment_status
-- ============================================================

-- institutional_attendance_sessions
CREATE POLICY "ias_select_verified_student"
    ON public.institutional_attendance_sessions FOR SELECT
    TO authenticated
    USING (
        public.is_verified_student()
        AND class_id = ANY(ARRAY(SELECT public.get_my_enrolled_class_ids()))
    );

CREATE POLICY "ias_select_teacher"
    ON public.institutional_attendance_sessions FOR SELECT
    TO authenticated
    USING (
        public.is_teacher()
        AND public.is_teacher_assigned_to_class(class_id)
    );

CREATE POLICY "ias_select_admin"
    ON public.institutional_attendance_sessions FOR SELECT
    TO authenticated USING (public.is_admin());

CREATE POLICY "ias_teacher_insert"
    ON public.institutional_attendance_sessions FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_teacher()
        AND public.is_teacher_assigned_to_class(class_id)
        AND created_by = auth.uid()
    );

CREATE POLICY "ias_teacher_update"
    ON public.institutional_attendance_sessions FOR UPDATE
    TO authenticated
    USING (
        public.is_teacher()
        AND public.is_teacher_assigned_to_class(class_id)
    )
    WITH CHECK (
        public.is_teacher()
        AND public.is_teacher_assigned_to_class(class_id)
    );

CREATE POLICY "ias_admin_delete"
    ON public.institutional_attendance_sessions FOR DELETE
    TO authenticated USING (public.is_admin());

-- institutional_attendance_records
-- Students: read own records only (read-only)
CREATE POLICY "iar_select_student_own"
    ON public.institutional_attendance_records FOR SELECT
    TO authenticated
    USING (
        public.is_verified_student()
        AND student_id = auth.uid()
    );

CREATE POLICY "iar_select_teacher"
    ON public.institutional_attendance_records FOR SELECT
    TO authenticated
    USING (
        public.is_teacher()
        AND public.is_teacher_assigned_to_session(session_id)
    );

CREATE POLICY "iar_select_admin"
    ON public.institutional_attendance_records FOR SELECT
    TO authenticated USING (public.is_admin());

-- INSERT: teacher must be assigned to session AND student must be enrolled in session's class
CREATE POLICY "iar_teacher_insert"
    ON public.institutional_attendance_records FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_teacher()
        AND public.is_teacher_assigned_to_session(session_id)
        AND public.is_student_enrolled_in_session_class(student_id, session_id)
    );

-- UPDATE: same dual validation
CREATE POLICY "iar_teacher_update"
    ON public.institutional_attendance_records FOR UPDATE
    TO authenticated
    USING (
        public.is_teacher()
        AND public.is_teacher_assigned_to_session(session_id)
    )
    WITH CHECK (
        public.is_teacher()
        AND public.is_teacher_assigned_to_session(session_id)
        AND public.is_student_enrolled_in_session_class(student_id, session_id)
    );

CREATE POLICY "iar_admin_delete"
    ON public.institutional_attendance_records FOR DELETE
    TO authenticated USING (public.is_admin());

-- assignments
CREATE POLICY "assignments_select_verified_student"
    ON public.assignments FOR SELECT
    TO authenticated
    USING (
        public.is_verified_student()
        AND is_published = TRUE
        AND class_id = ANY(ARRAY(SELECT public.get_my_enrolled_class_ids()))
    );

CREATE POLICY "assignments_select_teacher"
    ON public.assignments FOR SELECT
    TO authenticated
    USING (
        public.is_teacher()
        AND EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.teacher_id = auth.uid()
              AND tsa.subject_id = assignments.subject_id
              AND tsa.is_active  = TRUE
        )
    );

CREATE POLICY "assignments_select_admin"
    ON public.assignments FOR SELECT
    TO authenticated USING (public.is_admin());

CREATE POLICY "assignments_teacher_insert"
    ON public.assignments FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_teacher()
        AND created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.teacher_id = auth.uid()
              AND tsa.subject_id = assignments.subject_id
              AND tsa.is_active  = TRUE
        )
    );

CREATE POLICY "assignments_teacher_update"
    ON public.assignments FOR UPDATE
    TO authenticated
    USING (
        public.is_teacher()
        AND EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.teacher_id = auth.uid()
              AND tsa.subject_id = assignments.subject_id
              AND tsa.is_active  = TRUE
        )
    )
    WITH CHECK (
        public.is_teacher()
        AND EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.teacher_id = auth.uid()
              AND tsa.subject_id = assignments.subject_id
              AND tsa.is_active  = TRUE
        )
    );

CREATE POLICY "assignments_teacher_delete"
    ON public.assignments FOR DELETE
    TO authenticated
    USING (
        public.is_teacher()
        AND EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.teacher_id = auth.uid()
              AND tsa.subject_id = assignments.subject_id
              AND tsa.is_active  = TRUE
        )
    );

CREATE POLICY "assignments_admin_all"
    ON public.assignments FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- assignment_attachments: mirror assignment visibility
CREATE POLICY "aa_select_verified_student"
    ON public.assignment_attachments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            WHERE a.id          = assignment_attachments.assignment_id
              AND a.is_published = TRUE
              AND public.is_verified_student()
              AND a.class_id = ANY(ARRAY(SELECT public.get_my_enrolled_class_ids()))
        )
    );

CREATE POLICY "aa_select_teacher"
    ON public.assignment_attachments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            JOIN public.teacher_subject_assignments tsa
              ON  tsa.subject_id = a.subject_id
              AND tsa.teacher_id = auth.uid()
              AND tsa.is_active  = TRUE
            WHERE a.id = assignment_attachments.assignment_id
        )
    );

CREATE POLICY "aa_select_admin"
    ON public.assignment_attachments FOR SELECT
    TO authenticated USING (public.is_admin());

CREATE POLICY "aa_teacher_insert"
    ON public.assignment_attachments FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.assignments a
            JOIN public.teacher_subject_assignments tsa
              ON  tsa.subject_id = a.subject_id
              AND tsa.teacher_id = auth.uid()
              AND tsa.is_active  = TRUE
            WHERE a.id = assignment_attachments.assignment_id
        )
    );

CREATE POLICY "aa_teacher_delete"
    ON public.assignment_attachments FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            JOIN public.teacher_subject_assignments tsa
              ON  tsa.subject_id = a.subject_id
              AND tsa.teacher_id = auth.uid()
              AND tsa.is_active  = TRUE
            WHERE a.id = assignment_attachments.assignment_id
        )
    );

CREATE POLICY "aa_admin_all"
    ON public.assignment_attachments FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- student_assignment_status: students own their completion records
CREATE POLICY "sas_select_student_own"
    ON public.student_assignment_status FOR SELECT
    TO authenticated USING (student_id = auth.uid());

CREATE POLICY "sas_select_teacher"
    ON public.student_assignment_status FOR SELECT
    TO authenticated
    USING (
        public.is_teacher()
        AND EXISTS (
            SELECT 1 FROM public.assignments a
            JOIN public.teacher_subject_assignments tsa
              ON  tsa.subject_id = a.subject_id
              AND tsa.teacher_id = auth.uid()
              AND tsa.is_active  = TRUE
            WHERE a.id = student_assignment_status.assignment_id
        )
    );

CREATE POLICY "sas_select_admin"
    ON public.student_assignment_status FOR SELECT
    TO authenticated USING (public.is_admin());

CREATE POLICY "sas_student_insert"
    ON public.student_assignment_status FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "sas_student_update"
    ON public.student_assignment_status FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "sas_student_delete"
    ON public.student_assignment_status FOR DELETE
    TO authenticated USING (student_id = auth.uid());

-- ============================================================
-- DOMAIN E: Academic Content
-- academic_notes, support_queries
-- ============================================================

-- academic_notes
CREATE POLICY "notes_select_verified_student"
    ON public.academic_notes FOR SELECT
    TO authenticated
    USING (
        public.is_verified_student()
        AND is_published = TRUE
    );

CREATE POLICY "notes_select_teacher"
    ON public.academic_notes FOR SELECT
    TO authenticated
    USING (
        public.is_teacher()
        AND EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.teacher_id = auth.uid()
              AND tsa.subject_id = academic_notes.subject_id
              AND tsa.is_active  = TRUE
        )
    );

CREATE POLICY "notes_select_admin"
    ON public.academic_notes FOR SELECT
    TO authenticated USING (public.is_admin());

CREATE POLICY "notes_teacher_insert"
    ON public.academic_notes FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_teacher()
        AND uploaded_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.teacher_id = auth.uid()
              AND tsa.subject_id = academic_notes.subject_id
              AND tsa.is_active  = TRUE
        )
    );

CREATE POLICY "notes_teacher_update"
    ON public.academic_notes FOR UPDATE
    TO authenticated
    USING (
        public.is_teacher()
        AND EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.teacher_id = auth.uid()
              AND tsa.subject_id = academic_notes.subject_id
              AND tsa.is_active  = TRUE
        )
    )
    WITH CHECK (
        public.is_teacher()
        AND EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.teacher_id = auth.uid()
              AND tsa.subject_id = academic_notes.subject_id
              AND tsa.is_active  = TRUE
        )
    );

CREATE POLICY "notes_teacher_delete"
    ON public.academic_notes FOR DELETE
    TO authenticated
    USING (
        public.is_teacher()
        AND EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.teacher_id = auth.uid()
              AND tsa.subject_id = academic_notes.subject_id
              AND tsa.is_active  = TRUE
        )
    );

CREATE POLICY "notes_admin_all"
    ON public.academic_notes FOR ALL
    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- support_queries
CREATE POLICY "sq_select_own_student"
    ON public.support_queries FOR SELECT
    TO authenticated USING (student_id = auth.uid());

CREATE POLICY "sq_select_admin"
    ON public.support_queries FOR SELECT
    TO authenticated USING (public.is_admin());

-- Allow both verified AND pending students to INSERT (pending students may need help)
CREATE POLICY "sq_insert_student"
    ON public.support_queries FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id   = auth.uid()
              AND role = 'student'
        )
    );

CREATE POLICY "sq_admin_update"
    ON public.support_queries FOR UPDATE
    TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "sq_admin_delete"
    ON public.support_queries FOR DELETE
    TO authenticated USING (public.is_admin());

-- ============================================================
-- DOMAIN F: AI Chat
-- ai_conversations, ai_messages
-- ============================================================

-- ai_conversations: each user owns their own sessions
CREATE POLICY "ai_conv_select_own"
    ON public.ai_conversations FOR SELECT
    TO authenticated USING (user_id = auth.uid());

CREATE POLICY "ai_conv_insert_own"
    ON public.ai_conversations FOR INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "ai_conv_update_own"
    ON public.ai_conversations FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "ai_conv_delete_own"
    ON public.ai_conversations FOR DELETE
    TO authenticated USING (user_id = auth.uid());

-- ai_messages: ownership validated via PARENT conversation (not just message.user_id)
-- This prevents impersonation: attacker cannot reference another user's conversation_id

CREATE POLICY "ai_msg_select_own"
    ON public.ai_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id      = ai_messages.conversation_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "ai_msg_insert_own"
    ON public.ai_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        ai_messages.user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id      = ai_messages.conversation_id
              AND c.user_id = auth.uid()
        )
    );

-- UPDATE: validate via parent conversation AND ensure user_id stays correct after update
CREATE POLICY "ai_msg_update_own"
    ON public.ai_messages FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id      = ai_messages.conversation_id
              AND c.user_id = auth.uid()
        )
    )
    WITH CHECK (
        ai_messages.user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id      = ai_messages.conversation_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "ai_msg_delete_own"
    ON public.ai_messages FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id      = ai_messages.conversation_id
              AND c.user_id = auth.uid()
        )
    );


-- ==========================================================================
-- START OF FILE: 007_indexes.sql
-- ==========================================================================

-- ============================================================
-- CampusIQ Stage 6.2 — Migration 007: Performance Indexes
-- All indexes use IF NOT EXISTS for idempotent re-execution
-- ============================================================

-- ----------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role
    ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_verification
    ON public.profiles(verification_status);

-- ----------------------------------------------------------------
-- approved_enrollments
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_approved_enrollments_college
    ON public.approved_enrollments(college_id, enrollment_no);

-- ----------------------------------------------------------------
-- teacher_invitations
-- Only index pending invitations (the hot path for acceptance checks)
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_teacher_invitations_pending_email
    ON public.teacher_invitations(email)
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_teacher_invitations_expires
    ON public.teacher_invitations(expires_at)
    WHERE status = 'pending';

-- ----------------------------------------------------------------
-- student_class_enrollments
-- Hot path: RLS uses (student_id, is_active) and (class_id, is_active)
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sce_student_active
    ON public.student_class_enrollments(student_id, class_id)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_sce_class_active
    ON public.student_class_enrollments(class_id, student_id)
    WHERE is_active = TRUE;

-- ----------------------------------------------------------------
-- teacher_subject_assignments
-- Hot path: RLS checks (teacher_id, is_active) and (teacher_id, class_id, subject_id)
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tsa_teacher_active
    ON public.teacher_subject_assignments(teacher_id, class_id, subject_id)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_tsa_class_subject_active
    ON public.teacher_subject_assignments(class_id, subject_id)
    WHERE is_active = TRUE;

-- ----------------------------------------------------------------
-- student_attendance_logs (personal logs)
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sal_student_subject_date
    ON public.student_attendance_logs(student_id, subject_id, session_date DESC);

-- ----------------------------------------------------------------
-- institutional_attendance_sessions
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ias_class_subject_date
    ON public.institutional_attendance_sessions(class_id, subject_id, session_date DESC);

-- ----------------------------------------------------------------
-- institutional_attendance_records
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_iar_session_student
    ON public.institutional_attendance_records(session_id, student_id);

CREATE INDEX IF NOT EXISTS idx_iar_student_session
    ON public.institutional_attendance_records(student_id, session_id);

-- ----------------------------------------------------------------
-- assignments
-- ----------------------------------------------------------------
-- Student feed: published assignments for a class, ordered by due date
CREATE INDEX IF NOT EXISTS idx_assignments_feed
    ON public.assignments(class_id, is_published, due_date ASC);

-- Teacher lookup by subject
CREATE INDEX IF NOT EXISTS idx_assignments_subject
    ON public.assignments(subject_id);

-- ----------------------------------------------------------------
-- assignment_attachments
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_aa_assignment_id
    ON public.assignment_attachments(assignment_id);

-- ----------------------------------------------------------------
-- student_assignment_status
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sas_student_assignment
    ON public.student_assignment_status(student_id, assignment_id);

CREATE INDEX IF NOT EXISTS idx_sas_assignment_student
    ON public.student_assignment_status(assignment_id, student_id);

-- ----------------------------------------------------------------
-- academic_notes
-- ----------------------------------------------------------------
-- Student browse: published notes filtered by subject + unit
CREATE INDEX IF NOT EXISTS idx_notes_subject_unit_published
    ON public.academic_notes(subject_id, unit, is_published);

-- Teacher management: by uploaded_by
CREATE INDEX IF NOT EXISTS idx_notes_uploaded_by
    ON public.academic_notes(uploaded_by);

-- ----------------------------------------------------------------
-- support_queries
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sq_student_created
    ON public.support_queries(student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sq_status
    ON public.support_queries(status);

-- ----------------------------------------------------------------
-- ai_conversations
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ai_conv_user_updated
    ON public.ai_conversations(user_id, updated_at DESC);

-- ----------------------------------------------------------------
-- ai_messages
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ai_msg_conversation_created
    ON public.ai_messages(conversation_id, created_at ASC);

-- user_id index aids the ownership check in RLS
CREATE INDEX IF NOT EXISTS idx_ai_msg_user
    ON public.ai_messages(user_id);


-- ==========================================================================
-- START OF FILE: 008_seed_data.sql
-- ==========================================================================

-- ============================================================
-- CampusIQ Stage 6.2 — Migration 008: Seed Data
-- Reference data for UIT RGPV Shivpuri (initial deployment)
-- ON CONFLICT ... DO NOTHING makes this re-runnable safely
--
-- IMPORTANT: This file seeds INSTITUTIONAL REFERENCE DATA ONLY.
-- No user accounts, passwords, or admin credentials are created here.
-- Initial admin provisioning is performed out-of-band via the
-- Supabase Dashboard (see PROJECT_CONTEXT.md § Admin Provisioning).
-- ============================================================

-- ----------------------------------------------------------------
-- 1. College: UIT RGPV Shivpuri
-- ----------------------------------------------------------------
INSERT INTO public.colleges (code, name, city, state)
VALUES (
    'UIT_RGPV_SHIVPURI',
    'University Institute of Technology, RGPV Shivpuri',
    'Shivpuri',
    'Madhya Pradesh'
)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------
-- 2. Department: Computer Science & Engineering
-- ----------------------------------------------------------------
INSERT INTO public.departments (college_id, code, name)
SELECT
    id,
    'CSE',
    'Computer Science & Engineering'
FROM public.colleges
WHERE code = 'UIT_RGPV_SHIVPURI'
ON CONFLICT (college_id, code) DO NOTHING;

-- ----------------------------------------------------------------
-- 3. Class: Semester 1, Section A, Batch 2026-2030
-- ----------------------------------------------------------------
INSERT INTO public.classes (department_id, semester, section, batch, academic_year)
SELECT
    id,
    1,
    'Section A',
    '2026-2030',
    '2026-2027'
FROM public.departments
WHERE code = 'CSE'
ON CONFLICT (department_id, semester, section, batch, academic_year) DO NOTHING;

-- ----------------------------------------------------------------
-- 4. Subjects (text PKs match existing frontend subject constants)
--    sub-bt101, sub-bt102, sub-bt104, sub-bt105, sub-bt106
-- ----------------------------------------------------------------
INSERT INTO public.subjects (id, department_id, code, name, semester)
SELECT
    vals.id,
    d.id,
    vals.code,
    vals.name,
    1
FROM public.departments d
CROSS JOIN (VALUES
    ('sub-bt101', 'BT-101', 'Engineering Chemistry'),
    ('sub-bt102', 'BT-102', 'Mathematics-I'),
    ('sub-bt104', 'BT-104', 'Basic Electrical & Electronics'),
    ('sub-bt105', 'BT-105', 'Engineering Graphics'),
    ('sub-bt106', 'BT-106 (Provisional)', 'English for Communication')
) AS vals(id, code, name)
WHERE d.code = 'CSE'
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- 5. Map all 5 subjects to Semester 1, Section A, Batch 2026-2030
-- ----------------------------------------------------------------
INSERT INTO public.class_subjects (class_id, subject_id, semester, academic_year)
SELECT
    c.id,
    s.id,
    1,
    '2026-2027'
FROM public.classes c
CROSS JOIN public.subjects s
WHERE c.section      = 'Section A'
  AND c.semester     = 1
  AND c.batch        = '2026-2030'
  AND s.semester     = 1
  AND s.department_id = (SELECT id FROM public.departments WHERE code = 'CSE')
ON CONFLICT (class_id, subject_id, academic_year) DO NOTHING;

-- ----------------------------------------------------------------
-- Verification query (run after seed to confirm counts)
-- ----------------------------------------------------------------
-- SELECT 'colleges'   AS tbl, count(*) FROM public.colleges      UNION ALL
-- SELECT 'departments',       count(*) FROM public.departments    UNION ALL
-- SELECT 'classes',           count(*) FROM public.classes        UNION ALL
-- SELECT 'subjects',          count(*) FROM public.subjects       UNION ALL
-- SELECT 'class_subjects',    count(*) FROM public.class_subjects;
-- Expected: 1, 1, 1, 5, 5


