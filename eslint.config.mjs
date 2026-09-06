// ESLint v9 平面配置。
// 分层：JS/TS 通用推荐规则 → tests/ 与配置文件叠加 Playwright 专用规则 → demo-app 按 Node CommonJS 处理。
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // TypeScript 自己处理未定义变量，关掉 JS 的 no-undef 避免误报
  { files: ['**/*.ts'], rules: { 'no-undef': 'off' } },

  {
    files: ['tests/**'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // 课程里大量使用 test.fixme 骨架与 test.only 演示，这是有意为之：
      // no-skipped-test 关闭；no-focused-test 降为警告，提交前请自行清理
      'playwright/no-skipped-test': 'off',
      'playwright/no-focused-test': 'warn',
    },
  },

  {
    files: ['demo-app/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      // demo-app 是 CommonJS 的 Node 应用，require 是惯例而非失误
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
