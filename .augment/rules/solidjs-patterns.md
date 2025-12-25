---
type: auto
description: SolidJS component development patterns and best practices
---

# SolidJS 组件模式

## 组件模板

```typescript
import { splitProps, type Component } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'

// 使用 tailwind-variants 定义变体
const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md font-medium',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

// Props 继承 VariantProps
export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  onClick?: () => void
  disabled?: boolean
  children: JSX.Element
}

// 使用 splitProps 分离关注点
export const Button: Component<ButtonProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'children'],
    ['variant', 'size']
  )

  return (
    <button
      class={buttonVariants({ ...variants, class: local.class })}
      {...rest}
    >
      {local.children}
    </button>
  )
}
```

## 关键要点

- ✅ 使用 `splitProps` - 禁止直接解构 props
- ✅ 使用 `tailwind-variants` (tv) 做样式
- ✅ 只用命名导出
- ✅ 完整的 TypeScript 类型

## 禁止模式

```typescript
// ❌ 错误：直接解构 props
const Component = ({ value, onChange }) => { }

// ❌ 错误：使用 React Hooks
import { useState, useEffect } from 'react'

// ❌ 错误：默认导出
export default function Button() { }

// ❌ 错误：内联样式做变体
<button class={`${variant === 'primary' ? 'bg-blue' : 'bg-gray'}`}>
```

## 导入顺序

```typescript
// 1. 外部包
import { createSignal, onMount } from 'solid-js'
import { useNavigate } from '@tanstack/solid-router'

// 2. 内部包 (@beeve/*)
import { Button, Input } from '@beeve/ui'

// 3. 相对导入
import { useAuth } from '../../hooks/use-auth'

// 4. 类型导入
import type { User } from '@beeve/shared/types'
```
