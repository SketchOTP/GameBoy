# Mimir MCP Tools

On-demand reference. Load when using Mimir memory, skills, approvals, or telemetry.
Core rule in `AGENTS.md` §7: use Mimir when available; **commit chat history to Mimir MCP memory** means concise session outcome via `memory_record_outcome`, not raw transcript.

## Mimir vs Architect MCP

| System | Role |
|---|---|
| **Mimir MCP** | Long-term memory — recall, search, session outcomes, lessons |
| **Architect MCP** | Architecture gatekeeper — plan approval, diff review, release gate; RSAL derived truth (advisory) |

**Architect MCP queries Mimir** for related decisions and lessons. **Mimir does not approve plans, diffs, or releases.** Architect MCP is the approval authority for implementation scope and architectural compliance.

**RSAL pattern memory (manual only):** Mimir may store Architect-exported RSAL pattern summaries. Normal `memory_recall` does **not** include RSAL patterns. Use Architect `architect_lookup_mimir_rsal_patterns` with `explicit_rsal: true` for manual advisory lookup. Mimir RSAL memory cannot satisfy claim evidence or enable enforcement.

If Mimir MCP is unavailable:

- Do not pretend tools were used
- Mark reporting as `BLOCKED`
- Include the exact reason
- Include the session report in the final response for manual entry

Never store in Mimir: secrets, credentials, `.env`, API keys, raw dumps, full files, private user data, noisy temporary details.

---

## Memory Tools

| Tool | When to use |
|---|---|
| `memory_recall` | At task start, after context shifts, before modifying existing systems, before architecture decisions |
| `memory_search` | Before creating functionality that may already exist; feature, subsystem, bug, architecture, or history lookup |
| `memory_remember` | Durable knowledge: root causes, architecture decisions, operational constraints, recurring failure patterns |
| `memory_get` | Inspecting an exact memory record or validating recalled context |
| `memory_list` | Auditing memory state, reviewing layers, or checking filtered memory sets |
| `memory_edit` | Correcting inaccurate or stale memory |
| `memory_delete` | Memory is invalid, unsafe, or should no longer be retrieved |
| `memory_supersede` | Newer canonical knowledge replaces older knowledge |
| `memory_merge` | Duplicate or fragmented memories should become one canonical record |
| `memory_record_outcome` | End of every meaningful session — result, validation, risks, follow-up |

---

## Skill Tools

| Tool | When to use |
|---|---|
| `skill_list` | Before building reusable automation, workflow systems, or orchestration that may already exist as a skill |
| `skill_propose` | Workflow is genuinely reusable, repeated, measurable, and worth lifecycle management |
| `skill_test` | Before using, activating, or rolling out a skill in production-like work |
| `skill_activate` | Only after the skill has been tested, validated, and is operationally safe |

Do not create speculative skills.

---

## Approval Tools

| Tool | When to use |
|---|---|
| `approval_request` | Migrations, destructive changes, schema changes, dependency additions, public API changes, security-sensitive changes, production-impacting behavior, architectural rewrites |
| `approval_status` | Checking pending approval state or reviewing governance queues |
| `approval_decide` | Explicitly approving or rejecting a pending request; must include rationale |

Never bypass approval workflows.

---

## Reflection Tools

| Tool | When to use |
|---|---|
| `reflection_log` | After repeated failures, major debugging sessions, architecture discoveries, operational lessons, or failure patterns worth preventing |

Keep reflections concise and prevention-focused.

---

## Improvement Tools

| Tool | When to use |
|---|---|
| `improvement_list` | Before proposing improvements, to avoid duplicates |
| `improvement_get` | Reviewing an existing improvement proposal in detail |
| `improvement_propose` | Only when evidence supports a measurable improvement with clear expected impact |

Never propose speculative rewrites, trend-chasing architecture, or unnecessary abstractions.

---

## Quarantine Review Tools

| Tool | When to use |
|---|---|
| `quarantine_review_list` | Trust review, memory safety review, or quarantine audits |
| `quarantine_review_reactivate` | Only after explicit manual validation confirms quarantined content is safe |
| `quarantine_review_keep` | Safety or trust concerns remain unresolved |

Never auto-reactivate quarantined memories.

---

## Telemetry / Status Tools

| Tool | When to use |
|---|---|
| `telemetry_snapshot` | Before performance tuning, optimization, runtime-health decisions, or claims about system health |
| `retrieval_stats` | Diagnosing memory recall quality, retrieval quality, search precision, or context relevance |
| `project_status_summary` | Resuming dormant work, restoring project awareness, or reviewing overall project health |
| `project_bootstrap` | First project connection, major architecture reset, major process migration, or foundational context initialization |

Use live telemetry/status instead of assumptions.

---

## Required Mimir Flow

**At task start:**

1. `memory_recall`
2. `project_status_summary` if resuming dormant or unclear work
3. `memory_search` before creating/modifying potentially existing functionality
4. `skill_list` before reusable automation or orchestration work

**During work:**

1. `memory_remember` for durable discoveries
2. `reflection_log` for repeated failures or major lessons
3. `improvement_list` before proposing improvements
4. `telemetry_snapshot` before optimization/runtime-health claims
5. `approval_request` before approval-gated changes

**At completion:**

1. Run relevant verification
2. Inspect final diff
3. **Required:** record the session with `memory_record_outcome` before the final completion report when Mimir is reachable. Operational phrase: **commit chat history to Mimir MCP memory** — store concise outcome only, not raw transcript.

Never report `session outcome recorded: no`. Use `Mimir: commit chat history to Mimir MCP memory -> yes` only if the tool succeeded; use `BLOCKED (<reason>)` only after a failed attempt or when MCP is unavailable.

---

## Complements (Not Substitutes)

| MCP | Role |
|---|---|
| **Mimir** | Durable project memory and session outcomes |
| **Serena** | Symbol-level code navigation — see `docs/serena-tools.md` |
| **cocoindex-code** | Semantic code search — see `docs/cocoindex-code.md` |
| **Architect MCP** | Plan/diff/release approval + RSAL advisory — see `docs/architect-mcp.md` |

Use all available MCPs at task start. Do not rely on chat memory alone.
