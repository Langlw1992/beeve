# Button 按钮

触发操作的基础交互组件。

## 基础用法

```tsx
import { Button } from '@beeve/ui'

<Button>默认按钮</Button>
<Button variant="primary">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `variant` | 按钮变体 | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive' \| 'link'` | `'primary'` |
| `size` | 按钮尺寸 | `'sm' \| 'md' \| 'lg' \| 'icon'` | `'md'` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `type` | 原生 button 类型 | `'button' \| 'submit' \| 'reset'` | `'button'` |
| `class` | 自定义 CSS 类名 | `string` | - |
| `onClick` | 点击回调 | `(e: MouseEvent) => void` | - |

### 变体说明

| 变体 | 使用场景 |
|------|----------|
| `primary` | 主要操作，一个页面通常只有一个 |
| `secondary` | 次要操作，用于辅助功能 |
| `outline` | 带边框按钮，低强调的操作 |
| `ghost` | 幽灵按钮，最低视觉强调 |
| `destructive` | 危险操作，如删除 |
| `link` | 链接样式，看起来像超链接 |

### 尺寸说明

| 尺寸 | 高度 | 使用场景 |
|------|------|----------|
| `sm` | 32px | 紧凑空间、表格内操作 |
| `md` | 40px | 默认尺寸，大多数场景 |
| `lg` | 48px | 强调性操作、大屏幕 |
| `icon` | 40x40px | 图标按钮，正方形 |

## 样式定制

Button 使用 `tailwind-variants` 构建，可以通过 `class` prop 覆盖样式：

```tsx
<Button class="rounded-full">圆形按钮</Button>
<Button class="w-full">全宽按钮</Button>
```

## 无障碍

- 默认 `type="button"` 防止表单意外提交
- 禁用状态使用原生 `disabled` 属性
- 支持键盘焦点和 focus-visible 样式
- 图标按钮应添加 `title` 属性提供文字说明

```tsx
<Button size="icon" title="通知">🔔</Button>
```

## 更新日志

### 0.0.1
- 初始版本
- 支持 6 种变体和 4 种尺寸
- 默认 type="button" 防止表单意外提交

