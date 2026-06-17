#!/usr/bin/env bash
# Audit agent instruction layout for universal-2026-Q2-v5 compliance.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MAX_AGENTS_LINES=150
MAX_ADAPTER_LINES=10
MAX_CURSORRULES_LINES=15
MAX_CORE_MDC_LINES=25
FAIL=0

fail() { echo "FAIL: $1"; FAIL=1; }
pass() { echo "PASS: $1"; }

check_adapter() {
  local name="$1"
  if [[ ! -e "$name" ]]; then
    fail "$name missing"
    return
  fi
  if [[ -L "$name" ]]; then
    local target
    target="$(readlink "$name")"
    if [[ "$target" == "AGENTS.md" ]]; then
      pass "$name is symlink to AGENTS.md"
    else
      fail "$name symlink does not point to AGENTS.md (points to $target)"
    fi
  elif [[ -f "$name" ]]; then
    local lines
    lines=$(wc -l < "$name" | tr -d ' ')
    if [[ "$lines" -gt "$MAX_ADAPTER_LINES" ]]; then
      fail "$name has $lines lines (max $MAX_ADAPTER_LINES unless symlink)"
    else
      pass "$name ≤$MAX_ADAPTER_LINES lines (pointer)"
    fi
  else
    fail "$name exists but is neither file nor symlink"
  fi
}

# --- AGENTS.md ---

if [[ ! -f AGENTS.md ]]; then
  fail "AGENTS.md missing"
else
  pass "AGENTS.md exists"

  if head -1 AGENTS.md | grep -q '^Combined below'; then
    fail "AGENTS.md still has old preamble"
  else
    pass "AGENTS.md has no old preamble"
  fi

  if grep -q '^````markdown' AGENTS.md; then
    fail "AGENTS.md has outer markdown fence"
  else
    pass "AGENTS.md has no outer markdown fence"
  fi

  AGENTS_LINES=$(wc -l < AGENTS.md | tr -d ' ')
  if [[ "$AGENTS_LINES" -gt "$MAX_AGENTS_LINES" ]]; then
    if [[ -f docs/rule-changelog.md ]] && grep -qE "${AGENTS_LINES} lines|265 lines|176 lines" docs/rule-changelog.md 2>/dev/null; then
      pass "AGENTS.md $AGENTS_LINES lines (changelog documents exception)"
    else
      fail "AGENTS.md has $AGENTS_LINES lines (max $MAX_AGENTS_LINES without docs/rule-changelog.md entry)"
    fi
  else
    pass "AGENTS.md ≤$MAX_AGENTS_LINES lines ($AGENTS_LINES)"
  fi

  if grep -q '| Tool | When to use |' AGENTS.md; then
    fail "AGENTS.md contains tool catalog table"
  else
    pass "AGENTS.md has no inlined tool catalog"
  fi

  if ! grep -q 'universal-2026-Q2-v5' AGENTS.md; then
    fail "AGENTS.md missing universal-2026-Q2-v5 version marker"
  else
    pass "AGENTS.md has universal-2026-Q2-v5"
  fi

  if grep -qE 'universal-2026-Q2-v3|universal-2026-Q2-v4' AGENTS.md; then
    fail "AGENTS.md contains stale v3/v4 contract version"
  else
    pass "AGENTS.md has no stale v3/v4 version marker"
  fi

  if ! grep -q 'aion_run_goal' AGENTS.md; then
    fail "AGENTS.md missing aion_run_goal"
  else
    pass "AGENTS.md documents aion_run_goal"
  fi

  if grep -q '"tool".*"aion_run_goal"' AGENTS.md; then
    fail "AGENTS.md shows tool inside aion argument payload"
  else
    pass "AGENTS.md aion payload excludes tool field"
  fi

  if ! grep -q 'commit chat history to Mimir MCP memory' AGENTS.md; then
    fail "AGENTS.md missing Mimir concise-outcome phrase"
  else
    pass "AGENTS.md documents commit chat history concise outcome"
  fi

  if ! grep -q 'Lazy Senior Developer' AGENTS.md; then
    fail "AGENTS.md missing Lazy Senior Developer rule"
  else
    pass "AGENTS.md has Lazy Senior Developer rule"
  fi

  if ! grep -q 'ponytail:' AGENTS.md; then
    fail "AGENTS.md missing ponytail comment rule"
  else
    pass "AGENTS.md has ponytail comment rule"
  fi

  if ! grep -q 'Architect is not required for invoking Aion' AGENTS.md; then
    fail "AGENTS.md must state Architect not required for Aion"
  else
    pass "AGENTS.md Architect exception for Aion documented"
  fi

  if grep -q 'No implementation until Architect MCP' AGENTS.md; then
    fail "AGENTS.md has obsolete universal Architect blocker wording"
  else
    pass "AGENTS.md has no obsolete universal Architect blocker"
  fi

  if ! grep -q '## 7. Mimir Memory' AGENTS.md; then
    fail "AGENTS.md missing Mimir Memory section"
  else
    pass "AGENTS.md has Mimir Memory section"
  fi

  if ! grep -q '## 2. Aion Workflow' AGENTS.md; then
    fail "AGENTS.md missing Aion Workflow section"
  else
    pass "AGENTS.md has Aion Workflow section"
  fi

  if ! grep -q 'Trivial task exception' AGENTS.md; then
    fail "AGENTS.md trivial task exception missing"
  else
    pass "AGENTS.md has trivial task exception"
  fi

  if grep -q 'four byte-for-byte identical' AGENTS.md; then
    fail "AGENTS.md still requires four byte-identical files"
  else
    pass "AGENTS.md has no four-file mirror requirement"
  fi
fi

# --- Cross-agent adapters ---

check_adapter CLAUDE.md
check_adapter GEMINI.md

# --- .cursorrules ---

if [[ ! -f .cursorrules ]]; then
  pass ".cursorrules absent (acceptable)"
else
  if ! grep -q 'GENERATED\|Legacy compatibility\|do not edit' .cursorrules; then
    fail ".cursorrules exists but is not marked GENERATED stub"
  else
    pass ".cursorrules is GENERATED stub"
  fi
  CURSORRULES_LINES=$(wc -l < .cursorrules | tr -d ' ')
  if [[ "$CURSORRULES_LINES" -gt "$MAX_CURSORRULES_LINES" ]]; then
    fail ".cursorrules has $CURSORRULES_LINES lines (max $MAX_CURSORRULES_LINES)"
  else
    pass ".cursorrules ≤$MAX_CURSORRULES_LINES lines"
  fi
fi

# --- 00-core-contract.mdc (pointer only) ---

CORE_MDC=".cursor/rules/00-core-contract.mdc"
if [[ ! -f "$CORE_MDC" ]]; then
  fail "$CORE_MDC missing"
else
  if ! head -5 "$CORE_MDC" | grep -q '^---'; then
    fail "$CORE_MDC missing YAML frontmatter"
  else
    pass "$CORE_MDC has valid frontmatter"
  fi

  CORE_LINES=$(wc -l < "$CORE_MDC" | tr -d ' ')
  if [[ "$CORE_LINES" -gt "$MAX_CORE_MDC_LINES" ]]; then
    fail "$CORE_MDC has $CORE_LINES lines (max $MAX_CORE_MDC_LINES — must be pointer only)"
  else
    pass "$CORE_MDC is tiny pointer ($CORE_LINES lines)"
  fi

  if grep -q '## 0. Authority' "$CORE_MDC" || grep -q '## 1. Core Rule' "$CORE_MDC"; then
    fail "$CORE_MDC full-duplicates AGENTS.md body"
  else
    pass "$CORE_MDC does not duplicate AGENTS.md body"
  fi
fi

# --- Adapter file content guards ---

ADAPTER_FILES=(CLAUDE.md GEMINI.md .cursorrules "$CORE_MDC")
for f in "${ADAPTER_FILES[@]}"; do
  [[ -f "$f" || -L "$f" ]] || continue
  if [[ -L "$f" ]]; then
    continue
  fi
  if grep -q '## 0. Authority' "$f" 2>/dev/null || grep -q '## 1. Core Rule' "$f" 2>/dev/null; then
    fail "$f contains full AGENTS.md duplicate text"
  fi
  if grep -q 'THE COMMANDMENTS OF THE CODE' "$f" 2>/dev/null || \
     grep -q 'Do no harm you cannot justify' "$f" 2>/dev/null; then
    fail "$f inlines commandments body"
  fi
  if grep -q '| Tool | When to use |' "$f" 2>/dev/null || \
     grep -q '| `memory_recall`' "$f" 2>/dev/null; then
    fail "$f inlines Mimir tool catalog"
  fi
done
pass "adapter files do not inline commandments or Mimir catalog"

# --- Old monolithic rule file must be gone ---

if [[ -f .cursor/rules/00-project-contract.mdc ]]; then
  fail ".cursor/rules/00-project-contract.mdc still exists (rename to 00-core-contract.mdc)"
else
  pass "no legacy 00-project-contract.mdc"
fi

# --- Required docs ---

for f in docs/mcp-tool-manifest.json docs/mimir-tools.md docs/architect-mcp.md docs/serena-tools.md docs/cocoindex-code.md docs/verification-harness.md docs/project-continuity.md docs/rule-changelog.md docs/usage/mcp_cursor.md; do
  if [[ ! -f "$f" ]]; then
    fail "$f missing"
  else
    pass "$f exists"
  fi
done

# --- Serena adapter ---

SERENA_MDC=".cursor/rules/06-serena.mdc"
if [[ ! -f "$SERENA_MDC" ]]; then
  fail "$SERENA_MDC missing"
else
  pass "$SERENA_MDC exists"
fi

if [[ -f docs/serena-tools.md ]] && ! grep -q 'initial_instructions' docs/serena-tools.md; then
  fail "docs/serena-tools.md missing initial_instructions reference"
else
  pass "serena-tools documents Serena tools"
fi

# --- cocoindex-code adapter ---

COCO_MDC=".cursor/rules/07-cocoindex-code.mdc"
if [[ ! -f "$COCO_MDC" ]]; then
  fail "$COCO_MDC missing"
else
  pass "$COCO_MDC exists"
fi

if [[ -f docs/cocoindex-code.md ]] && ! grep -q '`search`' docs/cocoindex-code.md; then
  fail "docs/cocoindex-code.md missing search tool reference"
elif [[ -f docs/cocoindex-code.md ]] && grep -qE '`(index|lookup|search_code|semantic_search|find_code|code_search)`' docs/cocoindex-code.md; then
  fail "docs/cocoindex-code.md references non-exposed cocoindex tools"
else
  pass "cocoindex-code doc references search only"
fi

if [[ -f .cursor/rules/07-cocoindex-code.mdc ]] && grep -qE '`(index|lookup|search_code|find_code|code_search)`' .cursor/rules/07-cocoindex-code.mdc; then
  fail ".cursor/rules/07-cocoindex-code.mdc references non-exposed cocoindex tools"
else
  pass "cocoindex-code adapter references search only"
fi

# --- Mimir adapter ---

MIMIR_MDC=".cursor/rules/04-mimir.mdc"
if [[ ! -f "$MIMIR_MDC" ]]; then
  fail "$MIMIR_MDC missing"
else
  pass "$MIMIR_MDC exists"
fi

# --- Aion adapter ---

AION_MDC=".cursor/rules/08-aion.mdc"
AION_SKILL=".cursor/skills/aion/SKILL.md"
AION_CMD=".cursor/commands/aion.md"

if [[ ! -f "$AION_MDC" ]]; then
  fail "$AION_MDC missing"
else
  pass "$AION_MDC exists"
  if grep -q '"tool".*"aion_run_goal"' "$AION_MDC"; then
    fail "$AION_MDC shows tool inside argument payload"
  else
    pass "$AION_MDC aion payload excludes tool field"
  fi
  if ! grep -q 'aion_run_goal' "$AION_MDC"; then
    fail "$AION_MDC missing aion_run_goal"
  else
    pass "$AION_MDC documents aion_run_goal"
  fi
fi

if [[ ! -f "$AION_SKILL" ]]; then
  fail "$AION_SKILL missing"
else
  pass "$AION_SKILL exists"
fi

if [[ ! -f "$AION_CMD" ]]; then
  fail "$AION_CMD missing"
else
  pass "$AION_CMD exists"
fi

if [[ -f docs/usage/mcp_cursor.md ]] && ! grep -q 'aion_run_goal' docs/usage/mcp_cursor.md; then
  fail "docs/usage/mcp_cursor.md missing aion_run_goal"
elif [[ -f docs/usage/mcp_cursor.md ]] && ! grep -qE 'fast|balanced|deep|max|auto' docs/usage/mcp_cursor.md; then
  fail "docs/usage/mcp_cursor.md missing Aion mode aliases"
elif [[ -f docs/usage/mcp_cursor.md ]] && ! grep -q '/aion' docs/usage/mcp_cursor.md; then
  fail "docs/usage/mcp_cursor.md missing /aion command"
else
  pass "docs/usage/mcp_cursor.md documents Aion Cursor usage"
fi

if [[ -f "$CORE_MDC" ]] && ! grep -q '08-aion.mdc' "$CORE_MDC"; then
  fail "$CORE_MDC missing Aion MCP pointer"
else
  pass "$CORE_MDC references Aion MCP adapter"
fi

# --- Architect MCP adapter ---

ARCH_MDC=".cursor/rules/05-architect-mcp.mdc"
if [[ ! -f "$ARCH_MDC" ]]; then
  fail "$ARCH_MDC missing"
else
  pass "$ARCH_MDC exists"
fi

if [[ -f docs/verification-harness.md ]] && ! grep -q 'Architect MCP Checks' docs/verification-harness.md; then
  fail "docs/verification-harness.md missing Architect MCP checks section"
else
  pass "verification-harness documents Architect MCP checks"
fi

if [[ -f docs/mimir-tools.md ]] && ! grep -q 'Mimir vs Architect MCP' docs/mimir-tools.md; then
  fail "docs/mimir-tools.md missing Mimir vs Architect MCP clarification"
else
  pass "mimir-tools clarifies Mimir vs Architect MCP"
fi

if [[ -f docs/architect-mcp.md ]] && ! grep -q 'architect_review_plan' docs/architect-mcp.md; then
  fail "docs/architect-mcp.md missing workflow tools"
else
  pass "architect-mcp documents workflow"
fi

if [[ -f docs/mimir-tools.md ]] && grep 'session outcome recorded: no' docs/mimir-tools.md | grep -qv 'Never report'; then
  fail "docs/mimir-tools.md encourages session outcome recorded: no"
else
  pass "mimir-tools does not encourage session outcome recorded: no"
fi

if [[ -f "$MIMIR_MDC" ]] && ! grep -q 'commit chat history to Mimir MCP memory' "$MIMIR_MDC"; then
  fail "$MIMIR_MDC missing concise-outcome phrase"
else
  pass "$MIMIR_MDC documents commit chat history concise outcome"
fi

if [[ -f "$ARCH_MDC" ]] && ! grep -q 'Architect is not required for' "$ARCH_MDC"; then
  fail "$ARCH_MDC missing Architect not-required exceptions"
else
  pass "$ARCH_MDC documents Architect not-required exceptions"
fi

if [[ -f .cursor/rules/02-implementation.mdc ]] && ! grep -q 'Lazy Senior Developer' .cursor/rules/02-implementation.mdc; then
  fail "02-implementation.mdc missing Lazy Senior Developer rule"
elif [[ -f .cursor/rules/02-implementation.mdc ]] && ! grep -q 'ponytail:' .cursor/rules/02-implementation.mdc; then
  fail "02-implementation.mdc missing ponytail rule"
else
  pass "02-implementation.mdc has Lazy Senior and ponytail rules"
fi

# --- project_goals.md canonical naming ---

if [[ ! -f project_goals.md ]]; then
  fail "project_goals.md missing at repo root"
else
  pass "project_goals.md exists (canonical goal file)"
fi

if [[ -f PROJECT_GOAL.md ]] || [[ -f project_goal.md ]]; then
  fail "legacy goal file present (use project_goals.md only)"
else
  pass "no legacy PROJECT_GOAL.md / project_goal.md files"
fi

# --- No active legacy goal file references ---

LEGACY_GOAL_HITS=0
LEGACY_GOAL_EXCLUDE=(
  './docs/rule-changelog.md'
  './scripts/audit-agent-rules.sh'
  './docs/architect-mcp.md'
  './docs/verification-harness.md'
  './EXISTING_REPO.md'
)
while IFS= read -r hit; do
  [[ -z "$hit" ]] && continue
  skip=0
  for ex in "${LEGACY_GOAL_EXCLUDE[@]}"; do
    if [[ "$hit" == "$ex:"* ]]; then
      skip=1
      break
    fi
  done
  [[ "$skip" -eq 1 ]] && continue
  LEGACY_GOAL_HITS=1
  fail "active legacy goal reference: $hit"
done < <(grep -rn 'PROJECT_GOAL\.md\|project_goal\.md' . --exclude-dir=.git 2>/dev/null || true)

if [[ "$LEGACY_GOAL_HITS" -eq 0 ]]; then
  pass "no active legacy PROJECT_GOAL.md / project_goal.md references"
fi

# --- Reject active stale contract versions ---

CONTRACT_HITS=0
CONTRACT_EXCLUDE=(
  './docs/rule-changelog.md'
  './docs/audits'
  './scripts/audit-agent-rules.sh'
  './EXISTING_REPO.md'
  './setup_repo.md'
)
while IFS= read -r hit; do
  [[ -z "$hit" ]] && continue
  skip=0
  for ex in "${CONTRACT_EXCLUDE[@]}"; do
    if [[ "$hit" == "$ex:"* ]] || [[ "$hit" == *"$ex"* ]]; then
      skip=1
      break
    fi
  done
  [[ "$skip" -eq 1 ]] && continue
  if echo "$hit" | grep -qE 'Historical|historical|deprecated|Do not copy'; then
    continue
  fi
  CONTRACT_HITS=1
  fail "active stale contract reference: $hit"
done < <(grep -rn 'universal-2026-Q2-v3\|universal-2026-Q2-v4' . --exclude-dir=.git 2>/dev/null || true)

if [[ "$CONTRACT_HITS" -eq 0 ]]; then
  pass "no active universal-2026-Q2-v3/v4 references"
fi

STALE_BLOCKER_HITS=0
while IFS= read -r hit; do
  [[ -z "$hit" ]] && continue
  skip=0
  for ex in "${CONTRACT_EXCLUDE[@]}"; do
    if [[ "$hit" == "$ex:"* ]] || [[ "$hit" == *"$ex"* ]]; then
      skip=1
      break
    fi
  done
  [[ "$skip" -eq 1 ]] && continue
  if echo "$hit" | grep -qE 'Historical|historical|deprecated|Do not copy|rg -n'; then
    continue
  fi
  STALE_BLOCKER_HITS=1
  fail "active obsolete Architect universal blocker: $hit"
done < <(grep -rn 'No implementation until Architect MCP approves\|No implementation until Architect approves' . --exclude-dir=.git 2>/dev/null || true)

if [[ "$STALE_BLOCKER_HITS" -eq 0 ]]; then
  pass "no active obsolete universal Architect blocker wording"
fi

# --- MCP references in hot-path docs ---

if [[ -f README.md ]] && ! grep -q 'Aion MCP' README.md; then
  fail "README.md missing Aion MCP role"
else
  pass "README.md documents Aion MCP"
fi

if [[ -f README.md ]] && ! grep -q 'Serena MCP' README.md; then
  fail "README.md missing Serena MCP role"
else
  pass "README.md documents Serena MCP"
fi

if [[ -f README.md ]] && ! grep -q 'cocoindex-code MCP' README.md; then
  fail "README.md missing cocoindex-code MCP role"
else
  pass "README.md documents cocoindex-code MCP"
fi

if [[ -f docs/verification-harness.md ]] && ! grep -q 'MCP Readiness Checklist' docs/verification-harness.md; then
  fail "docs/verification-harness.md missing MCP readiness checklist"
else
  pass "verification-harness documents MCP readiness checklist"
fi

if [[ -f docs/project-continuity.md ]] && ! grep -q '\.architect/' docs/project-continuity.md; then
  fail "docs/project-continuity.md missing .architect/ continuity layer"
else
  pass "project-continuity documents .architect/ state"
fi

if [[ -f "$CORE_MDC" ]] && ! grep -q '06-serena.mdc' "$CORE_MDC"; then
  fail "$CORE_MDC missing Serena MCP pointer"
else
  pass "$CORE_MDC references Serena MCP adapter"
fi

if [[ -f "$CORE_MDC" ]] && ! grep -q '07-cocoindex-code.mdc' "$CORE_MDC"; then
  fail "$CORE_MDC missing cocoindex-code MCP pointer"
else
  pass "$CORE_MDC references cocoindex-code MCP adapter"
fi

# --- setup_repo.md conflicts ---

if [[ -f setup_repo.md ]]; then
  if grep -q 'four byte-for-byte identical' setup_repo.md; then
    fail "setup_repo.md still requires four byte-identical files"
  else
    pass "setup_repo.md has no four-file mirror requirement"
  fi

  if grep -q 'Every completed work session must append' setup_repo.md && \
     ! grep -q 'Mimir BLOCKED\|Mimir is BLOCKED\|when Mimir' setup_repo.md; then
    fail "setup_repo.md still forces every-session project_history append unconditionally"
  else
    pass "setup_repo.md does not force unconditional every-session project_*.md updates"
  fi
fi

# --- COMMANDMENTS (optional values layer; not hot path) ---

if [[ -f COMMANDMENTS_OF_THE_CODE.md ]]; then
  pass "COMMANDMENTS_OF_THE_CODE.md exists"

  if grep -q 'COMMANDMENTS_OF_THE_CODE' AGENTS.md; then
    if grep -q 'THE COMMANDMENTS OF THE CODE' AGENTS.md || \
       grep -q 'Do no harm you cannot justify' AGENTS.md; then
      fail "AGENTS.md inlines commandments (pointer only allowed)"
    else
      pass "AGENTS.md references commandments as deep pointer only"
    fi
  elif [[ -f setup_repo.md ]] && grep -q 'COMMANDMENTS_OF_THE_CODE' setup_repo.md; then
    fail "AGENTS.md missing commandments deep reference (bootstrap template expects it)"
  fi
elif grep -q 'COMMANDMENTS_OF_THE_CODE' AGENTS.md; then
  fail "AGENTS.md references COMMANDMENTS_OF_THE_CODE.md but file missing"
else
  pass "COMMANDMENTS_OF_THE_CODE.md absent (optional for non-template repos)"
fi

# --- Hooks (optional; not enabled by default) ---

if [[ -f .cursor/hooks.json ]]; then
  fail ".cursor/hooks.json exists (hooks are optional and not enabled by default)"
else
  pass "no hooks.json"
fi

# --- Template hygiene (no source-repo residue in copied files) ---

SOURCE_PATH_ALLOWLIST=(README.md setup_repo.md)
FORBIDDEN_RESIDUE=(
  '/home/sketch/Projects/general'
  'home/sketch?projects/general'
  '60505f9'
  '344b1f5'
  'df51dc6'
  'cost-router telemetry'
  'routing_decisions.jsonl'
  'Combined below from the universal contract'
  'hermes-chat'
  'P0+P1'
  'P3 hooks'
)

HYGIENE_FILES=(
  AGENTS.md
  COMMANDMENTS_OF_THE_CODE.md
  .cursorrules
  repo_map.md
  project_goals.md
  project_status.md
  project_knowledge.md
  project_history.md
  project_memory/index.json
  notes.md
  project_daily_summaries.md
  .gitignore
)

while IFS= read -r -d '' mdc; do HYGIENE_FILES+=("$mdc"); done < <(find .cursor/rules -name '*.mdc' -print0 2>/dev/null)
[[ -f .cursor/skills/mimir/SKILL.md ]] && HYGIENE_FILES+=(".cursor/skills/mimir/SKILL.md")
[[ -f .cursor/skills/aion/SKILL.md ]] && HYGIENE_FILES+=(".cursor/skills/aion/SKILL.md")
for doc in docs/*.md; do [[ -f "$doc" ]] && HYGIENE_FILES+=("$doc"); done
[[ -f scripts/sync-agent-rules.sh ]] && HYGIENE_FILES+=("scripts/sync-agent-rules.sh")

for rel in "${HYGIENE_FILES[@]}"; do
  [[ -f "$rel" ]] || continue
  for allowed in "${SOURCE_PATH_ALLOWLIST[@]}"; do
    [[ "$rel" == "$allowed" ]] && continue 2
  done
  for pattern in "${FORBIDDEN_RESIDUE[@]}"; do
    if grep -qF "$pattern" "$rel" 2>/dev/null; then
      fail "template residue in $rel: contains '$pattern'"
    fi
  done
done
pass "no forbidden template residue in copied/hot-path files"

# --- MCP tool manifest vs docs and live descriptors ---

MANIFEST="docs/mcp-tool-manifest.json"
if [[ ! -f "$MANIFEST" ]]; then
  fail "$MANIFEST missing"
else
  pass "$MANIFEST exists"
  if ! command -v python3 >/dev/null 2>&1; then
    fail "python3 required for MCP tool manifest audit"
  else
    MCP_AUDIT_OUT=$(python3 - "$ROOT" "$MANIFEST" <<'PY'
import glob
import json
import os
import re
import sys

root, manifest_path = sys.argv[1], sys.argv[2]
errors = []
notes = []
manifest = json.load(open(os.path.join(root, manifest_path), encoding="utf-8"))

for server, cfg in manifest.get("servers", {}).items():
    doc_rel = cfg.get("doc")
    doc_path = os.path.join(root, doc_rel)
    if not os.path.isfile(doc_path):
        errors.append(f"{doc_rel} missing for server {server}")
        continue
    doc_text = open(doc_path, encoding="utf-8").read()
    for tool in cfg.get("tools", []):
        if f"`{tool}`" not in doc_text:
            errors.append(f"{doc_rel} missing documented tool `{tool}`")

    # cocoindex-code: docs must not claim extra tools beyond manifest
    if server == "cocoindex-code":
        claimed = set(re.findall(r"`([a-z][a-z0-9_]*?)`", doc_text))
        allowed = set(cfg.get("tools", []))
        extra = sorted(t for t in claimed if t not in allowed and t not in {
            "offset", "limit", "languages", "paths", "refresh_index", "query",
            "rg", "find_symbol", "find_referencing_symbols", "search_for_pattern",
            "read_file", "project_knowledge.md", "07-cocoindex-code.mdc",
        })
        if extra:
            errors.append(f"{doc_rel} claims cocoindex tools beyond manifest: {', '.join(extra)}")

# Live descriptor check (best-effort across Cursor project caches)
cursor_projects = os.path.expanduser("~/.cursor/projects")
live_checked = 0
for server, cfg in manifest.get("servers", {}).items():
    desc_dir = cfg.get("descriptor_dir")
    pattern = os.path.join(cursor_projects, "*", "mcps", desc_dir, "tools", "*.json")
    live_tools = sorted({os.path.splitext(os.path.basename(p))[0] for p in glob.glob(pattern)})
    if not live_tools:
        continue
    live_checked += 1
    manifest_tools = set(cfg.get("tools", []))
    live_set = set(live_tools)
    missing_live = sorted(manifest_tools - live_set)
    extra_live = sorted(live_set - manifest_tools)
    if missing_live:
        notes.append(f"live {server} missing manifest tools (refresh MCP / restart Cursor): {', '.join(missing_live)}")
    if extra_live:
        notes.append(f"live {server} exposes undocumented tools (update manifest/docs): {', '.join(extra_live)}")

if errors:
    print("FAIL")
    for e in errors:
        print(e)
else:
    print("PASS")
    print(f"live_descriptor_servers_checked={live_checked}")
    for n in notes:
        print(f"NOTE: {n}")
PY
)
    if echo "$MCP_AUDIT_OUT" | head -1 | grep -q '^PASS'; then
      LIVE_N=$(echo "$MCP_AUDIT_OUT" | grep -o 'live_descriptor_servers_checked=[0-9]*' | cut -d= -f2)
      pass "MCP tool manifest matches docs (live descriptors checked: ${LIVE_N:-0} servers)"
      while IFS= read -r note; do
        [[ -z "$note" ]] && continue
        echo "NOTE: ${note#NOTE: }"
      done <<< "$(echo "$MCP_AUDIT_OUT" | grep '^NOTE:' || true)"
    else
      while IFS= read -r line; do
        [[ "$line" == "FAIL" || -z "$line" ]] && continue
        fail "MCP manifest: $line"
      done <<< "$MCP_AUDIT_OUT"
    fi
  fi
fi

echo "---"
if [[ "$FAIL" -eq 0 ]]; then
  echo "AUDIT: PASS"
  exit 0
else
  echo "AUDIT: FAIL"
  exit 1
fi
