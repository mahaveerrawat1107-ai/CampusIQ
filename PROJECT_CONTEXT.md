# CAMPUSIQ — PROJECT CONTEXT & ARCHITECTURE SPECIFICATION

> **Durable Source of Truth for CampusIQ Development**  
> *Last updated: 09 November 2026*  
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

## 2. Confirmed MVP Scope

The student application consists of **five primary navigation destinations**, plus a **separate protected Admin Panel** (not part of the student bottom navigation).

### 1. Home (Dashboard) — *Stage 1 Implemented*
- Academic overview and dynamic time-based greeting.
- Attendance summary card with overall percentage (82%), attended/held totals (41/50), target indicator (75%), and safe status.
- Quick-stat cards for pending assignments (4) and new course notes (3).
- Upcoming assignments list (max 3 items with subject, title, due date, priority badge, pending status).
- Recent notes list (max 3 recent PDFs with subject, unit, file size, upload timestamp).
- Quick navigation shortcuts.

### 2. Attendance (Next Milestone)
- Student-entered present/absent records per class session.
- Subject-wise totals and percentage calculation: $\text{Percentage} = (A / T) \times 100$.
- **75% Calculator Rules:**
  - Classes to attend to reach 75%: $x = \lceil(0.75 \times T - A) / 0.25\rceil$.
  - Classes that can be missed safely: $b = \lfloor(A / 0.75) - T\rfloor$.
- Numerator and denominator always visible ($A / T$).
- Integrity rule: Duplicate prevention for the same student + subject + session date + session number.
- Explicit label: *"Self-reported estimate, not official college record."*

### 3. Assignments
- Assignment listing filtered by status: Pending, Completed, Due Soon, Overdue.
- Details: Subject, title, due date, description, optional PDF attachment.
- Personal completion tracking: Student marks tasks completed for their own records.
- Explicit label: Personal tracker, not an official submission/grading portal.

### 4. Notes Library
- Academic hierarchy: **Semester → Subject → Unit → PDF**.
- Search and filtering by subject/unit.
- Mobile-friendly PDF preview with download fallback.
- Admin-curated uploads only.

### 5. Profile
- Student information: Full name, enrollment number, branch (CSE), semester (1st Year / Sem 1).
- Account settings and secure sign-out.

### 6. Admin Panel (Protected Route)
- Dedicated administrative interface.
- Upload course PDFs to private Supabase Storage, recording metadata in PostgreSQL.
- Create and manage assignments.
- Manage branch, semester, and subject catalog.
- Role-based server-side security checks (no client-side role elevation).

---

## 3. Explicitly Out of Scope for MVP

These features are strictly deferred:
- ❌ Facial recognition / camera attendance.
- ❌ OCR register scanning.
- ❌ Teacher accounts and teacher grading workflows.
- ❌ Automatic college ERP / RGPV scraping or integration.
- ❌ AI academic assistant / PDF Q&A (planned for Phase P2 post-pilot).
- ❌ Multi-college tenancy (single-college pilot first).
- ❌ Native Android application (mobile-first responsive web / PWA first).
- ❌ Payments, wallets, social feeds, or gamification economies.

---

## 4. Visual Design System & Design Tokens

### Design Direction
- **Theme:** Clean Light Mode.
- **UI Style:** Premium Minimal (inspired by the clarity of Notion and Linear; no generic AI aesthetics).
- **Dashboard Density:** Balanced.
- **Motion:** Subtle (100–200ms transitions; respects `prefers-reduced-motion`).

### Global Color Tokens
| Token | Hex | Role |
| :--- | :--- | :--- |
| **Primary Background** | `#F7F8FC` | Main app background canvas |
| **Surface** | `#FFFFFF` | Cards, modals, elevated sheets |
| **Primary Navy** | `#292D45` | Primary text, titles, structured elements |
| **Primary Accent** | `#635BFF` | Active navigation, primary actions, highlights |
| **Secondary Text** | `#687086` | Subtitles, labels, metadata |
| **Border** | `#E9EAF1` | Subtle divider lines, card borders |
| **Semantic Success** | `#0D9488` | Safe attendance (≥ 75%), completed tasks |
| **Semantic Warning** | `#F59E0B` | Near-threshold attendance (70–74.9%), due soon |
| **Semantic Error** | `#DC5252` | Critical attendance (< 70%), overdue tasks |

### Typography Tokens (Typeface: Manrope)
- **Main Page Headings:** 28px, Weight 700, Line height 1.25
- **Section Headings:** 20px, Weight 700, Line height 1.3
- **Card Headings:** 16px, Weight 600, Line height 1.4
- **Body Text:** 15px, Weight 400, Line height 1.5
- **Secondary Text:** 13px, Weight 500, Line height 1.4
- **Labels:** 12px, Weight 600, Uppercase / tracking-wider
- **Buttons:** 14px, Weight 600
- **Important Numbers:** 28–32px, Weight 700 (`tabular-nums`)

---

## 5. Current Development Stage & Status

- **Stage 0 — Project Foundation:** Completed & verified.
- **Stage 1 — Home Dashboard (Static UI):** Completed & verified.
  - Desktop sidebar + mobile fixed bottom navigation shell implemented.
  - Home dashboard with attendance overview, stats, upcoming assignments, recent notes, and shortcuts implemented.
- **Next Milestone:** Stage 2 — Attendance Module (Static UI & Calculation Engine).

---

## 6. Open / Provisional Decisions (To Be Confirmed)

1. **Authentication Mechanism:**
   - Provisional pilot proposal: Email + password with admin allowlist / pre-created test accounts.
   - Long-term: Phone OTP + enrollment identifier, subject to college administration approval and pilot feedback.
2. **Subject Catalog Ownership:**
   - Whether the initial pilot relies strictly on pre-seeded 1st-year CSE subjects (Mathematics-I, Chemistry, BEEE, etc.) or allows students to add personalized subjects in their personal tracker.
