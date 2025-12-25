# ADR-001: 使用 SolidJS 作为前端框架

**状态**: accepted  
**日期**: 2024-12-25

## 背景

项目需要选择一个前端框架来构建低代码平台和组件库。主要候选：
- React
- Vue
- SolidJS
- Svelte

## 决策

选择 **SolidJS** 作为前端框架。

## 理由

1. **性能优势**
   - 无虚拟 DOM，直接编译为细粒度 DOM 更新
   - 更小的 bundle 体积
   - 低代码平台需要处理大量动态组件，性能关键

2. **简单的心智模型**
   - 真正的响应式，不需要记忆 hooks 规则
   - 没有 stale closure 问题
   - 更接近原生 JavaScript

3. **生态兼容**
   - TanStack 全家桶支持 Solid 版本
   - 可以复用大部分 React 生态的设计模式

4. **类型安全**
   - 与 TypeScript 深度集成
   - JSX 类型推断更好

## 后果

### 正面
- 更好的运行时性能
- 更简单的代码
- 更小的 bundle

### 负面
- 生态不如 React 丰富
- 招聘时需要额外培训
- 部分第三方库需要封装

### 需要注意
- **禁止混淆 React 和 Solid 模式**
- 必须使用 `splitProps`，不能直接解构 props
- 使用 Solid 版本的 TanStack 库
