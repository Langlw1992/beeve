# 架构决策记录 (ADR)

本目录存放项目的架构决策记录，用于追溯重要技术决策的背景和理由。

## 格式

每个 ADR 文件命名为 `NNN-title.md`，内容包括：

- **状态**: proposed / accepted / deprecated / superseded
- **背景**: 为什么需要做这个决策
- **决策**: 具体选择了什么
- **理由**: 为什么这样选择
- **后果**: 这个决策带来的影响

## 索引

| ADR | 标题 | 状态 | 日期 |
|-----|------|------|------|
| [001](001-solidjs.md) | 使用 SolidJS 作为前端框架 | accepted | 2024-12-25 |
| [002](002-biome.md) | 使用 Biome 替代 ESLint/Prettier | accepted | 2024-12-25 |
| [003](003-docs-system.md) | 使用 Astro+Starlight 构建文档系统 | accepted | 2024-12-25 |

## 何时创建 ADR

- 选择核心技术栈
- 重大架构变更
- 引入重要依赖
- 改变开发流程
- 任何可能被质疑"为什么这样做"的决策
