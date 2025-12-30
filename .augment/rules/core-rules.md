---
type: always
---

# Beeve 项目核心规则

## 🚨 关键规则 - 零幻觉容忍

1. **禁止猜测 API** - 必须先用 context7 查询文档
2. **禁止假设库行为** - 必须验证
3. **禁止混淆 React/Solid** - 这是 SolidJS 项目
4. **必须分析现有代码** - 修改前用 serena 分析
5. **必须验证代码** - 通过 typecheck 和 lint
6. **必须引用文档来源** - 在回复中说明
7. **简体中文回复** - 除技术术语、代码、命令外
8. **前端视觉测试** - 使用 chromeDevtools MCP
9. **服务器检查** - 启动 dev 服务前先检查是否已运行，避免端口冲突

## 代码规范

- **禁止 forEach**：使用 `for...of` 或数组方法（`map`, `filter`, `reduce`）
- **强制花括号**：所有 `if/else` 语句必须使用 `{}`，即使单行
- **使用 size-x**：当宽高相同时，使用 `size-x` 而不是 `w-x h-x`

```typescript
// ❌ 禁止
items.forEach(item => doSomething(item))
if (condition) doSomething()

// ✅ 正确
for (const item of items) { doSomething(item) }
items.map(item => transform(item))
if (condition) { doSomething() }
```

```html
<!-- ❌ 禁止：宽高相同时分别设置 -->
<div class="w-4 h-4">...</div>
<div class="w-10 h-10">...</div>

<!-- ✅ 正确：使用 size-x -->
<div class="size-4">...</div>
<div class="size-10">...</div>
```

- **context7**: 使用任何库 API 前必须查询
- **serena**: 修改代码前必须分析结构
- **chromeDevtools**: 前端视觉测试和调试

详见 `.ai/mcp-usage.md`

## 必须查询文档的库

| 分类 | 库 |
|------|-----|
| 前端 | solid-js, @tanstack/solid-router, @tanstack/solid-query, @tanstack/solid-form, @tanstack/solid-table |
| 样式 | tailwindcss, tailwind-variants |
| 后端 | hono, @hono/zod-validator, drizzle-orm, zod |
| 构建 | vite, astro, @astrojs/starlight, typescript, biome |

## 反幻觉检查清单

编写代码前：
- [ ] 通过 context7 验证 API 存在于当前版本？
- [ ] 在文档中确认了正确的参数和返回类型？
- [ ] 确认这是 Solid 版本，不是 React？
- [ ] 用 serena 分析了现有代码？
- [ ] 参考了项目现有模式？
