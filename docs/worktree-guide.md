# Git Worktree 工作规范

本项目支持多人/多 agent 在不同分支上并行工作，方式是 **一个分支一个 worktree**。本文是完整规范；agent 的简明版在仓库根目录 `AGENTS.md`。

## 一、为什么用 worktree

普通做法（`git checkout` 切分支）在同一时刻只能停在一个分支上，且切换会带动整个工作目录变化，多个并行任务会互相踩踏。worktree 让每个分支拥有一个**独立完整的工作目录**，互不干扰：

```
playright/                        ← 主仓库，一般停在 main
playright.worktrees/
├── learn-01-basics/              ← learn/01-basics 分支的工作目录
├── learn-02-locators/            ← learn/02-locators 分支的工作目录
└── feat-todo-filter/             ← feat/todo-filter 分支的工作目录
```

所有 worktree 共享同一个 `.git` 对象库（提交、历史完全互通），但各有各的文件、`node_modules` 和测试产物。

## 二、目录与命名约定

| 事项 | 约定 |
|---|---|
| worktree 位置 | 一律放在 **仓库同级** 的 `../playright.worktrees/<分支slug>`，绝不放进仓库内部 |
| 分支 slug | 分支名里的 `/` 换成 `-`，如 `learn/01-basics` → `learn-01-basics` |
| 分支命名 | 课程练习 `learn/<NN>-<主题>`；新功能 `feat/<主题>`；修复 `fix/<主题>` |
| commit 前缀 | 与分支对应，如 `learn(01): 练习 getByRole`、`feat: todo 支持筛选` |
| 一个分支 | 只允许在一个 worktree 中检出（git 本身会阻止重复检出） |

## 三、标准工作流

```bash
# 1. 在主仓库（或任意 worktree）开新分支的 worktree
bash scripts/new-worktree.sh learn/01-basics
#    脚本自动完成：创建目录 → npm install → 分配空闲端口写入 .env

# 2. 进入自己的 worktree 工作
cd ../playright.worktrees/learn-01-basics
npx playwright test          # 测试自动读取 .env 里的 E2E_PORT

# 3. 提交、合并回 main（在 main 所在的目录执行）
git merge learn/01-basics

# 4. 清理 worktree 和分支
bash scripts/remove-worktree.sh learn/01-basics --delete-branch
```

## 四、隔离规则（避免分支间污染）

1. **文件隔离**：只在当前 worktree 目录内读写文件。跨 worktree 改文件是一切污染的根源。
2. **分支隔离**：不 checkout 其他 worktree 已检出的分支；不在 worktree 里直接改动 main。
3. **依赖隔离**：`node_modules` 不跨 worktree 共享，每个 worktree 各自 `npm install`（脚本已自动做）。
4. **端口隔离**：并行跑测试时每个 worktree 必须用不同端口。`new-worktree.sh` 会扫描已用端口，把下一个空闲端口写进该 worktree 的 `.env`（`E2E_PORT=31xx`，已 gitignore）；`playwright.config.ts` 自动读取。**不要硬编码端口。**
5. **产物隔离**：`playwright-report/`、`test-results/` 生成在各自 worktree 内部，且已 gitignore。
6. **共享但无害的部分**：
   - 浏览器二进制 `~/.cache/ms-playwright/` 全局共享，只读复用，不会污染分支；
   - git 对象库共享，提交立刻对所有 worktree 可见（这是特性不是污染）。

## 五、main 分支纪律

- main 始终保持「绿色」：只有完成且测试通过的内容才 merge 回 main。
- 练习中的半成品留在自己的分支上，不影响别人。
- 合并前在自己 worktree 里把测试跑绿。

## 六、清理规则

- 合并完成后尽快清理：`bash scripts/remove-worktree.sh <分支名> --delete-branch`。
- 脚本内 `git worktree remove` 在**有未提交改动时会拒绝**，这是保护机制：先确认改动是否需要提交，不要习惯性加 `--force`。
- 疑难情况的手工命令：
  ```bash
  git worktree list                 # 查看所有 worktree
  git worktree prune                # 清理失效记录（目录被手动删掉时）
  git branch -d <分支名>            # 删除已合并分支
  ```

## 七、常见问题

- **`fatal: 'xxx' is already checked out at ...`**：该分支已在别的 worktree 检出。要么去那个 worktree 工作，要么先把它移除，不要绕过。
- **测试报端口被占用（EADDRINUSE）**：有别的 worktree 用了同一端口。检查各自 `.env` 的 `E2E_PORT` 是否不同；必要时手动改自己的 `.env` 后重跑。
- **npm/playwright 卡住不动**：大概率是失效代理（见 README「WSL 环境注意事项」），unset 代理变量后重试。
- **新 worktree 里跑测试报缺浏览器**：浏览器与全局缓存共享，一般不会缺；若提示缺，执行一次 `npx playwright install chromium`。
