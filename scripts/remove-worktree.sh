#!/usr/bin/env bash
# 清理一个 worktree（合并回 main 之后执行）。
# 用法: bash scripts/remove-worktree.sh <分支名或目录名> [--delete-branch] [--archive-branch] [--force]
#   --delete-branch   同时删除本地分支
#   --archive-branch  不删分支，改名归档为 archive/<分支名>（graph 上仍可见）
#   --force           有未提交改动时也强制删除（危险，会丢改动）
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "用法: $0 <分支名或目录名> [--delete-branch] [--archive-branch] [--force]"
  git worktree list
  exit 1
fi

ARG="$1"
DELETE_BRANCH=false
ARCHIVE_BRANCH=false
FORCE=false
for a in "${@:2}"; do
  case "$a" in
    --delete-branch) DELETE_BRANCH=true ;;
    --archive-branch) ARCHIVE_BRANCH=true ;;
    --force) FORCE=true ;;
    *) echo "未知参数: $a" >&2; exit 1 ;;
  esac
done

if [ "$DELETE_BRANCH" = true ] && [ "$ARCHIVE_BRANCH" = true ]; then
  echo "--delete-branch 与 --archive-branch 只能二选一" >&2
  exit 1
fi

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

# branch --show-current 不受「tag 与分支同名」歧义影响（rev-parse --abbrev-ref 在同名 tag 存在时会返回 heads/…）
BRANCH="$(git -C "$WT_DIR" branch --show-current)"

REMOVE_ARGS=("$WT_DIR")
if [ "$FORCE" = true ]; then
  REMOVE_ARGS+=(--force)
fi
# git 在有未提交改动时会拒绝 remove，这是保护，别随手 --force
git worktree remove "${REMOVE_ARGS[@]}"
git worktree prune
echo "已移除 worktree: $WT_DIR"

# 归档/删除分支前提醒：结课标记应是同名附注 tag（graph 上永久可见）
if [ "$DELETE_BRANCH" = true ] || [ "$ARCHIVE_BRANCH" = true ]; then
  if ! git rev-parse -q --verify "refs/tags/$BRANCH" > /dev/null; then
    echo "提示：分支 $BRANCH 还没有同名 tag，建议先打结课标记再清理："
    echo "      git tag -a \"$BRANCH\" -m \"结课总结\""
  fi
fi

if [ "$ARCHIVE_BRANCH" = true ]; then
  if git branch -m "$BRANCH" "archive/$BRANCH"; then
    echo "分支已归档: $BRANCH → archive/$BRANCH（graph 上仍可见）"
  else
    echo "归档失败：archive/$BRANCH 可能已存在" >&2
    exit 1
  fi
elif [ "$DELETE_BRANCH" = true ]; then
  if git branch -d "$BRANCH" 2>/dev/null; then
    echo "已删除分支: $BRANCH"
  else
    echo "分支 $BRANCH 未合并，保留未删（确认后可用: git branch -D \"$BRANCH\"）"
  fi
fi
