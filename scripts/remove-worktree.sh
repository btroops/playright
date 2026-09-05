#!/usr/bin/env bash
# 清理一个 worktree（合并回 main 之后执行）。
# 用法: bash scripts/remove-worktree.sh <分支名或目录名> [--delete-branch] [--force]
#   --delete-branch   同时删除本地分支
#   --force           有未提交改动时也强制删除（危险，会丢改动）
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "用法: $0 <分支名或目录名> [--delete-branch] [--force]"
  git worktree list
  exit 1
fi

ARG="$1"
DELETE_BRANCH=false
FORCE=false
for a in "${@:2}"; do
  case "$a" in
    --delete-branch) DELETE_BRANCH=true ;;
    --force) FORCE=true ;;
    *) echo "未知参数: $a" >&2; exit 1 ;;
  esac
done

REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"
WT_ROOT="$(dirname "$REPO_ROOT")/${REPO_NAME}.worktrees"
SLUG="${ARG//\//-}"
WT_DIR="${WT_ROOT}/${SLUG}"

if [ ! -d "$WT_DIR" ]; then
  echo "未找到 worktree 目录: $WT_DIR，当前已有的 worktree:" >&2
  git worktree list >&2
  exit 1
fi

BRANCH="$(git -C "$WT_DIR" rev-parse --abbrev-ref HEAD)"

REMOVE_ARGS=("$WT_DIR")
if [ "$FORCE" = true ]; then
  REMOVE_ARGS+=(--force)
fi
# git 在有未提交改动时会拒绝 remove，这是保护，别随手 --force
git worktree remove "${REMOVE_ARGS[@]}"
git worktree prune
echo "已移除 worktree: $WT_DIR"

if [ "$DELETE_BRANCH" = true ]; then
  if git branch -d "$BRANCH" 2>/dev/null; then
    echo "已删除分支: $BRANCH"
  else
    echo "分支 $BRANCH 未合并，保留未删（确认后可用: git branch -D \"$BRANCH\"）"
  fi
fi
