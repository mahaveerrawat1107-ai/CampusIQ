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
