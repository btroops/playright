# 第 1 课：测试的组织与调试工具

> 前置：已完成第 0 课，`npx playwright test` 能全绿。
> 本课示范代码：`tests/01-basics/01-structure-demo.spec.ts`；作业：`tests/01-basics/90-homework.spec.ts`。
> 所有命令都在本 worktree 根目录（`~/playright.worktrees/learn-01-basics`）执行。

## 1. 测试的组织：文件 → describe → test

Playwright 按 `testDir`（config 里配的 `./tests`）递归发现所有 `*.spec.ts`，**一个文件就是一个套件**：

```ts
import { test, expect } from '@playwright/test';

test('最外层的独立用例', async ({ page }) => { /* ... */ });

test.describe('首页', () => {
  test('可以打开', async ({ page }) => { /* ... */ });
  test('导航链接齐全', async ({ page }) => { /* ... */ });
});
```

- `test.describe()` 把相关用例分组，让报告呈现为树形；可以嵌套。
- 分组还承载**组级配置**（第 5 课讲 `test.use()`，先留个印象）。
- 控制执行的标注，describe 和 test 都能用：

| 标注 | 作用 |
|---|---|
| `test.only(...)` | 只跑这个（调试完记得删！） |
| `test.skip('原因')` 或 `test.skip(条件, '原因')` | 跳过，报告显示 skipped |
| `test.fixme('原因')` | 明确表示「这个还没写完/坏的」，同样 skipped |

> CLI 也有对应的过滤方式（见下），比 `.only` 更推荐——不改代码就能选用例。

## 2. test.step：把用例切成可读的步骤

一个用例失败时，你希望报告直接告诉你「死在哪一步」。`test.step` 就是干这个的：

```ts
test('从首页进入练习场', async ({ page }) => {
  await test.step('打开首页', async () => {
    await page.goto('/');
  });
  await test.step('点击「练习场」链接并断言落地', async () => {
    await page.getByRole('link', { name: '练习场' }).click();
    await expect(page).toHaveURL(/lab\.html$/);
  });
});
```

- 报告和 Trace 里每个 step 可独立展开/折叠，失败步骤一目了然；
- step 可以嵌套；
- 推荐节奏：**准备（arrange）→ 动作（act）→ 断言（assert）** 各一个 step。

## 3. 命令行参数：80% 场景靠这十个

```bash
npx playwright test                          # 全部
npx playwright test basics                   # 只跑路径里含 "basics" 的文件（子串匹配）
npx playwright test -g "首页"                # 只跑标题含 "首页" 的用例（正则也行）
npx playwright test -g "首页" --grep-invert "导航"   # 反向过滤
npx playwright test --headed                 # 有头模式，看浏览器动作（WSLg）
npx playwright test --ui                     # UI Mode，可视化选择/重放/时间旅行
npx playwright test --debug                  # Playwright Inspector 单步调试
npx playwright test --project=chromium       # 指定浏览器项目
npx playwright test --workers=1              # 限 1 个并行 worker（排障时常用）
npx playwright test --repeat-each=2          # 每个用例跑 2 遍（观察并行/幂等）
npx playwright test --trace on               # 本次强制录制 trace（配合第 5 节）
npx playwright test --reporter=line          # 换 reporter（list/line/dot/json/html）
npx playwright test --list                   # 只列出将执行哪些用例，不真跑
```

> 组合技：`npx playwright test basics -g "练习场" --headed` —— 路径 + 标题 + 可视化，三条一起上。

## 4. reporter：看结果的几种姿势

- config 里已配 `[['list'], ['html', { open: 'never' }]]`：终端看 `list`，每次跑完同时生成 HTML 报告；
- `npm run show-report` 打开 HTML 报告（WSL 下用 Windows 浏览器访问提示的地址）；
- `--reporter=json` 适合喂给程序，`--reporter=line` 在 CI 上最省事；
- HTML 报告里点开一条用例：能看到每个 step 的耗时、错误栈、附件（截图/trace）。

## 5. trace 与 Trace Viewer：排障终极武器

config 里已配 `trace: 'retain-on-failure'`——**失败的用例自动留下 trace.zip**（在 `test-results/` 对应目录）。

打开方式二选一：

```bash
npm run show-report                 # 方式一：报告里点开失败用例 → Trace 标签
npx playwright show-trace test-results/01-basics-01-structure-demo-xxx/trace.zip
```

Trace Viewer 里重点看：

1. **Actions 时间线**：每一步（含每个 step）的耗时与结果；
2. **Before/After DOM 快照**：像录像一样回放每一步之后页面长什么样——断言失败时直接看「当时页面上到底有什么」；
3. **Network**：每个请求的状态（排登录/接口问题神器）；
4. **Console / Errors**：页面自己抛的错。

**本课必做的一次排障体验**：把示范用例里某个断言改成必失败 → 跑 → 打开 HTML 报告 → 进 Trace Viewer 回放 → 找到失败步骤、看清当时页面状态 → 改回来。

## 6. 作业

打开 `tests/01-basics/90-homework.spec.ts`，把两个 `test.fixme` 骨架补成真实用例。要求：

1. **用例一**：断言三张页面各自的 `<title>`——`/index.html`、`/login.html`、`/todos.html`。每个页面用 `test.step` 分成「打开」和「断言」两步。
   - ⚠️ 故意留的坑：`/todos.html` 未登录会被重定向到 `/login.html`，断言会失败——**不许改断言来绕过**，先用 Trace Viewer 看清楚发生了什么（看 URL 和 DOM 快照），然后在作业里写一行注释解释原因，并把这条页面从用例中去掉（它的正确测法第 5 课讲登录态后回来补）。
2. **用例二**：`/lab.html` 的七个 `<h2>` 区块标题全部可见。
3. 跑法练习：分别用 `-g` 只跑用例一、用 `--repeat-each=2` 观察两个 worker 并行、用 `--list` 确认选择器效果。

做完把 fixme 去掉、跑绿、提交：

```bash
git add -A && git commit -m "learn(01): 完成第 1 课作业"
```

## 7. 自查清单

- [ ] 能说出 `describe` 和 `test.step` 各解决什么问题
- [ ] 不查文档写出 5 个常用 CLI 参数及用途
- [ ] 能独立用 show-report + Trace Viewer 定位一个失败断言
- [ ] 知道 `.only` 和 `-g` 的区别、为什么更推荐 `-g`

完成后告诉 agent 验收，通过后把分支 merge 回 main 并在 `docs/curriculum.md` 打勾。
