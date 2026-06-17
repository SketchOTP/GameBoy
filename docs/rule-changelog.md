# Rule Changelog

Document measured exceptions to hot-path rule budgets and material contract changes.

---

## 2026-06-17 — GameBoy repo bootstrap

**Change:** Greenfield bootstrap from `rules_structure` template (`universal-2026-Q2-v5`).

**Files:** Full agent-rule layout, `project_goals.md` (DMG emulator), `README.md`, continuity files.

**AGENTS.md line budget:** 274 lines — v5 contract + §15 GameBoy tail; trim when stack/commands stabilize.

---

## 2026-06-17 — universal-2026-Q2-v5 + Aion v0.3 alignment

**Change:** Full governance alignment pass (AION-RULES-ALIGNMENT-031). Aion v0.3 workflow, modes 1–10, thin adapters, Mimir concise-outcome wording, Architect scoped to non-trivial direct edits when required.

**Files:**

- `AGENTS.md` — v5 contract with Aion, Lazy Senior, ponytail, Mimir concise outcomes
- `.cursor/rules/08-aion.mdc`, `.cursor/skills/aion/SKILL.md`, `.cursor/commands/aion.md`
- `docs/usage/mcp_cursor.md` — Cursor MCP usage (Aion, Mimir, Architect)
- `CLAUDE.md`, `GEMINI.md` — short adapters (not full contract duplicates)
- `scripts/audit-agent-rules.sh`, `scripts/sync-agent-rules.sh` — v5 checks
- `README.md`, `setup_repo.md`, `EXISTING_REPO.md`, `prompts/*` — v5 + Aion references

**AGENTS.md line budget:** 265 lines — v5 contract expanded for Aion/Mimir/Architect clarity; trim project-specific tail to ≤150 when customizing target repos.

**Why:** Prior template mixed v3 universal Architect blockers with partial v5 Aion content; corrupted adapter files and missing Aion skill/command docs blocked consistent agent behavior.

---

## 2026-06-11 — RSAL + full Architect tool catalog

**Change:** Bootstrap template now ships complete Architect MCP guidance (25 tools) with v1 blocking vs RSAL advisory enforcement split.

**Files:**

- `docs/architect-mcp.md` — full tool catalog, cold-start, pre-change planning, enforcement matrix
- `docs/mcp-tool-manifest.json` — 25 Architect tools + Mimir/Serena/cocoindex manifests
- `docs/verification-harness.md` — RSAL advisory checks section
- `docs/mimir-tools.md` — RSAL manual-only advisory note
- `docs/project-continuity.md` — RSAL artifact inventory
- `.cursor/rules/05-architect-mcp.mdc` — RSAL cold-start pointers
- `AGENTS.md` §11 — v1 blocking + RSAL advisory distinction
- `README.md`, `EXISTING_REPO.md`, `setup_repo.md` — source template path → Architect MCP `rules_structure/`
- `prompts/new_repo_prompt.md`, `prompts/exisiting_repo_prompt.md` — same path update + RSAL onboarding

**AGENTS.md line budget:** 154 lines — §11 expanded with RSAL pointer; target repos should trim project-specific tail to ≤150 when customizing.

**Why:** Downstream repos were bootstrapped from stale `general` template listing only 11 Architect tools. Agents need authoritative RSAL + supervision guidance from Architect MCP repo.
