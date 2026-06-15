# Agent workflows

Small, explicit workflows for finishing a slice before commit/PR. Each lives as a repo skill under `.cursor/skills/`.

| Workflow | Skill path | Purpose |
|----------|------------|---------|
| **add-docs** | `.cursor/skills/add-docs/SKILL.md` | JSDoc + comments for files in the current git diff |
| **update-test** | `.cursor/skills/update-test/SKILL.md` | Vitest updates/additions for behavior in the current git diff |
| **add-commit** | `.cursor/skills/add-commit/SKILL.md` | Draft commit message from diff; commit when user explicitly asks |

## How to invoke

In Cursor chat (Agents window), ask explicitly:

- “Run **add-docs** on my current changes”
- “Run **update-test** for this diff”
- “Run **add-commit**” (draft message) or “**commit this**” (draft + commit)

Recommended order after a code slice:

1. Implement the slice
2. **update-test**
3. **add-docs**
4. `pnpm lint` / `pnpm build`
5. **add-commit** (draft or commit)
6. Push / PR only when asked

These workflows are **scoped to the git diff** — they should not expand scope into new features.
