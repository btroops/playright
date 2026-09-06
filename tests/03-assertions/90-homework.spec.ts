// 写第一个断言时把 expect 加回 import：import { test, expect } from '@playwright/test'
import { test } from '@playwright/test';

/**
 * 第 3 课作业（讲义：lessons/03-assertions.md 第 7 节）。
 * 把下面的 test.fixme 骨架补成真实用例；完成后跑绿再提交：
 *   git add -A && git commit -m "learn(03): 完成第 3 课作业"
 *
 * 要求：注释按 docs/comment-style.md 的范本风格写——
 * 新 API 首次出现用「API 名：作用」说明，写清行为后果与「为什么」。
 * 本课红线：全程不允许出现 waitForTimeout（lint 也会替我盯着）。
 */

test.describe('作业：慢速内容完整闭环', () => {
  test.fixme('两次加载：waitForResponse + toHaveText + expect.poll', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ page }) =>
    // TODO 1: 打开 /lab.html；先架 page.waitForResponse(/\/api\/slow/) 等待器，
    //         再 getByTestId('slow-load-trigger') 点击，收割响应并断言 status 200
    // TODO 2: 断言第 1 条出现：定位器圈定 #slow-section 的 listitem，
    //         toHaveText('第 1 次加载完成')（体会断言自己等了 2 秒）
    // TODO 3: 再点一次同一个按钮——此刻它可能正被禁用（fetch 进行中），
    //         想清楚为什么第二次 click 不会失败（提示：actionability 检查），
    //         把你的解释写成注释
    // TODO 4: 用 expect.poll 轮询 #slow-section 的 listitem 数量 toBe(2)
    //
    // 想一想（写在下面结论注释里）：
    // ① 为什么全程不需要 waitForTimeout(2000)？
    // ② 如果在点击后立刻 textContent 取 #slow-list 再用普通断言，会发生什么？
    //
    // 你的结论注释：
  });
});

test.describe('作业：提交按钮状态机', () => {
  test.fixme('禁用 → 启用 → 提交成功 → 刷新后重置', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ page }) =>
    // TODO 1: 打开 /lab.html，断言「提交」按钮 toBeDisabled、复选框未选中
    // TODO 2: check() 勾选「我已阅读说明」，断言按钮 toBeEnabled
    // TODO 3: 点击「提交」，断言「提交成功」文字出现
    // TODO 4: page.reload() 刷新页面，断言按钮又回到 toBeDisabled
    //
    // 想一想（写在下面结论注释里）：
    // 为什么一刷新状态就重置了？（提示：这些状态存在哪里？
    // 对比 todos 的数据在服务端内存里——刷新后待办还在吗？）
    //
    // 你的结论注释：
  });
});
