// 写第一个断言时把 expect 加回 import：import { test, expect } from '@playwright/test'
import { test } from '@playwright/test';

/**
 * 第 4 课作业（讲义：lessons/04-interactions.md 第 7 节）。
 * 把下面的 test.fixme 骨架补成真实用例；完成后跑绿再提交：
 *   git add -A && git commit -m "learn(04): 完成第 4 课作业"
 *
 * 要求：注释按 docs/comment-style.md 的范本风格写——
 * 新 API 首次出现用「API 名：作用」说明，写清行为后果与「为什么」。
 */

test.describe('作业：对话框 dismiss 分支', () => {
  test.fixme('Confirm 选「取消」，页面记录取消结果', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ page }) =>
    // TODO 1: 打开 /lab.html，注册 dialog 监听器（记住：必须在触发之前注册）：
    //         本地数组记录 `dialog.type()` 与 `dialog.message()`，
    //         并对 confirm 调用 dismiss()（而不是 accept）
    // TODO 2: 点击「弹出 Confirm」按钮
    // TODO 3: 断言 #confirm-result 文字为「已选择：取消」；
    //         用 expect.poll 断言记录数组里有一条 "confirm: 确定要继续吗？"
    //
    // 想一想（写在下面结论注释里）：
    // 如果【不注册】dialog 监听器就点击，Playwright 会怎么处理这个对话框？
    // 页面表现和 dismiss 一样吗？既然如此，为什么我们还要显式注册？
    //
    // 你的结论注释：
  });
});

test.describe('作业：表单三连', () => {
  test.fixme('下拉 → 拖拽 → 上传，逐项断言', () => {
    // 把本骨架替换成真实用例：签名写成 async ({ page }) =>
    // 一次走完练习场三个控件，每步都用 test.step 起名：
    //
    // TODO 1: 下拉——selectOption 按【value】选中樱桃，断言
    //         #select-result 文字为「已选择：樱桃（value=cherry）」
    //         （注释里说明：value 和可见文字，哪个更适合作为测试契约？为什么？）
    // TODO 2: 拖拽——把 #drag-chip dragTo #drag-target，断言目标池
    //         toContainText('已放入：') 且其中可见「积木」
    // TODO 3: 上传——setInputFiles 用内存 buffer 构造 todo.txt（内容随意），
    //         断言 #upload-result toContainText('已选择：todo.txt')
    //
    // 想一想（写在下面结论注释里）：
    // setInputFiles 用 buffer 而不是真实磁盘文件，好处是什么？
    //（提示：想一想 CI 容器里、以及「想测 1GB 大文件」的场景）
    //
    // 你的结论注释：
  });
});
