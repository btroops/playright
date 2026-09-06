// 写第一个断言时把 expect 加回 import：import { test, expect } from '@playwright/test'
import { test } from '@playwright/test';

/**
 * 第 8 课作业（讲义：lessons/08-ci.md 第 6 节）。
 * 把下面的 test.fixme 骨架补成真实用例；完成后跑绿再提交：
 *   git add -A && git commit -m "learn(08): 完成第 8 课作业"
 *
 * 本课作业有两道在骨架之外（CI yaml 与多浏览器开关），见各 TODO。
 */

test.describe('作业：todos 页视觉基线', () => {
  test.fixme('登录后的待办列表区块渲染稳定', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ page }) =>
    // TODO 1: 需要登录态——用第 7 课的手段（page.request API 登录最省事）
    // TODO 2: 打开 /todos.html，等列表渲染完
    // TODO 3: 对 <ul id="todo-list"> 做 toHaveScreenshot('todo-list.png')，
    //         首跑生成基线后 git add 提交基线图
    //
    // 想一想（写在下面结论注释里）：
    // 视觉断言适合加在什么样的元素上？为什么「整页截图」的维护成本
    // 比「区块截图」高得多？哪两类改动会 respectively 触发与不触发它？
    //
    // 你的结论注释：
  });
});

test.describe('作业：仓库级工程化（骨架之外）', () => {
  test.fixme('本用例仅用于承载说明，不需要执行逻辑', () => {
    // 这两条不需要写测试代码，改完在结论注释里打勾：
    //
    // TODO A: 编写 .github/workflows/ci.yml，要点：
    //         on: push/PR → ubuntu-latest → actions/setup-node(node 24, cache: npm)
    //         → npm ci → npx playwright install --with-deps chromium
    //         → npx playwright test → 上传 playwright-report 为 artifact
    //         （本项目没有远端仓库，写好模板即可，不要求真的跑）
    //
    // TODO B: 启用多浏览器：npx playwright install firefox webkit
    //         （各约 100MB），然后把 playwright.config.ts 里注释掉的
    //         firefox project 取消注释，跑一遍全量测试观察差异
    //
    // 你的结论注释（A/B 各一行完成情况）：
  });
});
