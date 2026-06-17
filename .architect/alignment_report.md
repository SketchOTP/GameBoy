# Alignment Report

> **Advisory only (RSAL Phase 2).** This report is a view over `repository_truth.json`. It is not enforcement-active and does not override derived truth.

## Goal Alignment

Status: **ALIGNED**

## Derived Repository Truth

Truth artifact present: **yes**
Truth freshness (matches HEAD): **no**
Truth generated at: 2026-06-17T14:10:05.730002+00:00
Source commit: None
Scanner version: 0.3.0

Modules: 0
Test files: 0
Docs: 24
Scripts: 2
Artifacts: 10

## Knowledge Graph Edges

- depends_on: 0
- documents: 0
- documents_stage: 0
- evidences: 0
- maps_to: 0
- owns: 0
- runs_service: 0
- stage_depends_on: 0
- stage_has_status: 0
- tests: 0
- validates: 0

## Legacy Architecture State (informational)

Legacy architecture_state.json present: **yes**
Legacy module_count: 0
Legacy test_count (test files): 0

## Godot / GDScript Coverage

Godot project detected: **no**
GDScript modules: 0
Godot scenes: 0
Unsupported/unmapped files: 12

## Ownership Alignment

Status: **NEEDS_MAPPING**
Modules mapped: 0

## Decision Alignment

Status: **NO_DECISIONS**
Active request: none
Approved plan: none

## Metadata Drift Summary

Enforcement active: **false**
Metadata drift findings: 3
Scope drift log entries: 0

- **DOC_COUNT_DRIFT** (MEDIUM): observed=0, expected=24
- **SCRIPT_COUNT_DRIFT** (MEDIUM): observed=0, expected=2
- **ARTIFACT_COUNT_DRIFT** (MEDIUM): observed=0, expected=10

## RSAL Dry-Run Release Gate (Advisory)

> **RSAL enforcement is inactive.** Gate result is advisory only.

Overall would block (dry-run): **no**
Gate checks would block: **0** (advisory-only findings: 1)

- All enforceable dry-run gate checks passed
## Cross-Repo Pattern Advisory Summary

> **Advisory only (RSAL Phase 7C).** Pattern matches are not blockers. `enforcement_active: false`

**Promoted matches:** 0
**Candidate matches:** 0
**Deferred/noisy matches:** 1

### Promoted patterns
- none

### Candidate patterns
- none

### Deferred / noisy patterns
- `rsal.alignment.stale_report` (confidence 0.88, scope=diagnostic)
  - affected: `.architect/alignment_report.md`

### Recommended remediations
- Run architect_generate_alignment_report to refresh goals-vs-reality view
- Run architect_generate_alignment_report to refresh the goals-vs-reality view.

### False-positive notes
- Alignment report regenerated between drift scan and truth resync.
- Repos without alignment_report.md are not evaluated.

**enforcement_active:** false


## Risk Assessment

- No elevated risk zones identified

## Recommendations

- Run architect_resync_truth — repository_truth.json is stale
- Review drift_findings.json and reconcile legacy metadata views
- Update ownership map via architect_update_architecture

## Global Rules

Loaded 349 rules from 19 sources
