---
type: always
---

# Beeve Design System & UI Rules

**Strictly adhere to the Beeve Design System (Compact Mode).**
Reference: `packages/ui/DESIGN_SYSTEM.md`

## 1. Sizing (Compact)
Use `tailwind-variants` (tv) with these exact specifications:

- **Default (md)**: `h-8` (32px), `text-sm` (14px), `px-3`
  - Usage: Standard inputs, buttons.
- **Small (sm)**: `h-7` (28px), `text-xs` (12px), `px-2`
  - Usage: Property panels, dense grids.
- **Large (lg)**: `h-9` (36px), `text-sm` (14px), `px-4`
  - Usage: Modal actions, primary calls-to-action.

## 2. Styling
- **Radius**: `rounded-md` (0.5rem/8px)
- **Colors**: Zinc (Neutral), Blue (Primary)
- **Focus Ring**: MUST use theme color `ring-primary/20` (not fixed colors).
- **Icons**: Use `lucide-solid` icons. Sizes: `size-3.5` (sm), `size-4` (md/lg).

## 3. Implementation Pattern
All components MUST support `ref` and `class` merging.

```typescript
import { splitProps, type Component, type ComponentProps } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'

const variants = tv({
  variants: {
    size: {
      default: "h-8 px-3 text-sm",
      sm: "h-7 px-2 text-xs",
      lg: "h-9 px-4 text-sm",
      icon: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface MyComponentProps extends ComponentProps<'div'>, VariantProps<typeof variants> {
  // ...
}

export const MyComponent: Component<MyComponentProps> = (props) => {
  const [local, style, rest] = splitProps(props, ['class', 'children', 'ref'], ['size'])
  
  return (
    <div 
      ref={local.ref}
      class={variants({ ...style, class: local.class })} 
      {...rest}
    >
      {local.children}
    </div>
  )
}
```
