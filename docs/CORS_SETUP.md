# CORS 配置说明

本文档说明 Beeve 项目的跨域资源共享 (CORS) 配置。

## 当前配置

### 后端配置 (`apps/server/src/index.ts`)

```typescript
.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
)
```

### 环境变量 (`apps/server/.env`)

```bash
CORS_ORIGIN="http://localhost:5174"
```

### Better Auth 信任域名 (`apps/server/src/auth.ts`)

```typescript
trustedOrigins: [env.CORS_ORIGIN],
```

### 前端 Vite Proxy (`apps/web/vite.config.ts`)

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

## 各环境的推荐配置

### 开发环境

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 前端地址 | `http://localhost:5174` | Vite 默认端口 |
| 后端地址 | `http://localhost:3000` | Elysia 默认端口 |
| CORS_ORIGIN | `http://localhost:5174` | 允许前端访问 |
| BETTER_AUTH_URL | `http://localhost:3000` | Auth 服务地址 |

**开发环境特点：**
- 前端通过 Vite proxy 转发 `/api` 请求到后端
- 前端 `auth-client.ts` 中 `baseURL` 使用相对路径（空字符串）
- 实际开发中浏览器看到的请求都是同源的

### 生产环境

| 配置项 | 示例值 | 说明 |
|--------|--------|------|
| 前端地址 | `https://app.beeve.com` | 生产域名 |
| 后端地址 | `https://api.beeve.com` | API 子域名 |
| CORS_ORIGIN | `https://app.beeve.com` | 允许前端域名 |
| BETTER_AUTH_URL | `https://api.beeve.com` | Auth 服务地址 |

**生产环境配置：**

1. 后端 `.env`：
```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://app.beeve.com
BETTER_AUTH_URL=https://api.beeve.com
BETTER_AUTH_SECRET=your-production-secret-min-32-chars
```

2. 前端 `.env`：
```bash
VITE_API_URL=https://api.beeve.com
```

3. 前端 `auth-client.ts`：
```typescript
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || '',
})
```

## 常见问题排查

### 问题 1: CORS 预检请求失败 (OPTIONS 403)

**现象：**
```
Access to fetch at 'http://localhost:3000/api/auth/get-session' from origin
'http://localhost:5174' has been blocked by CORS policy
```

**排查步骤：**
1. 检查后端 `CORS_ORIGIN` 是否包含前端地址
2. 检查 `allowedHeaders` 是否包含请求中使用的头部
3. 检查 `credentials: true` 是否与请求中的 `credentials: 'include'` 匹配

**修复：**
```typescript
// 后端 - 确保配置正确
cors({
  origin: 'http://localhost:5174',  // 必须是完整 URL，不能只是端口号
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
})
```

### 问题 2: Better Auth 返回 "Untrusted origin"

**现象：**
```json
{
  "error": "Untrusted origin"
}
```

**排查步骤：**
1. 检查 `auth.ts` 中的 `trustedOrigins` 配置
2. 确保 `trustedOrigins` 包含前端实际访问的域名

**修复：**
```typescript
// auth.ts
trustedOrigins: [
  env.CORS_ORIGIN,
  'http://localhost:5174',  // 开发环境
  'https://app.beeve.com',  // 生产环境
],
```

### 问题 3: Cookie 无法设置

**现象：**
登录成功但后续请求未携带 Cookie

**排查步骤：**
1. 检查后端 CORS 配置中 `credentials: true`
2. 检查前端请求中 `credentials: 'include'`
3. 检查浏览器 DevTools Network 面板中的 Set-Cookie 响应头

**修复：**
```typescript
// 前端 auth-client.ts
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || '',
  fetchOptions: {
    credentials: 'include',  // 确保携带 Cookie
  },
})
```

### 问题 4: 多个开发端口冲突

**现象：**
Vite 启动在 `http://localhost:5173` 但 CORS 配置的是 `5174`

**修复：**
1. 统一端口配置，或
2. 配置多个允许的域名：
```bash
# .env
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
```

```typescript
// index.ts - 支持多个 origin
const allowedOrigins = env.CORS_ORIGIN.split(',')

.use(
  cors({
    origin: (request) => {
      const origin = request.headers.get('origin')
      return allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0]
    },
    credentials: true,
  }),
)
```

## 验证 CORS 配置

使用 curl 测试：

```bash
# 测试简单请求
curl -H "Origin: http://localhost:5174" \
     -H "Content-Type: application/json" \
     http://localhost:3000/health

# 测试预检请求
curl -X OPTIONS \
     -H "Origin: http://localhost:5174" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     http://localhost:3000/api/auth/sign-in/email
```

预期响应头应包含：
```
Access-Control-Allow-Origin: http://localhost:5174
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```
