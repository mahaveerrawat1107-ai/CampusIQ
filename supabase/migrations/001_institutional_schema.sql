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
