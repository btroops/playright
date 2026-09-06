# 第 2 课：定位器（Locators）——Playwright 的核心

> 前置：第 1 课完成。本课示范：`tests/02-locators/01-locators-demo.spec.ts`；作业：`tests/02-locators/90-homework.spec.ts`。
> 注释风格遵循 [docs/comment-style.md](../docs/comment-style.md)，示范文件里每个 API 都有「API 名：作用」详解。

## 1. 定位哲学：面向用户，而不是面向实现

自动化测试最大的维护成本是**元素定位失效**。CSS/XPath 锚定的是 DOM 结构（前端一改版全断），而用户找按钮靠的是「角色 + 名字」。Playwright 的推荐顺序：

1. **面向用户的定位器**（本课主角）：`getByRole` / `getByLabel` / `getByText` / `getByPlaceholder` …
2. **testId 兜底**：第三方组件没有语义角色时用 `getByTestId`
3. **CSS/XPath 最后手段**：非用不可时才用

附带收益：逼着页面写语义化 HTML（label 关联、button 而非 div）——定位器顺手当无障碍检查器用。

## 2. 定位器的三个关键性质

1. **惰性**：`page.getByRole(...)` 只是生成「查找说明书」，不立刻查 DOM；真正查找发生在 `await` 动作/断言那一刻，并带自动等待（元素没出现就一直轮询到超时）。
2. **严格模式（strict mode）**：动作/断言执行时若匹配到**多个**元素，直接抛 `strict mode violation`——宁可贵红不可测错。例外：`toBeCount` 这类「数数」断言允许多匹配。
3. **可链式**：定位器可以在定位器上继续定位（先圈地，再定位），天然缩小范围。

## 3. 七个内置定位器速览

| 定位器 | 找什么 | demo-app 例子 |
|---|---|---|
| `getByRole(role, { name })` | 无障碍角色 + 可访问名 | `getByRole('button', { name: '加载更多' })` |
| `getByLabel(text)` | label 关联的表单控件 | 登录页 `getByLabel('用户名')` |
| `getByPlaceholder(text)` | placeholder | Todo 页 `getByPlaceholder('想做什么？')` |
| `getByText(text)` | 文本内容 | 练习场 `getByText('条目 1')` |
| `getByAltText(text)` | 图片 alt | （demo-app 未用到） |
| `getByTitle(text)` | title 属性 | （demo-app 未用到） |
| `getByTestId(id)` | `data-testid` | `getByTestId('slow-load-trigger')` |

`name`/`text` 的匹配默认**忽略大小写、按子串**；要全等加 `exact: true`（仍会 trim 首尾空白）。子串匹配是双刃剑：`name: '加载'` 会同时命中「加载慢速内容」和「加载更多」→ 触发严格模式报错。

## 4. 链式与 filter

```ts
// 链式：先圈地（可以是任何定位器），再在圈内用语义定位
page.locator('#slow-section').getByRole('listitem');

// filter：同结构元素太多时，按内容筛出那一行
page.getByRole('listitem').filter({ hasText: '条目 3' });
// hasText 也是忽略大小写的子串匹配；还能接 .getByRole(...) 定位行内按钮
```

## 5. 严格模式的「逃生舱」（少用）

- `.first()` / `.last()` / `.nth(i)`：按 DOM 顺序取第 N 个——依赖顺序就是依赖实现，容易悄悄测错；
- 正确姿势永远是**把条件说全**：加 name、加 filter、链式圈地。

## 6. testId 兜底

第三方组件库渲染的控件常常没有语义角色，这时候和前端约定 `data-testid`：

```html
<button data-testid="slow-load-trigger">…</button>
```

```ts
page.getByTestId('slow-load-trigger')   // 默认读 data-testid 属性，无需配置
```

## 7. CSS / XPath：最后手段

```ts
page.locator('form button')                    // CSS
page.locator('xpath=//button[text()="登录"]')  // XPath
```

只在「语义定位器够不到、结构又极其稳定」时使用，注释里写明为什么。

## 8. 调试利器：codegen 让浏览器帮你写定位器

```bash
# 终端 1：手动起被测应用（codegen 不会自动拉起 webServer）
npm run demo-app
# 终端 2：打开录制器，点哪写哪，自动生成定位器代码
npx playwright codegen http://localhost:3100
```

录出来的代码也要**过一遍脑子**：它会生成很多 `.first()` 和 CSS，你该手工改成语义定位器。

## 9. 作业（tests/02-locators/90-homework.spec.ts）

1. **综合流程**：登录（getByLabel）→ 落地断言（toHaveURL）→ 新增一条待办（getByPlaceholder + 添加按钮）→ 用 filter 找到它 → 点它的删除按钮 → 断言它消失。全程注释按范本风格写。
2. **严格模式探索**：在练习场页验证「无 name 的 getByRole('heading') 会 strict violation」，把匹配到几个、为什么写进结论注释；再写出能唯一定位 `<h1>` 的定位器。

## 10. 自查清单

- [ ] 能说出定位器三性质：惰性、严格、可链式
- [ ] 能解释为什么 `toHaveCount` 不触发严格模式而 `toBeVisible` 会
- [ ] 拿到一个新元素，能按「角色→label/placeholder→testId→CSS」的顺序选定位器
- [ ] 用 codegen 录制过一次，并手工改掉它生成的 `.first()`
