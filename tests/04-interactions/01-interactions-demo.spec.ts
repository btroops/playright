import { test, expect } from '@playwright/test';

/**
 * 第 4 课示范：交互——把「用户能做的一切」都做一遍。
 * 配套讲义：lessons/04-interactions.md；注释风格：docs/comment-style.md
 *
 * 练习这些跑法：
 *   npx playwright test tests/04-interactions/01-interactions-demo.spec.ts
 *   npx playwright test 04-interactions -g "对话框" --headed
 *
 * 注：本诋试点全部是客户端状态（每个用例独立 page，互不共享），
 *     并行跑安全；两个会改服务端状态的场景留给作业。
 */

test.describe('下拉与上传', () => {

  test('selectOption：三种选中方式，断言联动结果', async ({ page }) => {
    await test.step('打开练习场，按可见文字选「苹果」', async () => {
      await page.goto('/lab.html');

      const select = page.getByLabel('选择水果');   // select 也是表单控件，label 关联定位（第 2 课）

      // selectOption({ label })：按 option 的【可见文字】选——最贴近用户视角，首选。
      await select.selectOption({ label: '苹果' });
      // select 的 change 监听会更新 #select-result：已选择：苹果（value=apple）
      await expect(page.locator('#select-result')).toHaveText('已选择：苹果（value=apple）');
    });

    await test.step('按 value 与按 index 再选两次', async () => {
      const select = page.getByLabel('选择水果');

      // selectOption('banana')：裸字符串等价于按 value 匹配（不含特殊字符时）。
      // 适合「option 文案会改、value 稳定」的场景——value 才是页面的稳定契约。
      await select.selectOption('banana');
      await expect(page.locator('#select-result')).toHaveText('已选择：香蕉（value=banana）');

      // selectOption({ index })：按下标选——依赖 DOM 顺序，逃生舱级别，尽量少用。
      await select.selectOption({ index: 3 });
      await expect(page.locator('#select-result')).toHaveText('已选择：樱桃（value=cherry）');
    });
  });

  test('setInputFiles：用内存 buffer 上传，不需要真实文件', async ({ page }) => {
    await test.step('构造内存文件并填入文件选择框', async () => {
      await page.goto('/lab.html');

      // setInputFiles：直接给 <input type="file"> 塞文件，不弹系统文件选择框。
      // 传对象 { name, mimeType, buffer } 时文件在内存里构造——
      // 不依赖磁盘路径、内容完全可控、跨平台，CI 上最省心。
      const buffer = Buffer.from('你好，Playwright！这是内存里构造的文件内容。', 'utf-8');
      await page.getByLabel('选择文件').setInputFiles({
        name: 'hello.txt',
        mimeType: 'text/plain',
        buffer,
      });
    });

    await test.step('断言上传回显', async () => {
      // demo-app 会回显「已选择：hello.txt（N 字节）」——字节数取决于编码后长度，
      // 这里只断言文件名部分，用 toContainText 而不是全文全等（位数无需硬编码）。
      await expect(page.locator('#upload-result')).toContainText('已选择：hello.txt');
    });
  });
});

test.describe('对话框：事件，不是元素', () => {

  test('Alert 与 Confirm：先注册监听，再触发', async ({ page }) => {
    // 收集 type 与 message 的本地数组：声明在【用例内】而不是 step 回调里——
    // test.step 的回调各有独立作用域，跨 step 共享的变量要在用例层声明。
    const seen: string[] = [];

    await test.step('打开页面并注册 dialog 监听器（必须在触发之前）', async () => {
      await page.goto('/lab.html');

      // window.alert/confirm 是浏览器原生对话框，不在 DOM 里——
      // getByRole('dialog') 永远找不到它。唯一入口是 page 的 dialog 事件。
      page.on('dialog', async (dialog) => {
        seen.push(`${dialog.type()}: ${dialog.message()}`);
        await dialog.accept();   // confirm 点「确定」；dismiss() 则是「取消」
      });
    });

    await test.step('依次触发 Alert 与 Confirm', async () => {
      await page.getByRole('button', { name: '弹出 Alert' }).click();
      await page.getByRole('button', { name: '弹出 Confirm' }).click();
    });

    await test.step('断言对话框内容与页面联动结果', async () => {
      // confirm accept 后页面会写入「已选择：确定」。
      await expect(page.locator('#confirm-result')).toHaveText('已选择：确定');

      // seen 是本地数组（不是页面状态），事件派发是异步的——
      // 用 expect.poll 轮询它凑齐两条，再断言内容与顺序。
      await expect.poll(() => seen.length).toBe(2);
      expect(seen[0]).toBe('alert: 这是一个 Alert 弹窗');
      expect(seen[1]).toBe('confirm: 确定要继续吗？');
    });
  });
});

test.describe('iframe：定位器的边界', () => {

  test('frameLocator：进入 frame 内部定位与操作', async ({ page }) => {
    await test.step('打开练习场，圈定 iframe', async () => {
      await page.goto('/lab.html');
    });

    await test.step('在 iframe 内部点击按钮并断言', async () => {
      // frameLocator('#iframe-box')：先圈定 frame（用 iframe 元素自身的定位器），
      // 之后的定位器都作用在 frame 内部文档上。
      // 普通 locator 穿不透 frame 边界（浏览器安全模型），frame 内外互不可见。
      const frame = page.frameLocator('#iframe-box');

      await frame.getByRole('button', { name: '点击我（iframe 内）' }).click();
      await expect(frame.getByText('iframe 内按钮被点击了')).toBeVisible();
    });

    await test.step('主页面不受 frame 内操作影响', async () => {
      // 反向证明「边界」：iframe 外的主页面元素照常用 page 定位器。
      await expect(page.getByRole('heading', { name: 'iframe 内嵌页面' })).toBeVisible();
    });
  });
});

test.describe('拖拽与多标签页', () => {

  test('dragTo：把积木从源池拖进目标池', async ({ page }) => {
    await test.step('拖拽积木到目标区域', async () => {
      await page.goto('/lab.html');

      // dragTo：等价于「hover 源 → mouse down → 分步移动到目标 → mouse up」。
      // 只对 mouse 事件实现的拖拽有效；HTML5 draggable 的 dnd 拖拽驱动不了它
      //（demo-app 特意用 mouse 事件实现，就是为了本课可以直接练）。
      await page.locator('#drag-chip').dragTo(page.locator('#drag-target'));
    });

    await test.step('断言积木落入目标池', async () => {
      // demo-app 会把目标池文字改成「已放入：」并把积木 append 进去。
      await expect(page.locator('#drag-target')).toContainText('已放入：');
      await expect(page.locator('#drag-target').getByText('积木')).toBeVisible();

      // 反向断言：源池里已经没有积木了（数数断言，0 个）。
      await expect(page.locator('#drag-source').getByText('积木')).toHaveCount(0);
    });
  });

  test('多标签页：waitForEvent 等新 Page，各页互不干扰', async ({ page }) => {
    await test.step('打开练习场', async () => {
      await page.goto('/lab.html');
    });

    await test.step('先架新页面等待器，再点击，在新页面里断言', async () => {
      // 又是第 3 课的竞态原则：【先架 waitForEvent('page')，再触发】。
      // 注意等待方是 page.context()（浏览器上下文）——新 Page 归它管，不是原 page。
      const newPagePromise = page.context().waitForEvent('page');
      await page.getByRole('link', { name: '在新标签页打开帮助页' }).click();
      const newPage = await newPagePromise;

      // newPage 是独立的 Page 对象：定位器、断言、关闭都作用于它自己。
      await expect(newPage.getByRole('heading', { name: '我是 iframe 内部页面' })).toBeVisible();
      await newPage.close();
    });

    await test.step('原页面不受影响', async () => {
      await expect(page.getByRole('heading', { name: '多标签页' })).toBeVisible();
    });
  });
});
