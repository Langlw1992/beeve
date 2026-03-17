# @beeve/auth - 认证服务

Beeve 统一认证中心。前后端一体化：SolidJS 页面 + Elysia API 在同一项目中。

## 架构分层

- **`src/routes/`** — 页面 + server functions。仅负责 UI 渲染和路由守卫，不写业务 API
- **`src/lib/server.ts`** — Elysia 实例，所有后端 API 在此定义（prefix `/api`）
- **`src/routes/api.$.ts`** — 桥接层，将 `/api/*` 请求转发给 Elysia，使用 `server.handlers`
- **`src/lib/auth/`** — Better Auth 配置（服务端、客户端、DB、schema）
- **`src/lib/eden.ts`** — Eden Treaty 同构客户端（服务端零开销，客户端走 HTTP）

## 目录结构

```
src/
├── routes/              # 页面路由 + server functions（TanStack Router 文件系统路由）
│   ├── __root.tsx       # 根布局
│   ├── api.$.ts         # /api/* → Elysia（桥接，勿修改）
│   ├── index.tsx        # 首页（未登录展示，已登录跳 dashboard）
│   ├── login.tsx        # 社交登录页（requireGuest）
│   ├── dashboard/       # 用户面板（requireAuth）
│   ├── settings/        # 用户设置（requireAuth）
│   └── admin/           # 管理后台（requireAdmin）
├── components/          # 共享组件
├── lib/
│   ├── auth/            # Better Auth
│   │   ├── server.ts    # 服务端配置（drizzle adapter, plugins, 社交登录）
│   │   ├── client.ts    # 客户端配置（better-auth/solid）
│   │   ├── db.ts        # Drizzle + pg Pool
│   │   └── schema.ts    # Drizzle schema（CLI 生成，勿手动编辑）
│   ├── server.ts        # Elysia 实例 — 所有 API 路由在此添加
│   ├── guards.ts        # 路由守卫：requireAuth / requireGuest / requireAdmin
│   └── eden.ts          # Eden Treaty 同构客户端
├── router.tsx
└── styles.css
```

## 关键约定

- **新增 API**：在 `src/lib/server.ts` 的 Elysia chain 上添加，不要在 routes 中写 API 逻辑
- **新增页面**：在 `src/routes/` 创建 `.tsx`，用 `createFileRoute` 定义
- **路由守卫**：在 `beforeLoad` 中调用 `guards.ts` 导出的函数

## 命令

```bash
pnpm dev                 # 开发服务器（:3000）
pnpm build               # 生产构建
pnpm lint                # Biome lint
pnpm typecheck           # tsc --noEmit
pnpm db:generate         # Drizzle 生成迁移文件
pnpm db:migrate          # 应用迁移
pnpm db:studio           # Drizzle Studio
```

Schema 重新生成（插件变更后）：
```bash
npx auth@latest generate --config src/lib/auth/server.ts --output src/lib/auth/schema.ts
```

## 环境变量（.env.local）

```bash
APP_ORIGIN=http://localhost:3000
BETTER_AUTH_SECRET=
DATABASE_URL=postgresql://beeve:beeve_secret@localhost:5432/beeve_auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
APPLE_CLIENT_ID=          # 可选，未配置则不启用
APPLE_CLIENT_SECRET=
APPLE_APP_BUNDLE_IDENTIFIER=
```
