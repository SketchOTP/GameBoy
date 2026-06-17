---
name: mimir
description: Mimir memory MCP workflow — recall, search, remember, and commit concise session outcomes
---

# Mimir Workflow

Use when Mimir MCP is available.

Tool catalog: `docs/mimir-tools.md`.

Mimir is durable memory, not approval authority.

## Use Mimir For

* repo memory recall
* prior decisions
* durable constraints
* root causes
* session outcome recording
* blocker continuity
* next-step continuity

Do not use Mimir as a substitute for code inspection, tests, Architect approval, or Aion reports.

## Start

Use only when relevant to the task.

1. `memory_recall` with project/task context
2. `project_status_summary` if resuming dormant work
3. `memory_search` before creating or modifying functionality that may already exist
4. `skill_list` before reusable automation work

Skip start recall for trivial edits unless the user explicitly requests memory use.

## During

Use `memory_remember` for durable discoveries:

* confirmed root cause
* architecture decision
* important constraint
* test/validation lesson
* durable project convention

Use `reflection_log` after repeated failures or a major lesson.

Do not store temporary debugging noise.

## End

Before the final response on meaningful work, run:

```text
commit chat history to Mimir MCP memory
```

Operational meaning:

1. Call `memory_record_outcome`
2. Store a concise session outcome
3. Do not store raw full chat history
4. Do not store secrets or private data

Include:

* task
* result: COMPLETE / PARTIAL / BLOCKED
* changed files
* verification performed
* Aion session id/status if Aion was used
* Architect status if Architect was required
* blockers
* next recommended step

Completion report wording:

```text
Mimir: commit chat history to Mimir MCP memory -> yes
```

Only use `yes` if the tool succeeded.

If blocked:

```text
Mimir: commit chat history to Mimir MCP memory -> BLOCKED (<reason>)
```

Never report `no`.

## If Mimir Is Blocked

* Report the blocker
* Use repo-local fallback docs only if this repo has that convention
* Include a concise manual memory summary in the final response

## Never Store

* secrets
* credentials
* `.env`
* API keys
* raw dumps
* full files
* raw chat transcripts
* private user data
* noisy temporary details
* unverified claims

## Approval

Mimir is not approval authority.

Use Architect MCP for approval when required by repo rules.
