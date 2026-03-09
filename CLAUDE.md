# Beeve — Claude Code Rules

> **Shared rules are in `AGENTS.md`.** This file contains Claude-specific additions only.

## Response Language

**Always respond in Chinese (中文).** All explanations, comments in generated code, commit messages, and PR descriptions should be in Chinese.

## Workflow Preferences

- Before making changes, read the relevant source files to understand existing patterns
- When creating new components, follow the exact patterns in existing components (e.g., Button, Badge, Switch)
- Run `pnpm lint` and `pnpm --filter @beeve/ui test:run` after making changes to verify correctness
- When fixing lint errors, prefer `pnpm lint:fix` first, then manually fix remaining issues
- Commit messages in Chinese, using conventional commit format: `feat: 新增 XX 组件`, `fix: 修复 XX 问题`
- 当任务涉及多端或用户体系时，优先先抽共享 package（contracts / auth-core / domain / api-client），再实现 app 内页面
- 不要把可复用业务逻辑直接放进 `apps/*`；`apps/*` 只负责平台入口、页面编排和运行时集成
- `@beeve/ui` 只面向 SolidJS Web/Desktop，移动端不要直接复用该组件包
- 新增 workspace 或改变目标结构时，同时更新 `AGENTS.md` 与 `.github/copilot-instructions.md`

## Important Reminders

- This is **SolidJS**, not React. Do NOT use `useState`, `useEffect`, `useRef`, or any React APIs
- Do NOT destructure component props — it breaks SolidJS reactivity
- Use `lucide-solid` for icons, not `lucide-react`
- Use `pnpm` exclusively, never `npm` or `yarn`
- All `tv()` variant definitions should be placed at the top of the component file, before the component function
- 规划用户体系时，默认把“用户、组织、角色、权限、会话、审计”视为同一平台层能力，而不是零散页面需求

## Backend (`apps/server`)

- **Framework**: Elysia (Bun), not Express/Fastify
- **Auth**: Better Auth (社交登录: Google/GitHub, Bearer Token 支持 iOS)
- **ORM**: Drizzle ORM (PostgreSQL)
- **Validation**: Elysia 内置 Zod (t.Object/t.String 等)
- **Routes**: 使用 Elysia 的 `.group()` 和插件模式
- **Middleware**: 使用 `.derive()` 扩展 context (user/session), `.onBeforeHandle()` 做守卫
- **Error handling**: 统一 ApiError 类, 在 error-handler.ts 中处理
- **ID generation**: 使用 `src/lib/id.ts` (Node.js crypto.randomUUID)

## 依赖管理规范

- **任何外部 lib 使用前，必须确认最新版本和 API** — 使用 `npm view <package> versions` 或官网确认
- **任何新增外部 lib 都需要等用户确认后再开始实施** — 先列出依赖清单及版本，等待用户批准
