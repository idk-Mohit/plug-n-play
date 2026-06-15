# Phase 1a — Multi-dashboard UI (create, list, switch)

## Scope (this PR only)

**In**
- Dashboard entity + persistence (localStorage + IndexedDB manifest mirror)
- Jotai atoms: `persistedDashboardsAtom`, `activeDashboardAtom`
- GitBook-style create dialog: blank / predefined templates / copy from existing
- Header **Add Dashboard** beside GitHub
- Sidebar **Dashboards** dropdown (max ~5 visible rows + scroll + Add at bottom)
- Default `Main` dashboard on first run; hydrate from worker on app start

**Out**
- Per-dashboard layout (1b) — switching changes active record only
- Rename / delete UI
- URL `#/dashboard/:id` routing
- Collaboration / share

## Files touched

- `src/core/rpc/data-contract.ts` — `DashboardRecord`, manifest types
- `src/engine/services/data.service.ts` — get/save dashboard manifest
- `src/engine/engine.worker.ts` — routes
- `src/state/data/dashboard.ts`, `dashboard-storage.ts`, `dashboard-templates.ts`
- `src/components/dashboard/*` — dialog, add button, switcher dropdown
- `src/components/header/MainHeader.tsx`, `src/components/sidebar/app-sidebar.tsx`
- `src/App.tsx` — hydration
- `src/components/ViewRenderer.tsx` — breadcrumb name

## Test plan

- [ ] update-test workflow (or manual equivalent)
- [ ] add-docs workflow (or manual equivalent)
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Manual: create blank + copy + predefined; 6+ dashboards scroll in sidebar; header + sidebar open same dialog; refresh persists list
