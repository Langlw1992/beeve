/**
 * @beeve/ui - Radio Component
 * 单选框组件
 */

import { splitProps, Show, createMemo, createSignal, createContext, useContext, type Component, type JSX, type Accessor } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'

const radioVariants = tv({
  slots: {
    root: 'inline-flex items-center gap-2 cursor-pointer select-none',
    control: [
      'shrink-0 flex items-center justify-center',
      'rounded-full border border-input bg-background',
      'transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20',
      'data-[state=checked]:border-primary',
    ],
    indicator: [
      'rounded-full bg-primary',
      'transition-transform duration-200',
      'scale-0 data-[state=checked]:scale-100',
    ],
    label: 'text-foreground',
    input: 'sr-only',
  },
  variants: {
    size: {
      sm: {
        control: 'size-4',
        indicator: 'size-2',
        label: 'text-xs',
      },
      md: {
        control: 'size-5',
        indicator: 'size-2.5',
        label: 'text-sm',
      },
      lg: {
        control: 'size-6',
        indicator: 'size-3',
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

export type RadioVariants = VariantProps<typeof radioVariants>

// ==================== Radio Group Context ====================
interface RadioGroupContextValue {
  name?: string
  value: Accessor<string | undefined>
  onChange: (value: string) => void
  disabled?: boolean
  size?: RadioVariants['size']
}

const RadioGroupContext = createContext<RadioGroupContextValue>()

export const useRadioGroup = () => useContext(RadioGroupContext)

// ==================== Radio Group ====================
export interface RadioGroupProps {
  /** 当前选中值 */
  value?: string
  /** 默认选中值 */
  defaultValue?: string
  /** 名称 */
  name?: string
  /** 禁用 */
  disabled?: boolean
  /** 尺寸 */
  size?: RadioVariants['size']
  /** 子元素 */
  children?: JSX.Element
  /** 自定义类名 */
  class?: string
  /** 值变化回调 */
  onChange?: (value: string) => void
}

export const RadioGroup: Component<RadioGroupProps> = (props) => {
  const [local, rest] = splitProps(props, ['value', 'defaultValue', 'name', 'disabled', 'size', 'children', 'class', 'onChange'])

  // 内部状态用于非受控模式
  const [internalValue, setInternalValue] = createSignal(local.defaultValue)

  const isControlled = () => local.value !== undefined

  const value = createMemo(() => {
    if (isControlled()) {
      return local.value
    }
    return internalValue()
  })

  const handleChange = (newValue: string) => {
    if (!isControlled()) {
      setInternalValue(newValue)
    }
    local.onChange?.(newValue)
  }

  return (
    <RadioGroupContext.Provider
      value={{
        name: local.name,
        value,
        onChange: handleChange,
        disabled: local.disabled,
        size: local.size,
      }}
    >
      <div class={local.class} role="radiogroup" {...rest}>
        {local.children}
      </div>
    </RadioGroupContext.Provider>
  )
}

// ==================== Radio ====================
export interface RadioProps extends RadioVariants {
  /** 单选框的值 */
  value: string
  /** 是否选中（独立使用时） */
  checked?: boolean
  /** 禁用状态 */
  disabled?: boolean
  /** 名称（独立使用时） */
  name?: string
  /** 标签内容 */
  children?: JSX.Element
  /** 自定义类名 */
  class?: string
  /** ID */
  id?: string
  /** 状态变化回调（独立使用时） */
  onChange?: (checked: boolean) => void
}

export const Radio: Component<RadioProps> = (props) => {
  const group = useRadioGroup()

  const [local, variants, rest] = splitProps(
    props,
    ['class', 'children', 'checked', 'onChange', 'id', 'name', 'value'],
    ['size', 'disabled']
  )

  const isDisabled = () => variants.disabled ?? group?.disabled
  const size = () => variants.size ?? group?.size ?? 'md'

  const isChecked = createMemo(() => {
    if (group) {
      return group.value() === local.value
    }
    return local.checked ?? false
  })

  const state = () => isChecked() ? 'checked' : 'unchecked'

  const styles = createMemo(() => radioVariants({
    size: size(),
    disabled: isDisabled(),
  }))

  const handleChange = () => {
    if (isDisabled()) { return }
    if (group) {
      group.onChange(local.value)
    } else {
      local.onChange?.(true)
    }
  }

  return (
    <label class={styles().root({ class: local.class })} {...rest}>
      <input
        type="radio"
        class={styles().input()}
        checked={isChecked()}
        disabled={isDisabled()}
        name={group?.name ?? local.name}
        value={local.value}
        id={local.id}
        onChange={handleChange}
      />
      <span class={styles().control()} data-state={state()}>
        <span class={styles().indicator()} data-state={state()} />
      </span>
      <Show when={local.children}>
        <span class={styles().label()}>{local.children}</span>
      </Show>
    </label>
  )
}

