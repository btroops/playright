import { test, expect } from '@playwright/test';

/**
 * 第 3 课示范：断言与等待——「测得稳」的根基。
 * 配套讲义：lessons/03-assertions.md；注释风格：docs/comment-style.md
 *
 * 练习这些跑法：
 *   npx playwright test tests/03-assertions/01-assertions-demo.spec.ts
 *   npx playwright test 03-assertions -g "禁用按钮" --headed
 *
 * 注：本课的「慢」都来自 /api/slow（2 秒）与前端渲染，
 *     所有等待都交给 Playwright 自动处理——全程没有一个硬性 sleep。
 */

// ─────────────────────────────────────────────────────────────
// 两类断言：expect(值) 同步瞬间、不重试；expect(locator) 反复轮询页面
// 直到条件满足或超时——后者叫 web-first 断言，是稳定性的根基。
// ─────────────────────────────────────────────────────────────

test.describe('web-first 断言：断言自己会等', () => {

  test('慢速内容：断言自动等待 2 秒后通过，无需 sleep', async ({ page }) => {
    await test.step('打开练习场', async () => {
      await page.goto('/lab.html');
    });

    await test.step('先架网络等待器，再点击——顺序即正确性', async () => {
      // waitForResponse(/…/)：等一个匹配该正则的网络响应。
      // 关键顺序：【① 先创建等待器 → ② 触发动作 → ③ 收割响应】——
      // 若先点击后架等待器，响应可能抢在等待器就位前返回（竞态），等待器就会等到超时。
      const respPromise = page.waitForResponse(/\/api\/slow/);    // ① 等待器就位
      await page.getByTestId('slow-load-trigger').click();        // ② 触发（自带 actionability 等待）
      const resp = await respPromise;                             // ③ 收割
      expect(resp.status()).toBe(200);
    });

    await test.step('直接断言结果出现：轮询替我们等了 2 秒', async () => {
      // toBeVisible / toHaveText / toHaveCount：web-first 断言。此刻新列表项
      // 大概率还没渲染，断言以默认 5s 为上限反复轮询（约每 100ms 一次），
      // 约 2 秒后渲染完成即通过。
      //
      // 反面写法（不要这样做）：
      //   const text = await page.locator('#slow-list').textContent(); // 取值瞬间元素可能还不存在
      //   expect(text).toContain('第 1 次加载完成');                    // 普通断言不重试 → 误报失败
      // 值会过期，「查找说明书」不会过期——对页面状态永远断言 locator。
      const item = page.locator('#slow-section').getByRole('listitem');
      await expect(item).toBeVisible();
      await expect(item).toHaveText('第 1 次加载完成');
      await expect(item).toHaveCount(1);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// 动作的自动等待（actionability）：click/fill/check 执行前会检查
// 元素可见、位置稳定、可交互（enabled、不被遮挡、能接收事件）。
// ─────────────────────────────────────────────────────────────
test.describe('动作的自动等待：可操作性检查', () => {

  test('禁用按钮：勾选复选框后才能点，全程无 sleep', async ({ page }) => {
    await test.step('初始状态：提交按钮禁用、复选框未选中', async () => {
      await page.goto('/lab.html');

      // toBeDisabled / toBeChecked：状态类 web-first 断言。
      // .not 取反同样自动轮询——「等它变成不是这样」也是等。
      await expect(page.getByRole('button', { name: '提交' })).toBeDisabled();
      await expect(page.getByRole('checkbox')).not.toBeChecked();
    });

    await test.step('勾选「我已阅读说明」，按钮随之启用', async () => {
      // check：勾选复选框——自动等待可勾选，并保证动作完成后是【选中】状态。
      await page.getByRole('checkbox').check();

      await expect(page.getByRole('button', { name: '提交' })).toBeEnabled();
    });

    await test.step('点击提交，断言结果文字出现', async () => {
      await page.getByRole('button', { name: '提交' }).click();

      // getByText：按文字内容定位（第 2 课）；toBeVisible 轮询等它出现。
      await expect(page.getByText('提交成功')).toBeVisible();
    });
  });
});

// ─────────────────────────────────────────────────────────────
// 轮询与超时：expect.poll 修复「取值 + 普通断言」不重试的缺陷；
// 超时是【上限】不是【等待时长】——页面就绪时第一次轮询就通过。
// ─────────────────────────────────────────────────────────────
test.describe('轮询与超时', () => {

  test('expect.poll：对「现取的值」做带重试的断言', async ({ page }) => {
    await test.step('连续点两次慢速加载', async () => {
      await page.goto('/lab.html');

      const slowBtn = page.getByTestId('slow-load-trigger');
      await slowBtn.click();

      // 第二次 click 时按钮多半已被处理函数禁用（fetch 进行中）——
      // 不用担心：动作的 actionability 包含 enabled 检查，会等它恢复可用再点。
      await slowBtn.click();
    });

    await test.step('expect.poll 反复取值直到为 2', async () => {
      // count()：立即返回当前匹配数（不等待）——单独用毫无等待能力，
      // 但放进 expect.poll 里就会带着「取值」一起被重试。
      // poll 默认 5s 上限、约 100ms 间隔；第二次请求 2 秒后完成，第 2 条渲染出来即通过。
      await expect
        .poll(async () => page.locator('#slow-section').getByRole('listitem').count())
        .toBe(2);
    });
  });

  test('超时是上限不是等待时长：就绪即通过', async ({ page }) => {
    await test.step('默认超时与单次覆盖', async () => {
      await page.goto('/lab.html');

      // 页面已就绪 → 第一次轮询就通过，不会傻等满默认的 5 秒。
      await expect(page).toHaveTitle(/练习场/);

      // 单次覆盖 timeout：只给这一条加长，全局配置不动——
      // 个别天生慢的断言单独照顾，别把全局超时调成天文数字（会钝化真 bug 的反馈）。
      await expect(page.getByTestId('slow-load-trigger')).toBeVisible({ timeout: 10_000 });
    });
  });
});
