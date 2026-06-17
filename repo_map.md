# Repo Map

Living navigation map for the **GameBoy** repository (DMG emulator — greenfield bootstrap).

## Entry points

- `project_goals.md` — north star and release gates
- `AGENTS.md` — canonical agent contract
- `README.md` — human overview and MCP stack
- `docs/verification-harness.md` — test/lint/build when defined
- `docs/architect-mcp.md` — Architect MCP workflow (25 tools)

## Important directories

| Path | Purpose |
|------|---------|
| `.cursor/rules/` | Cursor adapter rules (pointers; canonical = `AGENTS.md`) |
| `.cursor/skills/` | Mimir and Aion skill stubs |
| `docs/` | MCP catalogs, verification harness, continuity |
| `scripts/` | `sync-agent-rules.sh`, `audit-agent-rules.sh` |
| `project_memory/` | Navigation index only (`index.json`) |
| `.architect/` | Generated architecture/RSAL artifacts (after Architect import) |
| `.serena/` | Serena MCP project configuration |

## Planned application layout (not yet created)

| Path | Purpose |
|------|---------|
| `src/cpu/` | LR35902 CPU core |
| `src/mem/` | Memory bus and MMIO |
| `src/ppu/` | Picture processing unit |
| `src/cart/` | Cartridge and MBC |
| `src/frontend/` | Display, input, audio |
| `tests/` or `test/` | Unit and ROM tests (TBD with stack) |

## Verification commands

| Command | Status |
|---------|--------|
| `./scripts/audit-agent-rules.sh` | Agent rule compliance |
| `./scripts/sync-agent-rules.sh` | Regenerate adapters from `AGENTS.md` |
| Test/lint/build | **TBD** — no stack manifest at bootstrap |

## Runtime/config notes

- `.gitignore` excludes `.project_intel/` and `*.flock`
- Global MCP servers: `aion`, `architect`, `mimir`, `serena` via `~/.cursor/mcp.json`
- Do not hand-edit `.architect/*.json` — regenerate via Architect RSAL tools
