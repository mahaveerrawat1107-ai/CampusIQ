-- ============================================================
-- Migration 009: Seed Student Academic Context, Verification, and Content
-- Run this in Supabase SQL Editor to verify Mahaveer's student account,
-- enroll in Semester 1 Section A, seed sample assignments & notes, and set up buckets.
-- ============================================================

-- 1. Create Storage Buckets if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('academic-notes', 'academic-notes', true),
    ('assignment-attachments', 'assignment-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Read Policies (Wrapped to prevent error if already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Read Notes'
    ) THEN
        CREATE POLICY "Public Read Notes" ON storage.objects
            FOR SELECT USING (bucket_id = 'academic-notes');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Read Attachments'
    ) THEN
        CREATE POLICY "Public Read Attachments" ON storage.objects
            FOR SELECT USING (bucket_id = 'assignment-attachments');
    END IF;
END $$;

-- 2. Verify Mahaveer's student profile & set institutional context
UPDATE public.profiles
SET 
    full_name = 'Mahaveer Rawat',
    verification_status = 'verified',
    enrollment_no = '0101CS261045',
    college_id = (SELECT id FROM public.colleges WHERE code = 'UIT_RGPV_SHIVPURI' LIMIT 1),
    department_id = (SELECT id FROM public.departments WHERE code = 'CSE' LIMIT 1),
    avatar_initials = 'MR',
    updated_at = NOW()
WHERE email = 'mahaveer@uit.com';

-- 3. Enroll Mahaveer into Class: Semester 1, Section A, Batch 2026-2030
-- Matches actual schema: student_id, class_id, semester, academic_year, is_active
INSERT INTO public.student_class_enrollments (student_id, class_id, semester, academic_year, is_active)
SELECT 
    p.id,
    c.id,
    1,
    '2026-2027',
    true
FROM public.profiles p
CROSS JOIN public.classes c
WHERE p.email = 'mahaveer@uit.com'
  AND c.semester = 1
  AND c.section = 'Section A'
ON CONFLICT (student_id, class_id, academic_year) DO UPDATE SET is_active = true;

-- 4. Seed Initial Published Assignments
INSERT INTO public.assignments (
    id, class_id, subject_id, title, description, assigned_date, due_date, priority, is_published, created_by
)
SELECT 
    'a1b2c3d4-0001-4000-8000-000000000001'::uuid,
    c.id,
    'sub-bt101',
    'Water Treatment & Hardness Analysis',
    'Submit numerical problems on EDTA method, zeolite process, and boiler corrosion prevention as covered in Unit 1.',
    (CURRENT_DATE - INTERVAL '3 days')::date,
    (CURRENT_DATE + INTERVAL '4 days')::date,
    'High',
    true,
    p.id
FROM public.classes c
CROSS JOIN public.profiles p
WHERE c.semester = 1 AND c.section = 'Section A'
  AND p.email = 'mahaveer@uit.com'
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    due_date = EXCLUDED.due_date,
    priority = EXCLUDED.priority,
    is_published = true;

INSERT INTO public.assignments (
    id, class_id, subject_id, title, description, assigned_date, due_date, priority, is_published, created_by
)
SELECT 
    'a1b2c3d4-0002-4000-8000-000000000002'::uuid,
    c.id,
    'sub-bt102',
    'Maclaurin & Taylor Series Expansion',
    'Solve all tutorial sheet problems on expansion of functions and indeterminate forms using L''Hôpital''s rule.',
    (CURRENT_DATE - INTERVAL '2 days')::date,
    (CURRENT_DATE + INTERVAL '7 days')::date,
    'Medium',
    true,
    p.id
FROM public.classes c
CROSS JOIN public.profiles p
WHERE c.semester = 1 AND c.section = 'Section A'
  AND p.email = 'mahaveer@uit.com'
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    due_date = EXCLUDED.due_date,
    priority = EXCLUDED.priority,
    is_published = true;

INSERT INTO public.assignments (
    id, class_id, subject_id, title, description, assigned_date, due_date, priority, is_published, created_by
)
SELECT 
    'a1b2c3d4-0003-4000-8000-000000000003'::uuid,
    c.id,
    'sub-bt104',
    'DC Circuit Analysis (Thevenin & Norton)',
    'Detailed analysis report and simulation comparison of circuit theorems with practical laboratory calculations.',
    (CURRENT_DATE - INTERVAL '5 days')::date,
    (CURRENT_DATE + INTERVAL '2 days')::date,
    'High',
    true,
    p.id
FROM public.classes c
CROSS JOIN public.profiles p
WHERE c.semester = 1 AND c.section = 'Section A'
  AND p.email = 'mahaveer@uit.com'
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    due_date = EXCLUDED.due_date,
    priority = EXCLUDED.priority,
    is_published = true;

-- 5. Seed Initial Published Academic Notes
INSERT INTO public.academic_notes (
    id, semester, subject_id, unit, unit_title, title, description, file_name, file_size, storage_path, uploaded_by, is_published
)
SELECT 
    'b1c2d3e4-0001-4000-8000-000000000001'::uuid,
    1,
    'sub-bt101',
    1,
    'Water and its Treatment',
    'Unit 1 Complete Handbook — Boiler Troubles, Zeolite & Ion Exchange',
    'Comprehensive lecture notes covering water hardness calculations, EDTA method, softening processes, and numerical examples.',
    'Chemistry_Unit_1_Water_Softening.pdf',
    4404019,
    'notes/chem_unit1.pdf',
    p.id,
    true
FROM public.profiles p
WHERE p.email = 'mahaveer@uit.com'
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    file_name = EXCLUDED.file_name,
    file_size = EXCLUDED.file_size,
    is_published = true;

INSERT INTO public.academic_notes (
    id, semester, subject_id, unit, unit_title, title, description, file_name, file_size, storage_path, uploaded_by, is_published
)
SELECT 
    'b1c2d3e4-0002-4000-8000-000000000002'::uuid,
    1,
    'sub-bt102',
    1,
    'Differential Calculus',
    'Unit 1 — Rolle''s Theorem, Mean Value Theorems, Maclaurin Series',
    'Complete faculty notes with step-by-step proofs, solved previous years RGPV university exam questions, and practice sets.',
    'Maths1_Unit_1_Calculus.pdf',
    7130316,
    'notes/maths1_unit1.pdf',
    p.id,
    true
FROM public.profiles p
WHERE p.email = 'mahaveer@uit.com'
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    file_name = EXCLUDED.file_name,
    file_size = EXCLUDED.file_size,
    is_published = true;

INSERT INTO public.academic_notes (
    id, semester, subject_id, unit, unit_title, title, description, file_name, file_size, storage_path, uploaded_by, is_published
)
SELECT 
    'b1c2d3e4-0003-4000-8000-000000000003'::uuid,
    1,
    'sub-bt104',
    1,
    'DC Circuits & Theorems',
    'Unit 1 — Mesh, Nodal, Thevenin, Norton & Maximum Power Transfer',
    'Diagrammatic explanations and derivation sheets for network theorems with solved bridge circuit problems.',
    'BEEE_Unit_1_DC_Circuits.pdf',
    5347737,
    'notes/beee_unit1.pdf',
    p.id,
    true
FROM public.profiles p
WHERE p.email = 'mahaveer@uit.com'
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    file_name = EXCLUDED.file_name,
    file_size = EXCLUDED.file_size,
    is_published = true;
