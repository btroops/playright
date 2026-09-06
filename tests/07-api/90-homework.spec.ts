// 写第一个断言时把 expect 加回 import：import { test, expect } from '@playwright/test'
import { test } from '@playwright/test';

/**
 * 第 7 课作业（讲义：lessons/07-api.md 第 5 节）。
 * 把下面的 test.fixme 骨架补成真实用例；完成后跑绿再提交：
 *   git add -A && git commit -m "learn(07): 完成第 7 课作业"
 *
 * 要求：注释按 docs/comment-style.md 的范本风格写。
 * API 测试的并行安全原则：自建自删，不依赖其他用例留下的数据。
 */

test.describe('作业：todos 异常分支', () => {
  test.fixme('不存在的 id：PUT / DELETE 均返回 404', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ request }) =>
    // TODO 1: API 登录（POST /api/login，demo / pass123）
    // TODO 2: PUT /api/todos/999999 与 DELETE /api/todos/999999
    //         分别断言 status 404（服务端对不存在的 id 返回 404）
    //
    // 想一想（写在下面结论注释里）：
    // 999999 这个 id 理论上「碰巧存在」怎么办？怎么让异常分支测试更确定？
    //（提示：第 6 课的 route mock 能不能用来「保证」某个 id 不存在？）
    //
    // 你的结论注释：
  });
});

test.describe('作业：UI 跳过登录（storageState）', () => {
  test.fixme('登录一次，之后的用例直接是已登录状态', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ page, browser }) =>
    // TODO 1: 在第一个用例（或本用例前半段）完成 UI 登录，
    //         用 storageState() 导出快照（参考示范文件的写法）
    // TODO 2: browser.newContext({ storageState: 快照 }) 开新上下文
    // TODO 3: 新上下文里直接开 /todos.html，断言不被重定向、
    //         能看到种子待办「学习 Playwright 定位器」这一行
    //         （注意用 todo 行的 listitem filter 定位，别用硬编码顺序）
    //
    // 想一想（写在下面结论注释里）：
    // UI 登录很慢，为什么大套件不把 storageState 用到极致、
    // 让所有 UI 测试都跳过登录？跳过登录后，登录页本身的测试怎么办？
    //
    // 你的结论注释：
  });
});
