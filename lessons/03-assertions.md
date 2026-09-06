# 第 3 课：断言与等待——「测得稳」的根基

> 前置：第 1、2 课完成。本课示范：`tests/03-assertions/01-assertions-demo.spec.ts`；作业：`tests/03-assertions/90-homework.spec.ts`。
> 本课不需要改 demo-app：`/api/slow`（2 秒慢端点）和「启用与禁用」区块就是现成的考点。

## 1. 两类断言，命运完全不同

```ts
// ① 普通断言：同步、瞬间、不重试——拿到什么就比什么
expect(1 + 1).toBe(2);
expect(resp.status()).toBe(200);      // 对「已经到手的最终值」没问题

// ② web-first 断言：传给 expect 的是 locator（页面状态的「说明书」），
//    断言会反复轮询页面，直到条件满足或超时——这是测试稳定性的根基
await expect(page.getByRole('button', { name: '提交' })).toBeEnabled();
```

反面教材（新手最常踩）：「先取值，再普通断言」——

```ts
const text = await page.locator('#slow-list').textContent(); // 取值瞬间元素可能还没渲染
expect(text).toContain('第 1 次加载完成');                    // 普通断言不重试，误报失败
```

取值那一刻页面没就绪 → 拿到空/旧值 → 断言瞬间失败。**值会过期，说明书不会**。要对页面状态做断言，永远走 locator；确实要断言「现取的值」，用 `expect.poll`（见第 5 节）。

## 2. 自动等待的两层

| 层 | 等什么 | 例子 |
|---|---|---|
| **动作的 actionability** | 元素可见、位置稳定、可交互（enabled、不被遮挡、能接收事件） | `click()` 会等按钮从 disabled 恢复后自动再点 |
| **断言的轮询** | 条件为真，每 ~100ms 查一次，超时为止 | `toBeVisible()` 等元素渲染出来 |

两层都是「上限内尽可能等」，**超时是上限，不是固定等待时长**——页面就绪时第一次轮询就通过，不会傻等满 5 秒。

## 3. 常用 web-first 断言速查

| 断言 | 断言什么 |
|---|---|
| `toBeVisible()` / `toBeHidden()` | 可见 / 不可见 |
| `toBeEnabled()` / `toBeDisabled()` | 可交互 / 禁用 |
| `toBeChecked()` | 复选/单选选中 |
| `toHaveText('全文')` / `toContainText('片段')` | 文字内容 |
| `toHaveValue('…')` | 输入框的值 |
| `toHaveCount(n)` | 匹配元素个数（数数专用，不受严格模式约束） |
| `toHaveURL(/…/)` / `toHaveTitle(/…/)` | 地址栏 / 标签页标题 |
| `toHaveAttribute('href', /…/)` / `toHaveClass(/…/)` | 属性 / class |
| 都支持 `.not` 取反，同样自动轮询 | `await expect(locator).not.toBeVisible()` |

## 4. 超时体系

- **单次覆盖**：`await expect(locator).toBeVisible({ timeout: 10_000 })`——只给这一条加长；
- **全局默认**：config 里 `expect: { timeout: 5_000 }`（默认 5s）、`use: { actionTimeout: … }`（动作上限）；
- 原则：**个别慢场景单独加长，别把全局超时调成天文数字**——那会让真正的 bug 也慢慢死，反馈变钝。

## 5. 对「现取的值」做带重试的断言

```ts
// expect.poll：反复执行 fn，对返回值应用断言（默认 5s 上限、~100ms 间隔）
await expect.poll(async () => locator.count()).toBe(2);

// expect.toPass：重试一整段操作（可以包含多个步骤），直到不抛错为止
await expect(async () => {
  await page.getByRole('button', { name: '刷新' }).click();
  await expect(page.getByText('已刷新')).toBeVisible();
}).toPass();
```

等网络响应用 `page.waitForResponse(/…/)`、等跳转用 `page.waitForURL(/…/)`——注意**先创建等待器，再触发动作**，否则响应可能抢在等待器就位前返回（竞态）。

## 6. 反模式：硬性 sleep

`page.waitForTimeout(2000)` = 「祈祷 2 秒够用」：慢了误报失败，快了白白浪费时间。它还带双倍伤害：网络稍抖测试就红，而每次跑都白等。**本项目 lint 已启用 `playwright/no-wait-for-timeout`，写了直接报错。**

等待的正确姿势按优先级：locator 断言（首选）→ waitForResponse/waitForURL → expect.poll / toPass →（实在没有可观察状态时才考虑）waitForTimeout。

## 7. 作业（tests/03-assertions/90-homework.spec.ts）

1. **慢速内容完整闭环**：waitForResponse 等 `/api/slow` → 断言第 1 条出现 → 再点一次（体会第二次 click 如何自动等 enabled）→ `expect.poll` 断言共 2 条；结论注释回答：为什么全程不需要 `waitForTimeout(2000)`？
2. **提交按钮状态机**：初始 disabled → 勾选后 enabled → 点击 → 「提交成功」出现 → `reload()` 后按钮回到 disabled；结论注释回答：为什么刷新就重置了？

## 8. 自查清单

- [ ] 能说清「取值 + 普通断言」为什么会误报，以及 `expect.poll` 如何修复它
- [ ] 知道动作的 actionability 检查包含哪些条件
- [ ] 给某一条天生慢的断言单独加长超时，而不动全局配置
- [ ] 看到 `waitForTimeout` 会本能警惕（lint 也会替你警惕）
