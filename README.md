# GameBoy

Greenfield **Game Boy (DMG) emulator** project with universal agent governance (`universal-2026-Q2-v5`).

## Status

Bootstrap phase — agent rules and MCP onboarding complete; application code not yet started. See `project_goals.md` and `project_status.md`.

## Agent stack

| Layer | Role |
|-------|------|
| **Aion MCP** | Bounded goal orchestration (modes 1–10) |
| **Architect MCP** | Architecture authority — v1 gates when required + RSAL advisory |
| **Mimir MCP** | Long-term memory and session outcomes |
| **Serena MCP** | Symbol-level code navigation |
| **cocoindex-code MCP** | Semantic code search (when connected) |
| **`AGENTS.md`** | Canonical repo contract for coding agents |

## Quick start (humans)

```bash
./scripts/sync-agent-rules.sh
./scripts/audit-agent-rules.sh
```

Read `AGENTS.md` before making changes. For Architect workflow details: `docs/architect-mcp.md`.

## Project docs

- `project_goals.md` — goals, non-goals, release gates
- `repo_map.md` — structure and entry points
- `docs/verification-harness.md` — verification commands (updated as stack is chosen)
