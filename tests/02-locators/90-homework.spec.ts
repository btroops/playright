// 写第一个断言时把 expect 加回 import：import { test, expect } from '@playwright/test'
import { test } from '@playwright/test';

/**
 * 第 2 课作业（讲义：lessons/02-locators.md 第 9 节）。
 * 把下面的 test.fixme 骨架补成真实用例；完成后跑绿再提交：
 *   git add -A && git commit -m "learn(02): 完成第 2 课作业"
 *
 * 要求：注释按 docs/comment-style.md 的范本风格写——
 * 新 API 首次出现用「API 名：作用」说明，写清行为后果与「为什么」。
 */

test.describe('作业：登录-新增-删除 综合流程', () => {
  test.fixme('新增一条待办再用 filter 定位并删除它', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ page }) =>
    // 这是一条会【改变页面状态】的流程题——放在单个用例里做完整闭环，
    // 新增的条目最后删掉，不给其他用例留状态（并行才不会互相干扰）。
    //
    // TODO 1: 打开 /login.html，用 getByLabel('用户名')/getByLabel('密码')
    //         fill 演示账号（demo / pass123），点击 getByRole('button', { name: '登录' })
    // TODO 2: 断言落地：toHaveURL(/todos\.html$/)（第 1 课讲过 $ 的作用）
    // TODO 3: 新增待办：getByPlaceholder('想做什么？') fill 一句独特的话
    //         （避免和种子数据「学习 Playwright 定位器」子串撞车），
    //         点 getByRole('button', { name: '添加' })
    // TODO 4: 用 getByRole('listitem').filter({ hasText: '你写的那句话' })
    //         定位新条目，断言 toHaveCount(1)
    // TODO 5: 在这个 filter 结果上【链式】定位行内删除按钮：
    //         .getByRole('button', { name: '删除' })，click 它
    // TODO 6: 断言条目消失：filter 结果 toHaveCount(0)
    //
    // 想一想（写在下面结论注释里）：
    // 为什么 TODO 5 必须把删除按钮定位在「filter 结果」之内，
    // 而不能直接 page.getByRole('button', { name: '删除' })？
    //
    // 你的结论注释：
  });
});

test.describe('作业：严格模式探索', () => {
  test.fixme('验证无 name 的 heading 定位会 strict violation', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ page }) =>
    // TODO 1: 打开 /lab.html
    // TODO 2: page 上有 1 个 <h1> 和 7 个 <h2>。先用 toHaveCount 验证
    //         page.getByRole('heading') 匹配 8 个（数数断言不受严格模式约束）
    // TODO 3: 仿照示范文件，用 expect(...).rejects.toThrow(/strict mode violation/)
    //         验证对它做动作（如 click）会抛错
    // TODO 4: 写出能【唯一】定位 <h1>（文字「练习场」）的定位器并断言可见，
    //         注意 name 是子串匹配——确认没有别的标题包含这个词
    //
    // 你的结论注释（严格模式为什么宁可报错也不猜）：
  });
});
