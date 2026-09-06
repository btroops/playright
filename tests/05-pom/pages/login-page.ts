import type { Page } from '@playwright/test';

/**
 * 登录页 Page Object：封装登录页的定位器与操作。
 * 约定：类名 = 页面名 + Page；方法用业务动词；定位器以 getter 暴露；
 * 断言写在测试里——POM 负责「找得到、做得到」，测试负责「验证什么」。
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  // getter：暴露「断言要用」的定位器。测试里 expect(loginPage.errorMessage)……
  get errorMessage() {
    return this.page.locator('#error');
  }

  async open() {
    await this.page.goto('/login.html');
  }

  // login：业务动词。参数是业务参数（账号/密码），页面细节全部封装在类内。
  // 页面改版（比如按钮换了文字）只改这里，所有测试自动跟上。
  async login(username: string, password: string) {
    await this.page.getByLabel('用户名').fill(username);
    await this.page.getByLabel('密码').fill(password);
    await this.page.getByRole('button', { name: '登录' }).click();
  }
}
