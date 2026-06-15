---
name: add-docs
description: >-
  Update or add comments and JSDoc for the current git changes. Use when the user
  asks to run add-docs, document recent changes, or add JSDoc/comments before
  commit or PR.
disable-model-invocation: true
---

# add-docs workflow

Document **only what changed** in the working tree or branch diff. Do not rewrite unrelated files.

## When to run

- After a feature/fix slice, before commit or PR
- When the user says **add-docs**, **document this change**, or **add JSDoc**

## Steps

1. **Scope the diff**
   - Run `git diff` and `git diff --cached` (or `git diff main...HEAD` on a branch)
   - List changed `src/**` files; skip lockfiles, generated assets, and `graphify-out/`

2. **Decide what needs docs** (in priority order)
   - Exported functions, types, classes, hooks, atoms
   - Non-obvious invariants (single-dataset dashboard model, worker boundaries, filter semantics)
   - Public component props when behavior is not obvious from the name

3. **What to skip**
   - Obvious one-liners, getters, or UI markup
   - Restating the code line-by-line
   - New markdown docs unless the user asked for them

4. **Style (match this repo)**
   - Prefer **JSDoc on exports**; use `/** ... */` with `@param` / `@returns` only when they add clarity
   - Inline `//` only for non-obvious business logic or security/worker boundaries
   - Keep comments short; explain **why** and **contracts**, not **what** every line does
   - Follow `.cursor/rules/10-react-typescript-standards.mdc` comment discipline

5. **Apply edits**
   - Touch only files in the diff (plus their co-located types if a signature changed)
   - Do not drive-by refactor or rename

6. **Verify**
   - `pnpm lint` and `pnpm build` if you touched TS/TSX
   - Do not run add-docs and large feature work in the same pass unless the user asked

## Checklist

- [ ] Every **new or changed export** in the diff has JSDoc if behavior/constraints are non-obvious
- [ ] Worker/RPC/storage boundaries have a one-line contract comment where missing
- [ ] No noisy or duplicate comments
- [ ] Lint/build pass
