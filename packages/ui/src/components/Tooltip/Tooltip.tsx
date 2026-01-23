/**
 * @beeve/ui - Tooltip Component
 * 文字提示组件，基于 @zag-js/tooltip 实现
 */

import { Show, splitProps, type Component, type JSX } from 'solid-js'
import { Portal } from 'solid-js/web'
import { tv, type VariantProps } from 'tailwind-variants'
import { useTooltip, type TooltipProps as BaseProps } from '../../primitives/tooltip'

// ==================== 样式定义 ====================

const tooltipStyles = tv({
  slots: {
    positioner: 'z-50',
    content: [
      'px-2.5 py-1.5 text-xs font-medium',
      'bg-foreground text-background',
      'rounded-md shadow-md',
      'animate-in fade-in-0 zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    ],
    arrow: '[--arrow-size:8px] [--arrow-background:var(--color-foreground)]',
    arrowTip: '',
    trigger: 'inline-flex bg-transparent border-none p-0 font-inherit cursor-inherit',
  },
})

// 预先计算样式，避免重复调用
const styles = tooltipStyles()

// ==================== 类型定义 ====================

export interface TooltipProps extends BaseProps, VariantProps<typeof tooltipStyles> {
  /** Tooltip 内容 */
  content: JSX.Element
  /** 触发元素 */
  children: JSX.Element
  /** 是否显示箭头，默认 false */
  arrow?: boolean
  /** 自定义内容类名 */
  contentClass?: string
}

// ==================== 组件实现 ====================

export const Tooltip: Component<TooltipProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'content',
    'children',
    'arrow',
    'contentClass',
  ])

  const { api } = useTooltip(rest)

  return (
    <>
      {/* Trigger */}
      <button {...api().getTriggerProps()} type="button" class={styles.trigger()}>
        {local.children}
      </button>

      {/* Content */}
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()} class={styles.positioner()}>
            <Show when={local.arrow}>
              <div {...api().getArrowProps()} class={styles.arrow()}>
                <div {...api().getArrowTipProps()} class={styles.arrowTip()} />
              </div>
            </Show>
            <div
              {...api().getContentProps()}
              class={styles.content({ class: local.contentClass })}
            >
              {local.content}
            </div>
          </div>
        </Portal>
      </Show>
    </>
  )
}

