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
