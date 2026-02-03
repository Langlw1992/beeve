/**
 * @beeve/ui - Popover Component
 * 气泡卡片组件，基于 @zag-js/popover 和 @zag-js/hover-card 实现
 */

import {Show, splitProps, createMemo, type Component, type JSX} from 'solid-js'
import {Portal} from 'solid-js/web'
import {tv, type VariantProps} from 'tailwind-variants'
import {
  usePopover,
  type PopoverProps as BaseProps,
} from '../../primitives/popover'

// ==================== 样式定义 ====================

const popoverStyles = tv({
  slots: {
    positioner: 'z-50',
    content: [
      'min-w-[200px] rounded-lg border border-border bg-popover p-4 shadow-md outline-none',
      'animate-in fade-in-0 zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    ],
    arrow: ['[--arrow-size:8px]', '[--arrow-background:var(--color-popover)]'],
    arrowTip: 'border-border',
    trigger:
      'inline-flex bg-transparent border-none p-0 font-inherit cursor-inherit',
    title: 'mb-1 text-sm font-medium leading-none',
    description: 'text-sm text-muted-foreground',
    closeTrigger: [
      'absolute top-2 right-2 size-6 inline-flex items-center justify-center',
      'rounded-sm opacity-70 ring-offset-background transition-opacity',
      'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:pointer-events-none',
    ],
  },
})

/** 根据 placement 获取箭头边框类（箭头是 45° 旋转的正方形，只显示两边形成三角形） */
const getArrowTipBorderClass = (placement: string) => {
  if (placement.startsWith('bottom')) {
    return 'border-t border-l'
  }
  if (placement.startsWith('top')) {
    return 'border-b border-r'
  }
  if (placement.startsWith('left')) {
    return 'border-t border-r'
  }
  if (placement.startsWith('right')) {
    return 'border-b border-l'
  }
  return 'border-t border-l'
}

// 预先计算样式，避免在子组件中重复调用
const styles = popoverStyles()

// ==================== 类型定义 ====================

export interface PopoverProps
  extends BaseProps,
    VariantProps<typeof popoverStyles> {
  /** 触发元素 */
  children: JSX.Element
  /** Popover 内容 */
  content: JSX.Element
  /** 是否显示箭头，默认 false */
  arrow?: boolean
  /** 自定义内容类名 */
  contentClass?: string
}

export interface PopoverTitleProps {
  children: JSX.Element
  class?: string
}

export interface PopoverDescriptionProps {
  children: JSX.Element
  class?: string
}

// ==================== 子组件 ====================

export const PopoverTitle: Component<PopoverTitleProps> = (props) => (
  <div class={styles.title({class: props.class})}>{props.children}</div>
)

export const PopoverDescription: Component<PopoverDescriptionProps> = (
  props,
) => (
  <div class={styles.description({class: props.class})}>{props.children}</div>
)

// ==================== 主组件 ====================

export const Popover: Component<PopoverProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'content',
    'children',
    'arrow',
    'contentClass',
  ])

  const {api, isHover} = usePopover(rest)

  const arrowTipClass = createMemo(() => {
    const positionerProps = api().getPositionerProps()
    const placement = (positionerProps['data-placement'] as string) || 'bottom'
    return `${styles.arrowTip()} ${getArrowTipBorderClass(placement)}`
  })

  return (
    <>
      {/* Trigger */}
      {isHover ? (
        <span
          {...api().getTriggerProps()}
          class={styles.trigger()}
        >
          {local.children}
        </span>
      ) : (
        <button
          {...api().getTriggerProps()}
          type="button"
          class={styles.trigger()}
        >
          {local.children}
        </button>
      )}

      {/* Content */}
      <Show when={api().open}>
        <Portal>
          <div
            {...api().getPositionerProps()}
            class={styles.positioner()}
          >
            <Show when={local.arrow}>
              <div
                {...api().getArrowProps()}
                class={styles.arrow()}
              >
                <div
                  {...api().getArrowTipProps()}
                  class={arrowTipClass()}
                />
              </div>
            </Show>
            <div
              {...api().getContentProps()}
              class={styles.content({class: local.contentClass})}
            >
              {local.content}
            </div>
          </div>
        </Portal>
      </Show>
    </>
  )
}
