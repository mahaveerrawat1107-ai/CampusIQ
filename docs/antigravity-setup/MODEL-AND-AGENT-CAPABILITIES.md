# AI Models, Subagents & Swarm Capabilities

**Document Version:** 1.0  
**Target:** Google Antigravity 2.0 / CampusIQ Development  
**Auditor:** Agentic Coding Specialist  

---

## 1. AI Models Roster & Live Quota Verification

Antigravity interfaces with multiple frontier models through a dynamic routing engine. A live query to the model management system revealed the following actual capacity:

| Model ID | Display Name | Provider | Quota Remaining | Quota Reset Window | Recommended Role in CampusIQ |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `gemini-3.8-flash-high` | **Gemini 3.8 Flash (High)** | Google DeepMind | **95%** | Active (Weekly cycle) | Complex architectural planning, full-file refactoring, large context synthesis. |
| `gemini-3.8-flash-medium` | **Gemini 3.8 Flash (Medium)** | Google DeepMind | **95%** | Active (Weekly cycle) | Primary daily coding driver, component updates, unit testing, schema analysis. |
| `gemini-3.8-flash-low` | **Gemini 3.8 Flash (Low)** | Google DeepMind | **95%** | Active (Weekly cycle) | Fast code inspection, quick edits, syntax error correction, linting. |
| `claude-sonnet-4-6` | **Claude Sonnet 4.6 (Thinking)** | Anthropic | **0%** | Resets 2026-11-27 | Secondary deep-reasoning driver when quota resets. |
| `claude-opus-4-6-thinking` | **Claude Opus 4.6 (Thinking)** | Anthropic | **0%** | Resets 2026-11-27 | Exhausted. Switch to Flash models for current milestones. |
| `gpt-oss-120b-medium` | **GPT-OSS 120B (Medium)** | Open-source | **0%** | Resets 2026-11-27 | Exhausted. |

### Strategic Recommendation for CampusIQ
Because Anthropic and GPT-OSS models are temporarily at 0% quota until the November 27 cycle, **all subagents and primary workflows must run on `gemini-3.8-flash-medium` or `gemini-3.8-flash-high`**, which have **95% available capacity**. These models support large context windows, fast inference speeds, and deep multi-turn comprehension.

---

## 2. Agent Execution Modes & Subagent Types

Antigravity provides two distinct autonomous execution paradigms:

### A. Subagents (`invoke_subagent`)
Subagents run in their own isolated conversation context, communicating asynchronously via `send_message`.

1. **`self` (Full Developer Mirror):**
   - **Capabilities:** Inherits the parent's full toolset (file editing, terminal execution, commands, git).
   - **Best For:** Delegating modular tasks such as building an independent test suite, investigating an isolated component, or executing refactors without cluttering the main conversation context.
2. **`research` (Read-Only Codebase Explorer):**
   - **Capabilities:** Fast file search, repository grepping, and web documentation search. Has write tools disabled.
   - **Best For:** Large-scale codebase surveys, tracing complex type imports, and reviewing database schema scripts safely.
3. **`browser` (Live Interactive Webview):**
   - **Capabilities:** Automated DOM navigation, form input, button clicks, visual snapshot inspection, and local server probing.
   - **Best For:** Validating responsive web UIs, testing Next.js routes on `localhost:3000`, checking attendance calculators, and visual regression detection.
4. **`image-generator`:**
   - **Capabilities:** Synthesizes image assets and returns saved file paths.
   - **Best For:** Mock avatars, visual banners, or icon generation.

### B. Swarm Architecture (`swarm`)
- **Parallel Message-Board Collaboration:** Agents collaborate via a shared public bulletin board.
- **Worker Workspace Isolation:**
  - `inherit`: Shares the current working directory.
  - `share`: Spawns a dedicated Git worktree copy for simultaneous file edits without conflict.
  - `branch`: Spawns an isolated Git branch.
- **Role Assignment:** Supports sharded worker pools (e.g. `worker-1`, `worker-2`) for parallel tasks like auditing multiple API routes simultaneously.

---

## 3. Verified Multi-Agent Workflow for CampusIQ

```
       ┌────────────────────────────────────────────────────────┐
       │              COORDINATOR / ARCHITECT                   │
       │   - Deconstructs user request                          │
       │   - Inspects existing Next.js / Supabase architecture   │
       │   - Assigns bounded sub-tasks to specialists           │
       └──────────────┬──────────────────────────┬──────────────┘
                      │                          │
        ┌─────────────▼──────────┐    ┌──────────▼─────────────┐
        │   FRONTEND SPECIALIST  │    │   BACKEND SPECIALIST   │
        │ - React 18 / Next.js   │    │ - Supabase Client / SSR│
        │ - Tailwind CSS styles  │    │ - PostgreSQL / RLS     │
        │ - State & Context API  │    │ - Database Migrations  │
        └─────────────┬──────────┘    └──────────┬─────────────┘
                      │                          │
                      └─────────────┬────────────┘
                                    │
                      ┌─────────────▼────────────┐
                      │    SECURITY & QA AGENT   │
                      │ - Verifies RLS isolation │
                      │ - Runs `npm run build`   │
                      │ - Live browser testing   │
                      └──────────────────────────┘
```

---

## 4. Limitations & Best Practices

1. **Reactive Wakeup:** Subagents do not require polling loops. Antigravity notifies the parent agent as soon as a subagent yields results or finishes.
2. **Resource Throttling:** On 16 GB RAM systems, running more than 3 simultaneous browser subagents or parallel compilation workers can cause memory pressure. The recommended limit is **1 to 2 concurrent subagents**.
