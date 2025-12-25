/**
 * @beeve/ui - Button Component
 * 按钮组件
 */

import { splitProps, type Component, type JSX } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'

const buttonVariants = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-lg',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  variants: {
    variant: {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
      outline:
        'border border-slate-300 bg-transparent hover:bg-slate-100 focus-visible:ring-slate-500 dark:border-slate-700 dark:hover:bg-slate-800',
      ghost: 'bg-transparent hover:bg-slate-100 focus-visible:ring-slate-500 dark:hover:bg-slate-800',
      destructive: 'bg-error-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
      link: 'text-primary-500 underline-offset-4 hover:underline',
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

export type ButtonVariants = VariantProps<typeof buttonVariants>

export interface ButtonProps extends ButtonVariants {
  class?: string
  children?: JSX.Element
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: (e: MouseEvent) => void
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, variants, rest] = splitProps(props, ['class', 'children'], ['variant', 'size'])

  return (
    <button class={buttonVariants({ ...variants, class: local.class })} {...rest}>
      {local.children}
    </button>
  )
}
