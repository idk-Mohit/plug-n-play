# Agent Quick Context (start here)

This repo is **Plug & Play**: a performance-first dashboard + charting engine built with **Vite + React + TypeScript**, **D3**, **Jotai**, **Tailwind + shadcn/ui**, and a **compute layer** (workers/WASM-ready).

## What to read first (in order)

- `README.md`: product vision + goals
- `src/README.md`: folder map and core principles
- `src/core/`: infrastructure (RPC, storage, data-engine)
- `src/state/`: Jotai atoms + UI/data state
- `src/d3-core/`: charting engine (scales, axes, renderer, charts)
- `src/compute/` + `src/engine/`: heavy compute and worker plumbing

## Local commands

- `pnpm dev`: run the app
- `pnpm lint`: lint
- `pnpm build`: typecheck + build

## Optional agent skills (repo-local)

Task-specific playbooks live in `.cursor/skills/*/SKILL.md` (e.g. frontend UI, system design, React patterns, performance). Stack truth stays here and in `.cursor/rules/`; skills add situational depth the model can apply when relevant.

## Project conventions (high-signal)

- **Imports**: use the `@/` alias (see `tsconfig.json`, `vite.config.ts`).
- **UI**: prefer components in `src/components/ui/` (shadcn-style) and composition in `src/components/` + `src/containers/`.
- **State**: prefer fine-grained Jotai atoms; avoid “god” atoms that invalidate large subtrees.
- **Performance**: avoid per-render allocations in hot paths (renderers, chart transforms, table virtualization).
- **Heavy compute**: keep it out of React render; consider `src/compute/` and workers in `src/engine/`.

## What “done” looks like for changes

- **Type-safe** and passes `pnpm lint` / `pnpm build`
- **No new render loops** or expensive effects
- **No unnecessary re-renders** (especially in charts / large lists)

