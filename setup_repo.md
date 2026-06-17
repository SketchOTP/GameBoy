# Bootstrap guide: agent continuity layout for `[repo]`

This document describes **exactly** how to create the same repository documentation and agent-rule layout that exists alongside this file. Treat **`[repo]`** as a placeholder: substitute your repository or product display name everywhere `[repo]` appears (for example replace `[repo]` with `my-service`), or perform one global find-and-replace before committing.

**Audience:** Humans and AI coding agents. An agent with only this file should be able to recreate the full structure and file contents.

**For existing repos:** use `EXISTING_REPO.md` instead. This file (`setup_repo.md`) is for new-repo bootstrap. `EXISTING_REPO.md` covers migration when the target repo already has code, docs, memories, or older agent instructions.

All code sould be added in a structured, moduler, future change friendly way so that if we add or remove a feature later it does not break everything.

**Important:** `AGENTS.md` is the **canonical** universal contract (`universal-2026-Q2-v5`). Do not byte-copy it across multiple files.

| Path | Role |
|------|------|
| `[repo-root]/AGENTS.md` | Canonical Tier 0 rules (≤150 lines) |
| `[repo-root]/CLAUDE.md` | Adapter: symlink → `AGENTS.md` or ≤10-line pointer |
| `[repo-root]/GEMINI.md` | Adapter: symlink → `AGENTS.md` or ≤10-line pointer |
| `[repo-root]/.cursorrules` | GENERATED legacy stub (`scripts/sync-agent-rules.sh`) |
| `[repo-root]/.cursor/rules/00-core-contract.mdc` | GENERATED Cursor pointer — not a full duplicate |
| `[repo-root]/docs/mimir-tools.md` | Mimir tool catalog (on-demand) |
| `[repo-root]/docs/architect-mcp.md` | Architect MCP workflow (on-demand) |
| `[repo-root]/docs/usage/mcp_cursor.md` | Cursor MCP usage — Aion, Mimir, Architect |
| `[repo-root]/docs/serena-tools.md` | Serena tool catalog (on-demand) |
| `[repo-root]/docs/cocoindex-code.md` | cocoindex-code search workflow (on-demand) |
| `[repo-root]/docs/verification-harness.md` | Verifier registry (on-demand) |
| `[repo-root]/docs/project-continuity.md` | `project_*.md` workflow — **Mimir BLOCKED only** |
| `[repo-root]/COMMANDMENTS_OF_THE_CODE.md` | Optional values/judgment layer — **not hot path** |

After bootstrap, run `scripts/sync-agent-rules.sh` and `scripts/audit-agent-rules.sh`. Token discipline: minimize reads/output, use `project_memory/index.json` / `repo_map.md` for navigation, Mimir for durable memory when available.

---

## 1. Target directory layout

After setup, the repository root (call it **`[repo-root]`** — the folder that contains `.git` or will contain it) should contain:

```text
[repo-root]/
  AGENTS.md                        # canonical Tier 0 (≤150 lines)
  COMMANDMENTS_OF_THE_CODE.md      # optional values layer (on-demand only)
  CLAUDE.md                        # adapter → AGENTS.md
  GEMINI.md                        # adapter → AGENTS.md
  .cursorrules                     # GENERATED stub
  setup_repo.md
  docs/
    architect-mcp.md
    mcp-tool-manifest.json
    mimir-tools.md
    serena-tools.md
    cocoindex-code.md
    verification-harness.md
    project-continuity.md
    rule-changelog.md
    usage/
      mcp_cursor.md
  scripts/
    audit-agent-rules.sh
    sync-agent-rules.sh
  project_goals.md
  project_status.md
  project_history.md
  project_knowledge.md
  repo_map.md
  project_memory/
    index.json
  .cursor/
    rules/
      00-core-contract.mdc         # pointer only
      01-verification.mdc
      02-implementation.mdc
      03-approval-gates.mdc
      04-mimir.mdc
      05-architect-mcp.mdc
      06-serena.mdc
      07-cocoindex-code.mdc
      08-aion.mdc
    skills/
      mimir/SKILL.md
      aion/SKILL.md
    commands/
      aion.md
```

No other files are required by this layout. Application code, manifests, and CI may be added later.

---

## 2. Preconditions

- You can create directories and files under `[repo-root]`.
- Line endings: use **LF** (`\n`) for all text files unless your platform standard dictates otherwise.
- Encoding: **UTF-8** without BOM for all Markdown files.

---

## 3. Step-by-step: directories

1. `cd` to `[repo-root]`.
2. Create the nested rules directory:
   - `mkdir -p .cursor/rules`

---

## 4. Step-by-step: create the five project continuity files

Create each file at `[repo-root]/<filename>` with the content in the subsection below. Replace `[repo]` in titles and body if you are not using a global replace later.

### 4.1 `project_goals.md`

```markdown
# Project Goals

## Product Goal

TODO: Describe the target repo's purpose.

## Success Criteria

## Non Goals

## Architecture Principles

## Module Ownership Rules

## Forbidden Patterns

## Required Testing

## Release Gates

## Drift Definition

## Long Term Vision

## Repository Maturity Level

Level 2 — Development
```

### 4.2 `project_status.md`

```markdown
# Project Status

TODO: Record the target repo's current verified state, blockers, and latest validation results.
```

### 4.3 `project_history.md`

```markdown
# Project History

Append-only fallback audit only when Mimir MCP is unavailable.

## Entry format

```md
## YYYY-MM-DD HH:MM — short title

Changed:
- `path`

Summary:
- concise factual result

Validation:
- command — result
```

## Entries

<!-- Append new entries below. -->
```

### 4.4 `project_knowledge.md`

```markdown
# Project Knowledge

Fallback durable lessons only when Mimir MCP is unavailable.

Do not store the same fact in Mimir and this file unless explicitly required.
```

### 4.5 `repo_map.md`

```markdown
# Repo Map

This file must describe the **target repo** after bootstrap. Replace TODO sections with real paths, entrypoints, and commands.

## Entry points

- TODO

## Important directories

- TODO

## Verification commands

- TODO

## Runtime/config notes

- TODO
```

---

## 5. Step-by-step: install agent rules (v5 layout)

1. Copy the universal `AGENTS.md` from the source template repo into **`[repo-root]/AGENTS.md`**.
2. Copy `COMMANDMENTS_OF_THE_CODE.md` into the target repo unchanged unless the target repo has domain-specific values/safety constraints. Any project-specific edits must preserve the five truths and must not weaken “do no harm.”
3. Copy `docs/`, `scripts/`, and `.cursor/rules/` + `.cursor/skills/` from the source template repo.
4. Add a **repo-specific** section at the bottom of `AGENTS.md` (build/test commands, PR conventions) — keep total ≤150 lines or document in `docs/rule-changelog.md`.
5. Run `scripts/sync-agent-rules.sh` to generate adapters (`CLAUDE.md`, `GEMINI.md`, `.cursorrules`, `00-core-contract.mdc`). `AGENTS.md` is canonical; adapters must not duplicate its body.

```bash
chmod +x scripts/*.sh
./scripts/sync-agent-rules.sh
./scripts/audit-agent-rules.sh
```

6. For `project_*.md` continuity workflow, see `docs/project-continuity.md` — apply only when Mimir MCP is BLOCKED.

---

## 5b. Architect MCP setup (required)

After creating/customizing **`project_goals.md`** at repo root:

### Onboarding + RSAL cold-start

| Step | Tool | When |
|---|---|---|
| 1 | `architect_init_project` | If `project_goals.md` or `.architect/` is missing |
| 2 | `architect_import_repo` | After universal rules are copied into the repo |
| 3 | `architect_generate_alignment_report` | After import |
| 4 | `architect_resync_truth` | RSAL cold-start — derived truth |
| 5 | `architect_validate_claims` | Claim extraction and confidence |
| 6 | `architect_detect_drift` | Metadata drift detection |
| 7 | `architect_rsal_gate_report` | Dry-run gates (advisory) |
| 8 | `architect_benchmark_comprehension` | Repo health score |
| 9 | `architect_scan_cross_repo_patterns` | Cross-repo pattern scan |

### Supervised implementation (blocking)

| Step | Tool | When |
|---|---|---|
| 1 | `architect_start_request` | Before any implementation work |
| 2 | `architect_review_plan` | Before writing application code |
| 3 | `architect_review_diff` | After coding, before claiming complete |
| 4 | `architect_release_gate` | Before commit or release |

### Pre-change (non-trivial edits)

| Step | Tool | When |
|---|---|---|
| 1 | `architect_prepare_change_plan` | Before multi-file, architectural, or claim-bearing changes |
| 2 | `architect_impact_analysis` | Optional targeted impact preview |

**Hard gates (v1 — blocking when invoked/required):**

- When Architect workflow is required, do not implement until `architect_review_plan` returns `APPROVED_FOR_IMPLEMENTATION`.
- When Architect workflow is required, do not commit/release until `architect_review_diff` returns `APPROVED` and `architect_release_gate` returns `RELEASE_APPROVED`.
- Stop immediately if Architect MCP returns any rejection status.

Architect is not required for Aion invocation, Aion mode get/set, reading Aion reports, trivial edits, or docs-only edits.

**RSAL (advisory):** Review cold-start and gate outputs; RSAL does not block commits today. Never hand-edit `.architect/*.json`.

Full tool catalog (25 tools): `docs/architect-mcp.md`, `docs/mcp-tool-manifest.json`.

Architect MCP connects via global `~/.cursor/mcp.json`. See `.cursor/rules/05-architect-mcp.mdc` and `docs/verification-harness.md`.

Also customize repo-root `project_goals.md` for the target repo after bootstrap.

---

## 5c. MCP bootstrap (required)

After copying rules and customizing `project_goals.md`, confirm the MCP stack is connected and onboard the repo:

| Step | MCP | Action |
|---|---|---|
| 1 | All | Confirm `aion`, `architect`, `mimir`, `serena`, `cocoindex-code` green in Cursor MCP panel |
| 2 | Architect | `architect_init_project` if needed; `architect_import_repo`; `architect_generate_alignment_report`; RSAL cold-start (`architect_resync_truth` → `architect_validate_claims` → `architect_detect_drift` → `architect_rsal_gate_report` → `architect_benchmark_comprehension`); `architect_scan_cross_repo_patterns` |
| 3 | Mimir | `memory_recall`, `project_bootstrap` or `project_status_summary`; store durable context with `memory_remember` |
| 4 | cocoindex-code | `search` with exploratory queries to map major subsystems |
| 5 | Serena | `initial_instructions`, `activate_project`; `get_symbols_overview` on key entry files |
| 6 | Docs | Record MCP connection status, onboarding results, and gaps in `project_status.md` and `project_knowledge.md` (fallback only) |

Do not start feature work until Architect import completes and Mimir recall succeeds (or fallback docs are initialized).

---

## 6. Step-by-step: add this bootstrap guide (optional)

To allow the same propagation again later, copy **`setup_repo.md`** itself into `[repo-root]/setup_repo.md` (the file you are reading, or this project’s version). If you skip this, update `project_status.md`, `project_history.md`, and `repo_map.md` to remove references to `setup_repo.md`.

---

## 7. Verification checklist

Before considering setup complete:

- [ ] `project_goals.md`, `project_status.md`, `project_history.md`, `project_knowledge.md`, `repo_map.md` exist and use consistent `[repo]` (or your substituted name).
- [ ] `project_history.md` has at least one entry with correct `HHMM DDMMYY` and a complete `Files touched:` list.
- [ ] `scripts/audit-agent-rules.sh` PASS and `scripts/sync-agent-rules.sh` PASS.
- [ ] `AGENTS.md` ≤150 lines (or documented in `docs/rule-changelog.md`); `CLAUDE.md` and `GEMINI.md` symlink or ≤10-line pointer; `.cursorrules` GENERATED stub; `00-core-contract.mdc` pointer-only.
- [ ] `project_goals.md` exists at repo root; `architect_import_repo` completed; `.architect/architecture_graph.json` and `.architect/ownership_map.json` present.
- [ ] MCP stack connected: Architect, Mimir, Serena, cocoindex-code (see `docs/verification-harness.md` MCP readiness checklist).
- [ ] Mimir recall/bootstrap run; cocoindex-code and Serena used to map entry points (documented in `project_status.md`).
- [ ] `docs/project-continuity.md` used for `project_*.md` workflow only when Mimir is BLOCKED.
- [ ] If applicable, `setup_repo.md` is present and listed in `repo_map.md` / history.

---

## 8. After setup (agent behavior)

Any AI agent working in `[repo-root]` should:

1. Read `AGENTS.md` (Aion v0.3, Mimir §7, Architect §8).
2. Use Mimir when available; **commit chat history to Mimir MCP memory** means concise session outcome via `memory_record_outcome`, not raw transcript.
3. Use Serena and cocoindex-code before modifying unfamiliar code.
4. Treat `project_goals.md` as north star; update `project_status.md` on major milestones only.
5. Use Aion for bounded goals when appropriate (`aion_run_goal`, modes 1–10).
6. Call Architect MCP for non-trivial direct code changes when required — before implementation, after coding, and before commit/release.

---

## Appendix A — Deprecated (v2 monolith reference only)

**Historical reference only.** Do not copy this block into new repos. Use `AGENTS.md` v5 and `docs/project-continuity.md` instead.

````markdown
---
description: DEPRECATED — v2 reference only; apply when Mimir MCP is BLOCKED
alwaysApply: false
---

## Purpose (DEPRECATED)

Historical v2 contract. New repos: copy `AGENTS.md` v5 from the source template. When Mimir MCP is BLOCKED, use `docs/project-continuity.md`.

| File | Role |
|------|------|
| `project_goals.md` | Project north star |
| `project_status.md` | Current operational snapshot |
| `project_history.md` | Chronological work log |
| `project_knowledge.md` | Durable lessons for future agents |
| `repo_map.md` | Living map of the codebase |

---

# Mandatory Session Start

Before touching any code, the agent must read these local repo files:

```text
project_goals.md
project_status.md
project_history.md
project_knowledge.md
repo_map.md
```

Hard rule:

```text
Do not edit, create, delete, refactor, or run destructive commands until project_goals.md, project_status.md, project_history.md, project_knowledge.md, and repo_map.md have been read.
```

If any required file is missing:

1. Stop.
2. Create the missing file using the required format.
3. If `project_history.md` is missing, create it first.
4. Record the creation of missing files in `project_history.md`.
5. Continue only after all required files exist and have been reviewed.

---

# Efficiency, navigation, and token discipline

Agents must:

- **Minimize tokens:** Use the least reading, search, tool output, and prose necessary to complete the task safely. Prefer narrow searches, partial file reads, and small diffs over whole-repo exploration or dumping large files when the task does not require it.
- **Navigate with `repo_map.md`:** Read `repo_map.md` early and follow it to entrypoints and owning directories. Do not read the entire codebase or enumerate every file by default—open only paths the map (or a targeted search) justifies.
- **Enrich `project_knowledge.md` for the next agent:** When you learn shortcuts that save time or tokens (fast validation commands, safe edit paths, folders to skip, search patterns, navigation tips), add concise bullets there. That file is for durable, reusable efficiency lessons—not for duplicating `project_history.md`.
- **`project_history.md` when logging:** To add a session entry, **append** a new block at the bottom. Do **not** read or reload the full `project_history.md` just to append. Full-file reads of history are only for tasks that truly require auditing the entire log.

---

# Local Project Files

## `project_goals.md`

This file is the project north star.

It defines what the project is trying to become, who it serves, what success looks like, and what should be avoided.

Every agent must read this file before making changes.

Update `project_goals.md` when:

- The project’s main purpose changes.
- The target user changes.
- The definition of success changes.
- The project scope expands or narrows.
- A new non-goal is discovered.
- A requested task conflicts with the current north star.
- The human explicitly says the direction has changed.

Rules:

- Keep it short.
- Keep it strategic, not implementation-heavy.
- Do not turn it into a backlog.
- Do not bury temporary tasks in this file.
- This file should guide decisions, not document every detail.
- If the north star shifts, update this file before implementation work continues.

---

## `project_status.md`

This file is the current operational snapshot of the project.

It should show:

- Current state
- Active goal
- Current priorities
- Recently completed work
- In-progress work
- Known issues
- Blockers
- Validation status
- Last validation run
- Next recommended actions

Every agent must read this file before making changes.

Update `project_status.md` when:

- Work meaningfully changes the project state.
- A priority changes.
- A task moves from in-progress to complete.
- A blocker appears or is resolved.
- A known issue is discovered or fixed.
- Validation status changes.
- A new next action becomes obvious.

Rules:

- Keep it current.
- Keep it practical.
- Do not duplicate the full work history.
- Do not turn it into a backlog dump.
- It should help the next agent understand what state the project is in right now.

---

## `project_history.md`

This file is the chronological work log for the repository.

Every completed work session must append a new entry using this exact format:

```text
HHMM DDMMYY - One line summary of what was done or changed.
Files touched:
- path/to/file1.ext
- path/to/file2.ext
- path/to/file3.ext
```

Example:

```text
1435 240426 - Added authentication middleware and updated route protection.
Files touched:
- src/middleware/auth.ts
- src/routes/login.ts
- tests/auth.middleware.test.ts
```

Rules:

- Use 24-hour time.
- Use local machine time.
- Keep the summary to one line.
- List every file created, edited, deleted, moved, or renamed.
- Do not omit documentation, config, test, script, generated source, moved, renamed, or deleted files.
- Do not include secrets, tokens, passwords, API keys, or private credentials.
- Newest entries should be appended at the bottom unless the repo already uses newest-first ordering.
- Every completed work session must have an entry before the agent reports completion.
- **Efficiency:** For routine session logging, append the new entry at the bottom **without** reading or reprinting the full file. For context at session start, read only **recent** entries (or the tail of the file), not the entire history, unless the task explicitly requires a full audit.

---

## `project_knowledge.md`

This file stores durable knowledge learned during agent sessions.

It is not a work log, backlog, repo map, or status tracker.  
It is for useful lessons that should make future agents smarter.

Every agent must read this file before making changes.

Every agent must update this file after a completed session with useful durable knowledge learned, or explicitly note that no new durable knowledge was learned.

Update `project_knowledge.md` when the agent learns:

- Important project conventions
- Gotchas or failure patterns
- Setup requirements
- Validation commands that matter
- Files that are easy to misunderstand
- Architecture decisions
- Dependency constraints
- Environment assumptions
- Known fragile areas
- Human preferences specific to this project
- Reusable debugging lessons
- Anything a future agent should know before changing code
- **Token and navigation tips:** e.g. smallest useful test/lint command, which subtrees matter for which features, paths safe to ignore for common tasks, effective `rg`/search scopes, and how to use `repo_map.md` to avoid broad codebase reads

Rules:

- Keep entries short and useful.
- Do not duplicate `project_history.md`.
- Do not use this as a backlog.
- Do not store secrets, tokens, passwords, API keys, or private credentials.
- Capture lessons that help the next agent avoid mistakes.
- If no useful durable knowledge was learned, add a no-new-knowledge entry.

---

## `repo_map.md`

This file is the living map of the codebase.

It should help any agent quickly understand:

- Where the main entry points are.
- Where core logic lives.
- Where UI components live.
- Where APIs/routes live.
- Where data/storage logic lives.
- Where scripts/tooling live.
- Where tests live.
- Where config lives.
- Which generated/runtime files matter.
- Which files are deprecated or obsolete.

Update `repo_map.md` when:

- A new code file is added.
- A code file is changed in a way that affects behavior, structure, ownership, or purpose.
- A file is moved or renamed.
- A module, service, route, component, script, test, or config file changes role.
- A public interface, API contract, schema, command, or entrypoint changes.
- A generated/runtime file becomes important enough to track.
- A file becomes deprecated or obsolete.

Rules:

- Keep descriptions short but useful.
- Update only the sections affected by the work.
- Do not turn this into full documentation.
- If a file is obsolete, mark it deprecated or remove it if deleted.
- The map must help the next agent know where to work.
- **Use this file as the primary navigation aid** before opening large subtrees or guessing paths; prefer map-guided partial reads over scanning the whole repository.

---

# Mandatory Workflow

Every agent session must follow this order:

```text
1. Read AGENTS.md.
2. Read project_goals.md.
3. Read project_status.md.
4. Skim recent project_history.md (latest entries or tail; avoid reading the entire file unless a full audit is required).
5. Read project_knowledge.md (focus sections relevant to the task if the file is long).
6. Read repo_map.md; use it to plan which code paths to open.
7. Confirm the task aligns with project_goals.md.
8. Understand the current project state from project_status.md.
9. Cross-check recent history insights against project_status.md (still avoid full history read unless needed).
10. Understand the current task; apply relevant lessons from project_knowledge.md (step 5) without rereading the whole file unless necessary.
11. Inspect only the files needed for the task (per repo_map.md and targeted search—never the whole codebase by default).
12. Make the smallest safe change.
13. Run relevant validation.
14. Update project_goals.md if the north star shifted.
15. Update project_status.md if project state changed.
16. Update project_history.md by appending one new entry at the bottom (append-only; do not full-read the file for this step).
17. Update project_knowledge.md with useful durable lessons from the session (include token/nav tips when applicable), or note that no new durable knowledge was learned.
18. Update repo_map.md if code structure changed.
19. Report what changed, what was tested, and any blockers.
```

---

# Work Rules

Agents must:

- Prefer small, controlled changes.
- Avoid broad refactors unless explicitly requested.
- **Use minimal tokens:** default to the narrowest reads, searches, and edits that still satisfy the task and safety; avoid dumping or reading entire large files or trees without cause.
- Read only the files needed for the task after the mandatory startup files; **use `repo_map.md` first** to choose those paths instead of exploratory full-repo passes.
- Preserve existing behavior unless the task requires changing it.
- Keep changes easy to review.
- Update documentation when behavior, structure, commands, config, or usage changes.
- Run the narrowest relevant validation possible.
- Clearly report validation results.
- Clearly report any blockers, risks, or assumptions.
- Stop and report the conflict if a requested task conflicts with `project_goals.md`.
- Update `project_goals.md` first if the human changes the project direction.
- Update `project_status.md` when the current project state changes.
- Update `project_history.md` for every completed work session.
- Update `project_knowledge.md` after every completed session with useful durable lessons, or explicitly stating no durable knowledge was learned.
- Update `repo_map.md` when code structure, behavior, ownership, purpose, entrypoints, APIs, schemas, config, scripts, or tests change.

---

# Validation Rules

Before reporting completion, the agent must verify:

```text
[ ] project_goals.md was reviewed
[ ] project_status.md was reviewed
[ ] project_history.md was reviewed
[ ] project_knowledge.md was reviewed
[ ] repo_map.md was reviewed
[ ] project_goals.md updated if the north star shifted
[ ] project_status.md updated if project state changed
[ ] project_history.md updated
[ ] project_knowledge.md updated with useful durable lessons, or marked as no new durable knowledge
[ ] repo_map.md updated if code files were added, moved, renamed, or behaviorally changed
[ ] Tests or validation were run, or reason for not running was documented
[ ] All changed files are listed in the final report
[ ] No unrelated files were modified
```

Validation may include, depending on the project (update `project_knowledge.md` when a canonical stack exists):

```text
npm test
npm run lint
npm run build
pytest
ruff check .
mypy .
go test ./...
cargo test
dotnet test
powershell -ExecutionPolicy Bypass -File ./scripts/validate.ps1
```

Use project-specific commands when they exist.

---

# Required Final Agent Report

At the end of the session, report:

```text
Summary:
- One-line summary of completed work.

Files changed:
- path/to/file1.ext
- path/to/file2.ext

Validation:
- Command run:
- Result:

Docs updated:
- project_goals.md:
- project_status.md:
- project_history.md:
- project_knowledge.md:
- repo_map.md:

Blockers / risks:
- None
```

If validation was not run, state why.

---

# Hard Constraints

Agents must not:

- Skip reading `project_goals.md`.
- Skip reading `project_status.md`.
- Skip the required review of `project_history.md` (but **do not** interpret this as requiring a full-file read—recent entries or tail are enough unless a full audit is needed).
- Skip reading `project_knowledge.md`.
- Skip reading `repo_map.md`.
- **Read or reload the entire `project_history.md` solely to append** a new session entry—append at the bottom without a full read.
- **Default to whole-repository reads or broad directory listing** when `repo_map.md` and targeted search can narrow the scope.
- Make code changes before reading required context.
- Make changes that conflict with `project_goals.md` without reporting the conflict.
- Allow the project north star to shift without updating `project_goals.md`.
- Allow project state to change without updating `project_status.md`.
- Finish a session without updating `project_history.md`.
- Finish a session without updating `project_knowledge.md` or explicitly stating no durable knowledge was learned.
- Store temporary task notes in `project_knowledge.md`.
- Duplicate `project_history.md` entries inside `project_knowledge.md`.
- Leave changed files undocumented.
- Update code without updating `project_history.md`.
- Add, move, rename, or behaviorally change code files without checking whether `repo_map.md` needs updates.
- Store secrets, tokens, passwords, API keys, or private credentials in repo docs.
- Commit local runtime state, generated caches, logs, databases, or machine-specific files unless explicitly required.
- Perform broad refactors unless explicitly requested.
- Delete or rename files without documenting the reason.
- Run destructive commands without explicit approval.
- Modify unrelated files while completing a task.

---

# Operating Principle

Prefer small, controlled, well-documented changes.

The project goal is the north star.  
The project status is the live snapshot.  
The project history is the audit trail.  
The project knowledge file is the durable lesson memory.  
The repo map is the navigation layer.

The next agent should be able to understand:

```text
What changed.
Why it changed.
Which files were touched.
How to validate it.
Where the related code lives.
What state the project is currently in.
What durable lessons are known.
What still needs attention.
```
````

---

*End of `setup_repo.md`.*
