# Plug & Play — Product Roadmap

> **North star:** A browser-native, local-first, P2P-collaborative dashboard where data never leaves your environment.
>
> Target: any org that cannot upload data to SaaS — healthcare, finance, legal, EU-GDPR, research, defense.

---

## How to read this

Each phase is independently shippable. **Implement one numbered slice at a time** — see **`AGENTS.md` → Incremental delivery** and add **`docs/plans/<slice>.md`** before coding.

**Status legend:** ✅ Done · 🟡 Partial · ⬜ Not started

**Landed in repo** (`dev` @ `b907faf`, Jun 2026):

| Slice | Status | Notes |
|-------|--------|-------|
| **1d** Global filters | 🟡 Partial | Per-viz `vizFiltersAtomFamily` + worker filtering; charts/tables slice shared dataset independently. **Remaining:** mount `FilterPanel` per panel; optional dashboard-wide filter pass. |
| **1f** Query planner | 🟡 Partial | `planQuery` + `Data.executeQuery` RPC + tests. **Remaining:** optional client migration to `executeQuery`; `getCategorical` route when **1e** lands. |
| **1g** Worker task queue | 🟡 Partial | `PriorityTaskQueue` + version supersession in worker dispatch + tests. **Remaining:** integrate with `DataSource.maxInflight` backpressure. |

Everything else in Phase 1+ below is **⬜ planned, not implemented**.

### Pending — core first (recommended order)

Build the single-user dashboard foundation before sharing, collaboration, or render tiers.

| Order | Slice | Why now |
|-------|-------|---------|
| **1** | **1a** Multi-dashboard (partial) | Create/list/switch landed; next: rename/delete, then **1b** layout. |
| **2** | **1b** Dynamic chart layout | Panels need per-dashboard layout records. |
| **3** | **1c** Per-chart data slice config | Field mapping (x/y columns), transforms — same dataset, different columns per panel. |
| **4** | **1d-ui** Filter panel mount | Wire `FilterPanel` with `vizId` per chart/table panel. |
| **5** | **1h** Dashboard persistence & export | Auto-save + `.pnp` export; serializer reused in Phase 2. |
| **6** | **1e** More chart types | KPI, histogram, categorical bar, etc. — after layout + dataset binding exist. |

**Defer until Phase 1 core is solid:** Phase 2 (share URL), Phase 3 (P2P), Phase 4 (Canvas/WebGL/OPFS), Phase 5 (connectors).

**Next action:** write `docs/plans/phase-1b-dynamic-layout.md`, then implement **1b only**.

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
| Dashboard management | 🟡 **Partial** — create/list/switch + manifest persistence; layout per dashboard pending (1b) |
| Chart layout | Fixed layout; no add/remove/resize charts per dashboard |
| Chart-to-dataset binding | Global `activeDatasetAtom` — **one dataset per dashboard** (correct). Each viz slices via per-chart viewport + `vizFiltersAtomFamily`. |
| Filter system | 🟡 **Partial** — per-viz filters + worker filtering; `FilterPanel` needs `vizId`; not mounted on Home. Optional dashboard-wide filters reserved. |
| Query planner | 🟡 **Partial** — `planQuery` + `Data.executeQuery`; direct RPC still used from hooks |
| Worker task queue | 🟡 **Partial** — priority queue in worker; no `DataSource` backpressure hook yet |
| Shareable state | Dashboards live only in local memory; no export/import |
| Collaboration | Nothing yet |
| Canvas/WebGL tier | SVG only; no renderer fallback for large datasets |

---

## Phase 1 — Single-user dashboard product

> **Goal:** A proper dashboard product that one person can use every day. Every feature here is independently useful and also required before Phase 2 (sharing) makes sense.

### 1a. Multi-dashboard management 🟡

Users can create, name, rename, delete, and switch between dashboards. Each dashboard is an independent layout.

**Done (UI slice — create / list / switch)**
- ✅ `DashboardRecord` + `dashboards-manifest` IDB persistence (mirror dataset manifest pattern)
- ✅ `persistedDashboardsAtom`, `activeDashboardIdAtom`, create/clone/switch helpers
- ✅ GitBook-style **Create dashboard** dialog (blank / predefined / copy existing)
- ✅ Header **Add Dashboard** + sidebar **Dashboards** dropdown (scroll after ~5 rows)
- ✅ Default `Main` dashboard; hydrate from worker on app start
- ✅ Breadcrumb shows active dashboard name

**Remaining**
- ⬜ Rename / delete dashboard UI
- ⬜ Per-dashboard layout persistence (1b)

**Done (URL)**
- ✅ `#dashboard?dashboardId=…` hash param syncs with `activeDashboardIdAtom`

**Key files (landed)**
- `src/state/data/dashboard.ts`, `dashboard-storage.ts`, `dashboard-templates.ts`
- `src/components/dashboard/*`
- `src/engine/services/data.service.ts` — dashboard manifest RPC

### 1b. Dynamic chart layout ⬜

Users can add, remove, and resize chart panels within a dashboard. Layout is saved with the dashboard.

**Depends on:** 1a

**What to build**
- `PanelLayout` type: array of `{ id, type, chartSettings, gridPosition }` per dashboard (all panels share the dashboard dataset)
- Drag-and-drop resize using `react-resizable-panels` (already in `package.json`)
- "Add panel" button → chart type selector → spawns a new panel
- "Remove panel" (X button per panel)
- Layout serializes into `DashboardRecord` and persists

**Key files**
- `src/state/ui/layout.ts` — extend with dynamic panel list
- `src/containers/dashboard/DashboardLayout.tsx` — replace fixed layout with `PanelLayout`
- `src/components/charts/ChartPanel.tsx` — add remove/configure actions

### 1c. Per-chart data slice ⬜

Each chart/table on a dashboard reads the **same dataset** but can show a **different slice**: time viewport, row filters, and (later) column mapping.

**Already works today**
- ✅ One dataset per view via `activeDatasetAtom`
- ✅ Per-chart time viewport (`chartViewportAtomFamily`) — pan/zoom independently
- ✅ Per-viz row filters (`vizFiltersAtomFamily`) — charts via `useDatasetSlice`, tables via `useDataSource`
- ✅ Per-chart chart type → different aggregation method on the same slice

**Remaining**
- ⬜ Per-chart **field mapping** (which columns map to x/y) for non–`{x,y}` datasets
- ⬜ Per-chart transforms / groupBy (ties to **1e** categorical charts)
- ⬜ Persist slice config on dashboard record (after **1a**)

**Depends on:** 1a, 1b (for multi-panel layout)

**Key files**
- `src/state/data/filters.ts` — `vizFiltersAtomFamily`
- `src/state/ui/viewport.ts` — `chartViewportAtomFamily`
- `src/hooks/useDatasetSlice.ts`, `useDataSource.ts`

### 1d. Global filter panel 🟡

A filter panel that applies to all charts in the current dashboard simultaneously.

**Done (engine slice — `b907faf` + per-viz filters)**
- ✅ `FilterDefinition` + `filters?` on `DataGetAggregatedArgs`, `DataGetRangeArgs`, `DataGetPageArgs`
- ✅ `applyFiltersToRow` in worker (`filter.utils.ts`); filtering in `getAggregated`, `getRange`, `getPage`
- ✅ `vizFiltersAtomFamily(vizId)` — each chart/table slices the shared dataset independently
- ✅ `FilterPanel` component with required `vizId` prop
- ✅ Charts re-query when filters change (`useDatasetSlice`); tables via `useDataSource`

**Remaining (separate plans)**
- ⬜ **1d-ui:** Mount `FilterPanel` per panel (pass panel/chart id as `vizId`)
- ⬜ Optional dashboard-wide filter layer (`globalFiltersAtom`) merged with per-viz filters
- ⬜ Date range picker, value range slider polish (optional follow-up)

**Key files (landed)**
- `src/state/data/filters.ts`
- `src/components/filters/FilterPanel.tsx`
- `src/core/rpc/data-contract.ts`
- `src/engine/services/filter.utils.ts`, `data.service.ts`
- `src/hooks/useDatasetSlice.ts`

### 1e. More chart types ⬜

Expand beyond cartesian timeseries to cover common BI use cases.

**Depends on:** 1b, 1c (recommended — panels need layout + per-panel dataset first)

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

### 1f. Query planner (engineering) 🟡

A thin planning layer in the worker that routes queries based on filters + viewport. No full optimizer — just explicit routing.

**Done (engine slice — `b907faf`)**
- ✅ `DataQueryRequest` + `planQuery()` → `ExecutionPlan` (`meta | page | range | aggregated`)
- ✅ `Data.executeQuery` RPC routes to existing handlers with filter args
- ✅ Tests in `query.planner.test.ts`

**Remaining (optional / later slices)**
- ⬜ Migrate hooks (`useDatasetSlice`, `useDataSource`) to call `executeQuery` instead of direct `Data.getAggregated` etc.
- ⬜ Add `getCategorical` route when **1e** lands
- ⬜ Cost-based / index-aware planning (future)

**Key files (landed)**
- `src/engine/query.planner.ts`, `query.planner.test.ts`
- `src/engine/services/data.service.ts` — `executeQuery`
- `src/core/rpc/data-contract.ts` — `DataQueryRequest`

### 1g. Worker task queue 🟡

Priority queue inside the engine worker. Viewport-driven requests preempt background prefetches.

**Done (engine slice — `b907faf`)**
- ✅ `PriorityTaskQueue` with `high | normal | low` + version supersession
- ✅ All worker RPC handlers enqueued; data reads at `high`, preview at `normal`, rest at `low`
- ✅ Tests in `task-queue.test.ts`

**Remaining**
- ⬜ Wire queue concurrency / supersession keys to `DataSource.maxInflight` on the main thread
- ⬜ Pass explicit `version` from viewport debounce (today uses `Date.now()` per request)

**Key files (landed)**
- `src/engine/task-queue.ts`, `task-queue.test.ts`
- `src/engine/engine.worker.ts`

### 1h. Dashboard persistence & export ⬜

Save the full dashboard state to IndexedDB. Export/import as a `.pnp` JSON file.

**Depends on:** 1a (dashboard record model)

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

**Depends on:** 1a (dashboard record), 1h (serializer), 1c (per-panel slice config)

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

Start Phase 1 core top-to-bottom. Engine slices **1f/1g** were pulled forward early; UI and dashboard work still follow **1a → 1b → 1c**.

```
⬜ 1a dashboard management          ← partial (create/list/switch done)
 └─ ⬜ 1b dynamic layout
     └─ ⬜ 1c per-chart data slice (viewport + filters done; field mapping pending)
         ├─ 🟡 1d filter panel (engine + per-viz filters done; UI mount pending)
         ├─ ⬜ 1e more chart types
         └─ ⬜ 1h persistence + export
              └─ Phase 2 (shareable)
                   └─ Phase 3 (P2P)

🟡 1f query planner (RPC landed; client migration optional)
🟡 1g worker task queue (queue landed; backpressure hook pending)
```

Phase 4 (rendering) is parallel — defer until Phase 1 core is usable.

---

## What "done" looks like for Phase 1

- A user can open the app and create a named dashboard
- They can add charts of different types, each pointing to a different dataset
- They can apply global filters and see all charts update
- They can resize/rearrange the layout
- Their dashboard persists across page refreshes
- They can export it as a `.pnp` file and import it on another machine

At that point the product is real for a single user — and Phase 2 (sharing it) becomes a natural next step.
