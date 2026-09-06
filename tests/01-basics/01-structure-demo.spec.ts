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

// ─────────────────────────────────────────────────────────────
// describe：把一组相关的测试用例「打包」成一个分组（在报告里是层级目录）
// 第一个参数是分组名（中文也可），便于 --grep 按名字筛选、报告里归类。
// ─────────────────────────────────────────────────────────────
test.describe('首页', () => {

  // test：一个独立用例。每个用例之间互相隔离（各自独立的 page/浏览器上下文）。
  // 参数一：用例标题（会显示在报告里，也用于 -g 正则匹配）。
  // 参数二：测试函数，Playwright 会注入 page（当前标签页）等夹具(fixture)。
  test('打开首页可以看到应用入口', async ({ page }) => {

    // test.step：把用例内部拆成带名字的「子步骤」，让报告/重试时更易读。
    // 它不改变测试行为，只是给执行过程加一层可读的分组。
    await test.step('打开首页', async () => {
      // goto：导航到相对路径。因为 playwright.config.ts 里设了 baseURL，
      // 这里 '/' 实际等价于 http://localhost:<端口>/ ，即 index.html。
      await page.goto('/');
    });

    await test.step('断言标题与导航链接', async () => {
      // expect + toHaveTitle：断言浏览器标签页的 <title> 匹配正则。
      await expect(page).toHaveTitle(/Playwright 练习应用/);

      // getByRole('navigation')：按「无障碍角色」定位导航栏（对应 <nav>）。
      // 这是 Playwright 推荐的首选定位方式——稳定、贴近真实用户/读屏软件视角。
      const nav = page.getByRole('navigation');

      // 在 nav 作用域内继续定位链接：角色 link + 可见文字 name。
      // toBeVisible：断言元素「可见」（在视口内、非 display:none/visibility:hidden）。
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
      // click：真实点击该链接。Playwright 会自动等待元素「可点击」再点。
      await page.getByRole('navigation').getByRole('link', { name: '练习场' }).click();

      // toHaveURL：断言当前地址栏 URL 匹配正则。
      // /lab\.html$/ 的 $ 表示「以 lab.html 结尾」，避免误匹配带查询参数的情况。
      await expect(page).toHaveURL(/lab\.html$/);

      // 用 role+name 精确定位标题：heading 是 <h1>~<h6>，name 取其文字内容。
      await expect(page.getByRole('heading', { name: '练习场' })).toBeVisible();
    });
  });
});

// 第二个分组：练习场相关用例
test.describe('练习场', () => {
  test('页面包含全部考点区块', async ({ page }) => {
    await test.step('打开练习场', async () => {
      await page.goto('/lab.html');
    });

    await test.step('断言七个区块标题可见', async () => {
      // 把要校验的区块标题放进数组，用 for 循环逐个断言——避免重复 7 遍几乎一样的代码。
      for (const name of ['弹窗对话框', '慢速内容', '动态列表', '文件上传', '启用与禁用', '悬停提示', 'iframe 内嵌页面']) {
        // 每个标题都是 <h?> 角色，用 name 匹配其文字。
        await expect(page.getByRole('heading', { name })).toBeVisible();
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────
// 用例标注（annotations）：skip / fixme 用来「临时不跑」或「标记待办」。
// ─────────────────────────────────────────────────────────────

// test.skip(condition, reason)：
//   当 condition 为 true 时「跳过」该用例——跳过后的代码【不会执行】。
//   适合「某些环境/条件不满足时先别跑」的场景（条件性跳过）。
test('标注示例：skip', async ({ page }) => {
  test.skip(true, '示例：条件不满足时跳过');
  await page.goto('/'); // 因为上面 skip(true)，这一行永远不会执行
});

// test.fixme()：语义是「这个用例还没写好 / 已知失败，先标记着」。
// 与 skip 的区别：skip 是「条件不满足主动不跑」；fixme 是「我打算写但还没写好」。
// 两者在报告里都显示为 skipped/未执行，但意图不同，便于团队沟通。
test.fixme('标注示例：fixme', () => {
  // 这里故意留空，代表「待实现」
});
