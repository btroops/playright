# Playwright Lab

学习 Playwright 自动化测试的课程式项目，内含一个极简被测应用（`demo-app/`），并配套 git worktree 多分支工作规范（支持多个 agent 在不同分支并行工作）。

## 快速上手

```bash
# 1. 使用项目固定的 Node 版本（.nvmrc = v24.11.1）
nvm use

# 2. 安装依赖（如果超时，先看下方「WSL 环境注意事项」的代理问题）
npm install

# 3. 下载 Chromium（浏览器运行在 WSL 内部，不依赖 Windows 侧浏览器）
npx playwright install chromium

# 4. 跑冒烟测试，验证整条链路
npx playwright test
```

测试启动时 `playwright.config.ts` 会自动拉起 demo-app（默认端口 3100），无需手动起服务。

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm test` | 跑全部测试（headless） |
| `npm run test:headed` | 有头模式，浏览器窗口显示到 Windows 桌面（WSLg） |
| `npm run test:ui` | UI Mode：可视化的用例浏览器与调试器 |
| `npm run show-report` | 起本地服务查看 HTML 报告 |
| `node demo-app/server.js` | 手动启动被测应用（默认 <http://localhost:3100>） |

## WSL 环境注意事项

- **浏览器**：Playwright 使用 WSL 内部的 Linux Chromium，与 Windows 侧浏览器无关。headless 模式无任何图形依赖；headed 模式 / UI Mode / Trace Viewer 依赖 WSLg（本机已可用），窗口会直接显示在 Windows 桌面。
- **代理陷阱**：shell 里默认带有指向 Windows 宿主的代理变量（`HTTP_PROXY` 等，`172.29.48.1:7890`）。**该代理不通时，npm / playwright 会卡死**。处理办法：
  ```bash
  # 方法一：临时清掉代理再执行
  unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
  # 方法二：在 Windows 侧打开代理并允许局域网连接
  ```
- **查看报告**：`npm run show-report` 会在 WSL 里起一个本地服务（默认 <http://localhost:9323>），直接用 Windows 浏览器打开该地址即可（WSL2 的 localhost 转发）。
- **Node 版本**：项目通过 `.nvmrc` 固定 v24.11.1，进目录先 `nvm use`。
- **版本限制**：Playwright 1.63 起不再支持 Ubuntu 20.04（本机发行版），本项目锁定 **1.62.1**。若日后把 WSL 发行版升级到 22.04/24.04，可自由升级 Playwright。

## Worktree 多分支工作流

完整规范见 [docs/worktree-guide.md](docs/worktree-guide.md)，最常用两条命令：

```bash
# 开新分支的 worktree（自动装依赖 + 分配独立端口）
bash scripts/new-worktree.sh learn/01-basics

# 学完合并回 main 后清理
bash scripts/remove-worktree.sh learn/01-basics --delete-branch
```

## 学习路线

见 [docs/curriculum.md](docs/curriculum.md)：从跑通第一个测试，到定位器、断言、POM、网络 Mock、API 测试，共 8 个阶段。每个阶段在独立的 worktree 分支上进行，第 0 课从 [lessons/00-orientation.md](lessons/00-orientation.md) 开始。
