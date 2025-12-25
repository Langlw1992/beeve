---
type: always
---

# Beeve 项目概述

## 项目结构

```
beeve/
├── apps/
│   ├── web/          # SolidJS 前端 (TanStack Router)
│   ├── server/       # Hono API 服务器
│   └── docs/         # Astro + Starlight 文档
├── packages/
│   ├── ui/           # @beeve/ui 组件库
│   ├── lowcode-core/ # 低代码引擎
│   ├── auth-client/  # 认证客户端 SDK
│   ├── db/           # Drizzle ORM + PostgreSQL
│   └── shared/       # 共享类型和工具
```

## 技术栈

| 层 | 技术 |
|-----|------|
| 前端框架 | SolidJS (非 React) |
| 路由/状态 | TanStack Router, Query, Form, Table |
| 样式 | TailwindCSS v4 + tailwind-variants |
| 后端 | Hono |
| 数据库 | PostgreSQL + Drizzle ORM |
| 验证 | Zod |
| 构建 | Vite, Turborepo |
| 代码规范 | Biome (非 ESLint/Prettier) |
| 包管理 | pnpm workspace |

## 常用命令

```bash
pnpm dev              # 启动所有开发服务器
pnpm lint             # Biome lint
pnpm format           # 格式化代码
pnpm typecheck        # 类型检查
pnpm db:generate      # 生成迁移
pnpm db:migrate       # 运行迁移
```

## 详细文档

`.ai/` 目录包含完整文档：
- `mcp-usage.md` - MCP 使用要求（必读）
- `architecture.md` - 系统架构
- `conventions.md` - 编码规范
- `components.md` - 组件开发
- `api.md` - API 开发
- `database.md` - 数据库模式
