# Empty dashboard + bottom drawer — design spec

**Date:** 2026-06-14

## Summary

Blank dashboards present a clean slate (no dataset, collapsed sidebar, empty canvas). Dashboard-level settings live in a bottom drawer opened from the footer `PanelBottomOpen` control or the empty-state CTA. The drawer hosts rename, dataset selection, and visualization add/remove wired to persisted `DashboardRecord.panels`.

## UX

| Surface | Behavior |
|---------|----------|
| Blank dashboard enter | Clear `activeDatasetAtom`; collapse sidebar once per dashboard id |
| Empty canvas | `EmptyDashboardSection` + “Configure dashboard” CTA |
| Footer | Toggle drawer; dataset chip opens drawer Data section; em-dash when no dataset |
| Bottom drawer | General (rename), Data (dataset combobox), Visualizations (gallery + list) |

## Data model

```typescript
DashboardPanel = { id, type: "chart" | "table", chartType?, order }
DashboardRecord.panels?: DashboardPanel[]
```

Legacy records without `panels` normalize from `templateId` (chart-table → chart-1 + table-1; blank → []).

## Delivery batches

1. **A** — Clean slate + sidebar + CTA atom
2. **B** — Drawer shell + footer toggle
3. **C** — Rename + dataset in drawer
4. **D** — Panel layout persistence + dynamic Home render

## Deferred

- Resizable grid layout
- Per-dashboard dataset storage
- Analytics template panels
