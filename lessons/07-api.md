# 第 7 课：API 测试与登录态——request fixture 与 storageState

> 前置：第 1–6 课完成。本课示范：`tests/07-api/01-api-demo.spec.ts`；作业：`tests/07-api/90-homework.spec.ts`。
> 本课不改 demo-app——API 面早已就绪：`/api/login`、`/api/me`、`/api/logout`、`/api/todos`（CRUD）、`/api/slow`。

## 1. 为什么要做 API 测试

UI 测试慢（要等渲染）、脆（受样式影响）；API 测试**快一个数量级、且直击业务正确性**。成熟的测试策略是分层：大量 API 测试保业务逻辑，少量 UI 测试保用户旅程——而不是倒过来的「冰激凌筒」。

demo-app 的 API 面就是被测对象：

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/login` | POST | `{username, password}` → 成功 Set-Cookie `session=…`，失败 401 |
| `/api/me` | GET | 当前登录用户，未登录 401 |
| `/api/todos` | GET/POST | 列表 / 新建（201），需登录 |
| `/api/todos/:id` | PUT/DELETE | 更新 / 删除，不存在 404 |
| `/api/slow` | GET | 慢端点（第 3、6 课用过） |

## 2. request fixture：脱离浏览器的 HTTP 客户端

```ts
test('…', async ({ request }) => {
  const res = await request.post('/api/login', { data: { username: 'demo', password: 'pass123' } });
  expect(res.status()).toBe(200);
});
```

- `request` 夹具是独立的 HTTP 客户端（baseURL 已配置好）；
- **cookie 自动管理**：login 的 Set-Cookie 会留在 request 上下文里，后续 GET/POST 自动带上——登录态就这么建立；
- 断言响应：`expect(res.ok())`（普通断言，值已到手）或 `const body = await res.json()` 后断言结构。

## 3. page.request：与页面共享 cookie

`page.request` 与该页面共享同一个 cookie jar——**API 登录后，页面直接就是已登录状态**：

```ts
await page.request.post('/api/login', { data: { … } });
await page.goto('/todos.html');   // 不再被重定向，UI 测试跳过慢速的 UI 登录
```

这是「API 铺状态 + UI 测表现」的经典模式，比 UI 登录快且稳。

## 4. storageState：把登录态存下来复用

```ts
// 任何已登录的上下文里：
const state = await page.context().storageState();   // cookie + localStorage 快照
const another = await browser.newContext({ storageState: state });  // 新上下文直接是登录态
```

也可以存成文件（`storageState: { path: 'auth.json' }`）在项目间共享——大规模套件的标配做法（第 8 课的 setup project 是它的工程化形态）。

## 5. 作业（tests/07-api/90-homework.spec.ts）

1. **CRUD 全套 + 异常分支**：request fixture 完成 todos 增删改查全流程，并对不存在的 id 断言 404、错误密码断言 401；
2. **storageState 练习**：UI 登录 → 保存 storageState → 新 context 复用 → 直开 todos 页断言已登录。

## 6. 自查清单

- [ ] 能说清 request 与 page.request 的区别（独立 vs 共享页面 cookie）
- [ ] API 测试的断言风格：status + JSON 结构
- [ ] 会用 storageState 保存与复用登录态
- [ ] 理解「API 铺状态、UI 测表现」的分层思路
