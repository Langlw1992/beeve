/**
 * @beeve/ui - NumberInput Component
 * 数字输入框组件，基于 @zag-js/number-input 实现
 */

import { splitProps, Show, type Component } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'
import { ChevronUp, ChevronDown } from 'lucide-solid'
import { useNumberInput } from '../../primitives/number-input'
import type { NumberInputProps as BaseProps } from '../../primitives/number-input'

// ==================== 样式定义 ====================

const numberInputStyles = tv({
  slots: {
    root: 'relative inline-flex w-full',
    control: [
      'flex items-center w-full',
      'rounded-[var(--radius)] border bg-background',
      'transition-colors duration-200',
      'focus-within:ring-1 focus-within:ring-ring',
    ],
    input: [
      'flex-1 w-full bg-transparent outline-none tabular-nums',
      'placeholder:text-muted-foreground',
      'disabled:cursor-not-allowed disabled:opacity-50',
      // 隐藏原生 spinner
      '[appearance:textfield]',
      '[&::-webkit-outer-spin-button]:appearance-none',
      '[&::-webkit-inner-spin-button]:appearance-none',
    ],
    spinGroup: 'flex flex-col border-l border-input -my-px -mr-px',
    spinButton: [
      'flex items-center justify-center px-1.5',
      'text-muted-foreground hover:text-foreground hover:bg-accent/50',
      'cursor-pointer transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
      'first:rounded-tr-[calc(var(--radius)-1px)]',
      'last:rounded-br-[calc(var(--radius)-1px)]',
    ],
  },
  variants: {
    size: {
      sm: {
        control: 'h-7 text-xs',
        input: 'px-2 text-xs',
        spinButton: 'w-5',
      },
      md: {
        control: 'h-8 text-sm',
        input: 'px-3 text-sm',
        spinButton: 'w-6',
      },
      lg: {
        control: 'h-9 text-sm',
        input: 'px-4 text-sm',
        spinButton: 'w-7',
      },
    },
    variant: {
      default: { control: 'border-input hover:border-primary/50' },
      filled: { control: 'border-transparent bg-muted hover:bg-muted/80' },
      borderless: { control: 'border-transparent hover:bg-accent/50' },
    },
    status: {
      error: { control: 'border-destructive focus-within:ring-destructive/50' },
      warning: { control: 'border-warning focus-within:ring-warning/50' },
    },
    disabled: {
      true: { control: 'opacity-50 cursor-not-allowed', input: 'cursor-not-allowed' },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

// ==================== 类型定义 ====================

export interface NumberInputComponentProps extends BaseProps, VariantProps<typeof numberInputStyles> {
  /** 自定义类名 */
  class?: string
  /** 是否显示增减按钮 */
  showControls?: boolean
}

// ==================== 组件实现 ====================

export const NumberInput: Component<NumberInputComponentProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'showControls', 'placeholder'],
    ['size', 'variant', 'status', 'disabled']
  )

  const { api } = useNumberInput(rest)

  const styles = () => numberInputStyles({
    size: variants.size,
    variant: variants.variant,
    status: variants.status,
    disabled: variants.disabled,
  })

  return (
    <div {...api().getRootProps()} class={styles().root({ class: local.class })}>
      <div {...api().getControlProps()} class={styles().control()}>
        <input
          {...api().getInputProps()}
          class={styles().input()}
          placeholder={local.placeholder}
        />
        <Show when={local.showControls !== false}>
          <div class={styles().spinGroup()}>
            <button
              {...api().getIncrementTriggerProps()}
              class={styles().spinButton()}
              type="button"
            >
              <ChevronUp class="size-3" />
            </button>
            <button
              {...api().getDecrementTriggerProps()}
              class={styles().spinButton()}
              type="button"
            >
              <ChevronDown class="size-3" />
            </button>
          </div>
        </Show>
      </div>
    </div>
  )
}

