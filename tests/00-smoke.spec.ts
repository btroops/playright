import { test, expect } from '@playwright/test';

// 冒烟测试：验证「配置 + demo-app + 浏览器」整条链路可用
test('应用首页可以打开', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Playwright 练习应用/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Playwright 练习应用/);
});
