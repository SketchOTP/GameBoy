# MCP usage in Cursor

On-demand reference for Cursor MCP workflows. Canonical contract: `AGENTS.md`.

## Aion MCP (v0.3)

**Use Aion to run goal:** call `aion_run_goal` with `goal`, `project_root`, and optional `mode`.

**Cursor command:** `/aion` — see `.cursor/commands/aion.md`.

**Set mode:** `aion_set_mode` or `/aion set mode <value>`

**Get mode:** `aion_get_mode` or `/aion get mode`

**Inspect sessions:** `aion_get_status`, `aion_get_report`, `aion_list_sessions`

### Execution modes (1–10)

Numeric: `1` `2` `3` `4` `5` `6` `7` `8` `9` `10`

Aliases:

| Alias | Maps to |
|---|---|
| `fast` | `1` |
| `balanced` | `5` |
| `deep` | `8` |
| `max` | `10` |
| `auto` | Aion chooses `1`–`10` per goal |

Mode controls available depth (research, planning, Builder autonomy, Tester depth, artifacts, validation). It does not force unnecessary work.

### When to use Aion

Use when the user says “Use Aion,” “run Aion,” `/aion`, or asks to plan/build/validate/report a bounded repo task.

Do not use for trivial one-file edits, pure explanations, or when the user says not to use Aion.

Architect is **not** required to invoke Aion or set/get mode.

Details: `.cursor/rules/08-aion.mdc`, `.cursor/skills/aion/SKILL.md`

## Mimir MCP

Durable memory — recall, search, `memory_record_outcome`.

**commit chat history to Mimir MCP memory** means store a concise session outcome via `memory_record_outcome`, not a raw chat transcript.

Mimir is memory only, not approval authority.

Details: `.cursor/rules/04-mimir.mdc`, `.cursor/skills/mimir/SKILL.md`, `docs/mimir-tools.md`

## Architect MCP

Drift/plan/diff/release review for non-trivial **direct** code changes when required.

v1 gates block when invoked/required. RSAL is advisory unless repo rules say otherwise.

Architect is not required for Aion invocation, Aion mode get/set, reading Aion reports, trivial edits, or docs-only edits.

Details: `docs/architect-mcp.md`, `.cursor/rules/05-architect-mcp.mdc`

## Other MCPs

| MCP | Role |
|---|---|
| Serena | Symbol-level code navigation — `docs/serena-tools.md` |
| cocoindex-code | Semantic code search — `docs/cocoindex-code.md` |

Global MCP config: `~/.cursor/mcp.json`.
