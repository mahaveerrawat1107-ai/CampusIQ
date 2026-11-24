---
name: supabase-postgres-security
description: Best practices for Supabase PostgreSQL schema design, Row Level Security (RLS) policies, SECURITY DEFINER functions, and authentication session handling in CampusIQ.
---

# Supabase PostgreSQL & Security Engineering Skill

This skill enforces database integrity, secure migrations, and hardened multi-role access controls.

## Key Rules
1. **Migration Files:**
   - Always author schema changes under `supabase/migrations/` with idempotent checks (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`).
2. **Row Level Security (RLS):**
   - Every single table must have `ENABLE ROW LEVEL SECURITY`.
   - Never use `USING (TRUE)` on sensitive student or institutional data tables.
3. **Helper Functions:**
   - Always specify `SECURITY DEFINER` and `SET search_path = public, pg_temp` to prevent search path hijacking.
   - Revoke public execution and grant only to `authenticated`.
4. **Attendance Isolation:**
   - Maintain physical table separation between personal logs (`student_attendance_logs`) and institutional records (`institutional_attendance_records`).
