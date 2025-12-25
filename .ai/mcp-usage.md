# MCP 使用规范

> AI 必须严格遵循本规范使用 MCP 工具，确保代码质量和准确性。

## 核心原则

```
🚨 零幻觉容忍：不确定就查，查不到就问，绝不猜测
📖 文档驱动：所有 API 使用必须有文档依据
🔍 代码优先：修改前必须理解现有代码
✅ 验证闭环：代码必须能被类型检查和 lint 验证
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
| **chromeDevtools** | 前端视觉测试 | 页面渲染检查、UI 调试、样式验证 |
| **github** | GitHub 操作 | PR、Issue、代码审查 |
| **sequential-thinking** | 分步推理 | 复杂任务分解、架构设计 |
| **memory** | 持久记忆 | 跨会话上下文、项目知识 |

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

```typescript
// ❌ 错误：凭记忆使用 API
const router = createRouter({ ... }) // 可能是过时或错误的 API

// ✅ 正确：先查询文档
// 1. 查询 @tanstack/solid-router 文档
// 2. 确认 createRouter 的正确用法和选项
// 3. 引用文档编写代码
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
