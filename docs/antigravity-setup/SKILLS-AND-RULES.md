# Antigravity Skills & Rules Architecture

**Document Version:** 1.0  
**Target:** Google Antigravity 2.0 / CampusIQ Development  
**Auditor:** Senior AI Systems Engineer  

---

## 1. Antigravity Customization Architecture

Antigravity uses a two-tiered customization system:

1. **Rules (`GEMINI.md` / `AGENTS.md` / `.agents/rules/*.md`):**
   - Automatically injected into the agent's context.
   - Enforces coding guidelines, architectural constraints, security invariants, and file-editing protocols.
2. **Skills (`.agents/skills/<name>/SKILL.md`):**
   - On-demand procedural knowledge loaded via progressive disclosure.
   - Contains multi-step playbooks, runbooks, and domain-specific engineering workflows.

---

## 2. Configured CampusIQ Engineering Rules

To ensure reliable, professional AI development, the following rules are established in the project root (`GEMINI.md`) and `.agents/rules/`:

### Core Development Principles
1. **Inspect Before Editing:** Never assume the content or structure of a file. Read and inspect imports, types, and existing patterns before making changes.
2. **Preserve Existing Functionality:** Do not rewrite or replace functioning code unless explicitly instructed. Keep all existing working routes and features intact.
3. **No Phantom Passes:** Never declare a test or build successful without actually executing the command and verifying the exit code and logs.
4. **Architectural Traceability:** Document the reasoning behind major architectural patterns, database schemas, and state management changes.
5. **Exact Path Reporting:** After making modifications, explicitly report the exact file paths changed or created.
6. **Student Learning Orientation:** Provide clear, professional explanations of code and patterns so the developer understands *how* and *why* things work.

---

## 3. Recommended Skills for the Workspace

The following skills are installed under `.agents/skills/` to provide specialized procedures:

| Skill Name | Directory | Primary Capabilities |
| :--- | :--- | :--- |
| **`nextjs-app-router`** | `.agents/skills/nextjs-app-router/` | Next.js 14 App Router patterns, Server vs Client components, static route generation, and dynamic hydration optimization. |
| **`supabase-postgres-security`**| `.agents/skills/supabase-postgres-security/` | PostgreSQL RLS policy design, SECURITY DEFINER functions, schema migrations, and secure auth session management. |
| **`frontend-qa-testing`** | `.agents/skills/frontend-qa-testing/` | Systematic validation of student attendance math, assignment completion toggles, notes library filtering, and responsive UI layout. |

---

## 4. How to Invoke Skills in Conversations

- **Automated Selection:** Antigravity automatically detects when a task requires a skill based on its description and loads the relevant instructions.
- **Explicit User Trigger:** You can prompt the agent directly:
  > *"Use the nextjs-app-router skill to inspect our layout hierarchy."*
  > *"Use the supabase-postgres-security skill to review our attendance RLS policies."*
