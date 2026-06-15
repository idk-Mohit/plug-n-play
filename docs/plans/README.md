# Feature plans

Use one markdown file per focused slice before implementation.

## Naming

`docs/plans/phase-1a-multi-dashboard.md`, `docs/plans/phase-1d-filter-ui.md`, etc.

## Template

```markdown
# Phase Xy — Short title

## Scope (this PR only)
- Bullet list of what is in
- Bullet list of what is explicitly out

## Files touched
- ...

## Test plan
- [ ] update-test workflow (or manual equivalent)
- [ ] add-docs workflow (or manual equivalent)
- [ ] pnpm test
- [ ] pnpm build
- [ ] Manual: ...
```

Do not start the next slice until the current plan’s test plan is checked off.
