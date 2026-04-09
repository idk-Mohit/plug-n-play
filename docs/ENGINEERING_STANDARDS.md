# Engineering Standards

This doc is intentionally short: it’s the shared “how we build” reference for consistency, performance, and design quality.

## Code quality

- **TypeScript-first**: avoid `any`; prefer explicit types on exported APIs.
- **Imports**: use `@/` alias for cross-module imports.
- **Lint/build**: changes should pass `pnpm lint` and `pnpm build`.

## Performance defaults

- Keep heavy computation out of React render paths.
- Prefer stable props for heavy children (charts, virtualized tables).
- Use `src/compute/` and `src/engine/` for expensive transforms or background work.

## UI/design defaults

- Use `src/components/ui/` primitives (shadcn-style) and compose upward.
- Keep spacing/typography consistent with existing Tailwind patterns.
- Favor predictable interaction patterns (loading states, empty states, errors).

## Suggested PR test plan (copy/paste)

- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Manual smoke: open dashboard, add/load a dataset, render at least one chart
- [ ] Manual perf: pan/zoom/resize; confirm no jank regressions

