# Model Context Protocol (MCP) & Plugin Integrations

**Document Version:** 1.0  
**Target:** Google Antigravity 2.0 / CampusIQ Development  
**Auditor:** Developer Productivity Architect  

---

## 1. Overview of MCP in Google Antigravity

The **Model Context Protocol (MCP)** provides open standard connectivity between AI models and external data sources, developer tools, and API backends. In Antigravity, MCP servers can be configured in two ways:
1. **Catalog Plugins:** Curated, verified plugins installable via the Antigravity Marketplace (`<plugin-card>`).
2. **Custom / Local MCP Servers:** Registered via `mcp_config.json` running as local stdio processes (Node/Python).

---

## 2. Evaluation of Key Developer Integrations

### A. Supabase Integration
- **Marketplace Availability:** **Official Partner Plugin Available** (`antigravity-plugins-partners/plugin/supabase`).
- **What it Provides:**
  - Direct PostgreSQL schema inspection.
  - Project management, database migration tracking, and RLS policy linting.
  - Supabase Storage and Auth inspection.
- **Cost:** **Free** (utilizes your existing free Supabase tier).
- **Setup Recommendation:** Enable the official Supabase partner plugin via the Marketplace card for streamlined schema operations, while keeping raw SQL migrations version-controlled under `supabase/migrations/`.

<plugin-card catalog-id="antigravity-plugins-partners/plugin/supabase"></plugin-card>

### B. GitHub Integration
- **Host State:** Standard Git CLI (`v2.55.0.windows.3`) is installed and linked to `https://github.com/mahaveerrawat1107-ai/CampusIQ.git`.
- **Status:** **WORKING (Native CLI)**.
- **Recommendation:** Antigravity executes Git commands directly through its PowerShell sandbox (`git status`, `git commit`, `git diff`, `git log`). External GitHub MCP servers are unnecessary for basic branching, PRs, and commits, avoiding additional token overhead. For issue tracking and PR management, GitHub CLI (`gh`) can be utilized natively.

### C. Playwright & Browser Automation
- **Host State:** Built-in **Browser Subagent** (`browser`) is active and accessible via `invoke_subagent`.
- **What it Provides:**
  - Automated Chromium webview control.
  - Visual layout verification, responsive mobile emulation, form automation, and console log inspection.
  - Fully sandboxed execution without requiring local driver configuration.
- **Status:** **WORKING (Native Built-in)**.
- **Cost:** **Free**.
- **Recommendation:** Rely on the built-in `browser` subagent for automated testing. This avoids installing heavy, redundant third-party Playwright npm binaries.

### D. Filesystem MCP
- **Status:** **NOT NEEDED (Fully Covered)**.
- **Reasoning:** Antigravity provides high-performance native filesystem tools (`read_file`, `write_file`, `edit_file`, `run_command`). A separate Filesystem MCP server would add duplicate complexity and unnecessary IPC overhead.

---

## 3. Approved & Safe Plugin Strategy for CampusIQ

1. **Free-First Principle:** All recommended tools and plugins must be 100% free with no hidden recurring subscriptions.
2. **Minimalist Architecture:** Avoid cluttering the workspace with redundant MCP daemons that consume memory on the 16 GB host.
3. **Zero Secret Leakage:** Never store raw API tokens in unencrypted workspace files. Environment variables must stay confined to `.env.local`, which is strictly ignored by `.gitignore`.
