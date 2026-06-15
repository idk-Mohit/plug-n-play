# Phase 1b — Dynamic chart layout (first vertical slice)

## Scope (this PR)

- `DashboardPanel` on `DashboardRecord` + normalization for legacy records
- Layout helpers: defaults, add/remove panel, copy clone
- Drawer Visualizations section: gallery + active panel list
- `Home` renders dynamic panel list; empty when `panels.length === 0`
- Template seeding: chart-table → chart + table; blank → `[]`; copy → clone panels

## Out of scope (follow-up PRs)

- `react-resizable-panels` drag resize grid
- Per-panel remove on canvas
- Analytics template default panels
- Per-dashboard dataset binding (still global `activeDatasetAtom`)

## Test plan

- [ ] Vitest: `dashboard.helpers.test.ts`, layout normalization
- [ ] Add/remove panels persist after refresh
- [ ] Main dashboard keeps chart + table defaults
- [ ] Blank dashboard empty until user adds panels
- [ ] Copy dashboard clones panel layout with new ids
- [ ] `pnpm lint` / `pnpm test` / `pnpm build`
