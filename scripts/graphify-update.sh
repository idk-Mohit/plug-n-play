#!/usr/bin/env bash
# Refresh the Graphify knowledge graph after code changes (AST-only, no API cost).
# Populates graphify-out/cache/ for incremental updates.
#
# Usage:
#   pnpm graphify:update
#   bash scripts/graphify-update.sh
#   bash scripts/graphify-update.sh --force
#
# For docs/PDFs/semantic nodes, run in Cursor:  /graphify . --update
# Full rebuild (code + docs via IDE model):     /graphify .

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v graphify >/dev/null 2>&1; then
  if command -v uv >/dev/null 2>&1; then
    export PATH="${HOME}/.local/bin:${PATH}"
  fi
fi

if ! command -v graphify >/dev/null 2>&1; then
  echo "error: graphify not found. Install with: uv tool install graphifyy" >&2
  echo "       then: uv tool update-shell" >&2
  exit 1
fi

FORCE=()
if [[ "${1:-}" == "--force" ]]; then
  FORCE=(--force)
fi

echo "==> graphify update . ${FORCE[*]:-}"
if ((${#FORCE[@]})); then
  graphify update . "${FORCE[@]}"
else
  graphify update .
fi

echo ""
echo "Done. Outputs in graphify-out/:"
echo "  graph.json, GRAPH_REPORT.md, graph.html, manifest.json, cache/"
echo ""
echo "Query:  graphify query \"your question\""
echo "Docs:   run /graphify . --update in Cursor (needs IDE model for markdown/PDFs)"
echo "Note:   graphify-out/ is gitignored — keep it local"
