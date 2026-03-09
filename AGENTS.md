# Beeve — AI Agent Rules

## Response Language

**Always respond in Chinese (中文).** All explanations, comments in generated code, commit messages, and PR descriptions should be in Chinese.

## Core Principles

### Verify Before You Code

**Do NOT rely on training data or memory for any API usage, syntax, or design patterns.** Before writing code that involves any library, framework, or tool:

1. **Use Context7 first** to retrieve the latest documentation and best practices
2. **If Context7 yields no results**, fetch the official documentation from the web
3. **If still uncertain**, stop immediately and ask the user — do NOT guess or fabricate

This applies to all external dependencies including but not limited to: SolidJS, Zag.js, tailwind-variants, Vitest, Storybook, and any npm package. **Fabricating APIs, inventing non-existent parameters, or hallucinating syntax is strictly prohibited.**

### Research Before You Design

**Every solution must be informed by mainstream implementations and community best practices.** When planning a feature, refactor, or architectural decision:

1. Research how well-known open-source projects and libraries solve the same problem
2. Reference established design patterns and conventions in the ecosystem
3. Justify your approach — if it deviates from the mainstream, explain why explicitly

**Do NOT invent solutions in isolation.** Closed-door engineering and self-reinforcing assumptions lead to fragile, non-idiomatic code. When in doubt, research first, then propose.

### Leverage Skills and MCP Tools

**Prioritize existing agent skills and MCP tools over writing custom solutions.** When facing a task:

1. Check if an installed skill or MCP tool already handles the task — use it directly
2. If no matching skill is found, use `find-skills` to search for an installable agent skill before building from scratch
3. Only implement custom logic when no suitable skill or MCP tool exists

### Verify UI Changes in Browser

**Every frontend visual change must be verified via browser MCP after modification.** Do not assume UI changes are correct based on code alone — take a screenshot or inspect the rendered page through the browser to confirm the result matches expectations.

### Do NOT Start or Stop Servers

**Server lifecycle is controlled by the user, not the agent.** You are strictly prohibited from starting, stopping, or restarting any dev server (`pnpm dev`, etc.). If a server restart is required for your changes to take effect, prompt the user with a clear message explaining why a restart is needed.

### Format and Type-Check After Every Change

**After any code modification, always run formatting and type-checking before considering the task complete:**

1. **Format:** `pnpm format` (runs Biome formatter across the entire monorepo)
2. **Type-check:** `pnpm typecheck` (runs TypeScript type-checking across all packages via Turbo)

Fix any errors surfaced by these commands before proceeding. Do not leave formatting inconsistencies or type errors for the user to resolve.

## Project Overview

Beeve 当前是一个以 `packages/ui` 为核心的 **SolidJS 组件库 monorepo**，正在规划扩展为 **以用户体系 / 登录能力为基础设施的多端产品仓库**。

### 当前状态（已存在）

- `packages/ui` — SolidJS 组件库（现有核心）
- `apps/storybook` — 组件文档与交互演示
- `apps/server` — Elysia 后端 API 服务（用户体系、认证、应用管理）
- `apps/auth` — TanStack Start + SolidJS 用户管理系统（纯 Vite 构建）

### 目标状态（规划中）

未来优先扩展为以下结构，所有新增工作区默认遵循这套边界：

```text
apps/
  storybook/         # 组件文档
  server/            # 用户体系、认证、会话、权限、业务 API / BFF
  web/               # Web 管理台 / 用户端
  desktop/           # 桌面应用（优先复用 web 的 UI 与业务流程）
  mobile/            # iOS / 移动端（独立原生 UI，复用业务与协议层）

packages/
  ui/                # SolidJS Web/Desktop 组件库
  tokens/            # 设计令牌、主题契约、跨端视觉基础
  contracts/         # API 契约、DTO、Zod/类型定义、权限模型
  api-client/        # 类型安全 API Client
  auth-core/         # 认证领域模型、session/token/storage 抽象
  domain-user/       # 用户/组织/角色/权限相关领域逻辑
  utils/             # 平台无关工具函数
  config-*           # tsconfig、biome、vitest、tailwind 等共享配置
```

### 后端服务 (`apps/server`)

**技术栈:**
- **框架**: Elysia (Bun-native, TypeScript)
- **认证**: Better Auth (支持 OAuth、Bearer Token、PKCE)
- **ORM**: Drizzle ORM + Drizzle Kit
- **数据库**: PostgreSQL
- **验证**: Zod (Elysia 内置)

**目录结构:**
```
apps/server/
├── src/
│   ├── index.ts              # Elysia 入口
│   ├── auth.ts               # Better Auth 配置
│   ├── config/
│   │   ├── env.ts            # 环境变量验证 (Zod)
│   │   └── db.ts             # Drizzle 数据库实例
│   ├── db/
│   │   ├── schema/           # 业务表定义
│   │   │   ├── apps.ts       # 应用表
│   │   │   ├── user-apps.ts  # 用户-应用关联表
│   │   │   └── orgs.ts       # 组织表
│   │   └── migrations/       # 数据库迁移文件
│   ├── middleware/
│   │   ├── auth-guard.ts     # 认证守卫中间件
│   │   └── error-handler.ts  # 错误处理中间件
│   ├── routes/
│   │   ├── me.ts             # /api/v1/me 当前用户
│   │   ├── apps.ts           # /api/v1/apps 应用管理
│   │   └── orgs.ts           # /api/v1/orgs 组织管理
│   └── lib/
│       ├── errors.ts         # 错误码定义
│       └── id.ts             # ID 生成工具
├── .env.example              # 环境变量模板
└── drizzle.config.ts         # Drizzle 配置
```

**API 路由:**
- `GET /health` — 健康检查
- `GET/POST /api/auth/*` — Better Auth 认证路由
- `GET /api/v1/me` — 当前用户信息
- `GET /api/v1/me/apps` — 我的应用列表
- `GET/POST/PATCH/DELETE /api/v1/apps` — 应用 CRUD
- `GET/POST/PATCH/DELETE /api/v1/orgs` — 组织 CRUD

**认证方式:**
- Web: Cookie (httpOnly, secure)
- iOS/Mobile: Bearer Token `Authorization: Bearer <token>`
- 社交登录: Google, GitHub OAuth (PKCE 支持原生应用)

**开发命令:**
```bash
pnpm --filter @beeve/server dev          # 开发模式 (Bun watch)
pnpm --filter @beeve/server db:generate  # 生成迁移
pnpm --filter @beeve/server db:migrate   # 执行迁移
pnpm --filter @beeve/server db:studio    # Drizzle Studio
```

### 用户管理系统 (`apps/auth`)

**技术栈:**
- **框架**: TanStack Start + SolidJS
- **构建工具**: Vite 7 (注意：不使用 vinxi，因与 TanStack Start 插件存在兼容性问题)
- **UI**: `@beeve/ui` + Tailwind CSS v4
- **认证**: Better Auth (复用 `apps/server`)
- **路由**: TanStack Router (文件系统路由)

**目录结构:**
```
apps/auth/
├── app/
│   ├── router.tsx           # 路由配置
│   ├── client.tsx           # 客户端入口
│   ├── routes/              # 文件系统路由
│   │   ├── __root.tsx       # 根路由
│   │   ├── index.tsx        # 首页
│   │   ├── login.tsx        # 登录页
│   │   └── (authenticated)/ # 认证路由组
│   │       ├── __root.tsx   # 认证布局
│   │       ├── dashboard.tsx
│   │       ├── profile.tsx
│   │       └── admin/       # 管理后台
│   ├── components/          # 组件
│   ├── hooks/               # Hooks
│   ├── lib/                 # 工具函数
│   └── styles/              # 样式
├── vite.config.ts           # Vite 配置
└── index.html               # HTML 入口
```

**开发命令:**
```bash
pnpm --filter @beeve/auth dev     # 开发模式
pnpm --filter @beeve/auth build   # 生产构建
```

> 说明：当前仓库里尚未创建上述大部分工作区。AI 代理在新增目录时，必须以上述结构为准，而不是临时发明新的包名或层级。

## Commands

### 快速开始

```bash
pnpm setup                # 初始化项目（安装依赖 + 数据库设置）
pnpm dev                  # 启动完整开发环境（前端 + 后端）
```

### 开发服务器

```bash
# 常用开发命令
pnpm dev                  # 启动前端 + 后端
pnpm dev:web              # 只启动前端 (http://localhost:5174)
pnpm dev:server           # 只启动后端 (http://localhost:3000)
pnpm dev:docs             # 启动 Storybook (http://localhost:6006)
pnpm dev:all              # 启动所有服务
```

### 数据库操作

```bash
pnpm db:setup             # 初始化数据库（首次使用）
pnpm db:generate          # 生成迁移文件
pnpm db:migrate           # 执行迁移
pnpm db:push              # 直接推送 schema 到数据库
pnpm db:studio            # 打开 Drizzle Studio
```

### 构建与部署

```bash
pnpm build                # 构建所有包
pnpm build:web            # 只构建前端
pnpm build:server         # 只构建后端
```

### 代码质量

```bash
pnpm lint                 # 运行所有 lint 检查
pnpm lint:fix             # 自动修复 lint 错误
pnpm format               # 格式化代码
pnpm typecheck            # TypeScript 类型检查
```

### 项目维护

```bash
pnpm install              # 安装依赖
pnpm clean                # 清理构建产物和 node_modules
```

### UI 库测试

```bash
# UI library (packages/ui)
pnpm --filter @beeve/ui test           # Run tests in watch mode
pnpm --filter @beeve/ui test:run       # Run tests once
pnpm --filter @beeve/ui test:coverage  # Run tests with coverage (80% threshold)

# Run a single test file
pnpm --filter @beeve/ui vitest run src/components/Button/Button.test.tsx
```

## Architecture

### 架构演进原则

1. **先用户体系，后业务模块**：所有业务功能默认构建在认证、会话、用户、角色、权限之上。
2. **先共享契约，后端内实现**：新增业务能力时，先落 `packages/contracts` / `packages/api-client` / `packages/domain-*`，再落 app 内实现。
3. **共享逻辑优先放 package，不放 app**：`apps/*` 只承载平台入口、页面编排、平台适配和运行时集成。
4. **Web/Desktop 共享 UI，Mobile 共享领域层**：`@beeve/ui` 面向 SolidJS Web/Desktop；移动端不要直接依赖 SolidJS UI，而是复用 tokens、contracts、api-client、auth-core、domain-user。
5. **认证与权限是横切能力**：登录、注册、找回密码、组织成员管理、角色权限、审计日志、设备会话等能力优先抽象为可复用模块。

### 当前工作区

- `packages/ui` — SolidJS component library (`@beeve/ui`), built with tsup
- `apps/storybook` — Storybook for component documentation

**UI library layering:**

```
src/primitives/   → Headless primitives (Zag.js state machines): types + hooks
src/components/   → Styled components (tailwind-variants): UI + composition
src/providers/    → Context providers (ThemeProvider)
src/themes/       → Theme presets (base colors + theme colors, oklch)
src/styles/       → Global CSS (Tailwind base + theme variables)
src/index.ts      → Public API re-exports
```

**Theming:** CSS custom properties (oklch color space) generated by `src/themes/`, managed at runtime by `ThemeProvider` context. Theme persists to localStorage under key `beeve-theme`. Supports light/dark/system modes. Base colors (neutral, zinc, stone, gray, slate) + theme colors (blue, green, pink, etc.).

## Key Conventions

### Component File Structure

Every component lives in its own directory under `packages/ui/src/components/`:

```
ComponentName/
├── ComponentName.tsx          # Implementation
├── ComponentName.test.tsx     # Vitest + @solidjs/testing-library
├── ComponentName.stories.tsx  # Storybook story
├── index.ts                   # Re-exports (named exports + types)
└── README.md                  # (optional) Component docs
```

After creating a component, add its export to `packages/ui/src/index.ts`.

### Styling

- Use `tv()` from `tailwind-variants` for all component variant definitions
- Tailwind CSS v4 via the `@tailwindcss/vite` plugin
- No utility class strings scattered in logic — keep them in `tv()` definitions
- Use `slots` in `tv()` for multi-element components (e.g., Switch, Badge)
- Theme colors via CSS custom properties: `bg-primary`, `text-foreground`, `border-border`, etc.
- Border radius: `rounded-[var(--radius)]` for theme-aware corners

### SolidJS Patterns

- **NEVER** destructure props — it breaks reactivity. Use `splitProps()` or access `props.xxx` directly
- Use `splitProps()` to separate component-specific props from pass-through HTML attributes
- Props use `type` keyword (not `interface`) — no `any` (enforced by Biome)
- Use `import type` for type-only imports (enforced by Biome: `useImportType`)
- Component type: `Component<Props>` from `solid-js`
- JSX children type: `JSX.Element` from `solid-js`
- Reactivity: use `createSignal`, `createMemo`, `createEffect`
- Conditional rendering: `Show`, `For`, `Switch/Match`
- Overlay elements: `Portal` from `solid-js/web`
- Icons: `lucide-solid` (not lucide-react)

### Zag.js Integration

Complex interactive components (Dialog, Select, Popover, Menu, Slider, Tooltip, etc.) use **Zag.js state machines**:

- Primitives in `src/primitives/{name}/`: `types.ts` (props interface) + `use-{name}.ts` (hook wrapping `useMachine` + `normalizeProps`)
- Components in `src/components/{Name}/`: import primitive hook, add styling with `tv()`, compose JSX
- Pattern: `useMachine(machine, () => ({...options}))` → `connect(service, normalizeProps)` → spread API props onto elements

### Formatting (Biome)

- 2-space indent, single quotes, no semicolons (asNeeded), trailing commas, no bracket spacing
- `useImportType: error` — always use `import type` for type-only imports
- `noExplicitAny: error` — no `any` type allowed
- `noUnusedImports: error`, `noUnusedVariables: error`
- Files matching `*.gen.ts` are excluded from linting

### TypeScript Code Style

- **Use `type` instead of `interface`** for all type definitions. Use `type Props = { ... }` not `interface Props { ... }`
- **No `any`** — use precise types. If the type is truly unknown, use `unknown` and narrow it with type guards
- **Minimize `as` type assertions** — prefer type inference, generics, or type guards. Only use `as` when there is no other option and add a comment explaining why
- **No ignore annotations** — `@ts-ignore`, `@ts-expect-error`, `// biome-ignore`, `eslint-disable`, and any other suppression comments are strictly prohibited. Fix the underlying issue instead
- **Use types from type libraries** — if a dependency provides its own type definitions (e.g., `@zag-js/*`, `solid-js`, `@tanstack/solid-router`), import and use those types directly instead of redefining them
- **No duplicate type definitions** — define each type once in a single location and import it wherever needed. If a type is shared across modules, place it in a dedicated `types.ts` file

### Turbo Pipeline

- `transit` task is a pre-build step that ensures generated files are up-to-date
- `lint` and `typecheck` tasks depend on `transit`
- `build` tasks depend on `^build` (build dependencies first)

### 未来新增工作区时的工程约束

- 根 `package.json` 只做 `turbo run <task>` 转发，不承载具体业务命令
- 新任务先定义到对应 workspace 的 `package.json`，再在根 `turbo.json` 注册
- 优先使用 package 级 `turbo.json` 覆盖，而不是在根 `turbo.json` 堆大量 `package#task`
- `.env` 文件按 workspace 放置，不在仓库根目录放共享 `.env`
- 新增 workspace 时同步更新：
  - `pnpm-workspace.yaml`
  - `turbo.json`
  - 共享 `tsconfig`
  - 对应 AI 指导文档（本文件、`CLAUDE.md`、`.github/copilot-instructions.md`）

### Testing

- **Stack:** Vitest + @solidjs/testing-library + jsdom
- **Coverage threshold:** 80% (lines, functions, branches, statements)
- **Setup file:** `packages/ui/src/test/setup.ts` (mocks ResizeObserver, matchMedia, scrollIntoView)
- **Zag.js limitation:** Zag.js state machines don't work correctly in jsdom — mark those tests with `it.skip` and note "需要 e2e 测试"
- **Test style:** Chinese test descriptions, grouped by `describe` blocks (渲染, 变体, 交互, etc.)
- **Render pattern:** Always wrap in arrow function: `render(() => <Component />)`

### Code Comments

- Use Chinese for code comments and JSDoc descriptions
- Component file header: `/** @beeve/ui - ComponentName Component */` followed by Chinese description
- Section separators: `// ==================== 样式定义 ====================`

### Import Conventions

- Use `import type` for type-only imports: `import type {Component, JSX} from 'solid-js'`
- Mixed imports: `import {splitProps, Show, type Component, type JSX} from 'solid-js'`
- Internal imports use relative paths within `packages/ui/src/`
- Cross-package imports use package name: `import {Button} from '@beeve/ui'`

### Package Manager

- Always use `pnpm` (not npm or yarn)
- Filter commands: `pnpm --filter @beeve/ui <command>`
- Never manually edit `pnpm-lock.yaml`

## Auth-First 产品扩展路线

### Phase 1 — 平台基础 ✅

- 保持 `packages/ui` 作为 Web/Desktop 设计系统核心 ✅
- 新增 `apps/server` — 基础 API 服务 ✅
- 待完成：`packages/contracts`、`packages/api-client`、`packages/auth-core`
- 待完成：`apps/web` 前端接入
- 目标：打通登录、登出、刷新会话、当前用户、权限校验的最小闭环

### Phase 2 — 用户管理

- 用户列表 / 搜索 / 详情
- 角色、权限、状态管理
- 组织 / 租户（若产品是多租户，尽量在这一阶段定型）
- 邀请、重置密码、设备会话、审计日志

### Phase 3 — 业务模块

- 所有业务模块都以 “当前用户 + 当前组织 + 当前权限” 为前置上下文
- 业务模块的类型、接口、权限点统一沉淀到 `packages/contracts`
- 通用业务流程沉淀到 `packages/domain-*`

### Phase 4 — 多端扩展

- `apps/desktop`：优先采用与 Web 共用的 UI/路由/业务逻辑外壳
- `apps/mobile`：使用独立原生 UI，但复用 auth、contracts、api-client、domain
- 不允许为了赶进度把共享逻辑直接复制到平台 app 内

## AI 执行附加规则

- 设计新功能时，先判断它属于：
  - `packages/contracts`（协议/类型）
  - `packages/domain-*`（领域逻辑）
  - `packages/ui` / `packages/tokens`（展示层）
  - `apps/*`（页面/平台集成）
- 若一个功能未来会被两个以上 app 使用，就不应直接放入单个 app
- 新增用户体系相关功能时，默认同时考虑：
  - 认证方式
  - 会话存储
  - 权限边界
  - 审计/可追踪性
  - 多端兼容性
- 若新增目录结构与本文件的目标结构冲突，优先修正文档与实现方案，而不是继续扩散新的结构
