# Dashboard bottom drawer shell (Batch B)

## Scope

- `dashboardDrawerOpenAtom` in layout state
- `DashboardSettingsDrawer` Vaul bottom drawer shell mounted in `DashboardLayout`
- Footer `PanelBottomOpen` toggles drawer; empty-state CTA opens drawer

## Out of scope

- Rename and dataset sections (Batch C)
- Visualization gallery (Batch D)

## Test plan

- [ ] Footer button opens/closes drawer
- [ ] Overlay / Escape dismiss drawer
- [ ] Empty dashboard CTA opens drawer
- [ ] `pnpm lint` / `pnpm build`
