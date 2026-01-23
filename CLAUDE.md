# Beeve Project - AI Assistant Guide

> 本文档是 AI 助手的核心参考文档，包含项目约定、架构说明和工作指南。

## 🚨 核心规则（必须遵守）

```
1. 零幻觉容忍：不确定的 API 必须查询 context7，禁止猜测
2. 文档驱动：所有库的使用必须有文档依据
3. 代码分析优先：修改代码前必须用 serena 理解上下文
4. 验证闭环：代码必须能通过 typecheck 和 lint
5. 透明决策：说明依据，标记不确定的部分
6. 简体中文回复：回答使用简体中文（技术术语、代码、命令除外）
7. 前端视觉测试：需要检查页面渲染效果时，使用 chromeDevtools MCP
8. 服务器检查：启动 dev 服务前先检查是否已有服务在运行，避免重复启动导致端口冲突
```

### MCP 使用要求

- **context7**：使用任何库 API 前必须查询文档
  - **zag-js libraryId**: `/chakra-ui/zag`（直接使用此 ID，不要搜索）
- **serena**：修改代码前必须分析符号和引用
- **chromeDevtools**：前端视觉测试和调试时使用

详见 [.ai/mcp-usage.md](.ai/mcp-usage.md)

### 工作流程

1. **开始前**：阅读 [PROGRESS.md](PROGRESS.md) 了解当前进度
2. **执行时**：按 [.ai/workflow.md](.ai/workflow.md) 流程操作
3. **结束后**：更新 PROGRESS.md 记录完成情况
4. **重大决策**：在 [.ai/decisions/](.ai/decisions/) 创建 ADR

### ⚠️ 组件开发必须完整交付

**每完成一个组件，必须同时完成以下全部内容：**

| 交付物 | 路径 |
|--------|------|
| 组件代码 | `packages/ui/src/components/{Name}/{Name}.tsx` |
| 导出文件 | `packages/ui/src/components/{Name}/index.ts` |
| Stories | `packages/ui/src/components/{Name}/{Name}.stories.tsx` |
| 文档 | `apps/docs/src/content/docs/components/{name}.mdx` |
| 全局导出 | `packages/ui/src/index.ts` 添加导出 |
| 进度更新 | `PROGRESS.md` 勾选并添加日志 |

**不完整的组件 = 未完成**

**⚠️ 完成确认**：组件开发完成后，必须询问用户确认，得到确认后才能标记为完成并更新 PROGRESS.md

---

## 项目概述

Beeve 是一个基于 SolidJS 的全栈低代码平台，包含：

- **@beeve/ui** - Solid 组件库
- **@beeve/lowcode-core** - 低代码引擎核心
- **@beeve/auth-client** - 认证客户端 SDK
- **@beeve/db** - 数据库层 (Drizzle ORM + PostgreSQL)
- **@beeve/shared** - 共享类型和工具
- **apps/web** - 低代码平台前端
- **apps/server** - API 服务 (Hono)
- **apps/docs** - 文档站点

## 技术栈速查

| 类别 | 技术 |
|------|------|
| UI 框架 | SolidJS |
| 无头组件 | Zag.js |
| 路由 | TanStack Router |
| 数据请求 | TanStack Query |
| 表单 | TanStack Form |
| 表格 | TanStack Table |
| 样式 | TailwindCSS v4 |
| 服务端 | Hono |
| 数据库 | PostgreSQL + Drizzle ORM |
| 验证 | Zod |
| 构建 | Vite + Turborepo |
| 包管理 | pnpm workspace |
| 代码规范 | Biome |

## 项目结构

```
beeve/
├── apps/
│   ├── web/                    # 低代码平台前端
│   ├── server/                 # API 服务
│   └── docs/                   # 文档站点
├── packages/
│   ├── ui/                     # @beeve/ui 组件库
│   ├── lowcode-core/           # 低代码引擎
│   ├── auth-client/            # 认证客户端
│   ├── db/                     # 数据库层
│   ├── shared/                 # 共享代码
│   └── config/                 # 共享配置
├── .ai/                        # AI 工作文档
├── biome.json
├── turbo.json
└── pnpm-workspace.yaml
```

## 重要约定

### 代码风格

- 使用 **Biome** 进行 lint 和 format
- 缩进：2 空格
- 引号：单引号
- 分号：不使用（ASI）
- 文件命名：`kebab-case.ts` 或 `PascalCase.tsx`（组件）
- 禁止 `forEach`：使用 `for...of` 或数组方法（`map`, `filter`, `reduce`）
- 强制花括号：所有 `if/else` 语句必须使用 `{}`，即使单行
- CSS 尺寸：宽高相同时使用 `size-x` 而不是 `w-x h-x`

### 导入顺序

```typescript
// 1. 外部依赖
import { createSignal } from 'solid-js'
import { useNavigate } from '@tanstack/solid-router'

// 2. 内部包 (@beeve/*)
import { Button } from '@beeve/ui'
import { api } from '@beeve/shared'

// 3. 相对路径导入
import { useAuth } from '../hooks/use-auth'
import { Header } from './Header'

// 4. 类型导入
import type { User } from '@beeve/shared/types'
```

### 组件结构

```typescript
// components/Button/Button.tsx
import { splitProps, type Component, type JSX } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  variants: {
    variant: {
      primary: 'bg-primary text-white hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'children', 'loading'],
    ['variant', 'size']
  )

  return (
    <button
      class={buttonVariants({ ...variants, class: local.class })}
      disabled={local.loading}
      {...rest}
    >
      {local.loading ? <Spinner /> : local.children}
    </button>
  )
}
```

### API 路由结构 (Hono)

```typescript
// apps/server/src/routes/users/index.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@beeve/db'
import { users } from '@beeve/db/schema'

const app = new Hono()

// GET /users
app.get('/', async (c) => {
  const result = await db.select().from(users)
  return c.json(result)
})

// POST /users
app.post(
  '/',
  zValidator('json', z.object({
    email: z.string().email(),
    name: z.string().min(1),
  })),
  async (c) => {
    const body = c.req.valid('json')
    // ...
  }
)

export default app
```

### 数据库 Schema (Drizzle)

```typescript
// packages/db/src/schema/users.ts
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

## 常用命令

```bash
# 开发
pnpm dev                    # 启动所有开发服务
pnpm dev --filter=@beeve/web    # 仅启动 web
pnpm dev --filter=@beeve/server # 仅启动 server

# 构建
pnpm build                  # 构建所有包
pnpm build --filter=@beeve/ui   # 仅构建组件库

# 代码质量
pnpm lint                   # 检查代码
pnpm lint:fix               # 修复代码问题
pnpm format                 # 格式化代码
pnpm typecheck              # 类型检查

# 数据库
pnpm db:generate            # 生成迁移
pnpm db:migrate             # 执行迁移
pnpm db:studio              # 打开 Drizzle Studio

# Storybook
pnpm storybook              # 启动组件文档

# 测试
pnpm test                   # 运行测试
pnpm test:watch             # 监听模式
```

## AI 工作指南

### 任务开始前

1. **理解上下文**：先阅读相关的现有代码
2. **确认范围**：明确修改涉及哪些包/文件
3. **检查依赖**：确认是否需要新增依赖

### 编写代码时

1. **遵循现有模式**：参考项目中已有的代码风格
2. **类型优先**：先定义类型，再实现逻辑
3. **小步提交**：一次只做一件事
4. **保持一致**：命名、结构要与现有代码保持一致

### 完成后

1. **运行检查**：`pnpm lint && pnpm typecheck`
2. **测试功能**：确保改动不破坏现有功能
3. **更新文档**：如有必要，更新相关文档

## 文件索引

详细的架构说明和约定请参考 `.ai/` 目录：

- [.ai/mcp-usage.md](.ai/mcp-usage.md) - **MCP 使用规范（必读）**
- [.ai/architecture.md](.ai/architecture.md) - 详细架构说明
- [.ai/conventions.md](.ai/conventions.md) - 编码约定
- [.ai/components.md](.ai/components.md) - 组件开发指南
- [.ai/api.md](.ai/api.md) - API 开发指南
- [.ai/database.md](.ai/database.md) - 数据库约定
- [.ai/lowcode.md](.ai/lowcode.md) - 低代码引擎说明
- [.ai/workflow.md](.ai/workflow.md) - AI 工作流程指南

## 其他 AI 工具配置

本项目支持多种 AI 编码助手协作：

| 工具 | 配置文件 |
|------|---------|
| GitHub Copilot | [.github/copilot-instructions.md](.github/copilot-instructions.md) |
| Windsurf | [.windsurfrules](.windsurfrules) |
| Cursor | [.cursorrules](.cursorrules) |
| Augment | [.augment-guidelines](.augment-guidelines) |
| Cline | [.clinerules](.clinerules) |
| Aide | [.aide/prompts/developer.md](.aide/prompts/developer.md) |
