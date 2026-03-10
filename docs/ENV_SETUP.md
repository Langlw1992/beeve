# 环境变量配置说明

本文档说明 Beeve 项目的环境变量配置。

## 后端环境变量 (`apps/server/.env`)

### 必需变量

| 变量名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `NODE_ENV` | enum | 运行环境 | `development` \| `production` \| `test` |
| `DATABASE_URL` | URL | PostgreSQL 连接字符串 | `postgresql://user:pass@localhost:5432/beeve` |
| `BETTER_AUTH_SECRET` | string | Auth 加密密钥（至少32位） | `YpXiKcZMH+O6+Vhxv0pE1SyQT186h1vluqvepmHNirQ=` |
| `BETTER_AUTH_URL` | URL | Auth 服务基础 URL | `http://localhost:3000` |

### 可选变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | string | `3000` | 服务监听端口 |
| `CORS_ORIGIN` | string | `*` | 允许的跨域来源 |
| `AUTH_APP_URL` | URL | - | 前端应用 URL（用于重定向） |

### OAuth 提供商变量（可选）

| 变量名 | 说明 |
|--------|------|
| `GOOGLE_CLIENT_ID` | Google OAuth 客户端 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 客户端密钥 |
| `GITHUB_CLIENT_ID` | GitHub OAuth 客户端 ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 客户端密钥 |

### 开发环境完整示例

```bash
# 环境
NODE_ENV=development

# 数据库
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beeve"

# 服务端口
PORT=3000

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"

# CORS
CORS_ORIGIN="http://localhost:5174"

# Auth App URL
AUTH_APP_URL="http://localhost:5174"

# Google OAuth (可选)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (可选)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## 前端环境变量 (`apps/web/.env`)

### 开发环境

```bash
# Better Auth API 地址
# 开发环境下使用 Vite proxy，此变量可为空或设置为相对路径
# 生产环境需要设置为实际 API 地址
VITE_API_URL=
```

### 生产环境

```bash
# 生产环境 API 地址
VITE_API_URL=https://api.beeve.com
```

## 环境变量验证

后端使用 Zod 进行环境变量验证（`apps/server/src/config/env.ts`）：

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().optional().default('3000'),
  CORS_ORIGIN: z.string().optional().default('*'),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
})
```

如果验证失败，服务将输出错误信息并退出：
```
❌ 环境变量验证失败:
  - DATABASE_URL: Invalid url
  - BETTER_AUTH_SECRET: String must contain at least 32 character(s)
```

## 配置文件模板

### 后端 `.env.example`

```bash
# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5174

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/beeve

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-characters-long
BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 前端 `.env.example`

```bash
# Better Auth API 地址
# 开发环境下使用 Vite proxy，此变量可为空或设置为相对路径
# 生产环境需要设置为实际 API 地址
VITE_API_URL=
```

## 生成安全的 BETTER_AUTH_SECRET

使用 Node.js 生成随机密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

或使用 OpenSSL：

```bash
openssl rand -base64 32
```

## 不同环境的配置建议

### 本地开发

```bash
# 后端 .env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5174
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/beeve
BETTER_AUTH_SECRET=<生成的密钥>
BETTER_AUTH_URL=http://localhost:3000

# 前端 .env
VITE_API_URL=
```

### Docker 开发

```bash
# 后端 .env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5174
DATABASE_URL=postgresql://beeve:password@postgres:5432/beeve
BETTER_AUTH_SECRET=<生成的密钥>
BETTER_AUTH_URL=http://localhost:3000

# 前端 .env
VITE_API_URL=http://localhost:3000
```

### 生产环境

```bash
# 后端 .env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://app.beeve.com
DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/beeve
BETTER_AUTH_SECRET=<强密钥>
BETTER_AUTH_URL=https://api.beeve.com

# 前端 .env
VITE_API_URL=https://api.beeve.com
```

## 安全注意事项

1. **不要将 `.env` 文件提交到 Git**
   - `.env` 已在 `.gitignore` 中
   - 只提交 `.env.example` 作为模板

2. **生产环境密钥管理**
   - 使用密钥管理服务（如 AWS Secrets Manager, HashiCorp Vault）
   - 或使用 CI/CD 环境变量注入

3. **BETTER_AUTH_SECRET**
   - 必须至少 32 个字符
   - 生产环境必须使用随机生成的强密钥
   - 泄露此密钥将导致会话可被伪造

4. **OAuth 密钥**
   - 生产环境使用生产环境的 OAuth 应用配置
   - 本地开发使用测试/开发环境的 OAuth 应用
