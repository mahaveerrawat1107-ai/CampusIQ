# CAMPUSIQ — PROJECT CONTEXT & ARCHITECTURE SPECIFICATION

> **Durable Source of Truth for CampusIQ Development**  
> *Last updated: 09 November 2026 (Stage 2.1 commit: 2788ca4)*  
> *Initial Pilot Target: UIT RGPV Shivpuri, Madhya Pradesh, India (1st Year CSE)*

---

## 1. Product Overview

- **Product Name:** CampusIQ
- **Tagline:** *"Your college. Your academics. One organized workspace."*
- **Positioning:** A mobile-first academic companion workspace for college students. CampusIQ complements existing college systems—it does not claim to replace official college ERPs or act as an official attendance authority.
- **Core Problem:** Students struggle with academic fragmentation across WhatsApp groups, scattered PDFs, separate personal notebooks, and unorganized deadlines.
- **Core Value Proposition:**
  1. Personal attendance tracking against the 75% threshold with clear attendance math.
  2. Deadline clarity (upcoming, due soon, overdue, completed).
  3. Notes Library organized hierarchically (**Semester → Subject → Unit → PDF**).
  4. Daily dashboard answering: *"What academic task needs attention today?"*

---

## 2. Confirmed MVP Scope & Module Status

The student application consists of **five primary navigation destinations**, plus a **separate protected Admin Panel** (not part of the student bottom navigation).

### 1. Home (Dashboard) — *Stage 1 Implemented & Synchronized*
- Dynamic time-based greeting & current date.
- Real-time attendance summary synchronized with the Attendance engine via `useAttendance()`.
- Quick-stat cards for pending assignments (4) and new course notes (3).
- Upcoming assignments preview list (top 3) with clear indicator for the 4th item.
- Recent notes preview list (top 3) with clear Demo PDF labels.
- Interconnected quick navigation links to all modules.

### 2. Attendance Tracker — *Stage 2.1 Implemented & Verified*
- Single centralized `AttendanceContext` managing state with browser-safe `localStorage` persistence.
- Unified calculation engine (`calculateAttendanceMetrics`) — **confirmed business rules (Stage 2.1)**:
  - **Safe:** `attendance >= 75%` (always, even when safeBunks = 0).
  - **Warning:** `attendance >= 70%` and `< 75%`.
  - **Critical:** `attendance < 70%`.
  - Safe bunks formula (when ≥ 75%): $b = \lfloor(P / 0.75) - T\rfloor$.
  - Recovery formula (when < 75%): $x = \lceil(0.75 \times T - P) / 0.25\rceil$.
  - Recovery message suppressed when already ≥ 75%; boundary warning shown when safeBunks = 0.
- Pre-seeded subject catalog for 1st Year CSE (5 subjects, confirmed by user):
  - Engineering Chemistry (`BT-101`)
  - Mathematics-I (`BT-102`)
  - Basic Electrical & Electronics (`BT-104`)
  - Engineering Graphics (`BT-105`)
  - English for Communication (`BT-106 (Provisional)`) — **added Stage 2.1; no seed records**
- Seed data: 50 total records, 41 present = **82.0% overall** (BT-106 starts at 0/0).
- Mark Attendance Interface with date picker, duplicate prevention, and in-place editing.
- Filterable attendance history log — shows latest 10 by default; Load More pagination; filters reset count.
- Interactive "What-If" 75% scenario simulator.
- Home Dashboard attendance card always synchronized with Attendance page via shared `useAttendance()`.

### 3. Assignments — *Stage 3 Implemented & Workflow Corrected*
- **Role-Appropriate Workflow:**
  - Course assignments are created, edited, and published by faculty/instructors.
  - Students view published coursework on `/assignments` and manage their personal completion status. Students cannot create, modify, or delete course assignments.
- **Staff Assignment Management Prototype (`/admin/assignments`):**
  - Interactive prototype of authorized faculty interface (local storage based, clearly documented as prototype before full auth/RBAC).
  - Create, edit, and delete assignments with subject selection (`PILOT_SUBJECTS`), priority levels, assigned & due dates, and publication status (Published vs Draft).
  - Instant publish / unpublish toggle. Unpublished assignments are strictly hidden from students.
  - Multi-file attachment uploader for PDFs, JPG, PNG, and WEBP files (validated up to 10 MB).
- **Assignment Attachments & Storage:**
  - Binary attachment blobs stored safely in client-side IndexedDB (`campusiq_attachments_db`), avoiding localStorage quota limits.
  - Full document previews: modal PDF viewer and responsive Image modal with zoom controls (50% to 300%) and fullscreen viewing.
  - Direct download actions with authentic filename and MIME type handling.
  - Clean empty state when no attachments exist.
- **Decoupled Data Architecture:**
  - Staff assignment catalog (`campusiq_assignments_catalog_v2`) is separate from student personal completion records (`campusiq_student_status_v2`).
  - Editing or re-publishing an assignment preserves existing student completion progress.
- **Student Assignment Tracker (`/assignments`):**
  - KPI Statistics: Total, Pending, Completed, Overdue counters derived strictly from published assignments.
  - Search by title, filter by subject, filter by status, filter by priority, sort by nearest due date.
  - One-click completion status toggle (Pending ↔ Completed).
  - Mathematically verified overdue detection: completed assignments are never marked overdue.
- **Real-Time Home Dashboard Synchronization:**
  - Pending assignment count on Quick Stats card reflects live published assignments context.
  - Upcoming Assignments preview displays top 3 pending published assignments sorted by nearest due date.
  - Never shows draft or unpublished assignments to students.

### 4. Notes Library (Stage 4 Scaffold)
- Academic hierarchy: **Semester → Subject → Unit → PDF**.
- Search and filtering by subject/unit.
- Mobile-friendly PDF preview with download fallback.

### 5. Profile (Stage 5 Scaffold)
- Student identity: Full name, enrollment number (`0192CS261042`), branch (CSE), semester (Semester 1).
- Account settings and sign-out.

### 6. Admin Panel (Protected Route - Post Student MVP)
- Separate administrative interface for content curation.

---

## 3. Visual Design System & Design Tokens

- **Theme:** Clean Light Mode.
- **UI Style:** Premium Minimal (Notion/Linear clarity; no generic AI aesthetics).
- **Typography:** Manrope via `next/font/google` (`tabular-nums` for numbers & percentages).
- **Global Tokens:**
  - Background: `#F7F8FC`
  - Surface: `#FFFFFF`
  - Primary Navy: `#292D45`
  - Primary Accent: `#635BFF`
  - Secondary Text: `#687086`
  - Border: `#E9EAF1`
  - Success: `#0D9488`
  - Warning: `#F59E0B`
  - Error: `#DC5252`

---

## 4. Current Development Stage & Status

- **Stage 0 — Foundation & Design System:** Completed.
- **Stage 1 — Home Dashboard (Static UI):** Completed.
- **Stage 1.1 — Functional Navigation & Scaffolding:** Completed.
- **Stage 2 — Functional Attendance Management System:** Completed.
- **Stage 2.1 — Attendance Logic Corrections:** Completed (commit `2788ca4`).
  - Fixed status rules: Safe ≥75%, Warning 70–74.9%, Critical <70%.
  - Fixed recovery messages: no "Attend 0 classes" when already above target.
  - Added BT-106 English for Communication (provisional code, no seed records).
  - History UX: removed max-h scroll, Load More pagination (10 per page), filter-aware count reset.
  - Build verified: 8/8 static routes, 0 TypeScript errors.
  - Server probed: Home 82% ✓, Attendance BT-106 ✓, English for Communication ✓, Attendance 82% ✓.
- **Stage 3 — Assignment Management System (Workflow Corrected):** Completed.
  - Role separation: Students view and track personal completion; teachers/staff publish and manage assignments.
  - Student page `/assignments`: removed student creation/editing/deletion; retains KPI stats, filters, search, due date sorting, and interactive completion tracking.
  - Staff management prototype `/admin/assignments`: complete creation, editing, deletion with confirmation, draft/published visibility toggle, and multi-file attachment management.
  - Attachment support: PDF, JPG, PNG, WEBP with client-side IndexedDB blob storage (`campusiq_attachments_db`), avoiding localStorage quota limits.
  - Interactive previews: Dedicated PDF modal viewer and Image modal with zoom controls (50% to 300%) and direct download triggers.
  - Decoupled storage: Student completion statuses (`campusiq_student_status_v2`) decoupled from staff assignment definitions (`campusiq_assignments_catalog_v2`).
  - Home Dashboard synchronized: only published pending assignments shown (top 3) and counted. Draft assignments hidden.
  - Verified with 9/9 static pages compilation and live HTTP probe tests.
- **Next Milestone:** Stage 4 — Notes Library (awaiting user approval).
