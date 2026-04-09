---
name: performance-optimization
description: >-
  Performance and optimization playbook for interactive dashboards: React render
  cost, bundle and main-thread discipline, chart and D3 hot paths, virtualization,
  and worker offload. Use when optimizing speed, fixing jank, reviewing allocations,
  or when the user mentions performance, latency, FPS, memory, or profiling.
---

# Performance and optimization (Plug & Play)

Read `.cursor/rules/40-performance-guardrails.mdc` and `docs/ENGINEERING_STANDARDS.md` first. This skill adds a deeper checklist.

## Principles

- **Measure**: reproduce with DevTools (Performance/React Profiler) before large rewrites.
- **Hot paths**: chart transforms, scales, virtualized rows, and high-frequency events (pan/zoom/resize) dominate cost.

## React and rendering

- No heavy **parse/sort/group** of large datasets in render; precompute in `src/compute/` or memoized selectors with clear inputs.
- Keep **effect** dependencies accurate; avoid accidental resubscribe every frame.
- Stabilize props to heavy children: charts, virtualized lists (`@tanstack/react-virtual`).

## D3 and charts (`src/d3-core/`)

- Avoid **per-frame allocations** in scales, axes, and series transforms.
- Precompute derived series **outside** render; pass minimal inputs into the renderer.
- Ask: “Does this create new arrays/objects every frame or every mousemove?” If yes, refactor.

## Lists and tables

- Use **virtualization** for long lists; don’t map tens of thousands of rows naively.
- Debounce or throttle expensive handlers tied to scroll/resize if needed.

## Workers and async

- Move expensive transforms and background work to **`src/engine/`** / workers per existing patterns; never block the UI thread on large synchronous work when an async path exists.

## Bundles and loading

- Prefer **lazy loading** for large optional UI when it matches project patterns.
- Avoid importing heavy modules in files that load on every route if split points already exist.

## Quick regression checklist

- [ ] Pan/zoom/resize: smooth, no runaway allocations in Profiler
- [ ] Changing props to charts doesn’t rebuild unrelated subtrees
- [ ] No new `useEffect` loops (state ping-pong)
- [ ] `pnpm lint` and `pnpm build` still pass
