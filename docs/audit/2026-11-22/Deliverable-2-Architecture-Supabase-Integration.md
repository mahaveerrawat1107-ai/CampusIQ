# Deliverable 2: Architecture & Supabase Integration Assessment

## 1. Authentication Architecture

### Supabase Client Configuration
- **Browser Client**: `src/lib/supabase/client.ts` — `import { createBrowserClient } from "@supabase/ssr"`; exports `createClient()` function that falls back to placeholder credentials if env vars missing, ensuring `npm run build` succeeds without crashing.
- **Server Client**: `src/lib/supabase/server.ts` — `createServerClient` with `cookies()` from `next/headers`; used for Server Components, Server Actions, and Route Handlers.
- **Middleware**: `src/lib/supabase/middleware.ts` — `updateSession` runs on every request, validates session, redirects auth’d users away from `/login`, and handles token refresh.

### Demo Fallback Mechanism
- **LocalStorage Token**: `campusiq_demo_auth` stored as `"student"` / `"teacher"` when demo IDs are used in LoginPage.
- **AuthContext**: Reads `storedDemo` from `localStorage.getItem("campusiq_demo_auth")` on mount to set `isDemoUser: true` flag.
- **Purpose**: Enables offline QA and evaluator testing without requiring a live Supabase Auth project during initial review cycles.

### Environment Variable Guardrails
- All three files (`client.ts`, `server.ts`, `middleware.ts`) explicitly check `!supabaseUrl || !supabaseKey` before initializing clients.
- Fallback placeholder values (`https://placeholder-project.supabase.co`, `placeholder-publishable-key`) prevent build-time crashes during static site generation.

---
## 2. Database & Server Actions (Attendance Module)

### Table Schema
- **Table Name**: `student_attendance_logs`
- **Composite Unique Constraint**: `(student_id, subject_id, session_date)` — enforced via `onConflict` in `upsertAttendanceRecord()`.
- **Column Fields**: `id`, `student_id`, `subject_id`, `session_date`, `status` ("present" | "absent"), `created_at`, `updated_at`.

### Server Actions (src/lib/supabase/actions.ts)
| Action | Purpose | RLS Enforcement |
| :--- | :--- | :--- |
| `fetchAttendance()` | Queries all attendance logs for authenticated student | `.eq("student_id", user.id)` — filters strictly by authenticated user ID |
| `upsertAttendanceRecord()` | Inserts or updates a attendance log entry | `.upsert({ student_id: user.id, ...record }, { onConflict: "student_id,subject_id,session_date" })` |
| `deleteAttendanceRecord(id)` | Deletes a specific attendance record | `.delete().eq("id", id).eq("student_id", user.id)` — matches both record ID and student ownership |

### RLS Policy Verification
- All three Server Actions call `supabase.auth.getUser()` immediately and throw `Error("Unauthorized")` if no authenticated user is present.
- This ensures that even if RLS policies are misconfigured at the database level, the application layer prevents cross-student data access.

---
## 3. Notes Module Integration (Local Storage)

### IndexedDB / LocalStorage Blob Store
- **Storage Key Pattern**: `note_blob_{timestamp}_{random}` for each uploaded PDF.
- **Functions**: `saveNotePdfBlob(storageKey, file, fileName)` and `deleteNotePdfBlob(storageKey)` in `notesStorage.ts`.
- **Usage**: Student Notes Library (`/notes`) and Staff Resource Management (`/admin/notes`) both use this same blob store.
- **Verification**: Notes PDFs upload, display previews, and delete cleanly; old blobs are cleaned up on replacement (checks `!oldKey.startsWith("notes_blob_seed_")`).

---
## 4. Security, RLS, & Edge Cases

### Session & Middleware Guards
- `middleware.ts` `updateSession` redirects authenticated users away from `/login` and handles session persistence across route transitions.
- `AuthContext` `onAuthStateChange` callback updates session/user/profile state on every auth event (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED).

### Edge Cases Handled
- **Empty State**: Attendance metrics return `percentage: 0` when `total <= 0` or `attended < 0`.
- **Duplicate Prevention**: Attendance upsert uses composite primary key conflict resolution; Notes replacement checks `!oldKey.startsWith("notes_blob_seed_")` before cleanup.
- **Missing Env Vars**: Build succeeds with placeholder credentials; runtime degrades gracefully.

---
*End of Deliverable 2*