#!/usr/bin/env bash
# 创建一个新 worktree 并完成初始化（装依赖、分配独立端口）。
# 用法: bash scripts/new-worktree.sh <分支名> [基线分支]
# 示例: bash scripts/new-worktree.sh learn/01-basics
#       bash scripts/new-worktree.sh feat/todo-filter main
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "用法: $0 <分支名> [基线分支，默认 main]"
  exit 1
fi

BRANCH="$1"
BASE="${2:-main}"

REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"
WT_ROOT="$(dirname "$REPO_ROOT")/${REPO_NAME}.worktrees"
SLUG="${BRANCH//\//-}"
WT_DIR="${WT_ROOT}/${SLUG}"

if [ -e "$WT_DIR" ]; then
  echo "错误: 目录已存在: $WT_DIR" >&2
  exit 1
fi

mkdir -p "$WT_ROOT"

# 分支已存在则直接检出，否则基于基线分支新建
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  git worktree add "$WT_DIR" "$BRANCH"
else
  git worktree add "$WT_DIR" -b "$BRANCH" "$BASE"
fi

cd "$WT_DIR"

# 端口分配：扫描主仓库与所有 worktree 的 .env，取已用最大值 +1
MAX_PORT=3099
for env_file in "${REPO_ROOT}/.env" "${WT_ROOT}"/*/.env; do
  [ -f "$env_file" ] || continue
  p="$(sed -n 's/^\s*E2E_PORT\s*=\s*\([0-9]\+\)\s*$/\1/p' "$env_file" | head -1)"
  if [ -n "$p" ] && [ "$p" -gt "$MAX_PORT" ]; then
    MAX_PORT="$p"
  fi
done
PORT=$((MAX_PORT + 1))
echo "E2E_PORT=${PORT}" > .env

echo "==> 安装依赖（node_modules 不跨 worktree 共享，需各自安装）"
if ! env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy \
     npm install --no-audit --no-fund; then
  echo "npm install 失败。若是网络超时，先在终端执行 unset HTTP_PROXY HTTPS_PROXY ALL_PROXY 后重试。" >&2
  exit 1
fi

echo
echo "==> worktree 就绪"
echo "    目录: $WT_DIR"
echo "    分支: $BRANCH（基于 $BASE）"
echo "    端口: E2E_PORT=${PORT}（已写入 .env，测试自动读取）"
echo
echo "    进入工作: cd \"$WT_DIR\""
echo "    运行测试: npx playwright test"
echo "    提交规范: commit 信息使用前缀，如 'learn(01): 练习定位器'"
