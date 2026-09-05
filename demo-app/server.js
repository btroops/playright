// 极简演示应用：为 Playwright 练习提供稳定的被测对象。
// 内存存储，重启即重置；端口由 PORT 环境变量控制（默认 3100）。
const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3100;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// —— 会话（内存态） ——
const sessions = new Set();
const DEMO_USER = { username: 'demo', password: 'pass123' };

function getSessionToken(req) {
  const match = (req.headers.cookie || '').match(/(?:^|;\s*)session=([a-f0-9]+)/);
  return match && sessions.has(match[1]) ? match[1] : null;
}

function requireAuth(req, res, next) {
  if (!getSessionToken(req)) {
    return res.status(401).json({ error: '未登录' });
  }
  next();
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/me', (req, res) => {
  const token = getSessionToken(req);
  if (!token) return res.status(401).json({ error: '未登录' });
  res.json({ ok: true, username: DEMO_USER.username });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    const token = crypto.randomBytes(16).toString('hex');
    sessions.add(token);
    res.setHeader('Set-Cookie', `session=${token}; Path=/; HttpOnly`);
    return res.json({ ok: true, username });
  }
  res.status(401).json({ ok: false, error: '用户名或密码错误' });
});

app.post('/api/logout', (req, res) => {
  const token = getSessionToken(req);
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', 'session=; Path=/; Max-Age=0');
  res.json({ ok: true });
});

// —— Todos（内存存储） ——
let todos = [
  { id: 1, title: '学习 Playwright 定位器', done: false },
  { id: 2, title: '写下第一个测试用例', done: true },
];
let nextId = 3;

app.get('/api/todos', requireAuth, (req, res) => res.json(todos));

app.post('/api/todos', requireAuth, (req, res) => {
  const title = (req.body && String(req.body.title || '').trim());
  if (!title) return res.status(400).json({ error: '标题不能为空' });
  const todo = { id: nextId++, title, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', requireAuth, (req, res) => {
  const todo = todos.find((t) => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: '待办不存在' });
  if (typeof (req.body || {}).title === 'string' && req.body.title.trim()) {
    todo.title = req.body.title.trim();
  }
  if (typeof (req.body || {}).done === 'boolean') {
    todo.done = req.body.done;
  }
  res.json(todo);
});

app.delete('/api/todos/:id', requireAuth, (req, res) => {
  const exists = todos.some((t) => t.id === Number(req.params.id));
  if (!exists) return res.status(404).json({ error: '待办不存在' });
  todos = todos.filter((t) => t.id !== Number(req.params.id));
  res.json({ ok: true });
});

// —— 慢端点：练习自动等待 / waitForResponse ——
app.get('/api/slow', (req, res) => {
  const ms = Math.min(Number(req.query.ms) || 2000, 10000);
  setTimeout(() => res.json({ ok: true, waitedMs: ms }), ms);
});

app.listen(PORT, () => {
  console.log(`demo-app listening on http://localhost:${PORT}`);
});
