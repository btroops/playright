# 第 6 课：网络——route 拦截与 Mock

> 前置：第 1–5 课完成。本课示范：`tests/06-network/01-network-demo.spec.ts`；作业：`tests/06-network/90-homework.spec.ts`。
> 本课顺手修了 demo-app 一个容错缺陷：慢速加载的 handler 之前不检查响应状态（500 也当成功），现在会显示「加载失败」——mock 测试正是暴露这类盲区的利器。

## 1. route 三板斧

```ts
// ① fulfill：伪造响应，请求根本不会到达服务器
await page.route('**/api/slow*', (route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
);

// ② continue：放行（可顺带改请求头/参数），常用于「观察 + 放行」
await page.route('**/api/**', async (route) => {
  await route.continue();
});

// ③ abort：掐断请求，测「依赖挂了时页面怎么办」
await page.route('**/*.css', (route) => route.abort());
```

匹配模式：`'**/api/slow*'` 这类 glob（`**` 跨目录、`*` 单段），也可用正则 `/\/api\/slow/`。`page.route` 只作用于当前页面；`context.route` 作用于整个上下文的所有页面。

## 2. Mock 的三大价值

1. **提速**：2 秒的慢接口 fulfill 成瞬间——同样的断言从等 2s 变成 0s；
2. **测「难构造」的场景**：服务器 500、空列表、边界数据——真实后端很难随手制造这些状态；
3. **解耦**：前端页面没开发完/后端不稳定，照样测 UI 渲染逻辑。

反面提醒：端到端测试要保留真链路，**别把所有请求都 mock 掉**——mock 过度的测试只能证明「mock 世界里一切正常」。

## 3. 竞态原则仍然生效

`waitForResponse` / `waitForEvent` 都是「先架等待器，再触发」（第 3 课）。route 注册同理：**在 goto/click 之前注册**，否则请求已经飞过去了。

## 4. demo-app 的容错改进（本课分支）

`slow-load` 的 handler 现在：`fetch` 后检查 `res.ok`，非 2xx 显示「加载失败（HTTP xxx）」；网络异常显示「网络异常」；成功时清空错误提示。这些都写在页面的 `#slow-error`（role=alert）里，可被断言。

## 5. 作业（tests/06-network/90-homework.spec.ts）

1. mock `/api/login` 返回 500 → 登录页提交 → 断言错误提示可见；结论注释：为什么这类场景用 mock 而不是真把服务搞挂？
2. mock `/api/todos` 返回空数组 → 打开 todos 页 → 断言「共 0 项」的空状态；结论注释：边界数据为什么要用 mock 造？

## 6. 自查清单

- [ ] fulfill / continue / abort 三者分别适合什么场景
- [ ] 记得 route 要在请求发出前注册（竞态原则）
- [ ] 能说出「mock 过度」的风险
- [ ] 经历过一次「mock 暴露应用容错盲区」（本课 demo-app 的 500 缺陷）
