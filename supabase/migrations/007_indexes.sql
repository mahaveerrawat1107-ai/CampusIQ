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
