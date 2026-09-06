import { test, expect } from '@playwright/test';

/**
 * 第 2 课示范：定位器（Locators）——Playwright 最核心的一课。
 * 配套讲义：lessons/02-locators.md；注释风格：docs/comment-style.md
 *
 * 练习这些跑法：
 *   npx playwright test tests/02-locators/01-locators-demo.spec.ts
 *   npx playwright test 02-locators -g "严格模式"
 *   npx playwright test 02-locators -g "getByLabel" --headed
 *
 * 注：本文件全部用例【只读】——只定位、只断言，不改变页面状态，
 *     这样多个 worker 并行跑也不会互相干扰；会改状态的操作在作业里单独练。
 */

// ─────────────────────────────────────────────────────────────
// 定位器三性质：①惰性——getByRole(...) 只是生成「查找说明书」，
// 真正查找发生在 await 动作/断言那一刻，并带自动等待；
// ②严格——同时匹配到多个元素就抛 strict mode violation；
// ③可链式——定位器上还能继续定位，先圈地再定位。
// ─────────────────────────────────────────────────────────────

test.describe('面向用户的定位器', () => {

  test('getByRole：角色 + 可访问名（首选定位方式）', async ({ page }) => {
    await test.step('打开练习场', async () => {
      await page.goto('/lab.html');
    });

    await test.step('按角色与名字定位，并理解 name 的子串匹配', async () => {
      // getByRole(role, { name })：按「无障碍角色」+「可访问名」定位。
      // heading 对应 <h1>~<h6>，可访问名就是标签里的文字。
      await expect(page.getByRole('heading', { name: '弹窗对话框' })).toBeVisible();

      // name 默认【忽略大小写 + 子串匹配】——所以 name: '加载' 会同时命中
      // 「加载慢速内容（约 2 秒）」和「加载更多」两个按钮。
      // toHaveCount 是「数数」断言：它【不】受严格模式约束，专门用来数匹配数。
      await expect(page.getByRole('button', { name: '加载' })).toHaveCount(2);

      // 要全等匹配加 exact: true（仍会 trim 首尾空白）。
      // 全等后 '加载' 一个都匹配不上（按钮全文都比它长），count 归零。
      await expect(page.getByRole('button', { name: '加载', exact: true })).toHaveCount(0);

      // 说全条件（name: '加载更多'）后唯一命中，可以做动作/断言了。
      await expect(page.getByRole('button', { name: '加载更多' })).toBeVisible();
    });
  });

  test('getByLabel：表单控件靠 label 关联定位', async ({ page }) => {
    await test.step('打开登录页', async () => {
      await page.goto('/login.html');
    });

    await test.step('用 label 文字找到输入框并填写', async () => {
      // getByLabel(text)：找「<label> 文字」关联的表单控件。
      // 前提是 HTML 里 label 的 for 和 input 的 id 正确关联——
      // 这也是语义化 HTML 的红利：写对了页面，定位器天然稳定。
      // fill：清空后输入。它也是「动作」，自带自动等待（等元素可输入）。
      await page.getByLabel('用户名').fill('demo');
      await page.getByLabel('密码').fill('pass123');

      // toHaveValue：断言输入框当前值（web-first 断言，自动等待生效中）。
      // 这里只验证「定位对了」，提交登录留给作业的流程题去练。
      await expect(page.getByLabel('用户名')).toHaveValue('demo');
      await expect(page.getByLabel('密码')).toHaveValue('pass123');
    });
  });
});

// ─────────────────────────────────────────────────────────────
// 缩小范围：链式（先圈地，再定位）与 filter（按内容筛出那一行）
// ─────────────────────────────────────────────────────────────
test.describe('缩小范围：链式与 filter', () => {

  test('链式定位：全页 6 个「按钮」，圈定区块后只剩想要的那个', async ({ page }) => {
    await test.step('打开练习场', async () => {
      await page.goto('/lab.html');
    });

    await test.step('对比全页与区块内的匹配数', async () => {
      // page.locator(css)：CSS 定位器（最后手段之一，这里用作「圈地」的结构锚点）。
      // 链式：先 locator('#dialog-section') 圈定区块，再在圈内 getByRole。
      // 圈地用什么都行，圈内尽量用语义定位器。
      //
      // 注意是 6 个不是 5 个：页面上只有 5 个 <button>，但
      // <input type="file"> 在无障碍树里的角色也是 button（触发「选择文件」），
      // 它的可访问名来自 aria-label="选择文件"——
      // 记住：getByRole 看的是【无障碍树】，不是 HTML 标签名。
      await expect(page.getByRole('button')).toHaveCount(6);
      await expect(page.getByRole('button', { name: '选择文件' })).toHaveCount(1);
      await expect(page.locator('#dialog-section').getByRole('button')).toHaveCount(2);
      await expect(page.locator('#enable-section').getByRole('button')).toHaveCount(1);
    });

    await test.step('圈定动态列表，断言初始两条', async () => {
      // listitem 是 <li> 的角色；练习场初始只有 lazy-list 的「条目 1/2」。
      await expect(page.locator('#lazy-section').getByRole('listitem')).toHaveCount(2);
    });
  });

  test('filter：同结构元素太多时，按内容筛出目标', async ({ page }) => {
    await test.step('打开练习场并定位列表项', async () => {
      await page.goto('/lab.html');

      // filter({ hasText })：在已匹配的元素集合里，保留「内部文字包含…」的。
      // hasText 同样是忽略大小写的子串匹配；筛选后还能继续链式。
      const item = page.getByRole('listitem').filter({ hasText: '条目 1' });

      // 筛完只剩 1 条：toHaveText 断言它的完整文字（全等，忽略首尾空白）。
      await expect(item).toHaveCount(1);
      await expect(item).toHaveText('条目 1');
    });
  });
});

// ─────────────────────────────────────────────────────────────
// 严格模式与兜底：多匹配怎么办、没语义时用 testId、实在不行 CSS/XPath
// ─────────────────────────────────────────────────────────────
test.describe('严格模式与兜底', () => {

  test('严格模式：多元素匹配时动作直接报错', async ({ page }) => {
    await test.step('制造一次 strict mode violation 并观察报错', async () => {
      await page.goto('/lab.html');

      // click 是动作：执行时会解析定位器，匹配到 2 个元素 → 立即抛错。
      // rejects.toThrow：断言「这个 Promise 会以匹配该正则的错误被拒绝」——
      // 借它把「错误行为」本身固化成用例，以后谁改坏严格模式立刻测试变红。
      await expect(
        page.getByRole('button', { name: '加载' }).click()
      ).rejects.toThrow(/strict mode violation/);
    });

    await test.step('三种修复方式：说全 name / 链式圈地 / 逃生舱', async () => {
      // 修复一（推荐）：把条件说全，让它只匹配一个。
      await expect(page.getByRole('button', { name: '加载更多' })).toBeVisible();

      // 修复二：链式圈地，圈内唯一。
      await expect(page.locator('#slow-section').getByRole('button')).toBeVisible();

      // 修复三（逃生舱，少用）：.first() 按 DOM 顺序取第一个——
      // 依赖顺序就是依赖实现，页面一改版可能悄悄测错，慎用。
      await expect(page.getByRole('button', { name: '加载' }).first()).toBeVisible();
    });
  });

  test('getByTestId：没有语义角色时的约定兜底', async ({ page }) => {
    await test.step('用 data-testid 定位慢速按钮', async () => {
      await page.goto('/lab.html');

      // getByTestId(id)：按 data-testid 属性定位（默认就读它，无需配置）。
      // 适用场景：第三方组件渲染出的控件没有语义角色/名字，约定 testId 兜底。
      // demo-app 特意给慢速按钮加了 data-testid="slow-load-trigger" 供本课练习。
      await expect(page.getByTestId('slow-load-trigger')).toBeVisible();
    });
  });

  test('CSS / XPath：最后手段', async ({ page }) => {
    await test.step('分别用 CSS 和 XPath 定位登录按钮', async () => {
      await page.goto('/login.html');

      // locator('css 选择器')：CSS 定位。结构稳定、语义定位够不到时才用。
      // form button 表示 form 内的 button——比裸的 .btn 之类类名稳得多。
      await expect(page.locator('form button')).toHaveCount(1);

      // locator('xpath=...')：XPath 定位，前缀 xpath= 必写。
      // text()= 完全匹配按钮文字。同样：最后手段，注释里要写明为什么用它。
      await expect(page.locator('xpath=//button[text()="登录"]')).toHaveCount(1);
    });
  });
});
