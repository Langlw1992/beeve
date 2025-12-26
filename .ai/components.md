# 组件开发指南

## 组件分类

### 1. 基础组件 (Components)

有样式的、可直接使用的组件。

```
packages/ui/src/components/
├── Button/
├── Input/
├── Select/
└── ...
```

### 2. 原语组件 (Primitives)

无样式的、提供行为和可访问性的底层组件。

```
packages/ui/src/primitives/
├── Dialog/
├── Popover/
├── Tooltip/
└── ...
```

### 3. Hooks

可复用的状态逻辑。

```
packages/ui/src/hooks/
├── use-click-outside.ts
├── use-controllable-state.ts
├── use-media-query.ts
└── ...
```

## 组件目录结构

```
Button/
├── Button.tsx           # 主组件
├── Button.stories.tsx   # Storybook 文档
├── Button.test.tsx      # 测试文件
├── context.ts           # 组件 Context（如需要）
├── types.ts             # 类型定义（如复杂）
└── index.ts             # 导出
```

## 组件模板

### 基础组件模板

```typescript
// Button/Button.tsx
import { splitProps, type Component, type JSX } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'

// 1. 定义样式变体
const buttonVariants = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-medium',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

// 2. 定义 Props 类型
export type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** 是否处于加载状态 */
    loading?: boolean
    /** 左侧图标 */
    leftIcon?: JSX.Element
    /** 右侧图标 */
    rightIcon?: JSX.Element
  }

// 3. 实现组件
export const Button: Component<ButtonProps> = (props) => {
  // 分离 props
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'children', 'loading', 'disabled', 'leftIcon', 'rightIcon'],
    ['variant', 'size']
  )

  return (
    <button
      class={buttonVariants({ ...variants, class: local.class })}
      disabled={local.disabled || local.loading}
      {...rest}
    >
      {/* 加载状态 */}
      {local.loading && <Spinner class="h-4 w-4 animate-spin" />}

      {/* 左侧图标 */}
      {!local.loading && local.leftIcon}

      {/* 内容 */}
      {local.children}

      {/* 右侧图标 */}
      {local.rightIcon}
    </button>
  )
}
```

### 原语组件模板

```typescript
// primitives/Dialog/Dialog.tsx
import {
  createContext,
  useContext,
  createSignal,
  type ParentComponent,
  type Component,
  type JSX,
  Show,
} from 'solid-js'
import { Portal } from 'solid-js/web'

// 1. 定义 Context
type DialogContextValue = {
  open: () => boolean
  setOpen: (open: boolean) => void
  contentId: string
  titleId: string
  descriptionId: string
}

const DialogContext = createContext<DialogContextValue>()

function useDialogContext() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('Dialog components must be used within Dialog.Root')
  }
  return context
}

// 2. Root 组件
export type DialogRootProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: JSX.Element
}

const Root: ParentComponent<DialogRootProps> = (props) => {
  const [internalOpen, setInternalOpen] = createSignal(props.defaultOpen ?? false)

  const open = () => props.open ?? internalOpen()
  const setOpen = (value: boolean) => {
    setInternalOpen(value)
    props.onOpenChange?.(value)
  }

  const id = createUniqueId()

  return (
    <DialogContext.Provider
      value={{
        open,
        setOpen,
        contentId: `dialog-content-${id}`,
        titleId: `dialog-title-${id}`,
        descriptionId: `dialog-description-${id}`,
      }}
    >
      {props.children}
    </DialogContext.Provider>
  )
}

// 3. Trigger 组件
export type DialogTriggerProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>

const Trigger: Component<DialogTriggerProps> = (props) => {
  const context = useDialogContext()
  const [local, rest] = splitProps(props, ['onClick'])

  return (
    <button
      aria-haspopup="dialog"
      aria-expanded={context.open()}
      aria-controls={context.contentId}
      onClick={(e) => {
        context.setOpen(!context.open())
        if (typeof local.onClick === 'function') {
          local.onClick(e)
        }
      }}
      {...rest}
    />
  )
}

// 4. Content 组件
export type DialogContentProps = JSX.HTMLAttributes<HTMLDivElement>

const Content: ParentComponent<DialogContentProps> = (props) => {
  const context = useDialogContext()
  const [local, rest] = splitProps(props, ['class', 'children'])

  return (
    <Show when={context.open()}>
      <Portal>
        {/* Overlay */}
        <div
          class="fixed inset-0 z-50 bg-black/50"
          onClick={() => context.setOpen(false)}
        />
        {/* Content */}
        <div
          id={context.contentId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={context.titleId}
          aria-describedby={context.descriptionId}
          class={local.class}
          {...rest}
        >
          {local.children}
        </div>
      </Portal>
    </Show>
  )
}

// 5. 导出
export const Dialog = {
  Root,
  Trigger,
  Content,
  // ... 其他子组件
}
```

### 受控/非受控组件 Hook

```typescript
// hooks/use-controllable-state.ts
import { createSignal, type Accessor } from 'solid-js'

export type UseControllableStateProps<T> = {
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
}

export function useControllableState<T>(
  props: UseControllableStateProps<T>
): [Accessor<T | undefined>, (value: T) => void] {
  const [internalValue, setInternalValue] = createSignal<T | undefined>(
    props.defaultValue
  )

  const isControlled = () => props.value !== undefined
  const value = () => (isControlled() ? props.value : internalValue())

  const setValue = (nextValue: T) => {
    if (!isControlled()) {
      setInternalValue(() => nextValue)
    }
    props.onChange?.(nextValue)
  }

  return [value, setValue]
}
```

## Storybook 文档模板

```typescript
// Button/Button.stories.tsx
import type { Meta, StoryObj } from 'storybook-solidjs'
import { Button } from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'destructive'],
      description: '按钮变体',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
      description: '按钮尺寸',
    },
    loading: {
      control: 'boolean',
      description: '加载状态',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// 基础用法
export const Default: Story = {
  args: {
    children: 'Button',
  },
}

// 所有变体
export const Variants: Story = {
  render: () => (
    <div class="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}

// 所有尺寸
export const Sizes: Story = {
  render: () => (
    <div class="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

// 加载状态
export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
}

// 带图标
export const WithIcon: Story = {
  render: () => (
    <div class="flex gap-4">
      <Button leftIcon={<PlusIcon />}>Add Item</Button>
      <Button rightIcon={<ArrowRightIcon />}>Next</Button>
    </div>
  ),
}
```

## 测试模板

```typescript
// Button/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@solidjs/testing-library'
import { Button } from './Button'

describe('Button', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(() => <Button>Click me</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })

    it('applies variant classes', () => {
      render(() => <Button variant="secondary">Button</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-secondary')
    })

    it('applies size classes', () => {
      render(() => <Button size="lg">Button</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-12')
    })

    it('renders with custom className', () => {
      render(() => <Button class="custom-class">Button</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })
  })

  describe('states', () => {
    it('is disabled when disabled prop is true', () => {
      render(() => <Button disabled>Button</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('is disabled when loading prop is true', () => {
      render(() => <Button loading>Button</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('shows loading spinner when loading', () => {
      render(() => <Button loading>Button</Button>)
      expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn()
      render(() => <Button onClick={handleClick}>Button</Button>)

      await fireEvent.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      render(() => <Button onClick={handleClick} disabled>Button</Button>)

      await fireEvent.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has correct role', () => {
      render(() => <Button>Button</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('supports aria attributes', () => {
      render(() => <Button aria-label="Close dialog">×</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close dialog')
    })
  })
})
```

## 可访问性清单

### 通用

- [ ] 支持键盘导航
- [ ] 有正确的 ARIA 角色
- [ ] 支持 `aria-label` / `aria-labelledby`
- [ ] 支持 `aria-describedby`
- [ ] 有足够的颜色对比度
- [ ] 焦点状态可见

### 按钮

- [ ] 使用 `<button>` 元素
- [ ] 禁用时使用 `disabled` 属性
- [ ] 加载时阻止交互

### 输入框

- [ ] 关联 `<label>`
- [ ] 错误状态使用 `aria-invalid`
- [ ] 错误信息使用 `aria-describedby`
- [ ] 必填使用 `aria-required`

### 对话框

- [ ] 使用 `role="dialog"` 或 `role="alertdialog"`
- [ ] 使用 `aria-modal="true"`
- [ ] 打开时焦点移入
- [ ] 关闭时焦点恢复
- [ ] 支持 ESC 关闭
- [ ] 焦点陷阱

## 组件清单

### 第一阶段：基础

| 组件 | 状态 | 说明 |
|------|------|------|
| Button | ⬜ | 按钮 |
| IconButton | ⬜ | 图标按钮 |
| Input | ⬜ | 输入框 |
| Textarea | ⬜ | 多行输入 |
| Select | ⬜ | 选择器 |
| Checkbox | ⬜ | 复选框 |
| Radio | ⬜ | 单选框 |
| Switch | ⬜ | 开关 |
| Label | ⬜ | 标签 |
| FormField | ⬜ | 表单项 |

### 第二阶段：反馈

| 组件 | 状态 | 说明 |
|------|------|------|
| Alert | ⬜ | 警告提示 |
| Toast | ⬜ | 轻提示 |
| Progress | ⬜ | 进度条 |
| Spinner | ⬜ | 加载中 |
| Skeleton | ⬜ | 骨架屏 |
| Badge | ⬜ | 徽标 |

### 第三阶段：弹层

| 组件 | 状态 | 说明 |
|------|------|------|
| Dialog | ⬜ | 对话框 |
| Drawer | ⬜ | 抽屉 |
| Popover | ⬜ | 弹出框 |
| Tooltip | ⬜ | 文字提示 |
| Dropdown | ⬜ | 下拉菜单 |

### 第四阶段：导航

| 组件 | 状态 | 说明 |
|------|------|------|
| Tabs | ⬜ | 标签页 |
| Accordion | ⬜ | 手风琴 |
| Breadcrumb | ⬜ | 面包屑 |
| Pagination | ⬜ | 分页 |

### 第五阶段：数据展示

| 组件 | 状态 | 说明 |
|------|------|------|
| Table | ⬜ | 表格 |
| Card | ⬜ | 卡片 |
| Avatar | ⬜ | 头像 |
| List | ⬜ | 列表 |

### 第六阶段：高级

| 组件 | 状态 | 说明 |
|------|------|------|
| DatePicker | ⬜ | 日期选择 |
| TimePicker | ⬜ | 时间选择 |
| ColorPicker | ⬜ | 颜色选择 |
| Upload | ⬜ | 上传 |
| Command | ⬜ | 命令面板 |
