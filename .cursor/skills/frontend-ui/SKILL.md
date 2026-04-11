---
name: frontend-ui
description: >-
  Guides production-grade frontend UI work: composition, accessibility, Tailwind
  + shadcn-style primitives, and consistent loading/empty/error states. Use when
  building or refactoring UI in src/components/, src/containers/, layouts, forms,
  or visual polish; also when the user mentions frontend, UI, UX, or design systems.
---

# Frontend UI (Plug & Play)

Stack truth lives in `AGENTS.md` and `.cursor/rules/`. This skill adds UI-focused playbooks.

## Before changing UI

- Prefer existing primitives under `src/components/ui/`; compose upward in `src/components/` and `src/containers/`.
- Match spacing, typography, and color patterns already used nearby (Tailwind utility style).
- Avoid one-off inline styles unless there is a strong reason; prefer shared classes or small wrappers.

## Structure and composition

- Keep leaf components small; push conditional layout up or into dedicated subcomponents.
- Pass **stable** callbacks and avoid fresh object/array literals as props to heavy children (charts, virtualized lists).
- Co-locate UI-only state; wire domain state through existing Jotai patterns in `src/state/` (see rules for Jotai).

## States and feedback

- Plan **loading**, **empty**, and **error** states for data-driven views; avoid silent failures.
- Prefer clear labels and disabled vs hidden controls when an action is unavailable.

## Accessibility (baseline)

- Interactive elements should be keyboard reachable; use semantic elements and proper roles where components wrap non-button click targets.
- Associate labels with inputs; don’t rely on placeholder text alone for meaning.
- Respect focus management for dialogs, sheets, and drawers (open/close traps as patterns already in the app allow).

## Anti-patterns here

- Duplicating a `components/ui` primitive with a slightly different variant—extend or compose instead.
- Doing data transforms or heavy formatting in render for large lists—move work out of render (see `performance-optimization` skill).
