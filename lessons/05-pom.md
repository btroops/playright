# 第 5 课：Page Object Model 与自定义 fixtures——测试代码的工程化组织

> 前置：第 1–4 课完成。本课示范：`tests/05-pom/`（含 `pages/` 与 `fixtures.ts`）；作业：`tests/05-pom/90-homework.spec.ts`。
> 本课不改 demo-app——POM 是对「已有页面」的组织方式。

## 1. 为什么需要 POM

回想第 2 课作业：登录、新增、删除的定位器散落在测试代码里。页面一改版（比如按钮文字变了），你要改 N 个测试文件。**Page Object Model** 的解法：每个页面一个类，把「找得到、做得到」封装起来，测试里只写业务意图——

```
tests/05-pom/
├── pages/
│   ├── login-page.ts    # LoginPage：open / login / errorMessage
│   └── todo-page.ts     # TodoPage：open / addTodo / deleteTodo / item / stats
├── fixtures.ts          # 自定义 fixture：把 Page Object 注入每个用例
└── 01-pom-demo.spec.ts  # 测试只表达业务意图
```

页面改版时只改一个类；测试读起来像需求文档。

## 2. 最小 POM 类

```ts
export class LoginPage {
  constructor(private readonly page: Page) {}

  // 定位器以 getter 暴露：断言【写在测试里】，POM 只负责找得到
  get errorMessage() {
    return this.page.locator('#error');
  }

  async open() {
    await this.page.goto('/login.html');
  }

  // 方法名用业务动词，参数是业务参数（账号密码），不是元素定位
  async login(username: string, password: string) {
    await this.page.getByLabel('用户名').fill(username);
    await this.page.getByLabel('密码').fill(password);
    await this.page.getByRole('button', { name: '登录' }).click();
  }
}
```

两条边界：**断言放测试、不放 POM**（断言是「验证意图」，留在测试里一眼可见）；**POM 不做流程编排**（「先登录再新增」这种多页流程写在测试里，单页动作才进 POM）。

## 3. 自定义 fixture：让 Page Object 自动注入

每个测试都 `new LoginPage(page)` 太啰嗦。Playwright 的 `test.extend` 可以造一个「自带 Page Object 的 test」：

```ts
// fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login-page';

type Lab = { loginPage: LoginPage };

export const test = base.extend<Lab>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));   // use 之前=准备，之后=清理（这里无需清理）
  },
});
export { expect } from '@playwright/test';
```

测试文件里 `import { test, expect } from './fixtures'`，签名直接解构 `loginPage`——fixture 在用例开始前自动创建。第 7 课会用同一机制注入「已登录的 API 上下文」。

## 4. 何时值得上 POM

- 同一页面的交互出现在 **3 个以上**测试里 → 值得封装；
- 一次性用例 → 先内联，出现重复再提炼（过早抽象同样是债）。

## 5. 作业（tests/05-pom/90-homework.spec.ts）

1. 给练习场写 `LabPage`（封装慢速加载操作、慢速列表定位器、悬停提示定位器），用自定义 fixture 注入；
2. 用它改写一条既有用例（悬停提示断言 + 慢速内容闭环）；
3. 结论注释：你的 LabPage 里放了哪些东西？断言为什么不进 POM？

## 6. 自查清单

- [ ] 能说清 POM 解决什么、不解决什么（不解决「测什么」）
- [ ] 会写 test.extend fixture，知道 use 前后分别是准备与清理
- [ ] 页面改版时，知道只需要改 pages/ 下对应类
