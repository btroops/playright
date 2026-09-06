# 学习路线图

按阶段推进，每阶段在一个独立的 worktree 分支上完成：写学习笔记（`lessons/`）、写练习用例（`tests/`），必要时扩展 demo-app。完成后 merge 回 main 并在下面打勾。

| 阶段 | 分支 | 内容 | 状态 |
|---|---|---|---|
| 00 | main | 环境搭建、跑通冒烟测试、第 0 课 | ✅ |
| 01 | `learn/01-basics` | 测试基础：test/expect/step、命令行参数、headed/debug、UI Mode、Trace Viewer | ✅ |
| 02 | `learn/02-locators` | 定位器：getByRole/getByLabel/getByText、CSS/XPath、filter、严格模式 | 🔄 进行中 |
| 03 | `learn/03-assertions` | 断言与等待：web-first 断言、自动等待、超时与轮询 | ⬜ |
| 04 | `learn/04-interactions` | 交互：表单、下拉、上传、拖拽、对话框、iframe、多标签页 | ⬜ |
| 05 | `learn/05-pom` | 组织：Page Object Model、自定义 fixtures | ⬜ |
| 06 | `learn/06-network` | 网络：route 拦截与 Mock、等待网络响应 | ⬜ |
| 07 | `learn/07-api` | API 测试：request fixture、storageState 处理登录态 | ⬜ |
| 08 | `learn/08-ci` | 工程化：并行、多浏览器、截图对比、（可选）GitHub Actions | ⬜ |

## 各阶段与 demo-app 功能的对应

- 01–03 用 首页 / 练习场 即可；
- 04 用到 练习场 的弹窗、iframe、上传、慢速内容；
- 05 用到 登录页 + Todo 列表（把页面封装成 Page Object）；
- 06 练习拦截 `/api/slow`、`/api/todos` 的响应；
- 07 直接对 `/api/login`、`/api/todos` 写接口测试，并用 storageState 跳过登录。
