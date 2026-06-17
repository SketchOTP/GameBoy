# Architect MCP

On-demand reference. Load when onboarding repos, planning work, reviewing diffs, gating releases, or using RSAL advisory tooling.

Architect MCP is the **architecture authority** for supervised repos. It has two layers:

| Layer | Role | Enforcement |
|-------|------|-------------|
| **v1 supervision** | Plan, diff, release gates | **Blocking** when explicitly invoked |
| **RSAL (Repository Self-Awareness)** | Derived truth, drift, claims, impact, planning | **Advisory only** (`enforcement_active: false`) |

Coding agents implement only within approved scope. **Never self-approve.**

Configured globally in `~/.cursor/mcp.json` (server key `architect`).

Machine-readable manifest: `docs/mcp-tool-manifest.json` (25 tools).

---

## Authority boundaries

| System | Can approve plans/diffs/releases? | Can be repo truth? |
|--------|-----------------------------------|--------------------|
| Architect v1 gates | **Yes** | N/A |
| Architect RSAL (local scan) | No | **Yes** — `repository_truth.json` + RSAL artifacts |
| Mimir MCP | **No** — memory only | **No** — advisory pattern summaries only |
| Mimir RSAL patterns | No | **No** — manual lookup only; `claim_evidence_eligible: false` |

**Disabled (do not use expecting enforcement):** automatic Mimir recall, RSAL strict mode, release blocking from RSAL gates, Mimir as claim evidence.

---

## Required supervised workflow (blocking)

Use for all non-trivial implementation work:

```text
architect_start_request → architect_review_plan → implement →
architect_review_diff → architect_release_gate → commit
```

| Step | Tool | Enforcement | Gate |
|------|------|-------------|------|
| Start | `architect_start_request` | **Required** | Opens supervised request |
| Plan | `architect_review_plan` | **Blocking** | Must return `APPROVED_FOR_IMPLEMENTATION` |
| Implement | (coding agent) | — | Stay within approved file scope |
| Diff | `architect_review_diff` | **Blocking** | Must return `APPROVED` |
| Release | `architect_release_gate` | **Blocking** | Must return `RELEASE_APPROVED` |
| Commit | (git) | — | Only after release gate passes |

Stop immediately on any `REJECTED_*`, `NEEDS_*`, or `BLOCKED_*` status. Never fabricate approval statuses.

---

## RSAL cold-start protocol (required before non-trivial work)

Run after onboarding or when `.architect/` artifacts may be stale:

```text
architect_status → architect_resync_truth → architect_validate_claims →
architect_detect_drift → architect_rsal_gate_report → architect_benchmark_comprehension
```

| Tool | Enforcement | Purpose |
|------|-------------|---------|
| `architect_status` | **Required** checkpoint | Supervision state and onboarding completeness |
| `architect_resync_truth` | **Required** | Write `.architect/repository_truth.json` from live repo |
| `architect_validate_claims` | **Required** | Extract/score claims → `.architect/claim_registry.json` |
| `architect_detect_drift` | **Required** | Truth vs legacy metadata → `.architect/drift_findings.json` |
| `architect_rsal_gate_report` | **Advisory** | Dry-run gates → `.architect/rsal_gate_report.json` |
| `architect_benchmark_comprehension` | **Advisory** | Repo health score → `.architect/comprehension_benchmark.json` |

RSAL gate failures are **advisory** today — review HIGH findings; do not claim release readiness if dry-run would block.

---

## Pre-change planning (required for non-trivial edits)

Before proposing multi-file, architectural, schema, test, or claim-bearing changes:

| Tool | Enforcement | Purpose |
|------|-------------|---------|
| `architect_prepare_change_plan` | **Required** | Advisory context: impact, drift, claims, patterns, validation commands |
| `architect_impact_analysis` | **Advisory** | Preview blast radius for target file/module/stage/claim |

`architect_prepare_change_plan` runs RSAL resync by default. Optional Mimir RSAL patterns: `include_mimir_rsal_advisory=false` (default). Set `true` only when operator explicitly wants secondary Mimir advice.

Manual Mimir pattern lookup (never automatic): `architect_lookup_mimir_rsal_patterns` with `explicit_rsal: true`.

---

## Onboarding (new or existing repo)

| Step | Tool | Enforcement | Purpose |
|------|------|-------------|---------|
| 1 | `architect_init_project` | **Required** if `project_goals.md` or `.architect/` missing | Create starter state |
| 2 | `architect_import_repo` | **Required** | Scan repo; build graph and ownership map |
| 3 | `architect_generate_alignment_report` | **Required** | Goals vs reality → `.architect/alignment_report.md` |
| 4 | RSAL cold-start (above) | **Required** before feature work | Refresh derived truth |
| 5 | `architect_audit_codebase` | Optional | Baseline module/test inventory |

Expected artifacts:

```text
.architect/architecture_graph.json
.architect/ownership_map.json
.architect/architecture_state.json
.architect/alignment_report.md
.architect/repository_truth.json
.architect/claim_registry.json
.architect/drift_findings.json
.architect/rsal_gate_report.json
.architect/comprehension_benchmark.json
```

Do not start feature implementation until `architect_import_repo` and RSAL cold-start complete.

---

## Supervision workflow tools (11)

| Tool | When to use | Enforcement |
|------|-------------|-------------|
| `architect_init_project` | `project_goals.md` or `.architect/` missing | **Required** (onboarding) |
| `architect_import_repo` | After rules copied; initial or major rescan | **Required** (onboarding) |
| `architect_start_request` | Before any implementation work | **Required** |
| `architect_review_plan` | Before writing application code | **Blocking** |
| `architect_review_diff` | After coding, before claiming complete | **Blocking** |
| `architect_release_gate` | Before commit or release | **Blocking** |
| `architect_update_architecture` | After major architecture or ownership changes | **Required** when arch changes |
| `architect_generate_alignment_report` | After onboarding or structural/goal changes | **Required** after structural changes |
| `architect_audit_codebase` | Baseline or periodic architecture audit | Optional |
| `architect_watch` | Long sessions; detect scope drift vs approved plan | Optional |
| `architect_status` | Check MCP connection and onboarding state | **Required** checkpoint |

---

## RSAL advisory pipeline tools (14)

| Tool | When to use | Enforcement |
|------|-------------|-------------|
| `architect_resync_truth` | Rescan repository; refresh `repository_truth.json` | **Required** (cold-start, stale truth) |
| `architect_validate_claims` | Extract/score status-doc claims | **Required** (cold-start) |
| `architect_detect_drift` | Compare truth vs legacy metadata | **Required** (cold-start) |
| `architect_rsal_gate_report` | Dry-run release gate evaluation | Advisory (review HIGH) |
| `architect_project_legacy_metadata` | Opt-in projection to legacy `architecture_state.json` | Optional |
| `architect_impact_analysis` | Blast radius before editing a target | Advisory (pre-change) |
| `architect_benchmark_comprehension` | Score how well repo self-model matches reality | Advisory (cold-start) |
| `architect_benchmark_domain_plugins` | Calibrate stage/hardware/service/runtime plugins | Optional |
| `architect_prepare_change_plan` | Default pre-change advisory bundle | **Required** (non-trivial edits) |
| `architect_scan_cross_repo_patterns` | Detect known RSAL failure patterns | Advisory |
| `architect_calibrate_cross_repo_patterns` | Calibrate patterns across managed repos | Optional (operator) |
| `architect_export_pattern_memory` | Export sanitized patterns for Mimir ingest | Optional (operator) |
| `architect_validate_pattern_memory_export` | Validate export before external ingest | Optional (operator) |
| `architect_lookup_mimir_rsal_patterns` | Manual Mimir RSAL pattern lookup | **Explicit only** (`explicit_rsal: true`) |

---

## Generated RSAL artifacts (never hand-edit)

Regenerate via RSAL pipeline — do not manually edit `.architect/*.json`:

| Artifact | Regenerate with |
|----------|-----------------|
| `.architect/repository_truth.json` | `architect_resync_truth` |
| `.architect/claim_registry.json` | `architect_validate_claims` |
| `.architect/drift_findings.json` | `architect_detect_drift` |
| `.architect/rsal_gate_report.json` | `architect_rsal_gate_report` |
| `.architect/comprehension_benchmark.json` | `architect_benchmark_comprehension` |
| `.architect/domain_plugin_benchmark.json` | `architect_benchmark_domain_plugins` |
| `.architect/change_plan.json` | `architect_prepare_change_plan` |
| `.architect/cross_repo_pattern_findings.json` | `architect_scan_cross_repo_patterns` |
| `.architect/cross_repo_pattern_calibration.json` | `architect_calibrate_cross_repo_patterns` |
| `.architect/rsal_pattern_memory_export.json` | `architect_export_pattern_memory` |
| `.architect/alignment_report.md` | `architect_generate_alignment_report` |

---

## Watch mode

`architect_watch` monitors git changes and detects scope drift against the approved plan.

Use during long implementation sessions. If drift is detected, stop and re-run `architect_review_plan` or `architect_review_diff`.

---

## Mimir relationship

| Path | Status |
|------|--------|
| Architect queries Mimir for session memory | Normal — Mimir is memory, not approval |
| `include_mimir_rsal_advisory` in planning | Default **false** |
| `architect_lookup_mimir_rsal_patterns` | Manual only — `explicit_rsal: true` |
| Automatic Mimir recall | **Not implemented** |
| Mimir RSAL as claim evidence | **Forbidden** |

Architect local RSAL scan remains **authoritative** over Mimir advisory.

---

## Failure handling

| Status pattern | Action |
|----------------|--------|
| `REJECTED_*` | Stop. Revise plan or diff. Do not commit. |
| `NEEDS_*` | Stop. Address gaps. Re-submit. |
| `BLOCKED_*` | Stop. Report blocker. |
| MCP unavailable | Mark `BLOCKED` in completion report. Do not claim gates passed. |

---

## Cursor adapter

`.cursor/rules/05-architect-mcp.mdc` — pointer only. Canonical gates in `AGENTS.md` §11. Checks in `docs/verification-harness.md`.
