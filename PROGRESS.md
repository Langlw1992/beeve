# Beeve 项目进度

> AI 助手和开发者共同维护的进度追踪文件

## 当前阶段

**Phase 1: 核心包开发** 🔄 进行中

## 待办事项

### Phase 0: 项目初始化
- [x] 项目规划和技术选型
- [x] AI 协作文档体系 (`.ai/`, `CLAUDE.md`)
- [x] 多 AI 工具配置 (Copilot, Cursor, Augment, etc.)
- [x] Monorepo 基础结构 (pnpm workspace + Turborepo)
- [x] 基础配置 (TypeScript, Biome, TailwindCSS v4)
- [ ] CI/CD 配置 (GitHub Actions)

### Phase 1: 核心包开发
- [x] `@beeve/shared` - 共享类型和工具（基础版）
- [x] `@beeve/ui` - 组件库基础（Button 组件）
- [ ] `@beeve/db` - 数据库层 (Drizzle + PostgreSQL)
- [ ] `apps/server` - API 服务器骨架

### Phase 2: 认证系统
- [ ] 数据库 Schema (users, sessions, oauth_accounts)
- [ ] `@beeve/auth-client` - 认证客户端 SDK
- [ ] OAuth 集成 (GitHub, Google)
- [ ] JWT 会话管理

### Phase 3: 低代码引擎
- [ ] `@beeve/lowcode-core` - Schema 定义
- [ ] 物料系统
- [ ] 渲染器
- [ ] 设计器

### Phase 4: 应用整合
- [ ] `apps/web` - 前端应用
- [x] `apps/docs` - 文档站点（Astro + Starlight）

---

## 会话日志

### 2025-01-07
- ✅ 初始化 pnpm workspace + Turborepo 2.7.2
- ✅ 配置 TypeScript 5.x 严格模式 + SolidJS JSX
- ✅ 配置 Biome 1.9.4 (single quotes, no semicolons)
- ✅ 配置 TailwindCSS v4 + @tailwindcss/vite
- ✅ 创建 `@beeve/shared` 包（types, utils, validators）
- ✅ 创建 `@beeve/ui` 包（Button 组件 + tailwind-variants）
- ✅ 验证构建流程（typecheck + lint 全部通过）

### 2025-12-25
- ✅ 创建 `apps/docs` 文档站点（Astro v5 + Starlight）
- ✅ 配置 SolidJS 集成（@astrojs/solid-js）
- ✅ 配置 TailwindCSS v4（@tailwindcss/vite）
- ✅ 编写 Button 组件文档（API、变体、示例）
- ✅ 创建 PropsTable 和 ComponentPreview 辅助组件
- ✅ 文档站点本地运行验证通过

### 2024-12-25
- ✅ 完成项目规划和技术选型
- ✅ 创建 AI 协作文档体系
- ✅ 配置多 AI 工具规则
- ✅ 添加 MCP 使用规范和反幻觉规则
- ✅ 迁移 Augment 到新版 rules 格式
- ✅ 建立工作流体系

---

## 重要决策

| 日期 | 决策 | 原因 | ADR |
|------|------|------|-----|
| 2024-12-25 | 使用 SolidJS 而非 React | 更好的性能、更简单的心智模型 | [ADR-001](/.ai/decisions/001-solidjs.md) |
| 2024-12-25 | 使用 Biome 而非 ESLint | 更快、配置更简单、格式化+lint 一体 | [ADR-002](/.ai/decisions/002-biome.md) |
| 2024-12-25 | 使用 Astro+Starlight 做文档 | 统一组件文档和技术文档 | [ADR-003](/.ai/decisions/003-docs-system.md) |

---

## 阻塞问题

*当前无阻塞问题*

---

## 下一步行动

1. 创建 `@beeve/db` 包（Drizzle + PostgreSQL）
2. 创建 `apps/server` 骨架（Hono）
3. 扩展 `@beeve/ui` 组件（Input, Card, Dialog 等）
4. 配置 CI/CD (GitHub Actions)
