# ADR-002: 使用 Biome 替代 ESLint/Prettier

**状态**: accepted  
**日期**: 2024-12-25

## 背景

项目需要代码规范和格式化工具。传统选择是 ESLint + Prettier，但配置复杂且有性能问题。

## 决策

选择 **Biome** 作为唯一的 lint 和格式化工具。

## 理由

1. **性能**
   - Rust 编写，比 ESLint 快 10-100 倍
   - Monorepo 中优势更明显

2. **简单配置**
   - 一个工具同时处理 lint 和 format
   - 开箱即用的合理默认配置
   - 不需要管理多个配置文件

3. **一致性**
   - 没有 ESLint/Prettier 规则冲突问题
   - 格式化结果确定性更好

4. **现代化**
   - 原生支持 TypeScript
   - 更好的错误信息

## 后果

### 正面
- 更快的 CI/CD
- 更简单的配置
- 更好的开发体验

### 负面
- 规则不如 ESLint 丰富
- 部分 ESLint 插件无法使用

### 需要注意
- **禁止引入 ESLint 或 Prettier**
- 使用 `pnpm lint` 和 `pnpm format`
- 配置文件为 `biome.json`
