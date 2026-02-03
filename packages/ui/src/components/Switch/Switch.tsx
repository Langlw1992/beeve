/**
 * @beeve/ui - Switch Component
 * 开关组件
 */

import {
  splitProps,
  Show,
  createMemo,
  createSignal,
  type Component,
  type JSX,
} from 'solid-js'
import {tv, type VariantProps} from 'tailwind-variants'

const switchVariants = tv({
  slots: {
    root: 'inline-flex items-center gap-2 cursor-pointer select-none',
    track: [
      'relative shrink-0 rounded-full',
      'bg-input transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20',
      'data-[state=checked]:bg-primary',
    ],
    thumb: [
      'absolute top-1/2 -translate-y-1/2 rounded-full bg-background shadow-sm',
      'transition-all duration-200',
      'data-[state=unchecked]:left-0.5',
    ],
    label: 'text-foreground',
    input: 'sr-only',
  },
  variants: {
    size: {
      sm: {
        track: 'h-4 w-7',
        thumb: 'size-3 data-[state=checked]:left-[calc(100%-0.875rem)]',
        label: 'text-xs',
      },
      md: {
        track: 'h-5 w-9',
        thumb: 'size-4 data-[state=checked]:left-[calc(100%-1.125rem)]',
        label: 'text-sm',
      },
      lg: {
        track: 'h-6 w-11',
        thumb: 'size-5 data-[state=checked]:left-[calc(100%-1.375rem)]',
        label: 'text-base',
      },
    },
    disabled: {
      true: {
        root: 'cursor-not-allowed opacity-50',
        track: 'pointer-events-none',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type SwitchVariants = VariantProps<typeof switchVariants>

export interface SwitchProps extends SwitchVariants {
  /** 开关状态 */
  checked?: boolean
  /** 默认开关状态 */
  defaultChecked?: boolean
  /** 禁用状态 */
  disabled?: boolean
  /** 名称 */
  name?: string
  /** 值 */
  value?: string
  /** 标签内容 */
  children?: JSX.Element
  /** 自定义类名 */
  class?: string
  /** ID */
  id?: string
  /** 状态变化回调 */
  onChange?: (checked: boolean) => void
}

export const Switch: Component<SwitchProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    [
      'class',
      'children',
      'checked',
      'defaultChecked',
      'onChange',
      'id',
      'name',
      'value',
    ],
    ['size', 'disabled'],
  )

  // 内部状态用于非受控模式
  const [internalChecked, setInternalChecked] = createSignal(
    local.defaultChecked ?? false,
  )

  const isControlled = () => local.checked !== undefined

  const checked = createMemo(() => {
    if (isControlled()) {
      return local.checked ?? false
    }
    return internalChecked()
  })

  const state = () => (checked() ? 'checked' : 'unchecked')

  const styles = createMemo(() =>
    switchVariants({
      size: variants.size,
      disabled: variants.disabled,
    }),
  )

  const handleChange = (e: Event) => {
    if (variants.disabled) {
      return
    }
    const target = e.target as HTMLInputElement
    // 非受控模式下更新内部状态
    if (!isControlled()) {
      setInternalChecked(target.checked)
    }
    local.onChange?.(target.checked)
  }

  return (
    <label
      class={styles().root({class: local.class})}
      {...rest}
    >
      <input
        type="checkbox"
        role="switch"
        class={styles().input()}
        checked={checked()}
        disabled={variants.disabled}
        name={local.name}
        value={local.value}
        id={local.id}
        onChange={handleChange}
        aria-checked={checked()}
      />
      <span
        class={styles().track()}
        data-state={state()}
      >
        <span
          class={styles().thumb()}
          data-state={state()}
        />
      </span>
      <Show when={local.children}>
        <span class={styles().label()}>{local.children}</span>
      </Show>
    </label>
  )
}
