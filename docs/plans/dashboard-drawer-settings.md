# Dashboard drawer settings (Batch C)

## Scope

- `updateDashboardRecord` helper
- Drawer General section: inline dashboard rename
- Drawer Data section: dataset combobox (moved from footer)
- Footer: read-only dataset chip opens drawer; row/upload placeholders when no dataset

## Out of scope

- Visualization gallery and panel list (Batch D)

## Test plan

- [ ] Rename persists after refresh
- [ ] Dataset selection in drawer updates charts/tables
- [ ] Footer no longer hosts combobox
- [ ] `pnpm lint` / `pnpm build`
