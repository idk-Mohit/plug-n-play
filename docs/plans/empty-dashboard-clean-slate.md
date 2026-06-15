# Empty dashboard clean slate (Batch A)

## Scope

- Clear `activeDatasetAtom` when viewing a blank-template dashboard
- Auto-collapse sidebar on blank dashboard enter
- Empty state CTA opens dashboard settings drawer (atom stub)
- Footer shows em-dash placeholders when no dataset selected

## Out of scope

- Drawer UI content (Batch B)
- Rename, dataset picker in drawer (Batch C)
- Panel layout (Batch D)

## Test plan

- [ ] Create/switch to blank dashboard → sidebar collapsed, no active dataset
- [ ] Footer shows `Rows: —` and `Upload Date: —` on blank dashboard
- [ ] Empty state CTA sets drawer open atom (drawer UI in Batch B)
- [ ] Switch back to Main → chart-table layout unchanged
- [ ] `pnpm lint` / `pnpm build`
