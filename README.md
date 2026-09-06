<h1 align="center">🎭 Playwright Lab</h1>

<p align="center">
  <b>端到端自动化测试学习实践</b> · TypeScript · Playwright 1.62 · git worktree 多分支并行
</p>

<p align="center">
  <img src="https://img.shields.io/badge/课程进度-4/9_已结课-F5A623" alt="课程进度" />
  <img src="https://img.shields.io/badge/测试-23_用例·21_通过-2EA043" alt="测试" />
  <img src="https://img.shields.io/badge/Playwright-1.62.1-2EAD33?logo=playwright&logoColor=white" alt="Playwright" />
  <img src="https://img.shields.io/badge/Node.js-v24.11.1-339933?logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/平台-WSL2·WSLg-0078D4?logo=windows&logoColor=white" alt="WSL2" />
</p>

一套为学习 Playwright 端到端测试搭建的**完整实践体系**：自带被测应用与 8 阶段课程，`npx playwright test` 一键起服务开跑，git worktree 多分支并行互不污染。

---

## 📖 这是什么

这是我个人学习 Playwright 的全程实践仓库，开源出来希望帮到同样在学的人。它不是一个代码堆，而是一套有明确学习策略的体系：

- **8 阶段课程体系** —— 每课三件套：讲义 + 可运行示范 + 作业骨架，注释逐行讲解 API；一课一个 worktree 分支，结课打 tag，graph 上永远可回放；
- **内置被测应用 demo-app** —— 登录 / Todo JSON API / 练习场（弹窗、iframe、文件上传、拖拽、慢接口），专为练手设计，页面结构稳定，`node demo-app/server.js` 一条命令起；
- **git worktree 并行规范** —— 一分支一工作树、端口自动分配互不冲突、测试产物天然隔离，人和多个 agent 可同时开工；
- **结课快照体系** —— 同名附注 tag + `--no-ff` 合并 + tar 快照，删了分支也丢不了历史；
- **工程化护栏** —— ESLint（含 Playwright 专用规则，`waitForTimeout` 之类反模式直接报错）+ 注释规范 + 「main 保持绿色」纪律；
- **WSL2 深度适配** —— headless 开箱即跑；headed / UI Mode / Trace Viewer 走 WSLg 直显 Windows 桌面；GitHub 上的 HTML 报告陷阱（失效代理劫持 localhost）已免疫。

> 📌 **学习策略核心**：第 1–4 课是「写对一条用例」的全部基本功（组织 → 定位 → 断言 → 交互）；第 5–7 课解决「工程上怎么组织」（POM → Mock → API 分层测试）；第 8 课以并行、视觉回归与 CI 收尾。**测得稳比测得多重要。**

## 🚀 快速上手

```bash
git clone git@github.com:btroops/playright.git
cd playright                 # 仓库根即项目根（package.json 在这里）

nvm use                      # .nvmrc 固定 v24.11.1
npm install
npx playwright install chromium

npx playwright test          # 首次即绿：webServer 自动拉起被测应用
```

> 💡 `npx playwright test --headed`：浏览器窗口直接显示在 Windows 桌面（WSLg）。

## 📚 课程路线

| 课 | 主题 | 状态 | 讲义 |
|---|---|---|---|
| 00 | 环境熟悉：跑测试、看报告、Trace Viewer | ✅ | [lessons/00-orientation.md](lessons/00-orientation.md) |
| 01 | 测试组织：describe / step、CLI、reporter | ✅ | [lessons/01-basics.md](lessons/01-basics.md) |
| 02 | 定位器：getByRole 系列、filter、严格模式 | ✅ | [lessons/02-locators.md](lessons/02-locators.md) |
| 03 | 断言与等待：web-first 断言、expect.poll | ✅ | [lessons/03-assertions.md](lessons/03-assertions.md) |
| 04 | 交互：下拉、上传、对话框、iframe、拖拽、多标签页 | 🔄 | [lessons/04-interactions.md](lessons/04-interactions.md) |
| 05 | 组织：Page Object Model、自定义 fixtures | 📚 | [lessons/05-pom.md](lessons/05-pom.md) |
| 06 | 网络：route 拦截与 Mock | 📚 | [lessons/06-network.md](lessons/06-network.md) |
| 07 | API 测试：request fixture、storageState | 📚 | [lessons/07-api.md](lessons/07-api.md) |
| 08 | 工程化：视觉基线、serial、报告附件、CI | 📚 | [lessons/08-ci.md](lessons/08-ci.md) |

每课的练习在独立分支上进行（`learn/01-basics` … `learn/08-ci`），完成并验收后按「同名 tag + `--no-ff` 合并」结课。

## 🧰 常用命令

| 命令 | 作用 |
|---|---|
| `npm test` | 跑全部测试（headless） |
| `npm run test:headed` | 有头模式，浏览器窗口显示到 Windows 桌面（WSLg） |
| `npm run test:ui` | UI Mode：可视化的用例浏览器与调试器 |
| `npm run show-report` | 起本地服务查看 HTML 报告 |
| `npm run lint` | ESLint 检查全部代码（提交前保持零 error） |
| `node demo-app/server.js` | 手动启动被测应用（默认 <http://localhost:3100>） |

## 🖥️ WSL2 环境备忘

- **浏览器**：Playwright 运行 WSL 内部的 Linux Chromium，与 Windows 侧浏览器无关；headless 无任何图形依赖；
- **代理陷阱**：shell 若带失效代理变量（`HTTP_PROXY` 等），安装/下载类命令会卡死——先 `unset HTTP_PROXY HTTPS_PROXY ALL_PROXY`；跑测试已由 config 注入 `NO_PROXY` 免疫；
- **查看报告**：`npm run show-report` 后用 Windows 浏览器访问提示的地址（WSL2 localhost 转发）；
- **版本限制**：Playwright 1.63 起不再支持 Ubuntu 20.04，本项目锁定 1.62.1。

## 🌿 Worktree 多分支工作流

```bash
bash scripts/new-worktree.sh learn/05-pom      # 开新分支：建目录 + 装依赖 + 分配独立端口
bash scripts/remove-worktree.sh learn/05-pom --delete-branch   # 结课后清理
```

完整规范见 [docs/worktree-guide.md](docs/worktree-guide.md)：目录布局、端口隔离、结课三件套（tag / `--no-ff` / 快照）、agent 守则与常见问题。

## 🗂️ 文档地图

| 文档 | 内容 |
|---|---|
| [AGENTS.md](AGENTS.md) | agent 工作守则（14 条硬性规则） |
| [docs/worktree-guide.md](docs/worktree-guide.md) | worktree 完整工作规范 |
| [docs/comment-style.md](docs/comment-style.md) | 注释与可读性规范（附范本） |
| [docs/curriculum.md](docs/curriculum.md) | 课程路线图与进度 |
| [lessons/](lessons/) | 全部课程讲义 |
