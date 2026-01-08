# MCP 使用规范

> AI 必须严格遵循本规范使用 MCP 工具，确保代码质量和准确性。

## 核心原则

```
🚨 零幻觉容忍：不确定就查，查不到就问，绝不猜测
📖 文档驱动：所有 API 使用必须有文档依据
🔍 代码优先：修改前必须理解现有代码
✅ 验证闭环：代码必须能被类型检查和 lint 验证
🔧 zag.js 查询：直接使用 library ID `/chakra-ui/zag`，不要搜索
🧩 组件复用：组合组件时复用已有组件（如 Menu 示例中使用 Button 组件）
```

---

## MCP 工具清单

### 必需 MCP

| MCP | 用途 | 使用场景 |
|-----|------|---------|
| **context7** | 库文档查询 | API 用法、配置选项、最佳实践 |
| **serena** | 代码语义分析 | 符号查找、引用分析、代码导航 |

### 推荐 MCP

| MCP | 用途 | 使用场景 |
|-----|------|---------|
| **typescript-lsp** | TypeScript 语言服务 | 符号重命名、代码重构、类型推断 |
| **playwright** | 浏览器自动化测试 | E2E 测试、可视化回归测试 |
| **frontend-design** | 前端设计和 UI 开发 | 组件设计、样式优化、设计系统 |
| **sequential-thinking** | 分步推理 | 复杂任务分解、架构设计 |
| **memory** | 持久记忆 | 跨会话上下文、项目知识 |
| **github** | GitHub 操作 | PR、Issue、代码审查 |
| **document-skills** | 文档操作 | Marketplace 技能管理 |
| **chromeDevtools** | 前端视觉测试 | 页面渲染检查、UI 调试、样式验证 |

---

## typescript-lsp 使用规范

### 必须使用的场景

```
⚠️ 以下场景建议使用 typescript-lsp：

1. 大规模重命名符号（函数、变量、类型）
2. 跨文件的代码重构
3. 获取准确的类型信息和推断
4. 代码补全和智能提示
5. 查找定义和类型定义
```

### 常用操作

#### 重命名符号
```typescript
// 安全地重命名符号，自动更新所有引用
mcp_typescript-lsp_rename({
  file: "path/to/file.ts",
  line: 10,
  character: 5,
  newName: "newSymbolName"
})
```

#### 获取符号定义
```typescript
// 跳转到符号定义位置
mcp_typescript-lsp_definition({
  file: "path/to/file.ts",
  line: 10,
  character: 5
})
```

#### 获取类型定义
```typescript
// 获取类型的定义位置
mcp_typescript-lsp_typeDefinition({
  file: "path/to/file.ts",
  line: 10,
  character: 5
})
```

#### 查找所有引用
```typescript
// 查找符号的所有引用位置
mcp_typescript-lsp_references({
  file: "path/to/file.ts",
  line: 10,
  character: 5
})
```

### 使用建议

- **与 serena 配合**：serena 提供语义分析，typescript-lsp 提供精确的类型信息
- **重构前必用**：大规模重命名前使用 typescript-lsp 确保安全性
- **类型问题排查**：遇到类型错误时使用获取准确的类型推断信息

---

## playwright 使用规范

### 必须使用的场景

```
⚠️ 以下场景必须使用 playwright：

1. E2E 测试编写和执行
2. 用户交互流程测试
3. 跨浏览器兼容性测试
4. 可视化回归测试
5. 复杂表单提交流程测试
```

### 使用流程

```
1. 启动开发服务器
2. 使用 playwright 连接到页面
3. 执行测试操作和断言
4. 截图记录测试结果
5. 生成测试报告
```

### 常用操作

#### 页面导航和交互
```typescript
// 导航到页面并执行操作
await page.goto('http://localhost:3000')
await page.click('button[type="submit"]')
await page.fill('input[name="email"]', 'test@example.com')
await page.selectOption('select', 'option-value')
```

#### 断言和验证
```typescript
// 验证元素状态
await expect(page.locator('.success-message')).toBeVisible()
await expect(page.locator('h1')).toHaveText('Welcome')
```

#### 截图和录制
```typescript
// 截图当前页面
await page.screenshot({ path: 'screenshot.png' })

// 录制视频
const context = await browser.newContext({ recordVideo: { dir: 'videos/' } })
```

### 与 chromeDevtools 的区别

| 场景 | 使用工具 |
|------|---------|
| 手动调试、样式调整 | chromeDevtools |
| 自动化测试、回归测试 | playwright |
| 快速视觉检查 | chromeDevtools |
| 完整用户流程测试 | playwright |

---

## frontend-design 使用规范

### 必须使用的场景

```
⚠️ 以下场景建议使用 frontend-design：

1. UI 组件设计和开发
2. 设计系统构建和维护
3. 样式优化和主题定制
4. 响应式布局设计
5. 组件库文档和 Storybook 开发
6. 设计 token 管理
```

### 使用流程

```
1. 确定组件设计需求和规格
2. 使用 frontend-design 生成设计方案
3. 应用项目的设计系统（TailwindCSS + tailwind-variants）
4. 结合 chromeDevtools 进行视觉验证
5. 使用 Storybook 记录组件用法
```

### 常用操作

#### 组件设计咨询
```typescript
// 获取组件设计建议
// - 布局方案
// - 样式变体设计
// - 可访问性建议
// - 响应式设计策略
```

#### 设计系统集成
```typescript
// 确保设计符合项目规范：
// - TailwindCSS v4 样式
// - tailwind-variants 变体定义
// - 设计 token 使用
// - 组件 API 设计
```

#### 样式优化建议
```typescript
// 获取样式改进建议：
// - CSS 性能优化
// - 主题切换支持
// - 动画和过渡效果
// - 深色模式适配
```

### 与项目规范的集成

**必须遵循的项目约定：**

1. **样式框架**：TailwindCSS v4
   - 使用 `size-x` 而不是 `w-x h-x`
   - 遵循项目的 Tailwind 配置

2. **组件变体**：tailwind-variants
   ```typescript
   const componentVariants = tv({
     base: '...',
     variants: { ... },
     defaultVariants: { ... }
   })
   ```

3. **组件结构**：
   - 使用 `splitProps` 分离 props
   - 导出 `VariantProps` 类型
   - 支持 `class` prop 合并

4. **文档化**：
   - 为组件创建 Storybook stories
   - 提供使用示例和 API 文档

### 工作流程示例

```
用户需求：设计一个 Card 组件

1. [frontend-design] 生成设计方案
   - 确定变体：default, outlined, elevated
   - 定义尺寸：sm, md, lg
   - 设计 slots：header, body, footer

2. [实现] 按项目规范编码
   - 使用 tailwind-variants 定义样式
   - 遵循组件结构模板
   - 添加 TypeScript 类型

3. [chromeDevtools] 视觉验证
   - 检查各变体渲染效果
   - 验证响应式表现
   - 测试交互状态

4. [Storybook] 文档化
   - 创建组件 stories
   - 展示所有变体和用例
```

### 与其他工具配合

| 场景 | 工具组合 | 说明 |
|------|---------|------|
| 新组件开发 | frontend-design → 手动实现 → chromeDevtools | 设计 → 编码 → 验证 |
| 样式调试 | chromeDevtools → frontend-design | 发现问题 → 获取优化建议 |
| 设计系统 | frontend-design → context7 | 设计咨询 → 查询 Tailwind 文档 |
| 组件文档 | frontend-design → Storybook | 设计说明 → 交互式文档 |

---

## sequential-thinking 使用规范

### 必须使用的场景

```
⚠️ 以下场景强烈建议使用 sequential-thinking：

1. 复杂任务分解和规划
2. 系统架构设计
3. 多步骤问题求解
4. 重大技术决策分析
5. 代码重构方案设计
6. 性能优化策略制定
```

### 使用流程

```
1. 识别复杂任务
2. 激活 sequential-thinking 模式
3. 逐步分析和推理
4. 形成结构化方案
5. 记录决策依据
```

### 常用操作

#### 任务分解
```typescript
// 将复杂需求分解为可执行步骤
// - 识别依赖关系
// - 确定优先级
// - 评估风险
// - 制定时间线
```

#### 架构设计
```typescript
// 系统化思考架构方案
// - 分析需求和约束
// - 评估技术选型
// - 设计模块划分
// - 考虑扩展性和维护性
```

#### 问题诊断
```typescript
// 系统化排查问题
// - 收集症状和日志
// - 提出假设
// - 设计验证方案
// - 确定根本原因
```

### 与项目工作流集成

**推荐使用时机：**

1. **新功能开发前**
   - 使用 sequential-thinking 分析需求
   - 设计实现方案
   - 识别潜在问题
   - 记录在 `.ai/decisions/` 目录（ADR）

2. **重构决策**
   - 分析现有代码问题
   - 评估重构方案
   - 考虑向后兼容性
   - 制定迁移计划

3. **性能优化**
   - 识别性能瓶颈
   - 评估优化策略
   - 权衡性能和复杂度
   - 制定优化步骤

### 输出建议

使用 sequential-thinking 后，建议：
- 在 `.ai/decisions/` 创建 ADR（架构决策记录）
- 更新 `PROGRESS.md` 记录关键决策
- 在代码中添加必要的注释说明设计意图

---

## memory 使用规范

### 必须使用的场景

```
⚠️ 以下场景建议使用 memory：

1. 跨会话的项目上下文保持
2. 记录重要的技术决策
3. 保存常用的命令和配置
4. 记录已知问题和解决方案
5. 维护项目知识库
```

### 使用流程

```
1. 识别需要记忆的信息
2. 使用 memory 工具保存
3. 在后续会话中检索
4. 定期更新和清理
```

### 常用操作

#### 保存项目知识
```typescript
// 记录项目特定的约定和模式
// - 代码风格指南
// - 架构模式
// - 常见问题解决方案
// - API 使用示例
```

#### 记录技术决策
```typescript
// 保存重要决策的上下文
// - 为什么选择特定技术
// - 技术选型的权衡
// - 已知的限制和注意事项
```

#### 维护命令库
```typescript
// 保存常用命令和配置
// - 数据库操作命令
// - 部署脚本
// - 调试技巧
// - 性能分析工具
```

### 与项目文件的配合

**Memory vs 文件系统：**

| 场景 | 使用工具 | 说明 |
|------|---------|------|
| 长期文档 | `.ai/` 目录文件 | 正式的项目文档 |
| 会话记忆 | memory 工具 | 临时上下文和提示 |
| 决策记录 | `.ai/decisions/` ADR | 架构决策 |
| 进度跟踪 | `PROGRESS.md` | 当前状态 |

**建议：**
- 重要信息应同时保存在文件系统和 memory
- Memory 用于快速检索和上下文提示
- 文件系统用于持久化和版本控制

### 记忆内容类型

```
✅ 适合保存到 memory：
- 当前开发的功能上下文
- 临时的调试发现
- 待解决的问题列表
- 快速参考的代码片段

❌ 不适合 memory（应用文件）：
- 完整的设计文档
- 代码实现
- 配置文件
- 测试用例
```

---

## github 使用规范

### 必须使用的场景

```
⚠️ 以下场景必须使用 github MCP：

1. 创建和管理 Pull Requests
2. 查看和回复 Issue
3. 代码审查和评论
4. CI/CD 状态检查
5. Release 管理
6. 项目看板管理
```

### 使用流程

```
1. 连接到 GitHub 仓库
2. 使用 github 工具执行操作
3. 结合 git 命令完成工作流
4. 遵循项目的 PR 和 Issue 规范
```

### 常用操作

#### 创建 Pull Request
```bash
# 使用 github 工具创建 PR
# - 自动填充标题和描述
# - 关联相关 Issue
# - 请求审查者
# - 添加标签
```

#### 代码审查
```bash
# 审查 PR 代码
# - 获取 diff
# - 添加行级评论
# - 提交审查意见
# - 批准或请求修改
```

#### Issue 管理
```bash
# 管理 Issues
# - 创建新 Issue
# - 更新状态
# - 添加标签
# - 分配负责人
```

### 与项目规范集成

**Beeve 项目的 GitHub 工作流：**

1. **分支策略**
   - `main` - 主分支
   - `feat/*` - 功能开发
   - `fix/*` - 问题修复
   - `refactor/*` - 重构

2. **PR 规范**
   - 标题格式：`[feat|fix|refactor] 简短描述`
   - 必须关联 Issue（如果有）
   - 需要通过 CI 检查（lint, typecheck, test）
   - 需要至少一个审查批准

3. **Commit 规范**
   - 遵循 Conventional Commits
   - 包含 AI 生成标记（如配置）

### 工作流程示例

```bash
# 1. 创建功能分支
git checkout -b feat/add-card-component

# 2. 实现功能并提交
git add .
git commit -m "feat: add Card component with variants"

# 3. 推送并创建 PR
git push origin feat/add-card-component
# 使用 github 工具创建 PR

# 4. 响应审查意见
# 通过 github 工具查看评论
# 修改代码并更新 PR

# 5. 合并 PR
# 审查通过后，使用 github 工具合并
```

### 与其他工具配合

| 场景 | 工具组合 | 说明 |
|------|---------|------|
| PR 审查 | github + serena | 获取 PR → 分析代码变更 |
| Issue 修复 | github + sequential-thinking | 理解问题 → 设计方案 |
| CI 失败调试 | github + bash | 获取 CI 日志 → 本地复现 |
| Release 管理 | github + changelog | 准备 Release Notes |

---

## document-skills 使用规范

### 用途

- **Marketplace 技能管理**：来自 Anthropic 官方的技能集合
- **扩展 Claude Code 能力**：提供额外的专业化技能

### 使用场景

```
⚠️ document-skills 是技能市场插件，主要提供：

1. 专业领域技能（如文档处理、数据分析等）
2. 预配置的工作流程
3. 常用任务的自动化
```

### 注意事项

- 查看可用技能：使用 Claude Code 的技能管理命令
- 按需启用：只启用项目需要的技能
- 定期更新：保持技能库最新

---

## chromeDevtools 使用规范

### 必须使用的场景

```
⚠️ 以下场景必须使用 chromeDevtools MCP：

1. 前端组件开发后的视觉验证
2. 样式调试和 CSS 问题排查
3. 页面布局检查
4. 响应式设计测试
5. UI 渲染问题定位
6. 交互效果验证
```

### 使用流程

```
1. 启动开发服务器 (pnpm dev)
2. 使用 chromeDevtools 连接到页面
3. 执行视觉检查和调试
4. 截图记录问题或验证结果
```

### 常用操作

- **页面截图**：验证渲染效果
- **元素检查**：查看 DOM 结构和样式
- **控制台**：检查 JavaScript 错误
- **网络**：验证 API 请求
- **性能**：分析渲染性能

---

## context7 使用规范

### 必须查询的场景

```
⚠️ 以下场景必须先查询 context7，禁止凭记忆编码：

1. 使用任何库的 API
2. 配置任何工具或库
3. 使用不常见的方法或选项
4. 版本相关的 API 差异
5. 框架特定的模式和约定
```

### 项目依赖库 - 全部需要查询

#### 前端核心
| 库 | context7 ID | 查询重点 |
|----|-------------|---------|
| solid-js | `/solidjs/solid` | 响应式 API、生命周期、Context |
| **@zag-js** | `/chakra-ui/zag` | **状态机、组件 API、可访问性（必查！直接用此 ID，不要搜索！）** |
| @tanstack/solid-router | `/tanstack/router` | 路由配置、导航、类型安全 |
| @tanstack/solid-query | `/tanstack/query` | 查询、变更、缓存策略 |
| @tanstack/solid-form | `/tanstack/form` | 表单状态、验证、字段 API |
| @tanstack/solid-table | `/tanstack/table` | 列定义、排序、分页 |
| @tanstack/solid-virtual | `/tanstack/virtual` | 虚拟化配置 |

#### 样式
| 库 | context7 ID | 查询重点 |
|----|-------------|---------|
| tailwindcss | `/tailwindlabs/tailwindcss` | 类名、配置、v4 变化 |
| tailwind-variants | `/nextui-org/tailwind-variants` | tv() API、变体、插槽 |

#### 后端
| 库 | context7 ID | 查询重点 |
|----|-------------|---------|
| hono | `/honojs/hono` | 路由、中间件、Context |
| drizzle-orm | `/drizzle-team/drizzle-orm` | Schema、查询、关联 |
| zod | `/colinhacks/zod` | Schema 定义、验证、类型推断 |

#### 构建工具
| 库 | context7 ID | 查询重点 |
|----|-------------|---------|
| vite | `/vitejs/vite` | 配置、插件、环境变量 |
| astro | `/withastro/astro` | 组件、路由、集成 |
| @astrojs/starlight | `/withastro/starlight` | 配置、组件、侧边栏 |
| typescript | `/microsoft/typescript` | 配置选项、类型工具 |
| biome | `/biomejs/biome` | 规则配置、格式化选项 |

#### 工具库
| 库 | context7 ID | 查询重点 |
|----|-------------|---------|
| jose | `/panva/jose` | JWT 签名、验证、加密 |
| date-fns | `/date-fns/date-fns` | 日期格式化、计算 |

### 查询流程（强制）

```typescript
// 第一步：解析库 ID
mcp_context7_resolve-library-id({ libraryName: "库名" })

// 第二步：获取文档
mcp_context7_get-library-docs({
  context7CompatibleLibraryID: "/org/repo",
  topic: "具体主题",  // 如 "routing", "validation"
  tokens: 10000       // 根据需要调整
})

// 第三步：引用文档编码
// 在代码注释或回复中引用具体文档内容
```

### 查询示例

#### 示例 1：路由配置

```typescript
// ❌ 错误：凭记忆使用 API
const router = createRouter({ ... }) // 可能是过时或错误的 API

// ✅ 正确：先查询文档
// 1. 查询 @tanstack/solid-router 文档
// 2. 确认 createRouter 的正确用法和选项
// 3. 引用文档编写代码
```

#### 示例 2：开发 Menu 组件（重要！）

```typescript
// ❌ 错误：使用了错误的库
// AI：用户要开发 menu 组件
// AI 行为：查询 kobalte menu 文档 ← 错误！项目使用的是 zag.js

// ✅ 正确：先确认项目技术栈
// 1. 查看 package.json 或阅读 CLAUDE.md 确认使用 zag.js
// 2. 使用 context7 查询：resolve-library-id("@zag-js/menu")
// 3. 获取 zag.js menu 组件文档
// 4. 参考项目中其他 zag 组件实现模式（Dialog、Tooltip）
// 5. 按项目规范实现组件
```

#### 示例 3：开发复杂交互组件的完整流程

```typescript
// 用户：开发一个 Dropdown Menu 组件

// Step 1: 确认技术栈（必须！）
// - 阅读 CLAUDE.md 或 .ai/components.md
// - 确认项目使用 @zag-js 作为无头组件库

// Step 2: 查询 context7 文档
mcp_context7_resolve-library-id({
  libraryName: "@zag-js/menu",
  query: "menu dropdown component"
})
// 得到 library ID: /chakra-ui/zag

mcp_context7_query-docs({
  libraryId: "/chakra-ui/zag",
  query: "menu component API usage state machine props"
})

// Step 3: 使用 serena 分析现有实现
mcp_serena_find_symbol({
  name_path_pattern: "Dialog",
  relative_path: "packages/ui/src/components/Dialog",
  include_body: true
})
// 学习项目中 zag.js 的使用模式

// Step 4: 实现组件（基于文档和现有模式）
```

---

## serena 使用规范

### 必须使用的场景

```
⚠️ 以下场景必须使用 serena 分析代码：

1. 修改任何现有函数或组件
2. 添加新功能到现有模块
3. 重构或重命名
4. 理解代码依赖关系
5. 查找类似实现参考
```

### 常用操作

#### 查找符号
```typescript
mcp_oraios_serena_find_symbol({
  name_path_pattern: "ComponentName",
  relative_path: "packages/ui/src",
  include_body: true,
  depth: 1
})
```

#### 查找引用
```typescript
mcp_oraios_serena_find_referencing_symbols({
  name_path: "functionName",
  relative_path: "path/to/file.ts"
})
```

#### 获取文件概览
```typescript
mcp_oraios_serena_get_symbols_overview({
  relative_path: "path/to/file.ts"
})
```

#### 搜索模式
```typescript
mcp_oraios_serena_search_for_pattern({
  substring_pattern: "pattern",
  relative_path: "packages/",
  context_lines_before: 3,
  context_lines_after: 3
})
```

### 修改代码前的必要步骤

```
1. get_symbols_overview - 了解文件结构
2. find_symbol - 定位要修改的符号
3. find_referencing_symbols - 找到所有调用方
4. 评估影响范围
5. 执行修改
6. 验证所有调用方仍然兼容
```

---

## 防幻觉检查清单

### 编码前检查

- [ ] 是否查询了所有使用的库文档？
- [ ] API 用法是否有文档依据？
- [ ] 配置选项是否来自官方文档？
- [ ] 是否确认了库版本兼容性？

### 修改代码前检查

- [ ] 是否理解了现有代码的上下文？
- [ ] 是否找到了所有引用方？
- [ ] 是否确认修改不会破坏现有功能？

### 编码后检查

- [ ] 代码是否能通过类型检查？
- [ ] 代码是否符合项目 lint 规则？
- [ ] 是否提供了验证方式？

---

## 错误处理

### context7 查询失败时

```
1. 尝试不同的 topic 参数
2. 尝试更通用的库名
3. 明确告知用户：
   "⚠️ 无法获取 [库名] 的文档，以下代码基于：
    - 项目现有代码模式
    - 通用最佳实践
    请人工验证 API 用法是否正确"
4. 标记所有不确定的部分
```

### serena 分析失败时

```
1. 尝试更精确的路径
2. 使用搜索模式替代
3. 明确告知用户代码分析不完整
4. 建议人工检查影响范围
```

---

## 输出格式要求

### 代码回复必须包含

```markdown
## 文档依据
- [库名] 文档：[具体内容或链接]
- 项目代码参考：[文件路径]

## 实现
[代码块]

## 验证
运行以下命令验证：
- `pnpm typecheck`
- `pnpm lint`

## ⚠️ 注意事项
- [任何不确定的地方]
- [需要人工验证的部分]
```

### 不确定时的声明格式

```markdown
## ✅ 已验证
- [基于文档确认的内容]

## ⚠️ 需要验证
- [基于现有代码推断的内容]
- [建议用户确认的内容]

## ❓ 未知
- [无法确定的内容]
```
