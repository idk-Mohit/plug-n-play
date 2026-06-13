# Knowledge map (Graphify)

Plug & Play uses **[Graphify](https://github.com/safishamsi/graphify)** (`graphifyy` on PyPI) for a queryable knowledge graph of the repo — code structure, imports, call edges, communities, and (when rebuilt with `/graphify`) semantic doc nodes.

Official README: [github.com/safishamsi/graphify](https://github.com/safishamsi/graphify)

## One-time setup

```bash
# 1. CLI (command is `graphify`, package is `graphifyy`)
uv tool install graphifyy
uv tool update-shell    # adds ~/.local/bin to PATH

# 2. Cursor integration (writes .cursor/rules/graphify.mdc)
graphify cursor install --project

# 3. Initial graph (local only — graphify-out/ is gitignored)
pnpm graphify:update
```

Repo-local agent skill (for `/graphify` in chat): `.cursor/skills/graphify/SKILL.md`

## Outputs (`graphify-out/`)

| Path | Purpose |
|------|---------|
| `graph.json` | Full graph — query with `graphify query` / `path` / `explain` |
| `GRAPH_REPORT.md` | God nodes, surprising connections, suggested questions |
| `graph.html` | Interactive visualization (open in browser) |
| `plug-n-play-callflow.html` | Mermaid architecture / call-flow (`pnpm graphify:callflow`) |
| `manifest.json` | Portable file index |
| `cache/` | **Incremental AST cache** — speeds up `graphify update` |
| `cost.json` | Local API cost log |

**`graphify-out/` is gitignored.** Each developer runs `pnpm graphify:update` after clone (or `/graphify .` in Cursor for docs). Cache stays local and speeds up subsequent updates.

## Manual update workflow (after you change code)

**Default — code only, offline, no API key:**

```bash
pnpm graphify:update
# same as: graphify update .
```

This re-extracts changed **code** files via tree-sitter, refreshes `graph.json`, `GRAPH_REPORT.md`, `graph.html`, and **`graphify-out/cache/`**.

After large refactors or if nodes look stale:

```bash
pnpm graphify:update:force
```

### When docs / architecture markdown change

`graphify update` does **not** re-run semantic extraction on `.md` files. In **Cursor chat**:

```
/graphify . --update
```

Uses your IDE model for doc nodes (no extra API key setup in headless CI). For a full rebuild including docs:

```
/graphify .
```

### Optional: architecture call-flow HTML

```bash
pnpm graphify:callflow
# opens graphify-out/<project>-callflow.html (Mermaid sections)
```

### Optional: auto-rebuild on every git commit

```bash
graphify hook install
```

AST-only post-commit refresh + `graph.json` merge driver. Re-run after upgrading graphify.

## Query the graph

Cursor loads `.cursor/rules/graphify.mdc` (`alwaysApply: true`) — agents should query before grepping:

```bash
graphify query "how does RPC reach the engine worker?"
graphify path "useDataSource" "Data.getPage"
graphify explain "MiniGrpc"
pnpm graphify:query "how does chart aggregation work?"
```

Open **`graphify-out/graph.html`** in a browser for visual exploration.

## Ignore rules

| File | Role |
|------|------|
| `.graphifyignore` | Skip `node_modules/`, `dist/`, lockfiles, etc. from the corpus |
| `.gitignore` | Ignore entire `graphify-out/` directory |

`.gitignore` is also respected when `.graphifyignore` is absent in a subtree.

## Privacy (this repo)

- **Code** → tree-sitter locally; never sent to a network.
- **Docs in `/graphify`** → semantic summaries via your Cursor model session (see Graphify README).
- Aligns with [`SECURITY.md`](../SECURITY.md): no telemetry from Graphify itself.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `graphify: command not found` | `uv tool install graphifyy && uv tool update-shell` |
| Graph feels stale after deletes | `pnpm graphify:update:force` |
| No `cache/` after update | Run `pnpm graphify:update` once; cache is created on extract/update |
| Want docs in the graph | `/graphify .` or `/graphify . --update` in Cursor |
| Rule/skill version drift | `uv tool upgrade graphifyy && graphify cursor install --project` |

## Related docs

- Cursor rule: [`.cursor/rules/graphify.mdc`](../.cursor/rules/graphify.mdc)
- Agent skill: [`.cursor/skills/graphify/SKILL.md`](../.cursor/skills/graphify/SKILL.md)
- Human architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`DATA_FLOW.md`](./DATA_FLOW.md)
