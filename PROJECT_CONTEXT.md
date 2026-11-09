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

## 2. Confirmed MVP Scope & Module Status

The student application consists of **five primary navigation destinations**, plus a **separate protected Admin Panel** (not part of the student bottom navigation).

### 1. Home (Dashboard) — *Stage 1 Implemented & Synchronized*
- Dynamic time-based greeting & current date.
- Real-time attendance summary synchronized with the Attendance engine via `useAttendance()`.
- Quick-stat cards for pending assignments (4) and new course notes (3).
- Upcoming assignments preview list (top 3) with clear indicator for the 4th item.
- Recent notes preview list (top 3) with clear Demo PDF labels.
- Interconnected quick navigation links to all modules.

### 2. Attendance Tracker — *Stage 2 Implemented*
- Single centralized `AttendanceContext` managing state with browser-safe `localStorage` persistence.
- Unified calculation engine (`calculateAttendanceMetrics`):
  - Current attendance percentage: $(P / T) \times 100$.
  - Safe bunks formula (when $\ge 75\%$): $b = \lfloor(P / 0.75) - T\rfloor$.
  - Recovery formula (when $< 75\%$): $x = \lceil(0.75 \times T - P) / 0.25\rceil$.
- Pre-seeded subject catalog for 1st Year CSE:
  - Engineering Chemistry (`BT-101`)
  - Mathematics-I (`BT-102`)
  - Basic Electrical & Electronics (`BT-104`)
  - Engineering Graphics (`BT-105`)
- Mark Attendance Interface with date picker, duplicate prevention, and in-place editing.
- Filterable attendance history log by subject and status with individual deletion support.
- Interactive "What-If" 75% scenario simulator.

### 3. Assignments (Stage 3 Scaffold)
- Filterable by status: Pending, Completed, Due Soon, Overdue.
- Details: Subject, title, due date, description, optional attachment.
- Personal completion tracking.

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
- **Next Milestone:** Stage 3 — Assignment Management System.
