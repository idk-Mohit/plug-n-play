# Architecture (entry point)

**Canonical system architecture** lives in **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)**. Read that file first for layers, data flow, and evolution path.

This repo root file is a short **vision summary** only.

## Vision

Offline-first, client-side visualization engine: React + TypeScript + D3 + Jotai, with workers and WASM for heavy work. See also:

- [`docs/DATA_FLOW.md`](docs/DATA_FLOW.md) — ingestion and storage flows (note the “Implementation status” section)
- [`docs/ENGINE_PROTOCOL.md`](docs/ENGINE_PROTOCOL.md) — UI ↔ worker RPC envelope (note the “Implementation status” section)
- [`src/README.md`](src/README.md) — source layout

## Historical note

An older phased checklist lived here; it drifted from the codebase. Roadmap and status are tracked in **issues / project board** and in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (Evolution Path).
