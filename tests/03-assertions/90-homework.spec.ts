import { test, expect } from '@playwright/test';

/**
 * 第 3 课作业（讲义：lessons/03-assertions.md 第 7 节；注释风格：docs/comment-style.md）。
 * 把下面的 test.fixme 骨架补成真实用例；完成后跑绿再提交：
 *   git add -A && git commit -m "learn(03): 完成第 3 课作业"
 *
 * 要求：注释按 docs/comment-style.md 的范本风格写——
 * 新 API 首次出现用「API 名：作用」说明，写清行为后果与「为什么」。
 * 本课红线：全程不允许出现 waitForTimeout（lint 也会替我盯着）。
 */

test.describe('作业：慢速内容完整闭环', () => {
  test('两次加载：waitForResponse + toHaveText + expect.poll', async ({ page }) => {
    await test.step('打开练习场', async () => {
      await page.goto('/lab.html');
    });

    await test.step('先架网络等待器，再点击，收割响应', async () => {
      // waitForResponse(/…/)：等一个匹配该正则的网络响应。
      // 关键顺序：【① 先创建等待器 → ② 触发动作 → ③ 收割响应】——
      // 若先点击后架等待器，响应可能抢在等待器就位前返回（竞态），等待器会等到超时。
      const respPromise = page.waitForResponse(/\/api\/slow/);   // ① 等待器就位
      await page.getByTestId('slow-load-trigger').click();       // ② 触发（自带的 actionability 等待）
      const resp = await respPromise;                            // ③ 收割
      expect(resp.status()).toBe(200);
    });

    await test.step('断言第 1 条出现（体会断言自己等了 2 秒）', async () => {
      // toHaveText：web-first 断言，会反复轮询页面直到条件满足。
      // 此刻第 1 条 <li> 大概率还没渲染（/api/slow 要 2 秒），断言以默认 5s 为上限
      // 每 ~100ms 查一次，约 2 秒后渲染完成即通过——这一等是断言替我们做的。
      const item = page.locator('#slow-section').getByRole('listitem');
      await expect(item).toHaveText('第 1 次加载完成');
      await expect(item).toHaveCount(1);
    });

    await test.step('再点一次：体会第二次 click 如何自动等 enabled', async () => {
      // 第一次点击的 click 处理函数里会把按钮 btn.disabled = true（fetch 进行中），
      // fetch 结束才 btn.disabled = false。所以第二次 click 命中时按钮多半仍处于禁用。
      // 但 click 自带 actionability 检查，其中含「enabled」一项——
      // 它会等按钮恢复可用后再真正点击，不会因 disabled 而失败。
      await page.getByTestId('slow-load-trigger').click();
    });

    await test.step('expect.poll 断言共 2 条', async () => {
      // count()：立即返回当前匹配数（不等待）。单独用毫无等待能力，
      // 但放进 expect.poll 里，就会带着「取值」一起被反复重试。
      // poll 默认 5s 上限、~100ms 间隔；第二次请求 2 秒后完成，第 2 条渲染出来即通过。
      await expect
        .poll(async () => page.locator('#slow-section').getByRole('listitem').count())
        .toBe(2);
    });

    // 结论注释 ①：为什么全程不需要 waitForTimeout(2000)？
    // 因为 Playwright 的等待是「事件/状态驱动」而非「时间驱动」，两层自动等待已覆盖全流程：
    //   · 第一层（动作）：click 的 actionability 检查含 enabled，第二次点击会等按钮恢复可用再点；
    //   · 第二层（断言）：toHaveText / toHaveCount / expect.poll 都是轮询式，会等渲染完成；
    //   · 网络层：waitForResponse 直接收割 /api/slow 的响应，不必 sleep 赌 2 秒够不够。
    // 超时是「上限」不是「等待时长」——页面就绪时第一次轮询就通过，不会傻等满 5 秒。
    //
    // 结论注释 ②：若点击后立刻用 textContent() 取值再普通断言，会发生什么？
    //   const text = await page.locator('#slow-list').textContent(); // 取值瞬间元素可能还没渲染
    //   expect(text).toContain('第 1 次加载完成');                   // 普通断言不重试 → 误报失败
    // 问题在于「值会过期，说明书不会」：textContent() 是即时快照，此刻大概率为空/旧值，
    // 而普通断言同步、瞬间、不重试，于是拿到过期值当场判失败。所以永远对 locator 做断言。
  });
});

test.describe('作业：提交按钮状态机', () => {
  test('禁用 → 启用 → 提交成功 → 刷新后重置', async ({ page }) => {
    await test.step('初始状态：提交按钮禁用、复选框未选中', async () => {
      await page.goto('/lab.html');

      // toBeDisabled / toBeChecked：状态类 web-first 断言，会轮询等状态稳定。
      // .not 取反同样自动轮询——「等它变成不是这样」也是等。
      await expect(page.getByRole('button', { name: '提交' })).toBeDisabled();
      await expect(page.getByRole('checkbox')).not.toBeChecked();
    });

    await test.step('勾选「我已阅读说明」，按钮随之启用', async () => {
      // check：勾选复选框——自动等待可勾选，并保证动作完成后处于【选中】状态。
      // 前端 change 监听里把 submit 按钮的 disabled 设为 !checked，故勾选后按钮启用。
      await page.getByRole('checkbox').check();
      await expect(page.getByRole('button', { name: '提交' })).toBeEnabled();
    });

    await test.step('点击提交，断言「提交成功」出现', async () => {
      await page.getByRole('button', { name: '提交' }).click();

      // getByText：按文字内容定位（第 2 课）；toBeVisible 轮询等它出现。
      await expect(page.getByText('提交成功')).toBeVisible();
    });

    await test.step('刷新页面，按钮回到禁用', async () => {
      // reload()：重新加载当前页面——浏览器重新请求 HTML、重新执行 <script>，
      // 所有由客户端脚本维持的临时状态都从初始声明重新开始。
      await page.reload();
      await expect(page.getByRole('button', { name: '提交' })).toBeDisabled();
    });

    // 结论注释：为什么一刷新状态就重置了？
    // 因为「提交按钮是否禁用」「复选框是否勾选」是【纯客户端运行时状态】——
    // 存在浏览器内存（JS 变量与 DOM 的 disabled/checked 属性），根本没发往服务端。
    // reload 会丢弃当前文档、重新下载 HTML 并重新跑脚本，<button disabled> 的初始声明
    // 又生效，于是回到 disabled。
    // 对比第 2 课 todos：待办数据存在【服务端内存】（server.js 的 todos 数组），
    // 刷新只重新发 GET /api/todos，只要服务进程没重启、登录态(session)还在，
    // 待办依然存在。区别一句话：状态在「服务端内存」就跨刷新存活，在「客户端内存」就随刷新清零。
  });
});
