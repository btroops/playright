import { test, expect } from '@playwright/test';

/**
 * 第 1 课作业（讲义：lessons/01-basics.md 第 6 节）。
 * 把下面的 test.fixme 骨架补成真实用例；完成后跑绿再提交：
 *   git add -A && git commit -m "learn(01): 完成第 1 课作业"
 */

test.describe('作业：三张页面的标题', () => {
  test.fixme('index / login / todos 各有自己的标题', async ({ page }) => {
    // TODO 1: 用 test.step 分两步——「打开页面」「断言标题」
    // TODO 2: 依次访问 /index.html、/login.html、/todos.html，
    //         断言 toHaveTitle(...)（标题内容自己打开页面看）
    //
    // ⚠️ 讲义 6.1 的坑：/todos.html 未登录会被重定向，断言会失败。
    // 不要改断言绕过！先用 show-report / trace 看清发生了什么，
    // 在下面写一行注释解释原因，然后把这条页面从循环里去掉。
    //
    // 你的结论注释：
    //
    // （讲义提示：它的正确测法在第 5 课学登录态后回来补）
  });
});

test.describe('作业：练习场区块', () => {
  test.fixme('七个考点区块全部可见', async ({ page }) => {
    // TODO: 访问 /lab.html，断言七个 <h2> 标题可见：
    //   弹窗对话框 / 慢速内容 / 动态列表 / 文件上传 / 启用与禁用 / 悬停提示 / iframe 内嵌页面
    // （示范写法就在 01-structure-demo.spec.ts 里，先自己写再看答案）
  });
});
