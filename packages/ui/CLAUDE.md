# @beeve/ui - 组件库开发规范

## 架构定位

基础 UI 组件库，采用**无头逻辑 + Tailwind 样式**的分层架构：
- **Zag.js** 提供无头交互逻辑（可访问性、状态管理、键盘导航）
- **Tailwind CSS** 提供视觉样式
- **tailwind-variants** 管理组件变体

## 目录结构

```
src/
├── components/          # 组件（每个组件独立目录）
│   ├── Button/
│   │   ├── Button.tsx   # 组件实现
│   │   └── index.ts     # 公开导出
│   └── ...
├── primitives/          # Zag.js 原始组件（底层逻辑封装）
├── themes/              # 主题系统（颜色、圆角、暗色模式）
├── providers/           # Context Provider（ThemeProvider 等）
├── styles/              # 全局 CSS
└── utils/               # 工具函数
```

## 组件开发规范

### 1. 文件结构

每个组件必须包含：
- `ComponentName.tsx` - 主组件文件
- `index.ts` - 统一导出（类型 + 组件）

### 2. 组件实现模式

```tsx
import { splitProps, type Component, type JSX } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'

// 1. 使用 tv() 定义变体
const componentVariants = tv({
  base: '...',           // 基础样式
  variants: {
    variant: { ... },    // 视觉变体
    size: { ... },       // 尺寸变体
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export type ComponentVariants = VariantProps<typeof componentVariants>

// 2. Props 接口定义
export interface ComponentProps extends ComponentVariants {
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
  children?: JSX.Element
  // 组件特定属性...
}

// 3. 组件实现
export const Component: Component<ComponentProps> = (props) => {
  // 使用 splitProps 分离变体属性与其他属性
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'classList', 'style', 'children'], // 本地处理
    ['variant', 'size'],                         // 变体属性
  )

  return (
    <div
      class={componentVariants({ ...variants, class: local.class })}
      {...rest}
    >
      {local.children}
    </div>
  )
}
```

### 3. 基于 Zag.js 的组件

复杂交互组件（Dialog、Menu、Select 等）使用 Zag.js：

```tsx
import * as dialog from '@zag-js/dialog'
import { normalizeProps, useMachine } from '@zag-js/solid'

export const Dialog: Component<DialogProps> = (props) => {
  const [state, send] = useMachine(dialog.machine({ id: createUniqueId() }))
  const api = createMemo(() => dialog.connect(state, send, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      {/* 使用 api 提供的方法管理交互 */}
    </div>
  )
}
```

**注意**：Cascader 组件使用 client-only Portal，但当前实现可在 SSR 环境安全渲染触发器，并在客户端挂载弹层。

### 4. 样式约定

**颜色系统**（CSS 变量）：
```css
--primary           /* 主色 */
--primary-foreground  /* 主色前景 */
--secondary         /* 次色 */
--destructive       /* 危险/错误 */
--background        /* 背景 */
--foreground        /* 前景/文字 */
--muted             /* 静音/次要背景 */
--border            /* 边框 */
--input             /* 输入框边框 */
--ring              /* 聚焦环 */
```

**圆角系统**：
```css
--radius            /* 默认圆角 */
--radius-sm         /* 小圆角 */
--radius-lg         /* 大圆角 */
```

### 5. 导出规范

`index.ts` 必须导出：
- 组件本身
- Props 类型（命名：`ComponentProps`）
- 变体类型（命名：`ComponentVariants`）

```ts
export { Component, type ComponentProps, type ComponentVariants } from './Component'
```

## 主题系统

**配置项**：
- `baseColor`: zinc | slate | gray | neutral | stone（基础灰度）
- `themeColor`: blue | green | purple | ...（主题强调色）
- `radius`: 0-1 或 'full'（圆角大小）
- `mode`: light | dark | system（颜色模式）

**使用 ThemeProvider**：
```tsx
import { ThemeProvider } from '@beeve/ui/providers'

<ThemeProvider config={{ baseColor: 'zinc', themeColor: 'blue', radius: 0.5 }}>
  <App />
</ThemeProvider>
```

## 开发命令

```bash
pnpm dev                 # 开发模式（watch 构建）
pnpm build               # 生产构建
pnpm test                # 运行测试
pnpm test:run            # 单次测试
pnpm typecheck           # 类型检查
```

## 新增组件 Checklist

- [ ] 创建 `src/components/ComponentName/` 目录
- [ ] 实现组件逻辑（Zag.js 或原生）
- [ ] 使用 `tv()` 定义变体
- [ ] 导出类型和组件
- [ ] 在 `src/index.ts` 中注册导出
- [ ] 添加预览页或示例（如适用）
- [ ] 运行 `pnpm typecheck` 确认无错误
