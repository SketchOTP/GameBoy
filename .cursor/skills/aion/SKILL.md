---
name: aion
description: Aion MCP workflow — run bounded goals through Aion, inspect status, reports, modes, and sessions
---

# Aion Workflow

Use when the user asks to run Aion or when a bounded repo task benefits from orchestration, validation, artifacts, and memory.

Aion is workflow orchestration, not approval authority.

## Trigger Phrases

Use Aion when the user says:

* `Use Aion...`
* `Run Aion...`
* `/aion ...`
* `have Aion handle this`
* `use the agent workflow`
* `plan/build/validate/report this`

Do not use Aion for trivial one-file edits, pure explanations, or when the user explicitly says not to use Aion.

## Tools

### `aion_run_goal`

Run a bounded goal.

Arguments:

```json
{
  "goal": "<user goal>",
  "project_root": "<current workspace root>",
  "mode": "<optional explicit mode>"
}
```

If no mode is specified, omit `mode` and let Aion use saved/default mode.

### `aion_get_status`

Inspect an existing session.

### `aion_get_report`

Read final report and artifact paths.

### `aion_list_sessions`

List recent sessions.

### `aion_set_mode`

Set project mode.

### `aion_get_mode`

Read current project mode.

## Modes

Supported values:

```text
1 2 3 4 5 6 7 8 9 10
fast balanced deep max auto
```

Aliases:

```text
fast     -> 1
balanced -> 5
deep     -> 8
max      -> 10
auto     -> Aion chooses 1-10 per goal
```

Mode controls available depth across research, planning, Builder autonomy, Tester depth, reporting detail, artifacts, budgets, validation, and phase count.

Mode does not force unnecessary work.

## Cursor Usage

For `/aion set mode <value>`:

```text
call aion_set_mode
```

For `/aion get mode`:

```text
call aion_get_mode
```

For all other `/aion ...` requests:

```text
call aion_run_goal
```

Always pass current workspace root as `project_root`.

## After Aion Runs

1. Read returned status
2. Call `aion_get_report` if needed
3. Summarize:

   * session id
   * status
   * changed files
   * validation result
   * final report path
4. Do not manually continue implementation unless the user asks

If Aion reports `partial_fail`, `blocked`, or `failed`, report that honestly.

## Completion Report

Include:

```text
Aion: <session id/status>
```

If Aion was not used:

```text
Aion: not used (<reason>)
```

## Mimir Interaction

Aion writes its own session artifacts and memory writeback.

Still commit the conversation outcome to Mimir when available:

```text
commit chat history to Mimir MCP memory
```

Store only a concise outcome, not raw chat.
