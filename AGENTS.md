# AGENTS.md — agent 工作守则

本仓库使用 git worktree 多分支并行工作。任何 agent 在本仓库工作前必须遵守以下规则。

## 开工前

1. 先执行 `pwd` 和 `git worktree list`，确认自己所在的 worktree 与对应分支；不要假设自己在主仓库。
2. 主仓库（原目录）通常停在 main；每个功能/课程分支都有自己独立的 worktree 目录（容器布局：仓库在 `~/playright/playright-lab/`，worktree 在同级 `~/playright/playright-lab.worktrees/<分支slug>`）。
3. 阅读一遍 [docs/worktree-guide.md](docs/worktree-guide.md)。

## 工作中

4. **只在自己的 worktree 目录内工作**。绝不修改其他 worktree 的文件，绝不 `git checkout` 其他 worktree 已检出的分支（git 会拒绝，也不要绕过）。
5. 新建工作分支一律用 `bash scripts/new-worktree.sh <分支名>`，它会自动：创建 `../playright-lab.worktrees/<分支slug>`、`npm install`、分配独立的 `E2E_PORT` 并写入该 worktree 的 `.env`。
6. 并行跑测试时**不得共用端口**：端口来自各自 worktree 的 `.env`（`E2E_PORT`），由配置自动读取，不要硬编码端口、不要改别人的 `.env`。
7. 分支命名：课程练习 `learn/<NN>-<主题>`，功能 `feat/<主题>`，修复 `fix/<主题>`。commit 信息带对应前缀，如 `learn(01): 练习 getByRole`。
8. 产物目录（`playwright-report/`、`test-results/`）和 `.env` 已在 .gitignore 里，不要提交，也不要把它们的内容写到其他 worktree。
9. 提交前运行 `npm run lint` 并保持**零 error**。不要为过检查随手改配置关闭规则；确需豁免某行时用 `// eslint-disable-next-line <规则名>` 并注明原因。课程骨架里的 `test.fixme` 是有意为之，已在配置中豁免。

## 收工

10. 只把**完成且测试通过（`npx playwright test`）、lint 通过（`npm run lint`）**的工作 merge 回 main（main 保持绿色）。练习未完成时留在分支上即可。
11. 合并后用 `bash scripts/remove-worktree.sh <分支名> [--delete-branch]` 清理。有未提交改动时 git 会拒绝删除——先提交或明确丢弃，不要习惯性 `--force`。

## 环境注意

12. 执行 npm / playwright **安装类**命令前确认代理可用：本机 shell 默认带 `HTTP_PROXY` 等变量，指向 Windows 宿主 `172.29.48.1:7890`；代理不通时先 `unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy`（README 有说明）。跑测试无需处理——`playwright.config.ts` 已注入 `NO_PROXY` 免疫。
13. 浏览器二进制在 `~/.cache/ms-playwright/`，全局共享、只读复用，不会造成分支间污染；新 worktree 缺浏览器时执行 `npx playwright install chromium`。
