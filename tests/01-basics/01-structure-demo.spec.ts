import { test, expect } from '@playwright/test';

/**
 * 第 1 课示范：组织（describe）与步骤（test.step）。
 * 配套讲义：lessons/01-basics.md
 *
 * 练习这些跑法：
 *   npx playwright test tests/01-basics/01-structure-demo.spec.ts
 *   npx playwright test basics -g "首页"
 *   npx playwright test basics -g "练习场" --headed
 *   npx playwright test basics --list
 *
 * 注：这里用到的定位器（getByRole 等）第 2 课系统讲，本课只需看懂结构。
 */

test.describe('首页', () => {
  test('打开首页可以看到应用入口', async ({ page }) => {
    await test.step('打开首页', async () => {
      await page.goto('/');
    });

    await test.step('断言标题与导航链接', async () => {
      await expect(page).toHaveTitle(/Playwright 练习应用/);
      const nav = page.getByRole('navigation');
      await expect(nav.getByRole('link', { name: '登录' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Todo 列表' })).toBeVisible();
      await expect(nav.getByRole('link', { name: '练习场' })).toBeVisible();
    });
  });

  test('从首页可以进入练习场', async ({ page }) => {
    await test.step('打开首页', async () => {
      await page.goto('/');
    });

    await test.step('点击「练习场」链接并断言落地', async () => {
      await page.getByRole('navigation').getByRole('link', { name: '练习场' }).click();
      await expect(page).toHaveURL(/lab\.html$/);
      await expect(page.getByRole('heading', { name: '练习场' })).toBeVisible();
    });
  });
});

test.describe('练习场', () => {
  test('页面包含全部考点区块', async ({ page }) => {
    await test.step('打开练习场', async () => {
      await page.goto('/lab.html');
    });

    await test.step('断言七个区块标题可见', async () => {
      for (const name of ['弹窗对话框', '慢速内容', '动态列表', '文件上传', '启用与禁用', '悬停提示', 'iframe 内嵌页面']) {
        await expect(page.getByRole('heading', { name })).toBeVisible();
      }
    });
  });
});

test('标注示例：skip / fixme', async ({ page }) => {
  // 讲义第 1 节：skip 与 fixme 都让用例显示为 skipped，语义不同——
  // skip = 「条件不满足，暂不跑」；fixme = 「这个用例还没写好」。
  test.fixme('示例：这条用例还没实现，第 2 课后可以回来把它补成真实断言');
});
