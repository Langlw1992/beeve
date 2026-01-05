/**
 * @beeve/ui - Checkbox Component
 * 复选框组件
 */

import { splitProps, Show, createMemo, createSignal, type Component, type JSX } from 'solid-js'
import { Check, Minus } from 'lucide-solid'
import { tv, type VariantProps } from 'tailwind-variants'

const checkboxVariants = tv({
  slots: {
    root: 'inline-flex items-center gap-2 cursor-pointer select-none',
    control: [
      'shrink-0 flex items-center justify-center',
      'rounded-sm border border-input bg-background',
      'transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20',
      'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground',
      'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground',
    ],
    label: 'text-foreground',
    input: 'sr-only',
  },
  variants: {
    size: {
      sm: {
        control: 'size-4',
        label: 'text-xs',
      },
      md: {
        control: 'size-5',
        label: 'text-sm',
      },
      lg: {
        control: 'size-6',
        label: 'text-base',
      },
    },
    disabled: {
      true: {
        root: 'cursor-not-allowed opacity-50',
        control: 'pointer-events-none',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type CheckboxVariants = VariantProps<typeof checkboxVariants>

export interface CheckboxProps extends CheckboxVariants {
  /** 选中状态 */
  checked?: boolean
  /** 默认选中状态 */
  defaultChecked?: boolean
  /** 不确定状态 */
  indeterminate?: boolean
  /** 禁用状态 */
  disabled?: boolean
  /** 复选框的值 */
  value?: string
  /** 名称 */
  name?: string
  /** 标签内容 */
  children?: JSX.Element
  /** 自定义类名 */
  class?: string
  /** ID */
  id?: string
  /** 状态变化回调 */
  onChange?: (checked: boolean) => void
}

export const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'children', 'checked', 'defaultChecked', 'indeterminate', 'onChange', 'id', 'name', 'value'],
    ['size', 'disabled']
  )

  // 内部状态用于非受控模式
  const [internalChecked, setInternalChecked] = createSignal(local.defaultChecked ?? false)

  const isControlled = () => local.checked !== undefined

  const checked = createMemo(() => {
    if (isControlled()) {
      return local.checked ?? false
    }
    return internalChecked()
  })

  const state = createMemo(() => {
    if (local.indeterminate) { return 'indeterminate' }
    return checked() ? 'checked' : 'unchecked'
  })

  const styles = createMemo(() => checkboxVariants({
    size: variants.size,
    disabled: variants.disabled,
  }))

  const handleChange = (e: Event) => {
    if (variants.disabled) { return }
    const target = e.target as HTMLInputElement
    // 非受控模式下更新内部状态
    if (!isControlled()) {
      setInternalChecked(target.checked)
    }
    local.onChange?.(target.checked)
  }

  return (
    <label class={styles().root({ class: local.class })} {...rest}>
      <input
        type="checkbox"
        class={styles().input()}
        checked={checked()}
        disabled={variants.disabled}
        name={local.name}
        value={local.value}
        id={local.id}
        onChange={handleChange}
        aria-checked={local.indeterminate ? 'mixed' : checked()}
      />
      <span class={styles().control()} data-state={state()}>
        <Show when={state() === 'checked'}>
          <Check class="size-3.5" strokeWidth={3} />
        </Show>
        <Show when={state() === 'indeterminate'}>
          <Minus class="size-3.5" strokeWidth={3} />
        </Show>
      </span>
      <Show when={local.children}>
        <span class={styles().label()}>{local.children}</span>
      </Show>
    </label>
  )
}

