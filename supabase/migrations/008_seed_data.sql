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
