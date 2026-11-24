# CampusIQ Workspace Engineering Rules for Antigravity

Welcome to the **CampusIQ** project! These rules ensure that all AI-driven engineering sessions maintain code quality, avoid breaking changes, and support clear architectural understanding.

---

## 1. Prime Directive: Inspect Before Editing
- **Never guess file contents or component structure.** Always use `read_file` to inspect existing imports, TypeScript types, and styling patterns before modifying code.
- **Respect the existing project structure:** Next.js 14 App Router (`src/app/`), components (`src/components/`), contexts (`src/context/`), and data libraries (`src/data/`, `src/lib/`).

---

## 2. Preserve Existing Functionality & Invariants
- **Do not rewrite functioning code.** Incremental changes and targeted edits (`edit_file`) are preferred over whole-file replacements.
- **Maintain verified features:**
  - Student attendance engine (`calculateAttendanceMetrics` with 75% threshold rules).
  - Notes library hierarchy (Semester &rarr; Subject &rarr; Unit &rarr; PDF).
  - Assignment status toggles and decoupled storage.
  - Role integrity: backend roles are strictly `student`, `teacher`, and `admin`. HOD is a teacher, not a separate DB role.

---

## 3. Strict Verification & Testing Protocols
- **No phantom passes:** Never state that a build, test, or migration succeeded without actually executing the command and verifying the logs.
- After modifying frontend code or configurations, always verify that `npm run build` succeeds with 0 TypeScript and lint errors.
- Clearly report every file created or modified during the session.

---

## 4. Supabase & Database Guidelines
- All database modifications must be authored as versioned SQL scripts in `supabase/migrations/`.
- Respect physical attendance isolation: Personal student attendance logs (`student_attendance_logs`) must remain private and physically separated from institutional records (`institutional_attendance_records`).
- Never expose the Supabase `service_role` key in frontend code or Git-tracked files. Keep client credentials in `.env.local`.

---

## 5. Explanatory & Educational Approach
- The developer is an aspiring software engineer (1st Year B.Tech CSE).
- Accompany major architectural patterns, database schemas, and state logic with concise, educational explanations of *how* and *why* they work.
