---
name: add-commit
description: >-
  Draft a commit message from the current git diff, or create the commit when
  the user explicitly asks to commit. Use when the user says add-commit, draft
  a commit message, or asks to commit staged/unstaged changes.
disable-model-invocation: true
---

# add-commit workflow

Produce an accurate commit message from the **actual diff**. Commit only when the user **explicitly** asks (e.g. “commit this”, “make the commit”).

## When to run

- Before commit: user wants a message reviewed
- User says **add-commit**, **draft commit message**, or **what should I commit as**
- User says **commit** / **commit this** → draft message **and** run the commit (see below)

## Steps — draft only

1. **Inspect the diff**
   - `git status`
   - `git diff` and `git diff --cached`
   - `git log -5 --oneline` for message style

2. **Summarize honestly**
   - One primary intent (feature / fix / chore / docs)
   - Do not claim tests/docs if they are not in the diff
   - Split into two commits if the diff mixes unrelated slices (tell the user; do not commit one blob unless they insist)

3. **Message format** (match recent repo commits)

   ```
   type(scope): short imperative subject (≤ ~72 chars)

   Optional body: 1–3 sentences on why / user-visible outcome.
   No bullet laundry lists unless multiple independent fixes.
   ```

   **Types:** `feat`, `fix`, `chore`, `docs`, `test`, `refactor`  
   **Scopes:** `ui`, `engine`, `filters`, `table`, `deps`, etc.

4. **Present to the user**
   - Show subject + body in a copy-paste block
   - List files that will be included
   - Note anything **not** committed (untracked secrets, unrelated dirty files)
   - **Do not run `git commit`** unless they explicitly asked to commit

## Steps — when user asks to commit

Follow the user rule **committing-changes-with-git**:

1. Run `git status`, `git diff`, `git diff --cached`, `git log -5 --oneline` in parallel
2. Stage only relevant files (never `.env`, credentials)
3. Commit with HEREDOC message
4. `git status` to verify
5. Never push unless asked

If pre-commit hook fails: fix and **new** commit — never amend unless user rule allows.

## Recommended slice order (with other workflows)

1. Implement slice  
2. **update-test**  
3. **add-docs**  
4. **add-commit** (draft or commit)  
5. Push / PR only when asked

## Checklist

- [ ] Message matches the diff (not the plan or roadmap)
- [ ] Subject is imperative and scoped
- [ ] Body explains **why**, not every file changed
- [ ] Commit created **only** on explicit user request
