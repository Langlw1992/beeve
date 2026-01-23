/**
 * @beeve/ui - Button Component
 * 按钮组件
 */

import { splitProps, Show, type Component, type JSX } from 'solid-js'
import { LoaderCircle } from 'lucide-solid'
import { tv, type VariantProps } from 'tailwind-variants'

const buttonVariants = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-medium',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20',
    'disabled:pointer-events-none disabled:opacity-50',
    'rounded-[var(--radius)]',
  ],
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-white hover:bg-destructive/90',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      sm: 'h-7 px-2 text-xs',
      md: 'h-8 px-3 text-sm',
      lg: 'h-9 px-4 text-sm',
      icon: 'size-8',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export type ButtonVariants = VariantProps<typeof buttonVariants>

export interface ButtonProps extends ButtonVariants {
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
  children?: JSX.Element
  disabled?: boolean
  /** 加载状态 */
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: (e: MouseEvent) => void
  title?: string
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'classList', 'style', 'children', 'type', 'loading', 'disabled'],
    ['variant', 'size']
  )

  return (
    <button
      type={local.type ?? 'button'}
      class={buttonVariants({ ...variants, class: local.class })}
      classList={local.classList}
      style={local.style}
      disabled={local.disabled || local.loading}
      {...rest}
    >
      <Show when={local.loading}>
        <LoaderCircle class="size-3.5 animate-spin" />
      </Show>
      {local.children}
    </button>
  )
}
