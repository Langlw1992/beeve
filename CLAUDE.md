# Beeve - 全栈创业产品

## 项目定位

基于 TypeScript 的全栈创业产品，面向多端（Web、客户端、桌面端），强调**用户体验**与**开发体验（DX）**，通过 **Vibe Coding** 方式持续迭代。

当前处于早期迭代阶段，基础架构建设中。

## 技术架构

**前端**
- SolidJS - 高性能响应式框架
- Tailwind CSS v4 - 原子化样式
- Zag.js - 无头组件原语（用于 @beeve/ui）

**后端**
- Elysia - Bun 高性能 Web 框架
- Better Auth - 认证库（支持 OAuth/SSO）
- Drizzle ORM - 类型安全的数据库 ORM
- SQLite - 数据库

**工程化**
- pnpm workspace - Monorepo 管理
- Turborepo - 任务编排与缓存
- Biome - 代码规范与格式化
- Bun - auth-server 运行环境
- TypeScript - 严格类型检查

## 项目结构

```
beeve/
├── packages/ui          # 基础 UI 组件库（无头 + 样式）
├── apps/auth-web        # 用户管理基础架构（SSO/认证中心前端）
├── apps/auth-server     # 认证服务后端（Elysia + Better Auth）
├── apps/beeve-app       # iOS/macOS 原生应用（SwiftUI）
└── [更多应用待添加]      # 后续产品应用
```

## 开发命令

```bash
# 根目录
pnpm install             # 安装依赖
turbo dev                # 启动所有 dev 服务

# 针对特定项目（使用 --filter）
turbo dev --filter=@beeve/ui         # 仅开发 UI 包
turbo dev --filter=auth-web          # 仅开发 auth-web
turbo dev --filter=auth-server       # 仅开发 auth-server
turbo build --filter=@beeve/ui       # 构建 UI 包
turbo build --filter=auth-web        # 构建 auth-web
turbo build --filter=auth-server     # 构建 auth-server

# 代码质量（全仓库）
turbo lint               # 检查代码
turbo lint:fix           # 自动修复
turbo typecheck          # 类型检查

# 数据库相关（auth-server）
turbo db:generate        # 生成 Drizzle 迁移
turbo db:migrate         # 执行数据库迁移
turbo db:push            # 推送 schema 变更
turbo db:studio          # 启动 Drizzle Studio
```

## 编码原则

**类型安全**
- TypeScript `strict` 模式强制开启
- 所有公共 API 必须标注类型
- 避免 `any`，使用 `unknown` + 类型守卫

**Vibe Coding**
- 优先实现功能，快速验证想法
- 保持代码简洁，避免过早抽象
- 使用现代工具减少样板代码

**组件设计（UI 包）**
- 基于 Zag.js 实现无头逻辑
- 样式与逻辑分离，支持主题定制
- 组件需通过 Storybook 预览

## AI 协作规则

**强制要求**
- 涉及库/API 文档、代码生成、配置步骤时，**必须主动使用 Context7**，无需用户明确要求
- 严格遵守类型安全规范
- 修改代码前先读取相关文件

**渐进式披露**
- 根目录 CLAUDE.md 只定义方向与原则
- 具体实现细节见子项目 CLAUDE.md：
  - `packages/ui/CLAUDE.md` - 组件开发规范
  - `apps/auth-web/CLAUDE.md` - 前端应用开发规范
  - `apps/auth-server/` - 后端服务开发规范

## 部署

- CI/CD：GitHub Actions
- 构建产物：各应用 `dist/` 或 `.output/`

## 待办

- [ ] 完善 packages/ui 组件库
- [ ] auth-web 用户管理功能
- [ ] auth-server API 完善
- [ ] beeve-app 原生应用开发
- [ ] 添加更多产品应用
