/**
 * @beeve/ui - Select Component
 * 选择器组件，基于 Zag.js combobox 实现
 */

import { splitProps, Show, For, type Component } from 'solid-js'
import { Portal } from 'solid-js/web'
import { tv } from 'tailwind-variants'
import { ChevronDown, X, LoaderCircle } from 'lucide-solid'
import { useSelect } from '../../primitives/select'
import type { SelectProps } from '../../primitives/select'

// ==================== 样式定义 ====================

const selectStyles = tv({
  slots: {
    root: 'relative inline-block w-full',
    control: [
      'flex items-center gap-2 w-full',
      'rounded-[var(--radius)] border bg-background',
      'transition-colors duration-200',
      'cursor-pointer',
      'focus-within:ring-1 focus-within:ring-primary/20',
    ],
    input: [
      'flex-1 bg-transparent outline-none cursor-pointer',
      'placeholder:text-muted-foreground',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    trigger: [
      'flex items-center justify-center',
      'text-muted-foreground',
      'transition-transform duration-200',
    ],
    clearButton: [
      'flex items-center justify-center',
      'text-muted-foreground hover:text-foreground',
      'transition-colors',
    ],
    positioner: 'z-50',
    content: [
      'bg-popover text-popover-foreground',
      'rounded-[var(--radius)] border shadow-md',
      'max-h-60 overflow-auto',
      'animate-in fade-in-0 zoom-in-95',
    ],
    item: [
      'relative flex items-center px-3 py-2 cursor-pointer',
      'outline-none transition-colors',
      'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
      'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
      'data-[state=checked]:bg-accent/50',
    ],
    empty: 'py-6 text-center text-sm text-muted-foreground',
    loading: 'flex items-center justify-center py-4',
  },
  variants: {
    size: {
      sm: { control: 'h-7 px-2 text-xs', input: 'text-xs', item: 'text-xs py-1' },
      md: { control: 'h-8 px-3 text-sm', input: 'text-sm', item: 'text-sm py-1.5' },
      lg: { control: 'h-9 px-4 text-sm', input: 'text-sm', item: 'text-sm py-2' },
    },
    variant: {
      default: { control: 'border-input hover:border-primary/50' },
      filled: { control: 'border-transparent bg-muted hover:bg-muted/80' },
      borderless: { control: 'border-transparent hover:bg-accent/50' },
    },
    status: {
      error: { control: '!border-destructive focus-within:ring-destructive/20' },
      warning: { control: '!border-warning focus-within:ring-warning/20' },
    },
    disabled: {
      true: { control: 'opacity-50 cursor-not-allowed', input: 'cursor-not-allowed' },
    },
    open: {
      true: { trigger: 'rotate-180' },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

// ==================== 组件实现 ====================

export const Select: Component<SelectProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'class',
    'size',
    'variant',
    'status',
    'allowClear',
    'notFoundContent',
  ])

  // loading 和 disabled 需要传递给 useSelect
  const { api, filteredOptions } = useSelect(rest)

  // 计算是否禁用 (disabled 或 loading 状态)
  const isDisabled = () => rest.disabled || rest.loading

  // 是否有选中的值 - 使用 selectedItems 更可靠
  const hasSelectedValue = () => {
    const items = api().selectedItems
    return items && items.length > 0
  }

  const styles = () =>
    selectStyles({
      size: local.size,
      variant: local.variant,
      status: local.status,
      disabled: isDisabled(),
      open: api().open,
    })

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    api().clearValue()
    rest.onClear?.()
  }

  return (
    <div class={styles().root({ class: local.class })} {...api().getRootProps()}>
      {/* Control */}
      <div {...api().getControlProps()} class={styles().control()}>
        <input
          {...api().getInputProps()}
          class={`${styles().input()} ${!rest.showSearch ? 'caret-transparent selection:bg-transparent' : ''}`}
        />

        {/* Clear Button - 只在有选中值时显示 */}
        <Show when={local.allowClear && hasSelectedValue() && !isDisabled()}>
          <button
            type="button"
            aria-label="Clear"
            class={styles().clearButton()}
            onClick={handleClear}
          >
            <X class="size-3.5" />
          </button>
        </Show>

        {/* Loading Indicator */}
        <Show when={rest.loading}>
          <div data-testid="select-loading" class={styles().loading()}>
            <LoaderCircle class="size-3.5 animate-spin" />
          </div>
        </Show>

        {/* Trigger */}
        <button {...api().getTriggerProps()} class={styles().trigger()}>
          <ChevronDown class="size-3.5" />
        </button>
      </div>

      {/* Dropdown - Positioner 始终渲染，由 zag-js 控制显示/隐藏 */}
      <Portal>
        <div {...api().getPositionerProps()} class={styles().positioner()}>
          <Show when={api().open}>
            <ul {...api().getContentProps()} class={styles().content()}>
              <Show
                when={filteredOptions().length > 0}
                fallback={
                  <li class={styles().empty()}>
                    {local.notFoundContent ?? 'No data'}
                  </li>
                }
              >
                <For each={filteredOptions()}>
                  {(option) => (
                    <li {...api().getItemProps({ item: option })} class={styles().item()}>
                      {rest.optionRender
                        ? rest.optionRender(option, {
                            selected: api().value.includes(String(option.value)),
                            highlighted: api().highlightedValue === String(option.value),
                            disabled: option.disabled ?? false,
                          })
                        : option.label}
                    </li>
                  )}
                </For>
              </Show>
            </ul>
          </Show>
        </div>
      </Portal>
    </div>
  )
}

