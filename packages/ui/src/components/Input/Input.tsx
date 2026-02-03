/**
 * @beeve/ui - Input Component
 * 输入框组件，支持 text、textarea、number 等模式
 */

import {
  splitProps,
  Show,
  createSignal,
  createMemo,
  type Component,
  type JSX,
} from 'solid-js'
import {X, Eye, EyeOff, Plus, Minus} from 'lucide-solid'
import {tv, type VariantProps} from 'tailwind-variants'

const inputVariants = tv({
  slots: {
    root: 'relative w-full',
    wrapper: [
      'group/input flex gap-2 w-full',
      'rounded-[var(--radius)] border bg-background',
      'transition-colors duration-200',
      'focus-within:ring-1 focus-within:ring-primary/20',
    ],
    input: [
      'flex-1 w-full bg-transparent outline-none',
      'placeholder:text-muted-foreground',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      // 隐藏原生 number spinner
      '[appearance:textfield]',
      '[&::-webkit-outer-spin-button]:appearance-none',
      '[&::-webkit-inner-spin-button]:appearance-none',
    ],
    textarea: [
      'flex-1 w-full bg-transparent outline-none resize-y',
      'placeholder:text-muted-foreground',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    prefix: 'flex items-center text-muted-foreground shrink-0',
    suffix: 'flex items-center gap-1 text-muted-foreground shrink-0',
    actionButton: [
      'flex items-center justify-center',
      'text-muted-foreground hover:text-foreground',
      'cursor-pointer transition-colors',
    ],
    count: 'text-xs text-muted-foreground shrink-0 tabular-nums',
    footer: 'flex items-center justify-end px-3 pb-2',
    numberControls: [
      'flex flex-col border-l border-input',
      'w-0 overflow-hidden transition-[width] duration-150',
      'group-hover/input:w-6 group-focus-within/input:w-6',
    ],
    numberButton: [
      'flex items-center justify-center px-1.5',
      'text-muted-foreground hover:text-foreground hover:bg-accent/50',
      'cursor-pointer transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ],
  },
  variants: {
    size: {
      sm: {
        wrapper: 'text-xs',
        input: 'text-xs',
        textarea: 'text-xs',
      },
      md: {
        wrapper: 'text-sm',
        input: 'text-sm',
        textarea: 'text-sm',
      },
      lg: {
        wrapper: 'text-sm',
        input: 'text-sm',
        textarea: 'text-sm',
      },
    },
    variant: {
      default: {wrapper: 'border-input hover:border-primary/50'},
      filled: {wrapper: '!border-transparent bg-muted hover:bg-muted/80'},
      borderless: {
        wrapper: '!border-transparent shadow-none hover:bg-accent/50',
      },
    },
    status: {
      error: {
        wrapper:
          '!border-destructive text-destructive focus-within:ring-destructive/20',
      },
      warning: {
        wrapper: '!border-warning text-warning focus-within:ring-warning/20',
      },
    },
    disabled: {
      true: {wrapper: 'opacity-50 cursor-not-allowed bg-muted'},
    },
    inputType: {
      text: {
        wrapper: 'items-center',
      },
      textarea: {
        wrapper: 'flex-col',
      },
      number: {
        wrapper: 'items-center',
      },
    },
  },
  compoundVariants: [
    // text/number 模式的尺寸
    {inputType: 'text', size: 'sm', class: {wrapper: 'h-7 px-2'}},
    {inputType: 'text', size: 'md', class: {wrapper: 'h-8 px-3'}},
    {inputType: 'text', size: 'lg', class: {wrapper: 'h-9 px-4'}},
    {inputType: 'number', size: 'sm', class: {wrapper: 'h-7 pl-2 pr-0'}},
    {inputType: 'number', size: 'md', class: {wrapper: 'h-8 pl-3 pr-0'}},
    {inputType: 'number', size: 'lg', class: {wrapper: 'h-9 pl-4 pr-0'}},
    // textarea 模式的尺寸
    {
      inputType: 'textarea',
      size: 'sm',
      class: {textarea: 'px-2 py-1.5 min-h-[60px]'},
    },
    {
      inputType: 'textarea',
      size: 'md',
      class: {textarea: 'px-3 py-2 min-h-[80px]'},
    },
    {
      inputType: 'textarea',
      size: 'lg',
      class: {textarea: 'px-4 py-3 min-h-[100px]'},
    },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'default',
    inputType: 'text',
  },
})

export type InputVariants = VariantProps<typeof inputVariants>

export interface InputProps extends Omit<InputVariants, 'inputType'> {
  /** 输入模式: text (默认), textarea (多行), number (数字) */
  inputType?: 'text' | 'textarea' | 'number'
  /** 输入框值 */
  value?: string | number
  /** 默认值 */
  defaultValue?: string | number
  /** 占位符 */
  placeholder?: string
  /** 原生 input type (仅 inputType=text 时有效) */
  type?: 'text' | 'password' | 'email' | 'tel' | 'url' | 'search'
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

  // textarea 专用属性
  /** 行数 (仅 textarea 模式) */
  rows?: number

  // number 专用属性
  /** 最小值 (仅 number 模式) */
  min?: number
  /** 最大值 (仅 number 模式) */
  max?: number
  /** 步长 (仅 number 模式) */
  step?: number
  /** 显示增减按钮 (仅 number 模式) */
  showControls?: boolean

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
      'class',
      'prefix',
      'suffix',
      'value',
      'defaultValue',
      'type',
      'inputType',
      'onInput',
      'onChange',
      'onKeyDown',
      'onPressEnter',
      'onClear',
      'allowClear',
      'showCount',
      'maxLength',
      'rows',
      'min',
      'max',
      'step',
      'showControls',
    ],
    ['size', 'variant', 'status', 'disabled'],
  )

  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined

  // 内部值状态
  const [internalValue, setInternalValue] = createSignal(
    String(local.defaultValue ?? ''),
  )

  // 是否正在输入法组合中
  const [isComposing, setIsComposing] = createSignal(false)

  // 密码可见性状态
  const [passwordVisible, setPasswordVisible] = createSignal(false)

  // 输入模式
  const mode = () => local.inputType ?? 'text'
  const isTextarea = () => mode() === 'textarea'
  const isNumber = () => mode() === 'number'
  const isPassword = () =>
    local.type === 'password' && !isTextarea() && !isNumber()

  // 实际的 input type
  const nativeType = createMemo(() => {
    if (isNumber()) {
      return 'number'
    }
    if (isPassword()) {
      return passwordVisible() ? 'text' : 'password'
    }
    return local.type ?? 'text'
  })

  // 当前显示的值
  const currentValue = createMemo(() => {
    const val = local.value ?? internalValue()
    return String(val)
  })

  // 数值
  const numericValue = createMemo(() => {
    const val = currentValue()
    const num = Number.parseFloat(val)
    return Number.isNaN(num) ? 0 : num
  })

  // 清空按钮是否可见
  const clearButtonVisible = createMemo(
    () => currentValue().length > 0 && !variants.disabled,
  )

  // 是否显示后缀区域
  const showSuffix = createMemo(
    () =>
      !isTextarea() &&
      (local.allowClear || isPassword() || local.showCount || local.suffix),
  )

  // 字数统计文本
  const countText = createMemo(() => {
    const len = currentValue().length
    return local.maxLength ? `${len}/${local.maxLength}` : `${len}`
  })

  const styles = createMemo(() =>
    inputVariants({
      size: variants.size,
      variant: variants.variant,
      status: variants.status,
      disabled: variants.disabled,
      inputType: mode(),
    }),
  )

  const handleInput = (e: InputEvent) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement
    setInternalValue(target.value)
    if (isComposing()) {
      return
    }
    local.onInput?.(target.value, e)
  }

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement
    local.onChange?.(target.value, e)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    local.onKeyDown?.(e)
    if (e.key === 'Enter' && !isComposing() && !isTextarea()) {
      local.onPressEnter?.(e)
    }
  }

  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = (e: CompositionEvent) => {
    setIsComposing(false)
    const target = e.target as HTMLInputElement | HTMLTextAreaElement
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

  // Number 模式的增减
  const canIncrement = () =>
    local.max === undefined || numericValue() < local.max
  const canDecrement = () =>
    local.min === undefined || numericValue() > local.min

  const handleIncrement = () => {
    if (variants.disabled || !canIncrement()) {
      return
    }
    const step = local.step ?? 1
    const newVal = Math.min(
      numericValue() + step,
      local.max ?? Number.POSITIVE_INFINITY,
    )
    setInternalValue(String(newVal))
    local.onInput?.(String(newVal), new InputEvent('input'))
  }

  const handleDecrement = () => {
    if (variants.disabled || !canDecrement()) {
      return
    }
    const step = local.step ?? 1
    const newVal = Math.max(
      numericValue() - step,
      local.min ?? Number.NEGATIVE_INFINITY,
    )
    setInternalValue(String(newVal))
    local.onInput?.(String(newVal), new InputEvent('input'))
  }

  // 共用的输入属性（不包括 value，因为需要响应式绑定）
  const inputProps = {
    disabled: variants.disabled,
    maxLength: local.maxLength,
    onInput: handleInput,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    ...rest,
  }

  return (
    <div class={styles().root()}>
      <div class={styles().wrapper({class: local.class})}>
        {/* Prefix - 仅非 textarea 模式 */}
        <Show when={!isTextarea() && local.prefix}>
          <span class={styles().prefix()}>{local.prefix}</span>
        </Show>

        {/* Textarea 模式 */}
        <Show when={isTextarea()}>
          <textarea
            ref={inputRef as HTMLTextAreaElement}
            class={styles().textarea()}
            rows={local.rows ?? 3}
            value={currentValue()}
            {...inputProps}
          />
          <Show when={local.showCount}>
            <div class={styles().footer()}>
              <span class={styles().count()}>{countText()}</span>
            </div>
          </Show>
        </Show>

        {/* Text/Number 模式 */}
        <Show when={!isTextarea()}>
          <input
            ref={inputRef as HTMLInputElement}
            class={styles().input()}
            type={nativeType()}
            min={local.min}
            max={local.max}
            step={local.step}
            value={currentValue()}
            {...inputProps}
          />
        </Show>

        {/* Suffix 区域 - 仅非 textarea 模式 */}
        <Show when={showSuffix()}>
          <span class={styles().suffix()}>
            <Show when={local.allowClear}>
              <button
                type="button"
                class={styles().actionButton()}
                classList={{invisible: !clearButtonVisible()}}
                onClick={handleClear}
                tabIndex={clearButtonVisible() ? -1 : undefined}
                aria-label="清空"
                aria-hidden={!clearButtonVisible()}
              >
                <X class="size-3.5" />
              </button>
            </Show>
            <Show when={isPassword()}>
              <button
                type="button"
                class={styles().actionButton()}
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                aria-label={passwordVisible() ? '隐藏密码' : '显示密码'}
              >
                <Show
                  when={passwordVisible()}
                  fallback={<Eye class="size-3.5" />}
                >
                  <EyeOff class="size-3.5" />
                </Show>
              </button>
            </Show>
            <Show when={local.showCount && !isTextarea()}>
              <span class={styles().count()}>{countText()}</span>
            </Show>
            {local.suffix}
          </span>
        </Show>

        {/* Number 模式的增减按钮 */}
        <Show when={isNumber() && local.showControls}>
          <div class={styles().numberControls()}>
            <button
              type="button"
              class={styles().numberButton()}
              onClick={handleIncrement}
              disabled={variants.disabled || !canIncrement()}
              tabIndex={-1}
              aria-label="增加"
            >
              <Plus class="size-3" />
            </button>
            <button
              type="button"
              class={styles().numberButton()}
              onClick={handleDecrement}
              disabled={variants.disabled || !canDecrement()}
              tabIndex={-1}
              aria-label="减少"
            >
              <Minus class="size-3" />
            </button>
          </div>
        </Show>
      </div>
    </div>
  )
}
