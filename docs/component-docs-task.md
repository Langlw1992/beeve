# 组件文档批量创建任务

> 本文档用于指导 AI 助手为 Beeve UI 组件创建文档。

## 任务概述

为 Beeve UI 的 19 个组件创建完整文档。

## 待创建文档的组件列表

| # | 组件 | 中文名 | 优先级 | 状态 |
|---|------|--------|--------|------|
| 0 | Button | 按钮 | P0 | ✅ 已完成 |
| 1 | Input | 输入框 | P0 | ✅ 已完成 |
| 2 | Checkbox | 复选框 | P0 | ⬜ 待开始 |
| 3 | Radio | 单选框 | P0 | ⬜ 待开始 |
| 4 | Switch | 开关 | P0 | ⬜ 待开始 |
| 5 | Select | 下拉选择 | P0 | ⬜ 待开始 |
| 6 | Slider | 滑块 | P1 | ⬜ 待开始 |
| 7 | Label | 标签 | P1 | ⬜ 待开始 |
| 8 | Badge | 徽章 | P1 | ⬜ 待开始 |
| 9 | Card | 卡片 | P1 | ⬜ 待开始 |
| 10 | Tooltip | 提示 | P1 | ⬜ 待开始 |
| 11 | Dialog | 对话框 | P1 | ⬜ 待开始 |
| 12 | Menu | 菜单 | P2 | ⬜ 待开始 |
| 13 | NavMenu | 导航菜单 | P2 | ⬜ 待开始 |
| 14 | Popover | 气泡卡片 | P2 | ⬜ 待开始 |
| 15 | Progress | 进度条 | P2 | ⬜ 待开始 |
| 16 | Skeleton | 骨架屏 | P2 | ⬜ 待开始 |
| 17 | Toast | 消息提示 | P2 | ⬜ 待开始 |
| 18 | Sidebar | 侧边栏 | P3 | ⬜ 待开始 |
| 19 | Presence | 动画组件 | P3 | ⬜ 待开始 |

## 每个组件需要创建的文件

### 1. Demo 组件
**路径**: `apps/ui-doc/src/components/{Name}Demo.tsx`

```tsx
// 示例结构
import { ComponentName } from '@beeve/ui'

export function ComponentNameBasic() { ... }
export function ComponentNameVariants() { ... }
export function ComponentNameSizes() { ... }
export function ComponentNameStates() { ... }
// 根据组件特性添加更多 Demo
```

### 2. 文档页面
**路径**: `apps/ui-doc/src/content/docs/components/{name}.mdx`

```mdx
---
title: ComponentName 中文名
description: 组件描述
---

import { Demo1, Demo2, ... } from '../../../components/{Name}Demo'
import ComponentPreview from '../../../components/ComponentPreview.astro'

组件介绍...

## 何时使用
- 使用场景 1
- 使用场景 2

## 基础用法
<ComponentPreview>
  <Demo1 client:only="solid-js" />
</ComponentPreview>

## 变体/尺寸/状态...

## API

### Props
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|

### 键盘交互（如适用）

### 无障碍
```

## 文档内容要求

### 必须包含
1. **组件描述** - 简洁说明组件用途
2. **何时使用** - 使用场景列表
3. **基础用法** - 最简单的使用示例
4. **所有变体** - variant 属性的所有值
5. **所有尺寸** - size 属性的所有值
6. **状态演示** - disabled, loading, error 等
7. **完整 API 表格** - 所有 Props 及类型
8. **键盘交互** - 支持的快捷键（如适用）
9. **无障碍说明** - a11y 最佳实践

### 参考来源
- 组件代码: `packages/ui/src/components/{Name}/{Name}.tsx`
- Stories: `packages/ui/src/components/{Name}/{Name}.stories.tsx`
- 测试: `packages/ui/src/components/{Name}/{Name}.test.tsx`（如有）

## 执行步骤

对于每个组件，按以下顺序执行：

### Step 1: 分析组件 API
```bash
# 查看组件源码获取完整 Props
packages/ui/src/components/{Name}/{Name}.tsx
```

### Step 2: 参考 Stories
```bash
# 查看已有的演示用例
packages/ui/src/components/{Name}/{Name}.stories.tsx
```

### Step 3: 创建 Demo 组件
```bash
# 创建交互式演示
apps/ui-doc/src/components/{Name}Demo.tsx
```

### Step 4: 创建文档
```bash
# 创建 MDX 文档
apps/ui-doc/src/content/docs/components/{name}.mdx
```

### Step 5: 验证
```bash
# 类型检查
pnpm typecheck --filter=@beeve/ui-doc

# 本地预览（已运行在 localhost:4321）
# 访问 http://localhost:4321/components/{name}/
```

## 完成标准

每个组件文档完成后，确认：
- [ ] Demo 组件创建完成
- [ ] MDX 文档创建完成
- [ ] 类型检查通过
- [ ] 页面渲染正常
- [ ] 所有交互演示可用

## 参考文件

已完成的 Button 组件文档可作为参考模板：
- Demo: `apps/ui-doc/src/components/ButtonDemo.tsx`
- 文档: `apps/ui-doc/src/content/docs/components/button.mdx`

## 单组件执行指令

复制以下指令，替换 `{ComponentName}` 和 `{name}` 后发送给 AI：

```
请为 {ComponentName} 组件创建完整文档：

1. 先阅读组件源码：packages/ui/src/components/{Name}/{Name}.tsx
2. 参考 Stories：packages/ui/src/components/{Name}/{Name}.stories.tsx
3. 创建 Demo：apps/ui-doc/src/components/{Name}Demo.tsx
4. 创建文档：apps/ui-doc/src/content/docs/components/{name}.mdx
5. 运行 pnpm typecheck --filter=@beeve/ui-doc 验证

参考 Button 文档格式：apps/ui-doc/src/content/docs/components/button.mdx
参考 Button Demo 格式：apps/ui-doc/src/components/ButtonDemo.tsx
```

## 注意事项

1. **使用 context7 查询** - 使用 zag-js API 时必须查询文档（libraryId: `/chakra-ui/zag`）
2. **使用 serena 分析** - 修改代码前用 serena 理解组件结构
3. **简体中文** - 文档内容使用简体中文
4. **代码高亮** - 示例代码使用 tsx 语法
5. **client:only** - Demo 组件必须使用 `client:only="solid-js"`
6. **完成后更新本文档** - 将对应组件状态改为 ✅ 已完成
7. **图标使用 lucide-solid** - 请使用 lucide-solid 图标库，尺寸使用 size-4，禁止创建svg标签
