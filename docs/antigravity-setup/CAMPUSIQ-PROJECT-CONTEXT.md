# CampusIQ Architectural Context & Reference

**Document Version:** 1.0  
**Target:** Google Antigravity 2.0 / CampusIQ Development  
**Auditor:** Senior AI Systems Engineer  

---

## 1. Project Overview & Institutional Target

- **Project Name:** CampusIQ
- **Target Institution:** University Institute of Technology, RGPV Shivpuri (UIT RGPV Shivpuri), Madhya Pradesh, India.
- **Initial Target User Base:** 1st Year B.Tech Computer Science & Engineering (Semester 1).
- **Core Value Proposition:**
  1. Personal student attendance tracker with exact 75% boundary math, safe bunks calculation, and recovery advice.
  2. Institutional coursework and assignment deadline clarity.
  3. Structured academic notes library organized hierarchically (**Semester &rarr; Subject &rarr; Unit &rarr; PDF**).
  4. Daily student dashboard synthesizing academic priorities.

---

## 2. Technical Stack & Architecture

- **Framework:** Next.js 14.2.15 (App Router, React 18, TypeScript 5.6).
- **Styling & Design System:** Tailwind CSS 3.4, Lucide React icons, Manrope typography (`tabular-nums`), Clean Light Mode (#F7F8FC background, #635BFF primary accent, #292D45 navy text).
- **Backend & Cloud:** Supabase (PostgreSQL 15+, Supabase Auth, Row Level Security, `@supabase/ssr`).
- **Build Output:** 11/11 static pages generated cleanly with 0 TypeScript errors.

---

## 3. Route Map & Surface Layouts

| Route | Module / Feature | Access Type | Primary Data Source / Fallback |
| :--- | :--- | :--- | :--- |
| `/` | **Home Dashboard** | Student (Read-Only) | `useAttendance()`, `useAssignments()`, `useNotes()` |
| `/attendance` | **Attendance Tracker** | Student (Full CRUD) | `AttendanceContext` (`localStorage` cache &rarr; `student_attendance_logs`) |
| `/assignments` | **Coursework & Tasks** | Student (Read + Status) | `AssignmentsContext` (`localStorage` cache &rarr; `assignments`) |
| `/notes` | **Notes Library** | Student (Read-Only) | `NotesContext` (`localStorage` cache + IndexedDB &rarr; `academic_notes`) |
| `/profile` | **Student Profile & Settings** | Student | `AuthContext` + `profileData.ts` |
| `/login` | **Role-Based Auth & Demo Entry**| Public / All Roles | `AuthContext` (Supports real Supabase Auth + Demo IDs) |
| `/admin/assignments` | **Staff Assignment Management** | Faculty / Admin | `AssignmentsContext` + IndexedDB blob store |
| `/admin/notes` | **Staff Notes Management** | Faculty / Admin | `NotesContext` + IndexedDB blob store |

---

## 4. Database Architecture (21 Tables in 6 Domains)

1. **Domain A (Institutional Foundation):** `colleges`, `departments`, `classes`, `subjects`, `class_subjects`.
2. **Domain B (Identity & Access):** `profiles`, `approved_enrollments`, `teacher_invitations`, `student_class_enrollments`, `teacher_subject_assignments`.
3. **Domain C (Student Personal Records):** `student_attendance_logs`, `student_preferences`.
4. **Domain D (Institutional Coursework):** `institutional_attendance_sessions`, `institutional_attendance_records`, `assignments`, `assignment_attachments`, `student_assignment_status`.
5. **Domain E (Academic Content & Queries):** `academic_notes`, `support_queries`.
6. **Domain F (AI Interaction History):** `ai_conversations`, `ai_messages`.

---

## 5. Security & Invariant Rules

1. **Attendance Separation:** Personal student attendance logs are **physically separated** from institutional records. Faculty members have zero visibility into personal attendance logs.
2. **Verification Gate:** Students must have `verification_status = 'verified'` in `profiles` to access published institutional coursework and notes.
3. **Teacher Scoping:** Teachers can only access subjects and classes explicitly bound to them in `teacher_subject_assignments`.
4. **Role Integrity:** The three authorized backend roles are strictly `student`, `teacher`, and `admin`. Head of Department (HOD) is a teacher role with departmental scope, never a separate database role.
