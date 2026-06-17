# Verification Harness

On-demand reference. Load when running tests, fixing bugs, or claiming work is verified.

---

## Change → Verification Matrix

| Change | Verification |
|---|---|
| Logic | Unit test |
| Flow | Integration test |
| Typed code | Typecheck |
| Frontend/package | Build |
| Schema | Migration validation |
| CLI/runtime | Smoke run |
| Bug fix | Reproduce → test → fix root cause → retest |
| Aion task | Aion session status + `aion_get_report` + project tests when applicable |

Never game tests. Do not hard-code test values, weaken assertions, mock away the behavior being tested, add fake test-only fallbacks, or change tests to match broken code unless the test is proven wrong.

If tests cannot run, report: command attempted, exact blocker, what remains unverified. Never say tests passed if they were not run.

---

## Architect MCP Checks (v1 supervision — blocking)

Before claiming implementation complete or ready to commit, verify Architect MCP gates (global server `architect` in `~/.cursor/mcp.json`):

| Check | Tool / artifact | Expected |
|---|---|---|
| MCP connected | Cursor MCP panel | `architect` server green |
| Project goals | `project_goals.md` at repo root | File exists |
| Repo onboarded | `architect_import_repo` | `.architect/architecture_graph.json`, `.architect/ownership_map.json` |
| Plan approved | `architect_review_plan` | `APPROVED_FOR_IMPLEMENTATION` |
| Diff approved | `architect_review_diff` | `APPROVED` |
| Release approved | `architect_release_gate` | `RELEASE_APPROVED` |

If any gate fails, stop and report the Architect MCP status — do not commit or release.

**Workflow:** `architect_start_request` → `architect_review_plan` → implement → `architect_review_diff` → `architect_release_gate` → commit.

Details: `AGENTS.md` §8, `docs/architect-mcp.md`, `.cursor/rules/05-architect-mcp.mdc`.

---

## RSAL Advisory Checks (non-blocking)

Review before claiming repo health or release readiness. RSAL does **not** block commits today (`enforcement_active: false`).

| Check | Tool / artifact | Action |
|---|---|---|
| Truth fresh | `architect_resync_truth` → `repository_truth.json` | Re-run if stale vs HEAD |
| Claims scored | `architect_validate_claims` → `claim_registry.json` | Review unsupported claims |
| Drift reviewed | `architect_detect_drift` → `drift_findings.json` | Fix HIGH metadata drift |
| Dry-run gates | `architect_rsal_gate_report` → `rsal_gate_report.json` | Review would-block findings |
| Comprehension | `architect_benchmark_comprehension` | Target healthy or usable_with_caution |
| Pre-change plan | `architect_prepare_change_plan` | Required for non-trivial edits |

Do not manually edit `.architect/*.json` — regenerate via RSAL pipeline tools.

---

## MCP Readiness Checklist

Before starting supervised work in a bootstrapped repo:

| Check | How to verify |
|---|---|
| Aion connected | Cursor MCP panel — server `aion` green; or `aion_get_mode` succeeds |
| Architect connected | Cursor MCP panel — server `architect` green; or `architect_status` |
| Mimir connected | Cursor MCP panel — server `mimir` green; or `memory_recall` succeeds |
| Serena connected | Cursor MCP panel — server `serena` green; or `initial_instructions` succeeds |
| cocoindex-code connected | Cursor MCP panel — server `cocoindex-code` green; or `search` succeeds |
| `project_goals.md` present | Repo root — canonical name only (not `PROJECT_GOAL.md` / `project_goal.md`) |
| Architecture import run | `architect_import_repo` completed; `.architect/architecture_graph.json` exists |
| RSAL cold-start run | `repository_truth.json`, `claim_registry.json`, `drift_findings.json` present |
| Memory sync run | Mimir `memory_recall` / `project_bootstrap` completed |
| Code index/search available | cocoindex-code `search` returns results; Serena `get_symbols_overview` works on entry file |

If any check fails, complete onboarding per `setup_repo.md` §5c or `EXISTING_REPO.md` before feature work.

Details: `docs/architect-mcp.md`, `docs/mimir-tools.md`, `docs/serena-tools.md`, `docs/cocoindex-code.md`.

---

## GameBoy Project Commands

Greenfield bootstrap — no application test/lint/build yet. Use agent-rule scripts until a stack manifest exists.

| Command | Purpose | Status |
|---------|---------|--------|
| `./scripts/audit-agent-rules.sh` | Agent rule compliance | **Active** |
| `./scripts/sync-agent-rules.sh` | Regenerate adapters | **Active** |
| `cargo test` / `make test` / `npm test` | Application tests | **TBD** (no manifest) |

When `Cargo.toml`, `Makefile`, or `package.json` is added, update this table and `AGENTS.md` §15.

---

## Verifier Registry

Inspect manifest files before inventing commands:

| Signal file | Commands |
|---|---|
| `package.json` | Read `scripts` first → `npm`/`pnpm`/`yarn` test, lint, build |
| `pyproject.toml` | `pytest`; `ruff` / `mypy` if configured |
| `Cargo.toml` | `cargo test`; `cargo clippy` if configured |
| `go.mod` | `go test ./...` |
| `Makefile` | `make help` or inspect targets before running |
| `.github/workflows/` | Reference CI plan for canonical commands |

**Output contract:**

- Failure: return ≤20 lines of relevant error (not full log dump)
- Success: one-line confirmation
- Max 3 fix-and-retest loops → `BLOCKED` + report

---

## Anti-Stuck Loop

- Do not re-run the same failing command more than twice without a new hypothesis
- After 2 failed fix loops: `BLOCKED` or escalate to debugging
- Do not add semantic stuck-detectors unless false-positive rate is near zero

---

## Anti-Overmocking

Prefer behavior/integration tests over excessive mocks.

Mocks allowed only at external boundaries: network, filesystem, clock, paid APIs, hardware.

If adding mocks, state why a real fixture or integration test is impractical.

---

## Debugging Escalation

If two test-fix loops fail without new evidence:

- Stop guessing at the same edit site
- Add focused logging, inspect runtime state, or use debugger/instrumentation
- Do not continue editing without `INSPECTED` or `TESTED` new evidence

---

## Lucky-Pass Guard

On bug fixes: reproduce the failure before editing. A passing test after blind retries is not sufficient verification — confirm the fix addresses the observed failure mode.
