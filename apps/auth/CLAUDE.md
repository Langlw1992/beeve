# @beeve/auth - 认证服务

## 项目定位

统一的认证中心，为整个 Beeve 产品体系提供：
- 用户注册/登录
- 会话管理
- 权限控制
- 社交登录（Google、GitHub、Apple）

**前后端一体化**：前端界面 + 后端 API 在同一项目中。

## 技术栈

- **前端**: SolidJS + TanStack Solid Start（SSR 支持）
- **路由**: TanStack Solid Router（文件系统路由）
- **后端**: Elysia 1.4.27 (Bun 高性能 Web 框架)
- **数据获取**: TanStack Solid Query + Eden Treaty（端到端类型安全）
- **认证**: Better Auth 1.5.5（挂载到 Elysia）
- **数据库**: PostgreSQL (pg Pool)
- **样式**: Tailwind CSS v4

## 目录结构

```
src/
├── routes/              # 文件系统路由（TanStack Router）
│   ├── __root.tsx       # 根布局（HTML 骨架、全局样式）
│   ├── index.tsx        # 首页
│   ├── login.tsx        # 登录页
│   ├── about.tsx        # 关于页面
│   └── api/
│       └── api.$.ts         # Elysia 接管所有 /api/*
├── components/          # 页面组件
├── integrations/        # 第三方库集成
│   ├── better-auth/     # Better Auth 组件
│   └── tanstack-query/  # QueryClient 配置
├── lib/
│   ├── server.ts        # Elysia 服务端实例（所有后端逻辑）
│   ├── server-auth.ts   # Better Auth 配置
│   ├── auth-client.ts   # 客户端 Better Auth 配置
│   └── eden.ts          # Eden Treaty 同构客户端
├── router.tsx           # 路由配置
└── styles.css           # 全局样式
```

## 环境变量

```bash
# 应用配置
APP_ORIGIN=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key

# 数据库配置
DATABASE_URL=postgresql://beeve:beeve_secret@localhost:5432/beeve_auth

# 社交登录（按需配置）
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
APPLE_APP_BUNDLE_IDENTIFIER=
```

## 开发命令

```bash
# 开发
pnpm dev                 # 启动开发服务器（端口 3000）
turbo dev --filter=@beeve/auth

# 构建
pnpm build               # 生产构建（输出到 .output/）
turbo build --filter=@beeve/auth

# 代码质量
pnpm lint                # 代码检查
pnpm typecheck           # 类型检查
```

## 服务端架构（Elysia）

**Elysia 服务端**: `src/lib/server.ts`
- 使用 `{ prefix: "/api" }` 配置
- 集成 CORS（Better Auth 需要）
- 挂载 Better Auth (`/api/auth/*`)
- 其他 API 路由直接在此添加

**Better Auth 配置**: `src/lib/server-auth.ts`
- 数据库配置（PostgreSQL）
- 社交登录配置
- Admin 插件
- **关键**: `tanstackStartCookies()` 必须是最后一个插件

**API 入口**: `src/routes/api/api.$.ts`
- 所有 `/api/*` 请求转发给 Elysia
- 使用 `server.handlers` 定义 HTTP 方法处理

**Eden Treaty 客户端**: `src/lib/eden.ts`
- 端到端类型安全
- 同构函数：服务端零开销，客户端 HTTP

### 添加新 API 路由

在 `src/lib/server.ts` 中直接添加：

```typescript
export const app = new Elysia({ prefix: "/api" })
  .use(cors({ origin: appOrigin, credentials: true }))
  // Better Auth
  .all("/auth/*", async ({ request }) => auth.handler(request))
  // 添加你的路由
  .get("/health", () => ({ status: "ok" }))
  .get("/users", async () => {
    // 获取用户列表
  })
```

### 类型安全调用（Eden Treaty）

```typescript
// 在组件或 loader 中使用
import { api } from '@/lib/eden'

// Loader 中使用（服务端渲染时零 HTTP 开销）
export const Route = createFileRoute('/')({
  loader: async () => {
    const health = await api().health.get()
    return { health: health.data }
  },
})

// 客户端使用（自动发起 HTTP 请求）
function Component() {
  const handleClick = async () => {
    const result = await api().health.get()
    console.log(result.data)
  }
}
```

## Better Auth 集成

**客户端配置**: `src/lib/auth-client.ts`
- 使用 `better-auth/solid` 创建客户端

**在组件中使用**:
```tsx
import { authClient } from '@/lib/auth-client'

// 登录
await authClient.signIn.email({ email, password })

// 社交登录
await authClient.signIn.social({ provider: 'github', callbackURL: '/' })

// 获取当前用户
const { data: session } = await authClient.getSession()
```

## 数据库迁移

首次运行或 Better Auth 版本升级后，执行：
```bash
npx @better-auth/cli@latest migrate
```

## 路由约定

**TanStack Solid Router** 文件系统路由：

| 文件路径 | 路由路径 | 说明 |
|---------|---------|------|
| `routes/index.tsx` | `/` | 首页 |
| `routes/login.tsx` | `/login` | 登录页 |
| `routes/api/api.$.ts` | `/api/*` | API 路由（Elysia 处理） |
| `routes/__root.tsx` | - | 根布局 |

## 新增页面 Checklist

- [ ] 在 `src/routes/` 创建 `.tsx` 文件
- [ ] 使用 `createFileRoute` 定义路由
- [ ] 运行 `pnpm dev` 自动生成路由类型

## 依赖版本

关键依赖版本（截至 2025-03-16）：
- `elysia`: 1.4.27
- `@elysiajs/eden`: 1.4.8
- `@elysiajs/cors`: 1.4.1
- `better-auth`: 1.5.5
- `@tanstack/solid-start`: 1.166.14
- `pg`: 8.20.0
