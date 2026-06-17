# cocoindex-code MCP

On-demand reference. Load when exploring unfamiliar codebases or searching by meaning rather than exact text.

cocoindex-code provides **semantic code search and indexing** across the repository. Use for broad discovery; use Serena for symbol-level inspection and edits.

Configured globally in `~/.cursor/mcp.json` (server key `cocoindex-code`).

---

## When to Use cocoindex-code

| Situation | Use cocoindex-code |
|---|---|
| "How does authentication work?" | `search` with natural language |
| Find related code without knowing names | `search` |
| Explore unfamiliar repo during onboarding | `search` with small `limit`, paginate |
| Locate exact symbol for edit | Switch to Serena `find_symbol` |
| Text/regex match on known string | `rg` or Serena `search_for_pattern` |

---

## Exposed Tools (1)

| Tool | When to use |
|---|---|
| `search` | Semantic code search — natural language or code snippet queries |

### `search` Parameters

| Parameter | Purpose |
|---|---|
| `query` | Natural language or code snippet (required) |
| `limit` | Max results (default 5; max 100) |
| `offset` | Pagination offset |
| `refresh_index` | Incrementally update index before search (default true) |
| `languages` | Filter by language, e.g. `["python", "typescript"]` |
| `paths` | Filter by glob patterns, e.g. `["src/utils/*"]` |

Returns: file path, language, content chunk, start/end line, relevance score.

---

## Indexing / Search Workflow

```text
1. Confirm cocoindex-code connected (Cursor MCP panel)
2. search(query="…", limit=5) — start small
3. Review top results; note file paths and line ranges
4. Switch to Serena for symbol-level inspection of hits
5. read target files narrowly (Serena read_file or editor)
6. If results insufficient, paginate with offset or refine query
```

**Performance:** Set `refresh_index: false` for consecutive queries when codebase unchanged.

**Onboarding:** During new/existing repo bootstrap, run exploratory `search` queries to map major subsystems; document findings in Mimir or `project_knowledge.md` (fallback only).

---

## How It Complements Serena

| Layer | Tool | Strength |
|---|---|---|
| Broad discovery | cocoindex-code `search` | Meaning-based; finds related code without exact keywords |
| Precise navigation | Serena `find_symbol`, `find_referencing_symbols` | LSP-accurate symbols, refs, renames |
| Text patterns | `rg`, Serena `search_for_pattern` | Exact string/regex when keywords known |

Typical flow: **cocoindex-code** narrows scope → **Serena** grounds symbols → **edit** → **verify**.

Do not rely on chat memory alone — ground discoveries in search results and file reads.

---

## Cursor Adapter

`.cursor/rules/07-cocoindex-code.mdc` — pointer only.
