import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login-page';
import { TodoPage } from './pages/todo-page';

/**
 * 自定义 fixtures：给每个用例自动注入现成的 Page Object。
 * 测试文件统一 import { test, expect } from './fixtures'——
 * 而不是从 @playwright/test 直接拿 test（那一份不认识你的 fixtures）。
 */

// Lab：本目录测试可用的 fixture 集合（类型声明让签名里能直接解构）
type Lab = {
  loginPage: LoginPage;
  todoPage: TodoPage;
};

export const test = base.extend<Lab>({
  // fixture 写法：async ({ page }, use) => { 准备; await use(对象); 清理; }
  // 这里无需准备/清理，只是把 page 包装成 Page Object 交给用例。
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  todoPage: async ({ page }, use) => {
    await use(new TodoPage(page));
  },
});

// expect 本身无需扩展，转发导出保持「import 都来自 ./fixtures」的统一习惯
export { expect } from '@playwright/test';
