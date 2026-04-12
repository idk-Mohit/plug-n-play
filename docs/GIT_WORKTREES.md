# Git worktrees

Use [Git worktrees](https://git-scm.com/docs/git-worktree) to keep **multiple branches checked out at once** (separate folders, one `.git` database). Handy for a long-running `dev` server on one branch while you implement another.

## Convention in this repo

- Worktrees live under **`.worktrees/`** at the repo root (ignored by Git).
- **Default base branch for new work:** **`dev`**. Branch from your current HEAD only when you intend to (see script flags below).

## Quick start

From the repository root:

```bash
pnpm worktree:add -- <new-branch-name>
```

When your terminal is interactive, the script asks whether to branch from **`dev`** or **current**. In non-interactive contexts it defaults to **`dev`** without prompting.

### Common flags

| Flag | Meaning |
|------|---------|
| `--from-current` | Branch from current `HEAD` (current branch or detached commit) |
| `--base <ref>` | Branch from a specific ref (e.g. `main`, `origin/dev`) |
| `--path <dir>` | Custom path under or beside the repo (default: `.worktrees/<branch-sanitized>/`) |
| `--install` | Run `pnpm install` in the new worktree after creation |
| `--default-base` | Skip the prompt and use `dev` (explicit non-interactive default) |

Examples:

```bash
pnpm worktree:add -- feature/dataset-export
pnpm worktree:add -- --from-current hotfix/tooltip
pnpm worktree:add -- --base main spike/wasm-test
pnpm worktree:add -- --install experiment/ui
```

## Manual commands

```bash
git worktree list
git worktree remove .worktrees/my-branch
git worktree prune   # if a worktree folder was deleted outside Git
```

## Notes

- Run **`pnpm install`** in each worktree (separate `node_modules`).
- If two dev servers run together, use **different Vite ports** (e.g. `pnpm dev -- --port 5174`).
- Ensure **`dev` exists locally** (or pass `--base origin/dev`) before branching from it.
