/**
 * @beeve/ui - Input Component
 * 输入框组件
 */

import { splitProps, Show, createSignal, createMemo, type Component, type JSX } from 'solid-js'
import { X, Eye, EyeOff } from 'lucide-solid'
import { tv, type VariantProps } from 'tailwind-variants'

const inputVariants = tv({
  slots: {
    root: 'relative w-full',
    wrapper: [
      'flex items-center gap-2 w-full',
      'rounded-[var(--radius)] border bg-background',
      'transition-colors duration-200',
      'focus-within:ring-1 focus-within:ring-ring',
    ],
    input: [
      'flex-1 w-full bg-transparent outline-none',
      'placeholder:text-muted-foreground',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    ],
    prefix: 'flex items-center text-muted-foreground shrink-0',
    suffix: 'flex items-center gap-1 text-muted-foreground shrink-0',
    actionButton: [
      'flex items-center justify-center',
      'text-muted-foreground hover:text-foreground',
      'cursor-pointer transition-colors',
    ],
    count: 'absolute -bottom-5 right-0 text-xs text-muted-foreground',
  },
  variants: {
    size: {
      sm: {
        wrapper: 'h-7 px-2 text-xs',
        input: 'text-xs',
      },
      md: {
        wrapper: 'h-8 px-3 text-sm',
        input: 'text-sm',
      },
      lg: {
        wrapper: 'h-9 px-4 text-sm',
        input: 'text-sm',
      },
    },
    variant: {
      default: { wrapper: 'border-input hover:border-primary/50' },
      filled: { wrapper: '!border-transparent bg-muted hover:bg-muted/80' },
      borderless: { wrapper: '!border-transparent shadow-none hover:bg-accent/50' },
    },
    status: {
      error: { wrapper: '!border-destructive focus-within:ring-destructive/50' },
      warning: { wrapper: '!border-warning focus-within:ring-warning/50' },
    },
    disabled: {
      true: { wrapper: 'opacity-50 cursor-not-allowed bg-muted' },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

export type InputVariants = VariantProps<typeof inputVariants>

export interface InputProps extends InputVariants {
  /** 输入框值 */
  value?: string
  /** 默认值 */
  defaultValue?: string
  /** 占位符 */
  placeholder?: string
  /** 输入框类型 */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 最大长度 */
  maxLength?: number
  /** 前缀元素 */
  prefix?: JSX.Element
  /** 后缀元素 */
  suffix?: JSX.Element
  /** 自定义类名 */
  class?: string
  /** 输入框 ID */
  id?: string
  /** 名称 */
  name?: string
  /** 是否自动聚焦 */
  autofocus?: boolean
  /** 自动完成 */
  autocomplete?: string
  /** 允许一键清空 */
  allowClear?: boolean
  /** 显示字数统计 */
  showCount?: boolean

  /** 值变化回调 */
  onInput?: (value: string, e: InputEvent) => void
  /** 变化回调 */
  onChange?: (value: string, e: Event) => void
  /** 聚焦回调 */
  onFocus?: (e: FocusEvent) => void
  /** 失焦回调 */
  onBlur?: (e: FocusEvent) => void
  /** 按键回调 */
  onKeyDown?: (e: KeyboardEvent) => void
  /** 回车回调 */
  onPressEnter?: (e: KeyboardEvent) => void
  /** 清空回调 */
  onClear?: () => void
}

export const Input: Component<InputProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    [
      'class', 'prefix', 'suffix', 'value', 'defaultValue', 'type',
      'onInput', 'onChange', 'onKeyDown', 'onPressEnter', 'onClear',
      'allowClear', 'showCount', 'maxLength',
    ],
    ['size', 'variant', 'status', 'disabled']
  )

  let inputRef: HTMLInputElement | undefined

  // 内部值状态（用于非受控模式和字数统计）
  const [internalValue, setInternalValue] = createSignal(local.defaultValue ?? '')

  // 是否正在输入法组合中
  const [isComposing, setIsComposing] = createSignal(false)

  // 密码可见性状态
  const [passwordVisible, setPasswordVisible] = createSignal(false)

  // 是否为密码类型
  const isPassword = () => local.type === 'password'

  // 实际的 input type
  const inputType = createMemo(() => {
    if (isPassword()) {
      return passwordVisible() ? 'text' : 'password'
    }
    return local.type
  })

  // 当前显示的值
  const currentValue = createMemo(() => local.value ?? internalValue())

  // 清空按钮是否可见（有值且非禁用）
  const clearButtonVisible = createMemo(() =>
    currentValue().length > 0 && !variants.disabled
  )

  // 是否显示后缀区域（启用清空、密码类型或自定义后缀）
  const showSuffix = createMemo(() =>
    local.allowClear || isPassword() || local.suffix
  )

  // 字数统计文本
  const countText = createMemo(() => {
    const len = currentValue().length
    return local.maxLength ? `${len}/${local.maxLength}` : `${len}`
  })

  const styles = createMemo(() => inputVariants({
    size: variants.size,
    variant: variants.variant,
    status: variants.status,
    disabled: variants.disabled,
  }))

  const handleInput = (e: InputEvent) => {
    const target = e.target as HTMLInputElement
    setInternalValue(target.value)

    // 输入法组合中不触发回调
    if (isComposing()) { return }

    local.onInput?.(target.value, e)
  }

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    local.onChange?.(target.value, e)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    local.onKeyDown?.(e)
    if (e.key === 'Enter' && !isComposing()) {
      local.onPressEnter?.(e)
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = (e: CompositionEvent) => {
    setIsComposing(false)
    // 组合结束后触发 onInput
    const target = e.target as HTMLInputElement
    local.onInput?.(target.value, e as unknown as InputEvent)
  }

  const handleClear = () => {
    setInternalValue('')
    if (inputRef) {
      inputRef.value = ''
      inputRef.focus()
    }
    local.onInput?.('', new InputEvent('input'))
    local.onClear?.()
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible())
    inputRef?.focus()
  }

  return (
    <div class={styles().root()}>
      <div class={styles().wrapper({ class: local.class })}>
        <Show when={local.prefix}>
          <span class={styles().prefix()}>{local.prefix}</span>
        </Show>
        <input
          ref={inputRef}
          class={styles().input()}
          type={inputType()}
          value={currentValue()}
          disabled={variants.disabled}
          maxLength={local.maxLength}
          onInput={handleInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          {...rest}
        />
        <Show when={showSuffix()}>
          <span class={styles().suffix()}>
            {/* 清空按钮 - 始终占位，通过 invisible 控制可见性 */}
            <Show when={local.allowClear}>
              <button
                type="button"
                class={styles().actionButton()}
                classList={{ invisible: !clearButtonVisible() }}
                onClick={handleClear}
                tabIndex={clearButtonVisible() ? -1 : undefined}
                aria-label="清空"
                aria-hidden={!clearButtonVisible()}
              >
                <X class="size-3.5" />
              </button>
            </Show>
            {/* 密码切换按钮 */}
            <Show when={isPassword()}>
              <button
                type="button"
                class={styles().actionButton()}
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                aria-label={passwordVisible() ? '隐藏密码' : '显示密码'}
              >
                <Show when={passwordVisible()} fallback={<Eye class="size-3.5" />}>
                  <EyeOff class="size-3.5" />
                </Show>
              </button>
            </Show>
            {/* 自定义后缀 */}
            {local.suffix}
          </span>
        </Show>
      </div>
      <Show when={local.showCount}>
        <span class={styles().count()}>{countText()}</span>
      </Show>
    </div>
  )
}

