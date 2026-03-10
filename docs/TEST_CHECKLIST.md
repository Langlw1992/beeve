# 测试清单

本文档提供 Beeve 项目的完整测试步骤，用于验证系统各组件是否正常工作。

## 环境准备

### 1. 启动数据库

```bash
# 使用 Docker 启动 PostgreSQL
docker run -d \
  --name beeve-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=beeve \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. 配置环境变量

```bash
# 后端 (apps/server/.env)
cp apps/server/.env.example apps/server/.env
# 编辑 .env 文件，填入正确的数据库连接信息

# 前端 (apps/web/.env)
cp apps/web/.env.example apps/web/.env
# 开发环境通常不需要修改
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 数据库迁移

```bash
cd apps/server
pnpm db:migrate
```

---

## 后端 API 测试

### 启动服务

```bash
cd apps/server
pnpm dev
```

服务应启动在 `http://localhost:3000`

### 测试步骤

#### 1. 健康检查

```bash
curl http://localhost:3000/health
```

**预期响应：**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**验证点：**
- [ ] HTTP 状态码 200
- [ ] 返回 JSON 包含 status 和 timestamp

#### 2. CORS 配置测试

```bash
# 测试预检请求
curl -X OPTIONS \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:3000/health \
  -v
```

**预期响应头：**
```
Access-Control-Allow-Origin: http://localhost:5174
Access-Control-Allow-Credentials: true
```

**验证点：**
- [ ] 响应头包含正确的 CORS 配置
- [ ] 状态码 204 或 200

#### 3. Better Auth 端点测试

```bash
# 获取会话（未登录状态）
curl http://localhost:3000/api/auth/get-session \
  -H "Content-Type: application/json"
```

**预期响应：**
```json
null
```

**验证点：**
- [ ] HTTP 状态码 200
- [ ] 返回 null（未登录）

#### 4. 用户注册

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**预期响应：**
```json
{
  "token": "...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**验证点：**
- [ ] HTTP 状态码 200
- [ ] 返回包含 token 和 user 对象
- [ ] 数据库 users 表中有新记录

#### 5. 用户登录

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

**预期响应：**
```json
{
  "token": "...",
  "user": {
    "id": "...",
    "email": "test@example.com"
  }
}
```

**验证点：**
- [ ] HTTP 状态码 200
- [ ] 返回包含 token 和 user 对象
- [ ] 响应头包含 Set-Cookie

#### 6. 获取当前用户信息

```bash
curl http://localhost:3000/api/v1/me \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**预期响应：**
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  },
  "session": {
    "id": "...",
    "userId": "...",
    "expiresAt": "..."
  }
}
```

**验证点：**
- [ ] HTTP 状态码 200
- [ ] 返回包含 user 和 session 对象
- [ ] 未登录时返回 401

#### 7. 登出

```bash
curl -X POST http://localhost:3000/api/auth/sign-out \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**预期响应：**
```json
{
  "success": true
}
```

**验证点：**
- [ ] HTTP 状态码 200
- [ ] 再次获取会话返回 null

---

## 前端页面测试

### 启动服务

```bash
# 终端 1 - 启动后端
cd apps/server
pnpm dev

# 终端 2 - 启动前端
cd apps/web
pnpm dev
```

前端应启动在 `http://localhost:5174`

### 测试步骤

#### 1. 首页

**操作：**
- [ ] 访问 `http://localhost:5174`
- [ ] 检查页面标题是否为 "Beeve"
- [ ] 检查是否显示 "开始使用" 按钮
- [ ] 点击 "开始使用" 按钮

**预期结果：**
- [ ] 页面正常加载，无控制台错误
- [ ] 点击按钮跳转到登录页面

#### 2. 登录页面

**操作：**
- [ ] 访问 `http://localhost:5174/login`
- [ ] 检查是否显示登录表单
- [ ] 输入测试账号邮箱和密码
- [ ] 点击登录按钮

**预期结果：**
- [ ] 页面正常加载，显示邮箱和密码输入框
- [ ] 登录成功后跳转到仪表板
- [ ] 登录失败显示错误提示

**测试账号：**
- 邮箱: `test@example.com`
- 密码: `password123`

#### 3. 社交登录

**操作：**
- [ ] 在登录页面点击 "Google" 按钮
- [ ] 在登录页面点击 "GitHub" 按钮

**预期结果：**
- [ ] 跳转到对应的 OAuth 授权页面
- [ ] 授权成功后返回应用并登录

#### 4. 仪表板（需要登录）

**操作：**
- [ ] 登录后访问 `http://localhost:5174/dashboard`
- [ ] 检查是否显示用户信息
- [ ] 检查导航菜单是否正常

**预期结果：**
- [ ] 页面正常加载
- [ ] 显示当前用户信息
- [ ] 未登录时重定向到登录页面

#### 5. 个人资料页面

**操作：**
- [ ] 访问 `http://localhost:5174/profile`
- [ ] 检查是否显示用户信息

**预期结果：**
- [ ] 显示当前登录用户的详细信息

#### 6. 设置页面

**操作：**
- [ ] 访问 `http://localhost:5174/settings`
- [ ] 检查页面是否正常加载

**预期结果：**
- [ ] 页面正常加载，无错误

#### 7. 登出功能

**操作：**
- [ ] 在任意已登录页面点击登出按钮

**预期结果：**
- [ ] 登出成功
- [ ] 重定向到首页或登录页面
- [ ] 再次访问受保护页面需要重新登录

---

## 集成测试

### 完整登录流程

```
1. 访问首页 (/)          -> 显示登录按钮
2. 点击登录按钮          -> 跳转到 /login
3. 输入账号密码          -> 点击登录
4. 登录成功              -> 跳转到 /dashboard
5. 访问 /profile         -> 显示用户信息
6. 点击登出              -> 回到首页
7. 访问 /dashboard       -> 重定向到 /login?redirect=/dashboard
```

### 认证保护测试

**操作：**
1. 清除浏览器 Cookie
2. 直接访问 `http://localhost:5174/dashboard`

**预期结果：**
- [ ] 被重定向到登录页面
- [ ] URL 包含 `redirect=/dashboard` 参数
- [ ] 登录后自动跳转到仪表板

### 会话持久化测试

**操作：**
1. 登录应用
2. 关闭浏览器标签页
3. 重新打开 `http://localhost:5174/dashboard`

**预期结果：**
- [ ] 如果会话未过期，保持登录状态
- [ ] 如果会话已过期，重定向到登录页面

---

## 常见问题排查

### 后端问题

#### 数据库连接失败

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决：**
```bash
# 检查 PostgreSQL 是否运行
docker ps | grep postgres

# 检查数据库连接字符串
# 确保 DATABASE_URL 正确
```

#### 端口被占用

```
Error: Address already in use :::3000
```

**解决：**
```bash
# 查找占用端口的进程
lsof -i :3000

# 终止进程或更改 PORT 环境变量
```

### 前端问题

#### API 请求 404

```
POST http://localhost:5174/api/auth/sign-in/email 404 (Not Found)
```

**解决：**
- 检查 Vite proxy 配置
- 确保后端服务已启动
- 检查 `VITE_API_URL` 配置

#### CORS 错误

```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**解决：**
- 检查后端 `CORS_ORIGIN` 配置
- 检查 `trustedOrigins` 配置
- 参考 `docs/CORS_SETUP.md`

---

## 自动化测试命令

### 后端测试

```bash
cd apps/server

# 运行单元测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行 lint
pnpm lint
```

### 前端测试

```bash
cd apps/web

# 运行单元测试
pnpm test

# 运行 UI 组件测试
pnpm test:ui

# 运行 lint
pnpm lint
```

### 全项目测试

```bash
# 根目录运行
pnpm lint
pnpm test
```
