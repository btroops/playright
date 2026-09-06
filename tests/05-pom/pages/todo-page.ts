import type { Page } from '@playwright/test';

/**
 * Todo 页 Page Object：封装待办列表页的定位器与操作。
 * item(title) 是「参数化定位器」——按内容找到某一行，删除/断言都基于它。
 */
export class TodoPage {
  constructor(private readonly page: Page) {}

  get stats() {
    return this.page.locator('#stats');
  }

  // 参数化定位器：返回定位器本身（不 await）——调用方可以继续链式断言或取行内按钮。
  // filter 的子串匹配要求 title 足够独特，调用方负责传入独特文案。
  item(title: string) {
    return this.page.getByRole('listitem').filter({ hasText: title });
  }

  async open() {
    // 注意：直接开 /todos.html 需要已有登录态（未登录会被重定向到登录页）。
    // 登录态的建立见本目录 01-pom-demo.spec.ts 的第一个用例，或第 7 课的 storageState。
    await this.page.goto('/todos.html');
  }

  async addTodo(title: string) {
    await this.page.getByPlaceholder('想做什么？').fill(title);
    await this.page.getByRole('button', { name: '添加' }).click();
  }

  async deleteTodo(title: string) {
    // 链式：在某一行内找它自己的删除按钮（第 2 课：不圈定会命中多行报严格模式错）。
    await this.item(title).getByRole('button', { name: '删除' }).click();
  }
}
