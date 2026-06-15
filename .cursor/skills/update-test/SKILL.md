---
name: update-test
description: >-
  Update or add Vitest tests relevant to current git changes. Use when the user
  asks to run update-test, add tests for recent changes, or fix test coverage
  before commit or PR.
disable-model-invocation: true
---

# update-test workflow

Add or update tests for **behavior introduced or changed** in the current diff. Do not add trivial tests.

## When to run

- After a feature/fix slice, before commit or PR
- When the user says **update-test**, **add tests**, or **test this change**

## Steps

1. **Scope the diff**
   - Run `git diff` and `git diff --cached` (or `git diff main...HEAD` on a branch)
   - Identify modules with logic changes (prefer `src/engine/`, `src/core/`, `src/utils/`, pure state helpers)

2. **Find or create test files**
   - Co-locate: `foo.ts` → `foo.test.ts` in the same directory
   - Existing patterns: `vitest`, `describe`/`it`, `vi.mock` for IDB/RPC in engine tests
   - Read a neighboring `*.test.ts` in the same folder before writing new ones

3. **What to test**
   - Pure functions and worker/service logic (filters, planners, aggregations, serializers)
   - RPC handler branches and error paths when behavior changed
   - Jotai atom families / helpers when semantics changed (use `createStore` from `jotai`)
   - Regression cases for bugs fixed in the diff

4. **What to skip**
   - React components/hooks unless `@testing-library/react` is already used in repo (it is not today)
   - Trivial “expect(true).toBe(true)” or asserting obvious defaults with no behavior
   - Snapshot tests of large UI trees

5. **Write tests**
   - Name tests after **behavior**, not implementation
   - One assertion theme per `it` where possible
   - Mock at boundaries (`indexdb`, RPC), not deep internals

6. **Verify**
   - `pnpm test`
   - `pnpm build` if types or exports changed
   - Report file list + test count delta

## Checklist

- [ ] Every **non-trivial logic change** in the diff has coverage or a documented reason to skip
- [ ] New tests follow existing Vitest style in the same directory
- [ ] `pnpm test` passes
- [ ] No unrelated test files edited
