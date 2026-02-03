# Beeve 项目进度

> AI 助手和开发者共同维护的进度追踪文件

## 当前阶段

**Phase 2: 基础设施完善** 🔄 进行中（前后端并行）

## 待办事项

### Phase 0: 项目初始化 ✅
- [x] 项目规划和技术选型
- [x] AI 协作文档体系 (`.ai/`, `CLAUDE.md`)
- [x] 多 AI 工具配置 (Copilot, Cursor, Augment, etc.)
- [x] Monorepo 基础结构 (pnpm workspace + Turborepo)
- [x] 基础配置 (TypeScript, Biome, TailwindCSS v4)
- [ ] CI/CD 配置 (GitHub Actions)

### Phase 1: 核心包开发 ✅
- [x] `@beeve/shared` - 共享类型和工具（基础版）
- [x] `@beeve/ui` - 组件库基础
- [x] `@beeve/db` - 数据库层 (Drizzle + PostgreSQL)
- [x] `apps/server` - API 服务器骨架 (Hono)
- [x] `apps/ui-doc` - 组件文档站点（Astro + Starlight）
- [x] `apps/storybook` - 组件演示（Storybook）

### Phase 2: 基础设施完善 🔄 进行中

#### 2.1 后端 - 认证系统
- [x] 数据库 Schema (users, sessions, accounts, verifications)
- [x] `@beeve/auth-client` - 认证客户端 SDK
- [x] Better-Auth 集成 (框架配置)
- [ ] 配置 PostgreSQL 数据库
- [ ] 运行数据库迁移
- [ ] OAuth 集成 (GitHub, Google) - 需配置环境变量
- [ ] 认证 API 测试

#### 2.2 前端 - UI 组件库

**已完成组件（20个）：**
- [x] Button - 按钮
- [x] Input - 输入框
- [x] Checkbox - 复选框
- [x] Radio - 单选框
- [x] Switch - 开关
- [x] Select - 下拉选择
- [x] Slider - 滑块
- [x] Label - 标签
- [x] Tooltip - 提示
- [x] Dialog - 对话框
- [x] Badge - 徽章
- [x] Card - 卡片容器
- [x] Menu - 菜单（含 DropdownMenu 功能）
- [x] NavMenu - 导航菜单
- [x] Progress - 进度条
- [x] Sidebar - 侧边栏
- [x] Skeleton - 骨架屏
- [x] Presence - 存在动画
- [x] Popover - 气泡卡片
- [x] Toast - 消息提示
- [x] DatePicker - 日期选择器


**待开发组件：**
- [ ] Tabs - 选项卡（设计器面板切换）
- [ ] Table - 数据表格
- [ ] Avatar - 头像
- [ ] Tree - 树形控件（组件树/大纲）
- [ ] Collapse/Accordion - 折叠面板（属性面板）
- [ ] ColorPicker - 颜色选择器
- [ ] Breadcrumb - 面包屑导航
- [ ] NumberInput - 数字输入

### Phase 3: 低代码引擎
- [ ] `@beeve/lowcode-core` - Schema 定义
- [ ] 物料系统
- [ ] 渲染器
- [ ] 设计器

### Phase 4: 应用整合
- [ ] `apps/web` - 前端应用（登录、工作台）
- [ ] 前后端联调

---

## 会话日志

### 2026-02-03
- ✅ **重构 Table 组件样式为简洁实用风格**（参考 Ant Design, Shadcn/ui, Material-UI）
- ✅ **选中和展开列优化**：
  - 设置选中列和展开列为极度紧凑的 40px 宽度（w-[40px] min-w-[40px] max-w-[40px]）
  - 使用严格的宽度约束防止列宽变化
  - 优化图标和内容居中对齐
- ✅ **展开内容样式优化**：
  - 使用简洁的左侧边框（border-l-2 border-primary/40）
  - 浅色背景（bg-muted/10）保持内容清晰
  - 根据尺寸变体自适应内边距（sm: p-3, md: p-4, lg: p-5）
- ✅ **整体风格简化**：
  - 移除过度装饰，回归简洁实用的表格设计
  - 圆角从 xl 降低到 lg，更符合主流设计
  - 简化阴影和边框效果，突出功能性
  - 优化空状态图标，使用更简洁的表格 SVG
- ✅ **滚动体验改进**：
  - 添加专用滚动容器（scrollWrapper）
  - 启用平滑滚动（scroll-smooth）
  - 支持横向滚动时的列固定功能
- ✅ **选中展开列深度优化**（根据用户反馈"太丑了"进行重点改进）：
  - **视觉层次增强**：选中列和展开列使用渐变背景（from-muted/40 to-muted/30 vs from-muted/50 to-muted/40）
  - **内阴影效果**：添加 inset 阴影增强深度感（shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]）
  - **边框加强**：使用 border-r-2（2px 粗边框）和半透明颜色（border-border/60）增强分隔
  - **展开按钮重设计**：
    * 增大尺寸至 size-8（32px）更容易点击
    * 添加明显的背景（bg-muted/50）、边框（border-2）和阴影（shadow-sm）
    * 悬停效果：bg-muted/80 + scale-105 + shadow-md
    * 展开状态：使用主题色高亮（bg-primary + text-primary-foreground + shadow-lg + shadow-primary/20）
  - **图标优化**：添加 drop-shadow-sm 和更流畅的旋转动画（duration-300 ease-out）
- ✅ 通过完整的 typecheck 和 lint 验证
- ✅ Storybook 视觉验证通过（所有 stories 渲染正常）

### 2026-01-27
- ✅ 完成 DatePicker 组件基础开发（Input + Popover + Calendar）
- ✅ 集成 @zag-js/date-picker 并解决类型兼容问题
- ✅ 完成 DatePicker 文档和 Stories

### 2026-01-23
- ✅ 完成 Popover 组件开发（含文档）
- ✅ 完成 Toast 组件开发
- ✅ 补充 Toast 组件文档
- 📝 更新进度：组件库已完成 20 个组件

### 2026-01-05
- ✅ 完成 Slider 组件开发
- ✅ 修复 tooltip 居中定位问题
- ✅ 修复 marker 初始位置闪动问题（thumbSize 配置）
- ✅ 优化 disabled 样式（与其他组件统一）
- ✅ 清理无意义的 stories
- ✅ 规划组件库后续开发计划

### 2025-12-31
- ✅ 创建 `@beeve/db` 包（Drizzle ORM + PostgreSQL）
- ✅ 定义认证相关 Schema（users, sessions, accounts, verifications）
- ✅ 创建 `apps/server`（Hono API 服务器）
- ✅ 集成 Better-Auth 认证框架
- ✅ 创建 `@beeve/auth-client` 认证客户端 SDK
- ✅ 配置 GitHub/Google OAuth 支持（待填写环境变量）
- ✅ 验证 typecheck 全部通过

### 2025-01-07
- ✅ 初始化 pnpm workspace + Turborepo 2.7.2
- ✅ 配置 TypeScript 5.x 严格模式 + SolidJS JSX
- ✅ 配置 Biome 1.9.4 (single quotes, no semicolons)
- ✅ 配置 TailwindCSS v4 + @tailwindcss/vite
- ✅ 创建 `@beeve/shared` 包（types, utils, validators）
- ✅ 创建 `@beeve/ui` 包（Button 组件 + tailwind-variants）
- ✅ 验证构建流程（typecheck + lint 全部通过）

### 2025-12-25
- ✅ 创建 `apps/ui-doc` 文档站点（Astro v5 + Starlight）
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
| 2025-12-31 | 使用 Better-Auth 而非自建 | 开箱即用、支持 Drizzle、可扩展 Generic OAuth | - |

---

## 阻塞问题

*当前无阻塞问题*

---

## 下一步行动

**后端优先：**
1. 配置 PostgreSQL 数据库并运行迁移
2. 配置 GitHub/Google OAuth 环境变量
3. 完成认证 API 端到端测试

**前端并行：**
1. 开发 Tabs 组件
2. 开发 Table 组件
3. 开发 Avatar 组件
4. 开发 Tree 组件
