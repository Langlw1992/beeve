# 架构说明

## 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         apps/web                                │
│                    (低代码平台前端)                               │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │   Designer   │   Preview    │   Projects   │   Settings   │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   @beeve/ui     │  │ @beeve/lowcode  │  │ @beeve/auth     │
│   组件库         │  │    -core        │  │   -client       │
│                 │  │  低代码引擎      │  │  认证客户端      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │  @beeve/shared  │
                    │   共享类型/工具   │
                    └─────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌─────────────────────────────────────┐   ┌─────────────────┐
│           apps/server               │   │  apps/ui-doc    │
│           (Hono API)                │   │  apps/storybook │
│  ┌─────┬─────┬─────┬─────┬─────┐   │   └─────────────────┘
│  │auth │users│proj │pages│asset│   │
│  └─────┴─────┴─────┴─────┴─────┘   │
└─────────────────────────────────────┘
                    │
                    ▼
          ┌─────────────────┐
          │    @beeve/db    │
          │  Drizzle + PG   │
          └─────────────────┘
                    │
                    ▼
          ┌─────────────────┐
          │   PostgreSQL    │
          └─────────────────┘
```

## 包职责

### @beeve/ui

组件库，提供可复用的 UI 组件。

```
packages/ui/
├── src/
│   ├── components/          # 业务组件
│   │   ├── Button/
│   │   ├── Input/
│   │   └── ...
│   ├── primitives/          # 无样式原语（Headless）
│   │   ├── Dialog/
│   │   ├── Popover/
│   │   └── ...
│   ├── hooks/               # UI 相关 hooks
│   │   ├── use-click-outside.ts
│   │   ├── use-media-query.ts
│   │   └── ...
│   └── utils/               # 内部工具
│       ├── cn.ts            # className 合并
│       └── ...
├── tailwind.config.ts
└── package.json
```

**设计原则**：
- 组件应该是无状态的，状态由外部控制
- 使用 `tailwind-variants` 管理变体
- 提供完整的 TypeScript 类型
- 支持 ref 转发

### @beeve/lowcode-core

低代码引擎核心，提供 Schema 定义、渲染器和设计器。

```
packages/lowcode-core/
├── src/
│   ├── schema/              # Schema 定义
│   │   ├── types.ts         # 核心类型
│   │   ├── validators.ts    # Zod 验证
│   │   └── transforms.ts    # Schema 转换
│   ├── renderer/            # 渲染引擎
│   │   ├── Renderer.tsx     # 核心渲染器
│   │   ├── context.ts       # 渲染上下文
│   │   └── hooks.ts
│   ├── designer/            # 设计器
│   │   ├── Designer.tsx     # 设计器主组件
│   │   ├── Canvas.tsx       # 画布
│   │   ├── DragDrop.tsx     # 拖拽系统
│   │   ├── Selection.tsx    # 选中态
│   │   ├── store.ts         # 设计器状态
│   │   └── history.ts       # 撤销/重做
│   ├── materials/           # 物料系统
│   │   ├── registry.ts      # 物料注册中心
│   │   ├── protocol.ts      # 物料协议定义
│   │   └── builtin/         # 内置物料
│   └── plugins/             # 插件系统
│       ├── types.ts
│       └── manager.ts
└── package.json
```

**核心概念**：

1. **Schema**：描述页面结构的 JSON
2. **Renderer**：将 Schema 渲染为实际组件
3. **Designer**：可视化编辑 Schema
4. **Material**：可拖拽的组件物料
5. **Plugin**：扩展设计器功能

### @beeve/auth-client

前端认证 SDK。

```
packages/auth-client/
├── src/
│   ├── client.ts            # 认证客户端
│   ├── provider.tsx         # AuthProvider 组件
│   ├── hooks.ts             # useAuth, useUser 等
│   ├── guards.tsx           # 路由守卫组件
│   ├── storage.ts           # Token 存储
│   └── types.ts
└── package.json
```

**功能**：
- Token 管理（access + refresh）
- 自动刷新
- 登录/登出/注册
- OAuth 集成
- 路由守卫

### @beeve/db

数据库层。

```
packages/db/
├── src/
│   ├── schema/              # Drizzle Schema
│   │   ├── users.ts
│   │   ├── projects.ts
│   │   ├── pages.ts
│   │   ├── roles.ts
│   │   └── index.ts
│   ├── migrations/          # 迁移文件
│   ├── seed/                # 种子数据
│   └── client.ts            # 数据库客户端
├── drizzle.config.ts
└── package.json
```

### @beeve/shared

跨包共享代码。

```
packages/shared/
├── src/
│   ├── types/               # 通用类型
│   │   ├── api.ts           # API 响应类型
│   │   ├── user.ts
│   │   └── ...
│   ├── validators/          # Zod Schemas（前后端共享）
│   │   ├── user.ts
│   │   ├── project.ts
│   │   └── ...
│   ├── constants/           # 常量
│   │   ├── errors.ts
│   │   └── ...
│   └── utils/               # 工具函数
│       ├── format.ts
│       └── ...
└── package.json
```

### apps/server

Hono API 服务。

```
apps/server/
├── src/
│   ├── routes/              # API 路由
│   │   ├── auth/            # 认证
│   │   │   ├── login.ts
│   │   │   ├── register.ts
│   │   │   ├── refresh.ts
│   │   │   └── oauth/
│   │   ├── users/
│   │   ├── projects/
│   │   ├── pages/
│   │   └── assets/
│   ├── middleware/          # 中间件
│   │   ├── auth.ts          # JWT 验证
│   │   ├── cors.ts
│   │   └── logger.ts
│   ├── services/            # 业务逻辑
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── ...
│   ├── lib/                 # 工具
│   │   ├── jwt.ts
│   │   ├── hash.ts
│   │   └── ...
│   └── index.ts             # 入口
├── package.json
└── tsconfig.json
```

### apps/web

低代码平台前端。

```
apps/web/
├── src/
│   ├── routes/              # TanStack Router 路由
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── projects/
│   │   │   ├── index.tsx
│   │   │   └── $projectId/
│   │   │       ├── index.tsx
│   │   │       ├── pages/
│   │   │       └── settings.tsx
│   │   └── ...
│   ├── features/            # 功能模块
│   │   ├── designer/        # 设计器功能
│   │   ├── preview/         # 预览功能
│   │   └── ...
│   ├── components/          # 页面组件
│   ├── hooks/               # 自定义 hooks
│   ├── stores/              # 全局状态
│   ├── lib/                 # 工具
│   │   ├── api.ts           # API 客户端
│   │   └── ...
│   └── main.tsx
├── index.html
└── package.json
```

## 数据流

### 前端数据流

```
用户操作
    │
    ▼
┌─────────────┐
│  Component  │ ◄──── @beeve/ui
└─────────────┘
    │
    ▼
┌─────────────┐
│   Action    │ ◄──── 用户事件处理
└─────────────┘
    │
    ├─────────────────────────┐
    ▼                         ▼
┌─────────────┐       ┌─────────────┐
│ Local State │       │ TanStack    │
│  (signals)  │       │   Query     │
└─────────────┘       └─────────────┘
                            │
                            ▼
                      ┌─────────────┐
                      │  API Call   │
                      └─────────────┘
                            │
                            ▼
                      ┌─────────────┐
                      │   Server    │
                      └─────────────┘
```

### 低代码渲染流

```
Page Schema (JSON)
    │
    ▼
┌─────────────────┐
│ Schema Parser   │ ◄──── 验证 + 转换
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Material Lookup │ ◄──── 查找组件实现
└─────────────────┘
    │
    ▼
┌─────────────────┐
│    Renderer     │ ◄──── 递归渲染
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Solid 组件树   │
└─────────────────┘
```

## API 设计

### RESTful 约定

```
GET    /api/users          # 列表
GET    /api/users/:id      # 详情
POST   /api/users          # 创建
PATCH  /api/users/:id      # 部分更新
DELETE /api/users/:id      # 删除
```

### 响应格式

```typescript
// 成功
{
  "data": T,
  "meta"?: {
    "total": number,
    "page": number,
    "pageSize": number
  }
}

// 错误
{
  "error": {
    "code": string,
    "message": string,
    "details"?: Record<string, string[]>
  }
}
```

### 认证流程

```
┌────────┐                  ┌────────┐                  ┌────────┐
│ Client │                  │ Server │                  │   DB   │
└────┬───┘                  └────┬───┘                  └────┬───┘
     │                           │                           │
     │  POST /auth/login         │                           │
     │  {email, password}        │                           │
     │ ─────────────────────────►│                           │
     │                           │  查询用户                  │
     │                           │ ─────────────────────────►│
     │                           │                           │
     │                           │  验证密码                  │
     │                           │◄─────────────────────────│
     │                           │                           │
     │  {accessToken,            │                           │
     │   refreshToken}           │                           │
     │◄─────────────────────────│                           │
     │                           │                           │
     │  GET /api/xxx             │                           │
     │  Authorization: Bearer    │                           │
     │ ─────────────────────────►│                           │
     │                           │  验证 JWT                  │
     │                           │  执行业务逻辑              │
     │  响应                      │                           │
     │◄─────────────────────────│                           │
     │                           │                           │
```
