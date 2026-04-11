#!/usr/bin/env bash
# Create a new branch in an isolated Git worktree under .worktrees/
# Default base: dev. Use --from-current or --base <ref> to override.
# Docs: docs/GIT_WORKTREES.md

set -euo pipefail

DEFAULT_BASE_BRANCH="dev"

usage() {
  cat <<'EOF'
Usage: git-worktree-add.sh [options] <new-branch-name>

Creates .worktrees/<sanitized-branch>/ checked out on <new-branch-name>,
branching from dev by default (or from your choice when run interactively).

Options:
  --base <ref>       Use this branch or commit as the start point (e.g. main)
  --from-current     Branch from the current HEAD (branch or detached)
  --path <dir>       Worktree path (default: .worktrees/<sanitized-branch-name>)
  --install          Run pnpm install after creating the worktree
  --default-base     Non-interactive: use dev without prompting (same as CI default)
  -h, --help         Show this help

Examples:
  pnpm worktree:add -- feature/chart-themes
  pnpm worktree:add -- --from-current hotfix/typo
  pnpm worktree:add -- --base main experiment/foo
EOF
}

die() {
  echo "error: $*" >&2
  exit 1
}

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || die "run from inside a git repository"
cd "$REPO_ROOT"

# pnpm/npm forward a literal "--" before user-supplied args
while [[ "${1:-}" == "--" ]]; do
  shift
done

if ! git check-ignore -q .worktrees/ 2>/dev/null; then
  die ".worktrees/ must be ignored (add it to .gitignore — see docs/GIT_WORKTREES.md)"
fi

BASE_REF=""
FROM_CURRENT=false
PATH_OVERRIDE=""
RUN_INSTALL=false
FORCE_DEFAULT_BASE=false
BRANCH_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      [[ $# -ge 2 ]] || die "--base requires a value"
      BASE_REF="$2"
      shift 2
      ;;
    --from-current)
      FROM_CURRENT=true
      shift
      ;;
    --path)
      [[ $# -ge 2 ]] || die "--path requires a value"
      PATH_OVERRIDE="$2"
      shift 2
      ;;
    --install)
      RUN_INSTALL=true
      shift
      ;;
    --default-base)
      FORCE_DEFAULT_BASE=true
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    -*)
      die "unknown option: $1 (try --help)"
      ;;
    *)
      [[ -z "$BRANCH_NAME" ]] || die "unexpected argument: $1"
      BRANCH_NAME="$1"
      shift
      ;;
  esac
done

[[ -n "$BRANCH_NAME" ]] || {
  usage
  exit 1
}

if [[ -n "$BASE_REF" && "$FROM_CURRENT" == true ]]; then
  die "use only one of --base and --from-current"
fi

if git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}"; then
  die "branch already exists locally: ${BRANCH_NAME}"
fi

sanitize_path_segment() {
  echo "$1" | sed -e 's/[^a-zA-Z0-9._/-]/_/g' -e 's|^\.|_|g'
}

SAFE_SEGMENT="$(sanitize_path_segment "$BRANCH_NAME")"
[[ -n "$SAFE_SEGMENT" ]] || die "could not derive a safe directory name from branch name"

WT_REL="${PATH_OVERRIDE:-.worktrees/${SAFE_SEGMENT}}"
WT_ABS="${REPO_ROOT}/${WT_REL}"

if [[ -e "$WT_ABS" ]]; then
  die "path already exists: ${WT_REL}"
fi

mkdir -p "${REPO_ROOT}/.worktrees"

resolve_start_point() {
  if [[ "$FROM_CURRENT" == true ]]; then
    git symbolic-ref -q --short HEAD 2>/dev/null || git rev-parse HEAD
    return
  fi

  if [[ -n "$BASE_REF" ]]; then
    echo "$BASE_REF"
    return
  fi

  if [[ "$FORCE_DEFAULT_BASE" == true ]]; then
    echo "$DEFAULT_BASE_BRANCH"
    return
  fi

  if [[ -t 0 ]]; then
    local current
    current="$(git branch --show-current 2>/dev/null || true)"
    if [[ -z "$current" ]]; then
      current="(detached $(git rev-parse --short HEAD 2>/dev/null || echo '?'))"
    fi
    echo "" >&2
    echo "New branch: ${BRANCH_NAME}" >&2
    echo "Start from:" >&2
    echo "  1) ${DEFAULT_BASE_BRANCH} (default)" >&2
    echo "  2) current: ${current}" >&2
    read -r -p "Choice [1]: " choice || true
    choice="${choice:-1}"
    case "$choice" in
      1 | "" | d | D) echo "$DEFAULT_BASE_BRANCH" ;;
      2 | c | C)
        git symbolic-ref -q --short HEAD 2>/dev/null || git rev-parse HEAD
        ;;
      *)
        die "invalid choice (use 1 or 2)"
        ;;
    esac
    return
  fi

  echo "$DEFAULT_BASE_BRANCH"
}

START_POINT="$(resolve_start_point)"

if ! git rev-parse --verify "${START_POINT}^{commit}" >/dev/null 2>&1; then
  die "start point not found: ${START_POINT} (fetch the branch or pass --base)"
fi

git worktree add "$WT_ABS" -b "$BRANCH_NAME" "$START_POINT"

echo ""
echo "Worktree ready: ${WT_ABS}"
echo "Branch: ${BRANCH_NAME} (from ${START_POINT})"

if [[ "$RUN_INSTALL" == true ]]; then
  if [[ -f "${WT_ABS}/package.json" ]]; then
    (cd "$WT_ABS" && pnpm install)
  else
    echo "note: no package.json in worktree; skipped pnpm install" >&2
  fi
else
  echo "Next: cd ${WT_REL} && pnpm install && pnpm dev"
fi
