import { test, expect } from '@playwright/test';

/**
 * 第 1 课作业（讲义：lessons/01-basics.md 第 6 节）。
 * 把下面的 test.fixme 骨架补成真实用例；完成后跑绿再提交：
 *   git add -A && git commit -m "learn(01): 完成第 1 课作业"
 */

test.describe('作业：三张页面的标题', () => {
  test('index / login 各有自己的标题', async ({ page }) => {
    // 依次访问 /index.html、/login.html，每个页面都用 test.step 拆成
    // 「打开」和「断言」两步。

    await test.step('打开 /index.html', async () => {
      await page.goto('/index.html');
    });

    await test.step('断言 /index.html 标题', async () => {
      await expect(page).toHaveTitle('Playwright 练习应用');
    });

    await test.step('打开 /login.html', async () => {
      await page.goto('/login.html');
    });

    await test.step('断言 /login.html 标题', async () => {
      await expect(page).toHaveTitle('登录 · Playwright 练习应用');
    });

    // await test.step('打开 /todos.html', async () => {
    //   await page.goto('/todos.html');
    // });
    // await test.step('断言 /todos.html 标题', async () => {
    //   await expect(page).toHaveTitle('Todo 列表 · Playwright 练习应用');
    // });

    // ⚠️ 关于 /todos.html 的坑（讲义 6.1）：
    // 未登录直接访问 /todos.html 时，页面脚本会请求 /api/todos，
    // 接口返回 401，前端随即 location.href = '/login.html' 做重定向。
    // 所以标题最终是「登录 · Playwright 练习应用」而不是「Todo 列表 · …」，
    // toHaveTitle 断言必然失败——这不是断言写错，而是被测行为本身就这样。
    // 在 Trace Viewer 里能清楚看到：URL 跳到了 /login.html、DOM 变成了登录页。
    // 因此这里刻意不把 /todos.html 纳入断言（也不改断言绕过），
    // 它的正确测法（先建立登录态再断言）留到第 5 课学完登录态后回来补。
  });
});

test.describe('作业：练习场区块', () => {
  test('七个考点区块全部可见', async ({ page }) => {
    await test.step('打开 /lab.html', async () => {
      await page.goto('/lab.html');
    });

    await test.step('断言七个 <h2> 区块标题可见', async () => {
      for (const name of [
        '弹窗对话框',
        '慢速内容',
        '动态列表',
        '文件上传',
        '启用与禁用',
        '悬停提示',
        'iframe 内嵌页面',
      ]) {
        await expect(page.getByRole('heading', { name })).toBeVisible();
      }
    });
  });
});
