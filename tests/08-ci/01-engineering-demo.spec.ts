import { test, expect } from '@playwright/test';
import path from 'node:path';

/**
 * 第 8 课示范：工程化——视觉基线、serial 模式、报告附件。
 * 配套讲义：lessons/08-ci.md
 *
 * 练习这些跑法：
 *   npx playwright test tests/08-ci/01-engineering-demo.spec.ts
 *   npx playwright test 08-ci -g "视觉基线" --headed
 *   npx playwright test 08-ci -g "视觉基线" --update-snapshots   # 有意改版后刷新基线
 *
 * 注：本课第一次运行会自动生成视觉基线文件（tests/08-ci/*-snapshots/ 目录），
 *     基线随仓库提交——它是「页面应该长什么样」的可执行规格。
 */

// serial 用例链共享的登录态快照文件：固定路径（test-results/ 已 gitignore）。
// ⚠️ 不能用各用例的 testInfo.outputPath——那是每个用例独立目录，跨用例读不到。
const AUTH_SNAPSHOT = path.join('test-results', 'auth.serial.json');

test.describe('视觉基线：像素级回归', () => {

  test('登录表单渲染稳定（与基线比对）', async ({ page }) => {
    await page.goto('/login.html');

    // toHaveScreenshot：把元素截图与基线做像素级比对。
    // 首次运行自动生成基线并通过；之后每次运行都和基线比，不一致即红。
    // 差异确认是有意改版后，用 --update-snapshots 刷新基线（人工把关）。
    await expect(page.locator('#login-form')).toHaveScreenshot('login-form.png');

    // 为什么只截 #login-form 不截整页：区块小、语义清晰、改版影响面小——
    // 整页截图任何一行文案改动都会红，维护成本高（讲义第 2 节）。
  });
});

// serial 模式：describe 内的用例按顺序执行，前面失败则后面自动 skipped——
// 适合「一串强依赖的步骤」，避免第 1 步挂了之后连环误报。
test.describe.configure({ mode: 'serial' });

test.describe('serial 模式：有依赖的用例链', () => {

  test('步骤 1：UI 登录，把登录态存为文件', async ({ page }) => {
    await page.goto('/login.html');
    await page.getByLabel('用户名').fill('demo');
    await page.getByLabel('密码').fill('pass123');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL(/todos\.html$/);

    // storageState({ path })：登录态快照存成 JSON 文件（第 7 课）。
    // 路径用模块常量 AUTH_SNAPSHOT——serial 的下一步从同一路径读它。
    await page.context().storageState({ path: AUTH_SNAPSHOT });
  });

  test('步骤 2：用快照文件开已登录上下文', async ({ browser }) => {
    // storageState 直接传【文件路径字符串】。
    // ⚠️ 坑：newContext 的 storageState 只接受「路径字符串」或「{ cookies, origins } 对象」，
    // 写成 { path: … } 会被静默忽略——拿到空状态，登录态神秘失效。
    const ctx = await browser.newContext({ storageState: AUTH_SNAPSHOT });
    const authed = await ctx.newPage();

    await authed.goto('/todos.html');
    // 快照里带着 session cookie：无登录动作，直接是已登录状态。
    await expect(authed).toHaveURL(/todos\.html$/);
    await expect(authed.getByRole('heading', { name: '我的待办' })).toBeVisible();

    await ctx.close();
  });
});

test.describe('报告附件：把关键信息留在案发现场', () => {

  test('attach：运行环境摘要挂进报告', async ({ page }, testInfo) => {
    await page.goto('/');

    const summary = [
      `UA: ${await page.evaluate(() => navigator.userAgent)}`,
      `标题: ${await page.title()}`,
      `URL: ${page.url()}`,
    ].join('\n');

    // testInfo.attach：给报告附上文本/文件——HTML 报告里点开就能看。
    // 适合留「排障需要的现场信息」：环境、关键中间值、失败时的页面摘要等。
    await testInfo.attach('环境摘要', { body: summary, contentType: 'text/plain' });

    await expect(page).toHaveTitle(/练习应用/);
  });
});
