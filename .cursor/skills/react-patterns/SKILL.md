---
name: react-patterns
description: >-
  React + TypeScript patterns for maintainable UIs: component boundaries, hooks,
  effects, and render discipline. Use when refactoring React code, debugging
  re-renders or effect loops, or when the user mentions React, hooks, or component
  architecture. Complements project rules under .cursor/rules/.
---

# React patterns (Plug & Play)

Project rules in `.cursor/rules/10-react-typescript-standards.mdc` and Jotai rules apply first. This skill adds practical checklists.

## Component design

- Prefer **clear props** and small surfaces; extract hooks for reusable stateful logic under `src/hooks/`.
- Split **container** (data wiring) vs **presentational** (layout/markup) when it reduces churn and rerenders.

## Effects

- Use effects for **synchronization** with the world (subscriptions, imperative APIs), not for deriving values you can compute during render.
- Guard dependencies: avoid unconditional `setState` in effects; watch for infinite loops when derived state feeds back into deps.
- Clean up subscriptions, listeners, and timers in the effect cleanup function.

## Renders and memoization

- Avoid creating **new objects/arrays/functions** in render passed to memoized heavy children unless necessary.
- Apply `useMemo` / `useCallback` when they **measureably** avoid work or stabilize references for optimized children—not by default on every value.

## State

- UI-local state stays local; shared state uses existing **Jotai** patterns in `src/state/` (many small atoms; see Jotai rule file).
- Don’t perform heavy computation inside atom write paths—offload to `src/compute/` or workers.

## Types

- Avoid `any`; use narrow unions and explicit types on exported functions/components.
- Prefer discriminated unions for variant UI states when it improves exhaustiveness.

## Charts and virtualized lists

- Treat chart containers and virtualized tables as **hot paths**: minimal props churn, stable callbacks, no expensive work in parent render (see `performance-optimization` and d3-core rules).
