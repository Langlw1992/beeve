# ADR-003: 使用 Astro+Starlight 构建文档系统

**状态**: accepted  
**日期**: 2024-12-25

## 背景

项目需要两类文档：
1. 组件库文档（组件展示、API 文档、示例）
2. 技术文档（架构、使用指南、API 参考）

传统方案是使用 Storybook 做组件文档 + VitePress/Docusaurus 做技术文档。

## 决策

使用 **Astro + Starlight** 构建统一的文档系统，不使用 Storybook。

## 理由

1. **统一平台**
   - 一个站点同时包含组件文档和技术文档
   - 减少维护成本
   - 统一的搜索体验

2. **性能**
   - Astro 的 Island 架构，默认零 JS
   - 组件演示按需加载
   - 更快的加载速度

3. **灵活性**
   - 可以直接用 Solid 组件做演示
   - 支持 MDX，灵活混合内容
   - 不受 Storybook 约束

4. **简化依赖**
   - 不需要维护 Storybook 配置
   - 减少依赖数量

## 后果

### 正面
- 更简单的文档架构
- 更好的性能
- 更灵活的定制

### 负面
- 需要自己实现组件预览功能
- 没有 Storybook 的 addon 生态

### 实现方案

组件展示采用自定义 `<ComponentPreview>` 组件：

```astro
---
import { Button } from '@beeve/ui'
---

<ComponentPreview>
  <Button variant="primary">Click me</Button>
</ComponentPreview>
```

支持显示源码、多变体切换、props 表格等功能。
