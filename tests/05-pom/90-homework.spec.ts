// 写第一个断言时把 expect 加回 import：import { test, expect } from '@playwright/test'
import { test } from '@playwright/test';

/**
 * 第 5 课作业（讲义：lessons/05-pom.md 第 5 节）。
 * 把下面的 test.fixme 骨架补成真实用例；完成后跑绿再提交：
 *   git add -A && git commit -m "learn(05): 完成第 5 课作业"
 *
 * 要求：注释按 docs/comment-style.md 的范本风格写。
 * 本课作业的核心是「组织」：先写类，再写测试，测试里不出现原始定位器。
 */

test.describe('作业：LabPage', () => {
  test.fixme('悬停提示与慢速内容（经 LabPage 封装）', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ labPage, page }) =>
    //
    // TODO 1: 新建 tests/05-pom/pages/lab-page.ts：
    //         export class LabPage { … }
    //         · open()：goto /lab.html
    //         · slowLoad()：点击慢速加载按钮（getByTestId('slow-load-trigger')）
    //         · slowListItems()：返回 #slow-section 内 listitem 定位器
    //         · hoverTip()：返回 #hover-tip 定位器
    //         · hoverHelp()：hover 到 #hover-target（hover() 方法，第 4 课）
    // TODO 2: 在 fixtures.ts 的 Lab 类型与 extend 里注入 labPage
    // TODO 3: 用例一：hoverHelp() → expect(labPage.hoverTip()) toBeVisible()
    // TODO 4: 用例二（可与一合并）：slowLoad() 两次 →
    //         expect(labPage.slowListItems()) toHaveCount(2)
    //         （第 3 课的 expect.poll 在这里也可以用，二选一并注释理由）
    //
    // 想一想（写在下面结论注释里）：
    // 你的 LabPage 里放了哪些东西（操作/定位器/断言）？断言为什么不放进 POM？
    //
    // 你的结论注释：
  });
});
