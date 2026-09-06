# 第 4 课：交互——把「用户能做的一切」都做一遍

> 前置：第 1–3 课完成。本课示范：`tests/04-interactions/01-interactions-demo.spec.ts`；作业：`tests/04-interactions/90-homework.spec.ts`。
> 本课扩展了 demo-app：练习场新增「下拉选择」「拖拽」「多标签页」三个区块。

## 1. 本课 API 与考点对照

| 交互 | API | demo-app 考点 |
|---|---|---|
| 下拉框 | `selectOption({ label })` / `selectOption('value')` / `selectOption({ index })` | 「下拉选择」水果 |
| 文件上传 | `setInputFiles(路径)` 或 buffer | 「文件上传」 |
| 弹窗对话框 | `page.on('dialog')` 事件 | 「弹窗对话框」Alert/Confirm |
| iframe | `page.frameLocator('#…')` | 「iframe 内嵌页面」 |
| 拖拽 | `source.dragTo(target)` | 「拖拽」积木 |
| 多标签页 | `context.waitForEvent('page')` | 「多标签页」链接 |
| 悬停 | `locator.hover()` | 「悬停提示」 |

## 2. 对话框不是元素，是事件

新手最容易卡的地方：`window.alert/confirm` 是**浏览器原生对话框**，不在 DOM 里——`getByRole('dialog')` 永远找不到它。处理方式是**在触发前注册事件监听**：

```ts
page.on('dialog', async (dialog) => {
  // dialog.type()：'alert' | 'confirm' | 'prompt'…
  // dialog.message()：对话框文字
  await dialog.accept();   // 或 dialog.dismiss()
});
```

两条铁律：① **先注册、后点击**（又是第 3 课的竞态原则）；② 不注册时 Playwright 会**自动 dismiss** 所有对话框——测试不会卡死，但你看不到 message、也无法选择 accept。

## 3. iframe：定位器的边界

普通 locator **无法穿透 frame 边界**（浏览器安全模型决定）。必须先用 `frameLocator` 圈定 frame，再在里面用熟悉的定位器：

```ts
const frame = page.frameLocator('#iframe-box');   // 圈定 frame
await frame.getByRole('button', { name: '…' }).click();
```

frame 内外的元素互不可见：iframe 里的东西用 `page.getBy…` 找不到，反之亦然。

## 4. 上传：真实文件还是内存 buffer

```ts
// 方式一：磁盘上的真实文件（路径相对运行目录）
await page.getByLabel('选择文件').setInputFiles('fixtures/hello.txt');
// 方式二：内存 buffer（不需要真实文件，跨平台、CI 友好、内容可控）
await page.getByLabel('选择文件').setInputFiles({
  name: 'hello.txt', mimeType: 'text/plain', buffer: Buffer.from('你好，Playwright'),
});
```

下载则相反：等 `download` 事件 + `download.path()`。本项目暂不练。

## 5. 拖拽：两种实现，两种命运

- **HTML5 `draggable=true`** 的拖拽由浏览器 dnd 系统驱动，`dragTo` 的 mouse 事件序列**驱动不了它**（需要 `page.dispatchDragEvent` 等特殊手段）——遇到别硬扛；
- **mouse 事件实现**（mousedown/mousemove/mouseup）的拖拽，`source.dragTo(target)` 直接可用：它等价于「hover 源 → 按下 → 分步移动到目标 → 松开」。

demo-app 的拖拽特意用 mouse 事件实现，就是为了本课可以直接练 `dragTo`。

## 6. 多标签页：新 Page 对象

`target="_blank"` 或 `window.open` 会创建**新的 Page**——它有自己的定位器、自己的等待体系，原 page 摸不到它：

```ts
const newPagePromise = page.context().waitForEvent('page');  // 先架等待器（第 3 课原则）
await page.getByRole('link', { name: '…' }).click();
const newPage = await newPagePromise;
await expect(newPage.getByRole('heading', { name: '…' })).toBeVisible();
await newPage.close();
```

注意是 `page.context()`（浏览器上下文）在等 page 事件，不是 page 自己。

## 7. 作业（tests/04-interactions/90-homework.spec.ts）

1. **对话框 dismiss 分支**：注册监听并对 Confirm 用 `dismiss()`，断言「已选择：取消」；结论注释：不注册监听时 Playwright 如何处理对话框？为什么仍要显式注册？
2. **表单三连**：下拉选樱桃（按 value）→ 拖拽积木 → buffer 上传，逐步断言结果文案；结论注释：`setInputFiles` 用 buffer 的好处？

## 8. 自查清单

- [ ] 能说清对话框为什么必须用事件而非定位器处理
- [ ] 知道普通 locator 穿不透 iframe，会用 frameLocator
- [ ] 遇到拖拽没生效，能想到先分清 HTML5 dnd 还是 mouse 事件实现
- [ ] 多标签页测试记得「先架 waitForEvent，再触发」
