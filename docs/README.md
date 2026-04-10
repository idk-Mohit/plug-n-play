# Technical documentation

This folder holds **authoritative** technical docs for Plug & Play. **Canonical architecture:** [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Documents in this repo

| Document | Purpose |
|----------|---------|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | System design, layers, scalability |
| [`DATA_FLOW.md`](DATA_FLOW.md) | How data moves from sources to charts |
| [`ENGINE_PROTOCOL.md`](ENGINE_PROTOCOL.md) | RPC / worker message shapes |
| [`ENGINEERING_STANDARDS.md`](ENGINEERING_STANDARDS.md) | How we build (lint, perf, UI) |

## Planned / not yet in tree

The following are **not** present as files today; add them when you implement the content:

- `API_REFERENCE.md` — public / internal API surface
- `TESTING.md` — test strategy and commands
- `DEPLOYMENT.md` — build and deploy
- `SECURITY.md` — threat model and practices
- `PERFORMANCE.md` — profiling workflow and budgets
- `CONTRIBUTING.md` — contributor workflow

## Maintenance

When you change behavior, update the relevant doc in the same PR. Prefer short, accurate docs over aspirational ones.

*Documentation set last reviewed with the codebase: 2026.*
