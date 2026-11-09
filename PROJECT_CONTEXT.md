# CAMPUSIQ — PROJECT CONTEXT & ARCHITECTURE SPECIFICATION

> **Durable Source of Truth for CampusIQ Development**  
> *Last updated: 09 November 2026*  
> *Initial Pilot: UIT RGPV Shivpuri, Madhya Pradesh, India (1st Year CSE)*

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

### 1. Home (Dashboard)
- Academic overview and greeting.
- Attendance summary card with overall percentage and 75% target guidance.
- Quick-stat cards for pending assignments and newly available resources.
- Upcoming assignments list (up to 3 items with subject, title, due date, status).
- Recent notes list (up to 3 recent PDFs with subject and unit).
- Quick navigation shortcuts.

### 2. Attendance
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

These features are strictly deferred to maintain focus and ship a reliable pilot:
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

### Component Rules
- **Spacing:** Base 8px system (`p-2`, `p-4`, `p-6`, `p-8`).
- **Cards:** White background, 14–16px border-radius, thin border (`#E9EAF1`), subtle shadow.
- **Touch Targets:** 44–48px minimum height for primary mobile actions.
- **Inputs:** 10–12px radius, clear focus rings in primary accent (`#635BFF`).
- **Icons:** Lucide React with consistent 1.75px–2px stroke weight.

---

## 5. Responsive Design Principles

- **Mobile (< 768px):** Fixed bottom navigation bar with the 5 core destinations. Vertical card stack. No horizontal scrolling. Thumb-friendly touch targets.
- **Tablet (768px – 1024px):** Balanced 2-column dashboard grids, fluid card containers.
- **Desktop (> 1024px):** Fixed left sidebar navigation, top contextual header, centered responsive content with max-width containment (`max-w-6xl` or `max-w-7xl`).

---

## 6. Technical Stack & Architecture

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v3 with custom design tokens
- **Icons:** Lucide React
- **Backend (Planned):** Supabase (Auth, PostgreSQL with strict Row Level Security, private Storage Buckets with signed URLs)
- **Hosting:** Vercel
- **Source Control:** Git + GitHub

---

## 7. Current Development Stage & Status

- **Stage:** **Stage 0 — Project Foundation (Completed)**
- **Workspace State:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide React, Manrope font, and global design tokens fully established.
- **Next Approved Milestone:** **Stage 1 — CampusIQ Home Page: Static UI Implementation**.

---

## 8. Confirmed Pilot Settings & Open Decisions

- **Confirmed Pilot Audience:** 1st Year CSE Students at UIT RGPV Shivpuri.
- **Confirmed Auth Direction (Option A):** Email + password with admin allowlist / test accounts for the pilot.
- **Subject Catalog Decision:** Students can maintain their own subjects in their tracker; not blocked on admin-managed catalog.
- **Pending Decision:** College branding approval before production launch (pilot will use neutral CampusIQ branding).
