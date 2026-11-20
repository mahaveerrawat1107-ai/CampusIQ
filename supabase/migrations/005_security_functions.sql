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
