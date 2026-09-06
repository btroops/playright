import { test, expect } from './fixtures';

/**
 * 第 5 课示范：Page Object Model + 自定义 fixtures。
 * 配套讲义：lessons/05-pom.md
 *
 * 对比第 2 课作业（同样的业务流程，定位器散落在测试里）——
 * 本文件的测试读起来像需求文档：「登录 → 新增 → 删除」。
 *
 * 练习这些跑法：
 *   npx playwright test tests/05-pom/01-pom-demo.spec.ts
 *   npx playwright test 05-pom --headed
 */

test.describe('用 fixture 注入 Page Object', () => {

  test('登录后新增并删除一条待办（完整业务闭环）', async ({ loginPage, todoPage, page }) => {
    // 签名里解构的就是 fixtures.ts 注入的 Page Object——测试里没有一行定位器。
    // 独特文案（第 2 课的原则）：避免 filter 子串撞上种子数据。
    const myTodo = 'POM 演示：新增后立刻删除这一条';

    await test.step('登录', async () => {
      await loginPage.open();
      await loginPage.login('demo', 'pass123');

      // 登录成功与否的【验证】仍写在测试里（toHaveURL），POM 只负责动作。
      await expect(page).toHaveURL(/todos\.html$/);
    });

    await test.step('新增一条待办', async () => {
      await todoPage.addTodo(myTodo);
      // item(title) 返回定位器——继续用 web-first 断言（第 3 课），自动等渲染。
      await expect(todoPage.item(myTodo)).toHaveCount(1);
    });

    await test.step('删除它，恢复初始状态', async () => {
      await todoPage.deleteTodo(myTodo);
      await expect(todoPage.item(myTodo)).toHaveCount(0);
    });
  });

  test('登录失败分支：errorMessage getter 服务断言', async ({ loginPage }) => {
    await loginPage.open();

    // 错误密码 → 登录页显示错误提示。定位器来自 LoginPage.errorMessage getter。
    await loginPage.login('demo', 'wrong-password');
    await expect(loginPage.errorMessage).toHaveText('用户名或密码错误');

    // 注意对比：断言在测试里（一眼看到「验证什么」），
    // 若把 expect 藏进 POM 的 login() 里，这条用例的真实意图就不明显了。
  });
});
