import { test, expect } from '@playwright/test';

/**
 * 第 6 课示范：route 拦截与 Mock。
 * 配套讲义：lessons/06-network.md
 *
 * 练习这些跑法：
 *   npx playwright test tests/06-network/01-network-demo.spec.ts
 *   npx playwright test 06-network -g "伪造响应" --headed
 *
 * 注：route 是【页面级】的，只影响当前 page 发出的请求；
 *     注册时机必须早于请求发出（第 3 课的竞态原则）。
 */

test.describe('fulfill：伪造响应', () => {

  test('mock 慢接口：2 秒变瞬间，测试提速', async ({ page }) => {
    await test.step('注册 mock：/api/slow 立即返回成功', async () => {
      // page.route(pattern, handler)：匹配 pattern 的请求不再发给服务器，
      // 而是交给 handler。fulfill 直接「伪造」一个响应返回给页面。
      // 注册必须发生在 goto/click 之前——请求飞过去后再拦就晚了（竞态原则）。
      await page.route('**/api/slow*', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, waitedMs: 0 }),
        })
      );
    });

    await test.step('点击加载，结果瞬间出现', async () => {
      await page.goto('/lab.html');

      const respPromise = page.waitForResponse(/\/api\/slow/);
      await page.getByTestId('slow-load-trigger').click();
      const resp = await respPromise;
      expect(resp.status()).toBe(200);

      // 对比第 3 课：同样的断言，真实接口要等 2 秒，mock 后瞬间通过——
      // mock 是端到端测试提速的大杀器（但别把所有接口都 mock 掉，讲义第 2 节）。
      await expect(page.locator('#slow-section').getByRole('listitem')).toHaveText(/第 1 次加载完成/);
    });
  });

  test('mock 数据：不登录也能测 Todo 页的渲染', async ({ page }) => {
    await test.step('拦截 /api/todos 返回自定义数据', async () => {
      // /todos.html 未登录会请求 /api/todos → 401 → 重定向到登录页（第 1 课的坑）。
      // 现在 fulfill 一个 200 的自定义列表：请求根本到不了服务器，
      // 没有 401、没有重定向——认证依赖被彻底解耦，纯测 UI 渲染。
      await page.route('**/api/todos', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ id: 99, title: '被 mock 的待办', done: true }]),
        })
      );
    });

    await test.step('断言 mock 数据被正确渲染', async () => {
      await page.goto('/todos.html');

      await expect(page.getByRole('listitem').filter({ hasText: '被 mock 的待办' })).toHaveCount(1);
      // 前端统计文案也应跟随数据：done: true → 完成 1 项。
      await expect(page.locator('#stats')).toHaveText('共 1 项，完成 1 项');
    });
  });

  test('mock 500：验证页面对服务端错误的容错', async ({ page }) => {
    await test.step('注册 mock：/api/slow 返回 500', async () => {
      // 真实后端很难「随手」给你一个 500；mock 一行搞定。
      await page.route('**/api/slow*', (route) =>
        route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"internal"}' })
      );
    });

    await test.step('点击加载，断言错误提示且列表不新增', async () => {
      await page.goto('/lab.html');
      await page.getByTestId('slow-load-trigger').click();

      // demo-app 的 handler 检查 res.ok，500 → 显示「加载失败（HTTP 500）」（role=alert）。
      // ⚠️ 上一版应用没有这个检查：500 也被当成成功，列表照常新增——
      // 这个缺陷正是被 mock 500 的测试暴露出来的。mock 不仅测「好的路径」，
      // 更能逼出「坏的路径」上应用的容错盲区。
      await expect(page.getByRole('alert')).toHaveText(/加载失败（HTTP 500）/);
      await expect(page.locator('#slow-section').getByRole('listitem')).toHaveCount(0);
    });
  });
});

test.describe('continue：放行但留下观察记录', () => {

  test('记录请求 URL 后放行，验证请求参数', async ({ page }) => {
    await test.step('注册「观察 + 放行」的 route', async () => {
      // continue()：请求照常发给服务器（页面行为不变），
      // 但我们在 handler 里留下了观察记录——适合「验证前端发的请求对不对」。
      const requested: string[] = [];
      await page.route('**/api/slow*', async (route) => {
        requested.push(route.request().url());
        await route.continue();
      });

      await page.goto('/lab.html');
      await page.getByTestId('slow-load-trigger').click();

      // requested 是本地数组（非页面状态），事件派发异步——用 expect.poll 轮询（第 3 课）。
      await expect.poll(() => requested.length).toBe(1);
      // 前端应该请求 /api/slow?ms=2000：慢 2 秒是【前端的契约】，mock 它之前先确认它真的发了。
      expect(requested[0]).toContain('ms=2000');
    });
  });
});
