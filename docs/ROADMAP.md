# Plug & Play — Product Roadmap

> **North star:** A browser-native, local-first, P2P-collaborative dashboard where data never leaves your environment.
>
> Target: any org that cannot upload data to SaaS — healthcare, finance, legal, EU-GDPR, research, defense.

---

## How to read this

Each phase is independently shippable. **Implement one numbered slice at a time** — see **`AGENTS.md` → Incremental delivery** and add **`docs/plans/<slice>.md`** before coding.

**Landed in repo (engine layer):**

| Slice | Status |
|-------|--------|
| **1d** Global filters | Engine + `globalFiltersAtom` + `FilterPanel` component; charts read filters via `useDatasetSlice`. UI mount TBD in a separate plan. |
| **1f** Query planner | `planQuery` + `Data.executeQuery` |
| **1g** Worker task queue | `PriorityTaskQueue` in worker dispatch |

Everything else in Phase 1+ below is **planned, not implemented**.

The current focus is **Phase 1** — one slice per PR, starting from **1a** when ready.

---

## Current state (as of Jun 2026)

**What works today**

| Area | Status |
|------|--------|
| Memory-bounded `DataSource` (sliding window, backpressure, abort) | Done — `src/core/data-source/` |
| `MiniGrpc` RPC with cancel envelopes | Done — `src/core/rpc/` |
| Engine worker (IndexedDB, LTTB/minMax/mean streaming aggregations) | Done — `src/engine/` |
| D3 chart engine (line, area, scatter, bar) | Done — `src/d3-core/` |
| Fine-grained Jotai atoms (per-chart viewport, layout, toast) | Done — `src/state/` |
| Paged table virtualization (`useDataSource`) | Done — `src/hooks/` |
| Activity / system monitor | Done — `src/containers/activity/` |
| WASM stub wired | Done — `src/compute/wasm/` |
| OPFS utils scaffolded | Scaffolded — `src/core/storage/opfs.utils.ts` |

**What's missing (gap analysis)**

| Area | Gap |
|------|-----|
| Dashboard management | One implicit dashboard; no create/rename/delete/switch |
| Chart layout | Fixed layout; no add/remove/resize charts per dashboard |
| Chart-to-dataset binding | Global `activeDatasetAtom`; all charts share one dataset |
| Filter system | **Partial** — `FilterDefinition`, worker filtering, `globalFiltersAtom`; UI component exists, not on Home |
| Query planner | **Done** — `src/engine/query.planner.ts`, `Data.executeQuery` |
| Worker task queue | **Done** — `src/engine/task-queue.ts` |
| Shareable state | Dashboards live only in local memory; no export/import |
| Collaboration | Nothing yet |
| Canvas/WebGL tier | SVG only; no renderer fallback for large datasets |

---

## Phase 1 — Single-user dashboard product

> **Goal:** A proper dashboard product that one person can use every day. Every feature here is independently useful and also required before Phase 2 (sharing) makes sense.

### 1a. Multi-dashboard management

Users can create, name, rename, delete, and switch between dashboards. Each dashboard is an independent layout.

**What to build**
- `Dashboard` entity persisted in IndexedDB via the engine worker:
  - New RPC methods: `Data.saveDashboard`, `Data.loadDashboard`, `Data.listDashboards`, `Data.deleteDashboard`
  - Typed in `data-contract.ts`
- `dashboardsAtom` (Jotai) — list of all saved dashboards
- `activeDashboardAtom` — the current dashboard being viewed/edited
- Sidebar: dashboard list, new dashboard button, rename/delete actions
- Route per dashboard (URL fragment: `#/dashboard/:id`)

**Key files**
- `src/core/rpc/data-contract.ts` — add `DashboardRecord` type
- `src/engine/services/dashboard.service.ts` — new
- `src/state/data/dashboard.ts` — new Jotai atoms
- `src/containers/dashboard/` — update to load from atom

### 1b. Dynamic chart layout

Users can add, remove, and resize chart panels within a dashboard. Layout is saved with the dashboard.

**What to build**
- `PanelLayout` type: array of `{ id, type, datasetId, chartSettings, gridPosition }` per dashboard
- Drag-and-drop resize using `react-resizable-panels` (already in `package.json`)
- "Add panel" button → chart type selector → spawns a new panel
- "Remove panel" (X button per panel)
- Layout serializes into `DashboardRecord` and persists

**Key files**
- `src/state/ui/layout.ts` — extend with dynamic panel list
- `src/containers/dashboard/DashboardLayout.tsx` — replace fixed layout with `PanelLayout`
- `src/components/charts/ChartPanel.tsx` — add remove/configure actions

### 1c. Per-chart dataset selection

Each chart panel independently chooses its dataset. Replaces the global `activeDatasetAtom` pattern.

**What to build**
- Remove `activeDatasetAtom` as global selection; make it per-panel
- `panelDatasetAtomFamily(panelId)` — dataset binding per panel
- "Choose dataset" picker in the chart header or settings drawer
- Dashboard default dataset (inherited if panel has none set)

**Why this matters for later:** a CRDT document in Phase 3 syncs panel configurations — if each panel independently tracks its dataset, the sync document is clean.

**Key files**
- `src/state/data/dataset.ts` — remove global activeDataset, or reduce to dashboard default
- `src/state/ui/chart-setting.ts` — add `datasetId` to per-chart settings
- `src/hooks/useDatasetSlice.ts` — take `datasetId` as arg instead of reading global atom

### 1d. Global filter panel

A filter panel that applies to all charts in the current dashboard simultaneously.

**What to build**
- `FilterDefinition` type: `{ field: string, op: 'eq' | 'gt' | 'lt' | 'between' | 'contains', value: unknown }`
- `dashboardFiltersAtom` — list of active filters for the current dashboard
- Filter panel UI: add/remove filter chips, date range picker, value range slider
- Wire filters into `Data.getAggregated` and `Data.getRange` calls (extend `data-contract.ts`)
- Charts re-query when filters change

**Key files**
- `src/state/data/filters.ts` — new
- `src/components/filters/FilterPanel.tsx` — new
- `src/core/rpc/data-contract.ts` — add `filters` field to `DataGetAggregatedArgs`, `DataGetRangeArgs`
- `src/engine/services/data.service.ts` — apply filters in `getAggregated`, `getRange`

### 1e. More chart types

Expand beyond cartesian timeseries to cover common BI use cases.

**Priority order**

| Chart | Complexity | Value |
|-------|-----------|-------|
| Stat / KPI card (single number + delta) | Low | High — every dashboard needs KPIs |
| Histogram (count by bucket) | Low | High — frequency distributions |
| Bar (categorical, not timeseries) | Medium | High — groupBy results |
| Pie / donut (categorical share) | Medium | Medium |
| Data table panel (reuse `useDataSource`) | Low | High — raw data view |
| Composite line (multiple series overlaid) | Medium | Medium |

**Key files**
- `src/enums/chart.enums.ts` — extend `ChartType`
- `src/d3-core/charts/` — new chart directories per type
- `src/engine/services/data.service.ts` — add `Data.getCategorical` for groupBy aggregation
- `src/core/rpc/data-contract.ts` — add `DataGetCategoricalArgs`

### 1f. Query planner (engineering)

A thin planning layer in the worker that routes queries based on filters + viewport. No full optimizer — just explicit routing.

**What to build**
- `queryPlanner(request: QueryRequest): ExecutionPlan` — decides call sequence
- Routes: `getPage` (table/no filter), `getRange` (time-filtered), `getAggregated` (charted view), `getCategorical` (groupBy)
- Passes filter args down to correct IDB cursor range
- Enables future: add indexes, columnar path, cost-based switching

**Key files**
- `src/engine/query.planner.ts` — new
- `src/engine/engine.worker.ts` — dispatch through planner instead of direct routes
- `src/core/rpc/data-contract.ts` — `QueryRequest` union type

### 1g. Worker task queue

Priority queue inside the engine worker. Viewport-driven requests preempt background prefetches.

**What to build**
- Simple priority queue: `HIGH` (viewport/interaction) vs `NORMAL` (prefetch) vs `LOW` (background)
- Versioned tasks: each task has a `version`; cancel stale tasks when version is superseded
- Backpressure-aware: integrates with `DataSource.maxInflight`

**Key files**
- `src/engine/task-queue.ts` — new `PriorityTaskQueue` class
- `src/engine/engine.worker.ts` — dispatch all incoming RPC through the queue

### 1h. Dashboard persistence & export

Save the full dashboard state to IndexedDB. Export/import as a `.pnp` JSON file.

**What to build**
- `DashboardSerializer` — serialize the dashboard atom snapshot to JSON (layout, chart configs, filter state, dataset references)
- Auto-save on every meaningful state change (debounced)
- Export button → download `.pnp` file
- Import button → parse, validate, load into IndexedDB
- "Last edited" timestamp shown in sidebar

**Why this comes before sharing:** the serializer built here is reused verbatim in Phase 2 (shareable URL) and Phase 3 (CRDT document).

**Key files**
- `src/core/serializer/dashboard-serializer.ts` — new
- `src/state/data/dashboard.ts` — auto-save effect
- `src/components/header/` — export/import buttons

---

## Phase 2 — Shareable dashboards (no backend)

> **Goal:** "Send this dashboard to anyone" — via URL or file. No live network. No backend.

- Export dashboard state as a compressed `#fragment` URL (fragment never sent to servers)
- Recipient opens link → read-only render (data not included; they bring their own or import a bundled dataset)
- "Fork to edit" → clones state into their local IndexedDB
- `.pnp` file sharing (dashboard + embedded dataset snapshot for small datasets)

**Depends on:** 1a (dashboard record), 1h (serializer), 1c (per-panel dataset binding)

---

## Phase 3 — P2P real-time collaboration

> **Goal:** Multiple people, same dashboard, data never leaves the room.

### Architecture

```
Device A          relay (signaling only)         Device B
[Yjs doc] ←→ [WebRTC data channel] ←→ [Yjs doc]
                  (ICE handshake)
```

Datasets are never in the relay. Only the CRDT document (layout + chart configs + filter state, ~1–10 KB) travels peer-to-peer over an encrypted WebRTC data channel.

### Steps
- **3a.** CRDT document (Yjs `Y.Map`) bound two-way to Jotai atoms
- **3b.** Room-based transport: create room → share link + optional password → WebRTC data channel
- **3c.** Presence layer: cursors, selected chart, follow-mode (Yjs awareness protocol)
- **3d.** Optional self-hostable relay (~50 lines WebSocket signaling, no data stored)

**Key decision before starting:** Yjs (stable, battle-tested) vs Loro (Rust/WASM, fits our WASM setup, faster — but newer). Recommend Yjs for 3a–3b, revisit Loro for 3d+ when it matures.

**Depends on:** Phase 2 serializer, 1a dashboard record model

---

## Phase 4 — Rendering scale

> **Goal:** Handle datasets that SVG cannot. No user-visible API change.

### Tiered renderer contract

Define a `Renderer` interface: `mount(el, config)`, `draw(data, scales)`, `pick(x, y)`, `dispose()`.
Current SVG/D3 implements it. Canvas 2D and WebGL satisfy the same interface.

| Dataset size | Renderer | Performance |
|-------------|----------|-------------|
| < 500 points | SVG (current) | Accessibility, CSS, easy |
| 500–10K | Canvas 2D | 10–50× faster than SVG |
| 10K–1M+ | WebGL / WebGPU | GPU-accelerated |

Auto-switch based on `rowCount` from dataset meta. User can override per chart.

### OPFS workspace

Replace IndexedDB row store with OPFS for large datasets (hundreds of GB capacity). `src/core/storage/opfs.utils.ts` is already scaffolded — extend it. Makes `.pnp` bundles with large datasets practical.

**Depends on:** Renderer interface refactor (does not require Phase 2/3)

---

## Phase 5 — Live data connectors (deliberately deferred)

Connectors pull you toward being a backend product. Build after the base is solid.

- SQL database connections (user's browser connects directly; credentials never leave device)
- REST / WebSocket API polling
- CSV/JSON streaming ingestion
- All connections respect the local-first privacy contract

---

## Execution order

Start Phase 1 top-to-bottom. Each item unblocks the next.

```
1a dashboard management
 └─ 1b dynamic layout
     └─ 1c per-chart dataset
         ├─ 1d filter panel
         │   └─ 1f query planner
         │       └─ 1g worker task queue
         └─ 1e more chart types
         └─ 1h persistence + export
              └─ Phase 2 (shareable)
                   └─ Phase 3 (P2P)
```

Phase 4 (rendering) is parallel — can start after 1e chart types without blocking Phase 2/3.

---

## What "done" looks like for Phase 1

- A user can open the app and create a named dashboard
- They can add charts of different types, each pointing to a different dataset
- They can apply global filters and see all charts update
- They can resize/rearrange the layout
- Their dashboard persists across page refreshes
- They can export it as a `.pnp` file and import it on another machine

At that point the product is real for a single user — and Phase 2 (sharing it) becomes a natural next step.
