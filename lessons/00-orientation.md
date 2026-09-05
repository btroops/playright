# 第 0 课：熟悉工具——跑测试、看结果、调试

> 目标：不求看懂每一行代码，先把「改代码 → 跑测试 → 看结果」这个循环跑熟。后面所有课程都在这个循环里进行。

## 1. 项目里有什么

```
demo-app/          被测应用（Express）。测试不是测真网站，而是测这个本地应用
tests/             测试代码。00-smoke.spec.ts 是第一条用例
playwright.config.ts  测试运行器配置：去哪找用例、起什么浏览器、自动拉起被测应用
```

`playwright.config.ts` 里最重要的两块：

- `use.baseURL`：所有 `page.goto('/xxx')` 的基地址；
- `webServer`：跑测试前自动启动 `node demo-app/server.js`，并等它的 `/api/health` 返回 200——所以你**不需要手动启动被测应用**。

## 2. 第一条用例在做什么

```ts
test('应用首页可以打开', async ({ page }) => {
  await page.goto('/');                                   // 打开首页
  await expect(page).toHaveTitle(/Playwright 练习应用/);   // 断言标题
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Playwright 练习应用/);
});
```

每个测试函数会拿到一个全新的 `page`（干净浏览器上下文），互不影响。`expect(...).toHaveXxx()` 是**自动等待**的断言：条件没满足就轮询重试直到超时，不需要手写 sleep。

## 3. 跑起来

```bash
npx playwright test                # headless：看不见浏览器，速度最快
npx playwright test --headed       # 有头：浏览器窗口直接显示在 Windows 桌面（WSLg）
npx playwright test --ui           # UI Mode：可视化选择/重放用例，最推荐初学时开着
npx playwright test 00-smoke       # 只跑文件名匹配的用例
npx playwright test --debug        # Playwright Inspector：单步执行
```

> WSL 用户：`--headed` 和 `--ui` 依赖 WSLg，本机已可用；如果窗口没弹出来，检查 `echo $DISPLAY` 是否为 `:0`。

## 4. 失败了怎么看

故意把用例改错（比如断言改成 `/不存在的标题/`），然后：

1. 终端里的 `list` reporter 会显示哪一步失败、期望 vs 实际；
2. `npx playwright show-report` 打开 HTML 报告（WSL 下用 Windows 浏览器访问它提示的地址，如 <http://localhost:9323>）；
3. 失败用例会自动留下 trace（配置里 `trace: 'retain-on-failure'`），报告里可以直接打开 **Trace Viewer**——像看录像一样回放每一步的 DOM 快照、网络请求和控制台日志。这是 Playwright 最强力的排障工具。

改回正确的断言，确认恢复绿色。

## 5. 动手练（本次不需要提交）

1. 把 `00-smoke.spec.ts` 复制成 `tests/00-homework.spec.ts`，改成访问 `/lab.html` 并断言页面里有「练习场」标题；
2. 用 `--headed` 跑一遍，亲眼看浏览器动作；
3. 故意弄失败一次，走一遍「HTML 报告 → trace」的排障路径。

## 6. 下一课预告

第 1 课（`learn/01-basics` 分支）正式开始系统学习：test 组织、`test.step`、常用命令行参数、reporter 与 trace 的更多玩法。开课时在主仓库执行：

```bash
bash scripts/new-worktree.sh learn/01-basics
```
