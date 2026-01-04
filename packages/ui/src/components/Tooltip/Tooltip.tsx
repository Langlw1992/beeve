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
    // zag-js 会设置 arrow 的 position/size，我们只需要设置 CSS 变量
    // --arrow-size 和 --arrow-background 必须定义在 arrow 元素上
    arrow: '[--arrow-size:8px] [--arrow-background:var(--color-foreground)]',
    arrowTip: '',
  },
})

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
  const styles = tooltipStyles()

  return (
    <>
      {/* Trigger - 使用 asChild 模式，包装 children */}
      {(() => {
        const triggerProps = api().getTriggerProps()
        return (
          <button
            {...triggerProps}
            type="button"
            class="inline-flex"
            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'inherit' }}
          >
            {local.children}
          </button>
        )
      })()}

      {/* Content */}
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()} class={styles.positioner()}>
            {/* Arrow - 必须放在 positioner 内、content 外 */}
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

