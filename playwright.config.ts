import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';

// 端口解析优先级：环境变量 E2E_PORT > worktree 内的 .env 文件 > 默认 3100
// 每个工作树的 .env 由 scripts/new-worktree.sh 自动分配，保证并行运行时端口不冲突
if (!process.env.E2E_PORT) {
  try {
    for (const line of readFileSync('.env', 'utf8').split('\n')) {
      const match = line.match(/^\s*E2E_PORT\s*=\s*(\d+)\s*$/);
      if (match) {
        process.env.E2E_PORT = match[1];
        break;
      }
    }
  } catch {
    // 没有 .env 就用默认端口
  }
}

const port = Number(process.env.E2E_PORT) || 3100;
const baseURL = `http://localhost:${port}`;

// 测试目标永远是 localhost，但宿主机 shell 可能带指向 Windows 宿主的代理变量
// （尤其 ALL_PROXY），webServer 健康检查与浏览器都会遵循它们——代理失效时测试
// 会静默卡死。这里只把回环地址加入 NO_PROXY 绕过代理，不影响外部站点走代理。
const loopback = 'localhost,127.0.0.1,::1';
process.env.NO_PROXY = process.env.NO_PROXY ? `${process.env.NO_PROXY},${loopback}` : loopback;
process.env.no_proxy = process.env.NO_PROXY;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    // 失败的用例自动保留 trace，HTML 报告里可直接回放
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node demo-app/server.js',
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(port) },
    timeout: 30_000,
  },
});
