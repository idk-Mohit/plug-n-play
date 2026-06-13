# Agent Quick Context (start here)

This repo is **Plug & Play**: a performance-first dashboard + charting engine built with **Vite + React + TypeScript**, **D3**, **Jotai**, **Tailwind + shadcn/ui**, and a **compute layer** (workers/WASM-ready).

## What to read first (in order)

- `README.md`: product vision + goals
- **`docs/UI_THEME.md`**: compact dashboard UI theme (shadcn + Tailwind + drawer patterns) — **read before building or polishing UI**
- **`docs/ROADMAP.md`**: product phases and what is planned vs landed — **read before multi-step features**
- **`docs/plans/`**: one plan file per PR-sized slice — **write before coding**
- `src/README.md`: folder map and core principles
- `src/core/`: infrastructure (RPC, storage, data-engine)
- `src/state/`: Jotai atoms + UI/data state
- `src/d3-core/`: charting engine (scales, axes, renderer, charts)
- `src/compute/` + `src/engine/`: heavy compute and worker plumbing
- `SECURITY.md`: security & privacy posture (local-first, no telemetry, supply-chain policy)

## Local commands

- `pnpm dev`: run the app
- `pnpm lint`: lint
- `pnpm build`: typecheck + build
- `pnpm test`: vitest
- **`pnpm graphify:update`**: refresh code knowledge graph → `graphify-out/` + `cache/` (no API key)
- **`pnpm graphify:query -- "question"`**: query `graphify-out/graph.json`
- **Parallel branches:** `docs/GIT_WORKTREES.md` — `pnpm worktree:add -- <branch>` (defaults to branching from **`dev`**; interactive prompt or `--from-current` / `--base`)

## Cursor rules (the strict guardrails)

Rules in `.cursor/rules/` are loaded automatically by Cursor. The numbered series:

- **`00-project-context`** (always) — stack + navigation
- **`10-react-typescript-standards`** — `src/**/*.{ts,tsx}`
- **`20-state-jotai`** — `src/state/**`
- **`30-d3-core`** — `src/d3-core/**`
- **`40-performance-guardrails`** — `src/**/*.{ts,tsx}`
- **`50-security-privacy`** (always) — no telemetry, no secrets, treat inputs as hostile
- **`55-dependency-policy`** (always) — pinned exact versions, supply-chain hygiene (post Shai-Hulud)
- **`60-frontend-quality`** — accessibility, motion, content, anti-AI-slop aesthetics (Vercel WIG + frontend-design)
- **`70-react-vite-performance`** — Vite-only subset of Vercel React best practices
- **`80-data-handling`** — RPC contracts, worker boundary, storage discipline
- **`graphify`** (always) — query `graphify-out/graph.json` before grepping; see `docs/KNOWLEDGE_MAP.md`

## Optional agent skills (repo-local)

Task-specific playbooks live in `.cursor/skills/*/SKILL.md` (e.g. **graphify**, frontend UI, system design, React patterns, performance). Stack truth stays here and in `.cursor/rules/`; skills add situational depth the model can apply when relevant.

### Finish workflows (post-slice)

See **`docs/workflows.md`**. Invoke explicitly after a focused diff:

| Workflow | When |
|----------|------|
| **add-docs** | JSDoc + comments for changed files only |
| **update-test** | Vitest coverage for changed behavior |
| **add-commit** | Draft commit message from diff; commit only when you explicitly ask |

Recommended before commit: **update-test** → **add-docs** → **add-commit** → `pnpm lint` / `pnpm build`.

## Project conventions (high-signal)

- **Imports**: use the `@/` alias (see `tsconfig.json`, `vite.config.ts`).
- **UI**: prefer components in `src/components/ui/` (shadcn-style) and composition in `src/components/` + `src/containers/`; follow **`docs/UI_THEME.md`** for spacing, type scale, panels, and forms.
- **State**: prefer fine-grained Jotai atoms; avoid “god” atoms that invalidate large subtrees.
- **Performance**: avoid per-render allocations in hot paths (renderers, chart transforms, table virtualization).
- **Heavy compute**: keep it out of React render; consider `src/compute/` and workers in `src/engine/`.
- **Privacy by default**: no telemetry, no external network calls without explicit opt-in; user data never leaves the browser (see `SECURITY.md`).
- **Dependencies pinned exactly**: `.npmrc` enforces `save-exact=true`. No `^` or `~` in `package.json`. See `.cursor/rules/55-dependency-policy.mdc`.

## What “done” looks like for changes

- **Type-safe** and passes `pnpm lint` / `pnpm build`
- **No new render loops** or expensive effects
- **No unnecessary re-renders** (especially in charts / large lists)

## Incremental delivery (required)

**Never implement multiple roadmap phases or product features in one pass.** Each change should be one focused slice that can be reviewed, tested, and shipped independently.

Before any multi-step feature:

1. Write or update a plan in **`docs/plans/<feature>.md`** (or extend **`docs/ROADMAP.md`** with a link to a sub-plan).
2. Break work into **single-purpose PR-sized chunks** (e.g. “1d filters engine only”, then “1d filter UI mount”, not both plus dashboards).
3. **Do not combine** engine plumbing, new UI surfaces, persistence, and collaboration in the same diff.
4. **Do not mount new UI** (sidebars, rooms, share bars, multi-dashboard chrome) until that slice’s plan explicitly includes UX placement.
5. After each slice lands, run **`pnpm test`** / **`pnpm build`** before starting the next plan item.
6. Before commit: **`update-test`** → **`add-docs`** → **`add-commit`** (see **`docs/workflows.md`**).

When in doubt: smaller diff, clearer plan, one todo at a time.

