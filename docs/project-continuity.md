# Project Continuity (Mimir Fallback)

**Apply only when Mimir MCP is BLOCKED** or the user explicitly requires repo-local audit files.

When Mimir is available, follow `AGENTS.md` §9 and `docs/mimir-tools.md` instead of forcing updates to every `project_*.md` file each session.

**Continuity stack:**

| Layer | Role |
|---|---|
| **Mimir MCP** | Primary continuity — durable facts, decisions, session outcomes (`memory_record_outcome` required at end of every meaningful session when reachable) |
| **`.architect/`** | Architecture + RSAL derived truth — graph, ownership, alignment, repository_truth, claims, drift, gates |
| **Serena / cocoindex-code** | Repo understanding — symbol navigation and semantic search |
| **`project_*.md`** | Fallback only when Mimir is BLOCKED |

Do not rely on chat memory alone. Use Mimir + Architect RSAL + code-intelligence MCPs before trusting stale docs.

---

## Project Files

| File | Role |
|------|------|
| `project_goals.md` | Project north star and Architect MCP source of truth (repo root) |
| `project_status.md` | Current operational snapshot |
| `project_history.md` | Chronological work log |
| `project_knowledge.md` | Durable lessons for future agents |
| `repo_map.md` | Living map of the codebase |
| `project_memory/index.json` | Token-light navigation index |
| `.architect/decisions/` | Architect MCP decision history (when onboarded) |
| `.architect/alignment_report.md` | Goal/architecture alignment report |
| `.architect/architecture_graph.json` | Module/dependency graph — refresh after major changes |
| `.architect/ownership_map.json` | State ownership map — refresh after major changes |
| `.architect/architecture_state.json` | Architect MCP runtime state |
| `.architect/repository_truth.json` | RSAL derived truth — regenerate via `architect_resync_truth` |
| `.architect/claim_registry.json` | Claim confidence scores — `architect_validate_claims` |
| `.architect/drift_findings.json` | Metadata drift — `architect_detect_drift` |
| `.architect/rsal_gate_report.json` | Dry-run gates (advisory) — `architect_rsal_gate_report` |
| `.architect/comprehension_benchmark.json` | Repo health score — `architect_benchmark_comprehension` |

**Code intelligence (always when MCP available):**

- **cocoindex-code** `search` — broad semantic discovery during onboarding or unfamiliar areas
- **Serena** — symbol-level inspection before edits (`find_symbol`, `find_referencing_symbols`)

**RSAL (advisory, not blocking):** Run cold-start per `docs/architect-mcp.md` when artifacts are missing or stale.

---

## Session Start (Mimir BLOCKED)

Before touching code, read:

```text
project_goals.md
project_status.md
recent tail of project_history.md (not full file unless audit required)
project_knowledge.md (relevant sections)
repo_map.md or project_memory/index.json
```

Do not edit, create, delete, refactor, or run destructive commands until context is reviewed.

If required files are missing: stop, create using `setup_repo.md` templates, log in `project_history.md`, then continue.

---

## Token Discipline

- Minimize reads, search output, and prose
- Navigate with `repo_map.md` / `project_memory/index.json` before broad scans
- Append `project_history.md` at bottom without full-file read
- Enrich `project_knowledge.md` with durable navigation/validation tips only

---

## File Update Rules

**project_goals.md** — update when north star, audience, success criteria, or scope changes. Keep strategic, not a backlog.

**project_status.md** — update on major state change or when asked. Current state, priorities, blockers, validation status.

**project_history.md** — append on completed sessions when Mimir is BLOCKED:

```text
HHMM DDMMYY - One line summary.
Files touched:
- path/to/file
```

**project_knowledge.md** — durable lessons only when Mimir is BLOCKED. No secrets. No duplicate of history.

**repo_map.md** — update when structure, entrypoints, APIs, or ownership changes. Append deltas; avoid full regeneration unless requested.

**Architect MCP artifacts** — after major architecture or ownership changes, run `architect_update_architecture` and refresh `.architect/architecture_graph.json`, `.architect/ownership_map.json`, and `.architect/alignment_report.md` via `architect_generate_alignment_report`. Decision history lives in `.architect/decisions/`.

**RSAL artifacts** — never hand-edit. Regenerate via `architect_resync_truth`, `architect_validate_claims`, `architect_detect_drift`, `architect_rsal_gate_report` per `docs/architect-mcp.md`.

---

## Fallback Workflow

```text
1. Read AGENTS.md §10.
2. Read project_goals.md, project_status.md.
3. Skim recent project_history.md tail.
4. Read relevant project_knowledge.md sections.
5. Read repo_map.md / project_memory/index.json.
6. Confirm task aligns with project_goals.md.
7. Inspect only files needed for the task.
8. Make the smallest safe change.
9. Run relevant validation (docs/verification-harness.md).
10. Update project_goals.md if north star shifted.
11. Update project_status.md if major state changed.
12. Append project_history.md if Mimir BLOCKED and session complete.
13. Update project_knowledge.md if Mimir BLOCKED and durable lesson learned.
14. Update repo_map.md / project_memory/index.json if structure changed.
15. Report per AGENTS.md §8.
```

---

## Hard Constraints (Fallback Mode)

Agents must not:

- Store the same fact in Mimir and `project_knowledge.md` unless explicitly required
- Read entire `project_history.md` solely to append
- Default to whole-repository reads when map-guided search suffices
- Store secrets in repo docs
- Finish a Mimir-BLOCKED session without `project_history.md` append
- Modify unrelated files
- Manually edit generated `.architect/*.json` artifacts

---

## Validation Checklist (Fallback Mode)

```text
[ ] project_goals.md reviewed
[ ] project_status.md reviewed
[ ] project_history.md tail reviewed
[ ] project_knowledge.md reviewed if relevant
[ ] repo_map.md / project_memory/index.json reviewed
[ ] Tests or validation run, or blocker documented
[ ] All changed files listed in final report
[ ] No unrelated files modified
```
