import { test, expect } from '@playwright/test';

/**
 * 第 2 课作业（讲义：lessons/02-locators.md 第 9 节；注释风格：docs/comment-style.md）。
 * 把下面的 test.fixme 骨架补成真实用例；完成后跑绿再提交：
 *   git add -A && git commit -m "learn(02): 完成第 2 课作业"
 *
 * 要求：注释按 docs/comment-style.md 的范本风格写——
 * 新 API 首次出现用「API 名：作用」说明，写清行为后果与「为什么」。
 */

test.describe('作业：登录-新增-删除 综合流程', () => {
  test('新增一条待办再用 filter 定位并删除它', async ({ page }) => {
    // 这是一条会【改变页面状态】的流程题——放在单个用例里做完整闭环，
    // 新增的条目最后删掉，不给其他用例留状态（并行才不会互相干扰）。
    // 用一句在种子数据里绝不会出现的独特文案，避免 filter 的子串匹配误伤：
    // 种子是「学习 Playwright 定位器」「写下第一个测试用例」，所以这里用
    // 「作业：新增后立刻删除这一条」——其中没有任何子串落在种子标题里。
    const myTodo = '作业：新增后立刻删除这一条';

    await test.step('打开登录页并填写凭证（getByLabel）', async () => {
      // getByLabel(text)：按 <label> 文字找到关联的表单控件。
      // 前提是 HTML 里 label 的 for 与 input 的 id 正确关联——这是语义化 HTML 的红利，
      // 写对了页面，定位器天然稳定。fill：清空后输入，自带自动等待（等元素可输入）。
      await page.goto('/login.html');
      await page.getByLabel('用户名').fill('demo');
      await page.getByLabel('密码').fill('pass123');
    });

    await test.step('提交登录并断言落地（toHaveURL）', async () => {
      // getByRole('button', { name })：按「角色 + 可访问名」定位按钮，name 取按钮文字。
      // click：真实点击；之后 toHaveURL 断言地址栏——正则里的 $ 表示「以 todos.html 结尾」。
      await page.getByRole('button', { name: '登录' }).click();
      await expect(page).toHaveURL(/todos\.html$/);
    });

    await test.step('新增一条待办（getByPlaceholder + 添加按钮）', async () => {
      // getByPlaceholder(text)：按输入框的 placeholder 属性定位（Todo 输入框 placeholder='想做什么？'）。
      // 填上独特的文案后点「添加」，后端会写回并触发前端重新渲染列表。
      await page.getByPlaceholder('想做什么？').fill(myTodo);
      await page.getByRole('button', { name: '添加' }).click();
    });

    await test.step('用 filter 找到新条目并断言存在', async () => {
      // getByRole('listitem')：定位所有 <li>（每个待办是一行）。
      // filter({ hasText })：在已匹配集合里保留「内部文字包含该串」的元素（忽略大小写、子串匹配）。
      // 因为它只含我们的独特文案，筛完恰好 1 条——toHaveCount 是「数数」断言，不触发严格模式。
      const item = page.getByRole('listitem').filter({ hasText: myTodo });
      await expect(item).toHaveCount(1);
    });

    await test.step('在 filter 结果内链式定位删除按钮并点击', async () => {
      // 关键：页面此时共有 3 个「删除」按钮（2 个种子 + 1 个新增）。
      // 若直接 page.getByRole('button', { name: '删除' }) 会匹配全部 3 个 → 严格模式报错。
      // 正确做法是在「filter 结果（唯一的那一行）」之上继续链式定位行内按钮，
      // 圈定范围后删除按钮只剩 1 个，动作安全。
      await page.getByRole('listitem').filter({ hasText: myTodo })
        .getByRole('button', { name: '删除' }).click();
    });

    await test.step('断言条目已消失', async () => {
      // 删除后列表重新渲染，同一 filter 现在 0 条——toHaveCount(0) 自带自动等待，
      // 会轮询到列表更新完成，不会因渲染延迟误判。
      await expect(page.getByRole('listitem').filter({ hasText: myTodo })).toHaveCount(0);
    });
  });
});

test.describe('作业：严格模式探索', () => {
  test('验证无 name 的 heading 定位会 strict violation', async ({ page }) => {
    await test.step('打开练习场并数数 heading 总数', async () => {
      await page.goto('/lab.html');

      // getByRole('heading')：匹配所有 <h1>~<h6>。练习场有 1 个 <h1>（练习场）+ 10 个 <h2>
      //（七个初始区块 + 第 4 课新增的下拉/拖拽/多标签页三个区块），共 11 个。
      // ⚠️ 教训：这个断言原来写的是 8——第 4 课给练习场加了区块后它就红了。
      // 数页面元素个数的断言天然与 UI 演进耦合，改 UI 的分支必须同步修它。
      // toHaveCount 是「数数」断言，允许多匹配，不受严格模式约束——适合用来先清点个数。
      await expect(page.getByRole('heading')).toHaveCount(11);
    });

    await test.step('对它做动作触发 strict mode violation', async () => {
      // 无 name 的 getByRole('heading') 一次匹配 11 个元素；click 是「动作」，
      // 执行时解析定位器、发现多匹配 → 立即抛 strict mode violation。
      // 结论：匹配到【11 个】——页面里这些标题的角色都是 heading，不加 name 无法区分。
      // rejects.toThrow：断言「这个 Promise 会以匹配正则的错误被拒绝」，把「错误行为」固化为用例。
      await expect(
        page.getByRole('heading').click()
      ).rejects.toThrow(/strict mode violation/);
    });

    await test.step('写出能唯一定位 <h1> 的定位器', async () => {
      // 能唯一命中 <h1>（文字「练习场」）的定位器：
      //   getByRole('heading', { name: '练习场' })
      // name 默认是子串匹配，但要确认没有别的标题文本包含「练习场」——
      // 7 个 <h2> 分别是 弹窗对话框/慢速内容/动态列表/文件上传/启用与禁用/悬停提示/iframe 内嵌页面，
      // 都不含「练习场」，所以只有 h1 命中 → 唯一，可安全做动作。
      // （更严格可加 level: 1 限定只找 <h1>，双重保险：getByRole('heading', { name: '练习场', level: 1 })）
      await expect(page.getByRole('heading', { name: '练习场' })).toBeVisible();
    });
  });
});
