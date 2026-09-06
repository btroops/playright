import { test, expect } from '@playwright/test';

/**
 * 第 7 课示范：API 测试与登录态。
 * 配套讲义：lessons/07-api.md
 *
 * 练习这些跑法：
 *   npx playwright test tests/07-api/01-api-demo.spec.ts
 *   npx playwright test 07-api -g "CRUD"
 *
 * 注：API 测试同样要考虑并行安全——本文件每个用例都「自建自删」，
 *     不依赖其他用例留下的数据；对服务端共享数组的操作幂等或可清理。
 */

test.describe('request fixture：纯 API 测试', () => {

  test('未登录访问受保护接口：401', async ({ request }) => {
    // request 夹具：独立的 HTTP 客户端，baseURL 已从配置继承。
    // 没有登录过 → 没有 session cookie → 401。
    const res = await request.get('/api/todos');
    expect(res.status()).toBe(401);
  });

  test('登录拿 cookie，后续请求自动携带', async ({ request }) => {
    await test.step('POST /api/login：正确凭证', async () => {
      // data 会被序列化为 JSON 请求体（Content-Type 自动设置）。
      // 成功响应带 Set-Cookie：session=…——request 上下文自动保存它。
      const res = await request.post('/api/login', {
        data: { username: 'demo', password: 'pass123' },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toMatchObject({ ok: true, username: 'demo' });
    });

    await test.step('GET /api/todos：cookie 自动携带，拿到种子数据', async () => {
      const res = await request.get('/api/todos');
      expect(res.status()).toBe(200);

      const todos = await res.json();
      // 断言 JSON 结构而非整包全等：数组、元素字段齐全即可——
      // 与 UI 断言同哲学：断言「该有的形状」，不断言「恰好长这样」的易变细节。
      expect(Array.isArray(todos)).toBe(true);
      expect(todos[0]).toMatchObject({ id: expect.any(Number), title: expect.any(String), done: expect.any(Boolean) });
    });

    await test.step('错误凭证：401（登出分支见作业）', async () => {
      // 也可以在同一个 request 上下文里测错误路径——
      // 但注意：错误的登录不会清除已存在的 cookie（服务端只在校验凭证）。
      const res = await request.post('/api/login', {
        data: { username: 'demo', password: 'wrong' },
      });
      expect(res.status()).toBe(401);
    });
  });

  test('todos CRUD 全闭环（自建自删，并行安全）', async ({ request }) => {
    const myTodo = { title: `API 演示：${Date.now()}` };

    await test.step('POST：新建（201）', async () => {
      await request.post('/api/login', { data: { username: 'demo', password: 'pass123' } });
      const res = await request.post('/api/todos', { data: myTodo });
      expect(res.status()).toBe(201);
      const created = await res.json();
      expect(created).toMatchObject({ title: myTodo.title, done: false });
    });

    await test.step('PUT：标记完成', async () => {
      // 新建后的列表里找到自己的 id（用 title 定位，id 由服务端分配）。
      const list = await (await request.get('/api/todos')).json();
      const mine = list.find((t: { title: string }) => t.title === myTodo.title);

      const res = await request.put(`/api/todos/${mine.id}`, { data: { done: true } });
      expect(res.status()).toBe(200);
      expect((await res.json()).done).toBe(true);
    });

    await test.step('DELETE：删除并确认消失', async () => {
      const list = await (await request.get('/api/todos')).json();
      const mine = list.find((t: { title: string }) => t.title === myTodo.title);

      expect((await request.delete(`/api/todos/${mine.id}`)).status()).toBe(200);

      const after = await (await request.get('/api/todos')).json();
      expect(after.find((t: { id: number }) => t.id === mine.id)).toBeUndefined();
    });
  });
});

test.describe('page.request 与 storageState：API 与 UI 的桥', () => {

  test('page.request：API 登录后，页面直接是已登录状态', async ({ page }) => {
    await test.step('API 登录（不走 UI 表单）', async () => {
      // page.request 与页面共享 cookie jar——API 拿到的 session cookie，
      // 页面导航时同样携带。这是「API 铺状态 + UI 测表现」模式的根基。
      await page.request.post('/api/login', { data: { username: 'demo', password: 'pass123' } });
    });

    await test.step('直开 todos 页：不再被重定向', async () => {
      await page.goto('/todos.html');
      // 第 1 课踩过的坑：未登录会被重定向到登录页；现在 cookie 在，稳定停留在待办页。
      await expect(page).toHaveURL(/todos\.html$/);
      await expect(page.getByRole('heading', { name: '我的待办' })).toBeVisible();
    });
  });

  test('storageState：把登录态快照复用到新上下文', async ({ page, browser }) => {
    await test.step('UI 登录一次，导出 storageState', async () => {
      await page.goto('/login.html');
      await page.getByLabel('用户名').fill('demo');
      await page.getByLabel('密码').fill('pass123');
      await page.getByRole('button', { name: '登录' }).click();
      await expect(page).toHaveURL(/todos\.html$/);
    });

    await test.step('导出快照并用新上下文复用：天生已登录', async () => {
      // storageState()：当前上下文的 cookie + localStorage 快照（内存对象；
      // 也可以 storageState({ path: 'auth.json' }) 存成文件在项目间共享）。
      // test.step 支持返回值——跨 step 传数据就用它，避免用例层的 let 变量。
      const savedState = await test.step('导出快照', async () => page.context().storageState());

      // browser fixture 与 page 平级：从它 newContext 造一个全新的浏览器上下文。
      const ctx = await browser.newContext({ storageState: savedState });
      const p2 = await ctx.newPage();

      await p2.goto('/todos.html');
      // 没有任何登录动作，却已经是登录态——cookie 从快照里来。
      await expect(p2.getByRole('heading', { name: '我的待办' })).toBeVisible();
      await expect(p2).toHaveURL(/todos\.html$/);

      await ctx.close();   // 自建的上下文自己关（page/page.request 是 fixture 管理的，不用管）
    });
  });
});
