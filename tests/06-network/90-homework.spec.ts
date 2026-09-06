// 写第一个断言时把 expect 加回 import：import { test, expect } from '@playwright/test'
import { test } from '@playwright/test';

/**
 * 第 6 课作业（讲义：lessons/06-network.md 第 5 节）。
 * 把下面的 test.fixme 骨架补成真实用例；完成后跑绿再提交：
 *   git add -A && git commit -m "learn(06): 完成第 6 课作业"
 *
 * 要求：注释按 docs/comment-style.md 的范本风格写。
 * 记住两条铁律：route 在请求发出【前】注册；轮询本地数组用 expect.poll。
 */

test.describe('作业：登录服务挂了怎么办', () => {
  test.fixme('mock /api/login 返回 500，断言错误提示', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ page }) =>
    // TODO 1: 打开 /login.html（先打开页面再 mock 也可以——注意 route 时机，
    //         但 /api/login 是【提交时】才请求的，两种顺序都安全，说说为什么）
    // TODO 2: page.route('**/api/login', …) fulfill 500 + body
    //         {"error":"登录服务暂时不可用"}（login.html 会把 body.error 显示到 #error）
    // TODO 3: getByLabel 填账号密码 → 点「登录」
    // TODO 4: 断言错误提示出现（#error，role=alert）且仍停留在登录页（toHaveURL）
    //
    // 想一想（写在下面结论注释里）：
    // 这类「依赖挂掉」的场景，用 mock 而不是真的把服务搞停，好处是什么？
    //
    // 你的结论注释：
  });
});

test.describe('作业：空列表的边界状态', () => {
  test.fixme('mock 空待办列表，断言空状态渲染', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ page }) =>
    // TODO 1: page.route('**/api/todos', …) fulfill 200 + body "[]"（空数组）
    // TODO 2: 打开 /todos.html（有 mock 在，不需要登录也不会被重定向）
    // TODO 3: 断言空状态：#todo-list 下没有 listitem（toHaveCount(0)），
    //         且 #stats 文字为「共 0 项，完成 0 项」
    //
    // 想一想（写在下面结论注释里）：
    // 边界数据（空、超长、特殊字符、超大量）为什么天然适合用 mock 造？
    // 不用 mock 的话，你要怎么让服务端出现「恰好空列表」？
    //
    // 你的结论注释：
  });
});
