---
type: agent_requested
description: Rules for developing UI components in the @beeve/ui package, including file structure, styling with tailwind-variants, SolidJS component patterns, and Zag.js state machine integration.
---

# Component Development Guide

## File Structure

Every new component must follow this structure in `packages/ui/src/components/`:

```
ComponentName/
├── ComponentName.tsx          # Main implementation
├── ComponentName.test.tsx     # Unit tests
├── ComponentName.stories.tsx  # Storybook story
├── index.ts                   # Re-exports
└── README.md                  # (optional) Docs
```

After creating a component, add its export to `packages/ui/src/index.ts`:

```ts
export * from './components/ComponentName'
```

## Component Template

```tsx
/**
 * @beeve/ui - ComponentName Component
 * 组件中文描述
 */

import {splitProps, type Component, type JSX} from 'solid-js'
import {tv, type VariantProps} from 'tailwind-variants'

// ==================== 样式定义 ====================

const componentVariants = tv({
  base: ['...base classes'],
  variants: {
    variant: { /* ... */ },
    size: { /* ... */ },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export type ComponentNameVariants = VariantProps<typeof componentVariants>

export interface ComponentNameProps extends ComponentNameVariants {
  class?: string
  children?: JSX.Element
}

export const ComponentName: Component<ComponentNameProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'children'],
    ['variant', 'size'],
  )

  return (
    <div
      class={componentVariants({...variants, class: local.class})}
      {...rest}
    >
      {local.children}
    </div>
  )
}
```

## Multi-Slot Components (tv slots)

For components with multiple styled elements, use `tv()` with `slots`:

```tsx
const switchVariants = tv({
  slots: {
    root: 'inline-flex items-center gap-2',
    track: 'relative shrink-0 rounded-full bg-input',
    thumb: 'absolute rounded-full bg-background shadow-sm',
    label: 'text-foreground',
  },
  variants: {
    size: {
      sm: { track: '...', thumb: '...' },
      md: { track: '...', thumb: '...' },
    },
  },
})

// Usage: const styles = createMemo(() => switchVariants({size: variants.size}))
// Then: class={styles().root()}, class={styles().track()}, etc.
```

## index.ts Re-export Pattern

```ts
export {ComponentName} from './ComponentName'
export type {ComponentNameProps, ComponentNameVariants} from './ComponentName'
```

## Zag.js Component Pattern

For complex interactive components, create a primitive layer first:

**1. Primitive (`src/primitives/{name}/types.ts`):**

```ts
import type * as zagModule from '@zag-js/{name}'
export interface UseComponentProps {
  id?: string
  open?: boolean
  onOpenChange?: (details: {open: boolean}) => void
  // ... component-specific props
}
```

**2. Hook (`src/primitives/{name}/use-{name}.ts`):**

```ts
import {createMemo, createUniqueId} from 'solid-js'
import * as zagModule from '@zag-js/{name}'
import {useMachine, normalizeProps} from '@zag-js/solid'

export function useComponent(props: UseComponentProps) {
  const service = useMachine(zagModule.machine, () => ({
    id: props.id ?? createUniqueId(),
    // ... map props to zag options
  }))
  const api = createMemo(() => zagModule.connect(service, normalizeProps))
  return {api, service}
}
```

**3. Component (`src/components/{Name}/{Name}.tsx`):**

Import the primitive hook, add `tv()` styling, compose JSX by spreading API props:

```tsx
const {api} = useComponent(rest)
// Then: <div {...api().getContentProps()} class={styles.content()}>
```

## Storybook Story Template

```tsx
import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {ComponentName} from '@beeve/ui'

const meta = {
  title: 'Components/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
} satisfies Meta<typeof ComponentName>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { /* default props */ },
}
```

## Theme Integration

- Use CSS custom property classes: `bg-primary`, `text-foreground`, `border-border`, `bg-background`
- Border radius: `rounded-[var(--radius)]` for theme-aware corners
- All color values are oklch-based CSS custom properties set by ThemeProvider

