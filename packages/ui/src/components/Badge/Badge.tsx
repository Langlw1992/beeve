/**
 * @beeve/ui - Badge Component
 * 徽标组件，用于展示状态标记
 *
 * @example
 * ```tsx
 * // 数字徽标
 * <Badge count={5}>
 *   <Avatar />
 * </Badge>
 *
 * // 小红点
 * <Badge dot>
 *   <Bell />
 * </Badge>
 *
 * // 状态点
 * <Badge status="success" text="已完成" />
 * ```
 */

import { splitProps, Show, createMemo, type Component, type JSX } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'

// ==================== 样式定义 ====================

const badgeVariants = tv({
  slots: {
    root: 'relative inline-flex',
    badge: [
      'flex items-center justify-center',
      'font-normal text-white rounded-full',
      'shadow-sm',
    ],
    dot: 'rounded-full shadow-sm',
    statusDot: 'rounded-full',
    statusText: 'text-foreground',
  },
  variants: {
    color: {
      default: { badge: 'bg-destructive', dot: 'bg-destructive', statusDot: 'bg-muted-foreground' },
      blue: { badge: 'bg-blue-500', dot: 'bg-blue-500', statusDot: 'bg-blue-500' },
      green: { badge: 'bg-green-500', dot: 'bg-green-500', statusDot: 'bg-green-500' },
      orange: { badge: 'bg-orange-500', dot: 'bg-orange-500', statusDot: 'bg-orange-500' },
      red: { badge: 'bg-destructive', dot: 'bg-destructive', statusDot: 'bg-destructive' },
    },
    status: {
      default: { statusDot: 'bg-muted-foreground' },
      success: { statusDot: 'bg-green-500' },
      processing: { statusDot: 'bg-blue-500 animate-pulse' },
      error: { statusDot: 'bg-destructive' },
      warning: { statusDot: 'bg-orange-500' },
    },
    size: {
      sm: { badge: 'min-w-[16px] h-4 text-[10px] px-1', dot: 'size-1.5', statusDot: 'size-1.5' },
      md: { badge: 'min-w-[18px] h-[18px] text-[11px] px-1.5', dot: 'size-2', statusDot: 'size-2' },
    },
    placement: {
      'top-right': {},
      'top-left': {},
      'bottom-right': {},
      'bottom-left': {},
    },
    standalone: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    // 附着模式下的位置样式
    {
      standalone: false,
      placement: 'top-right',
      class: {
        badge: 'absolute -top-2 -right-2 origin-center',
        dot: 'absolute top-0 right-0 origin-center',
      },
    },
    {
      standalone: false,
      placement: 'top-left',
      class: {
        badge: 'absolute -top-2 -left-2 origin-center',
        dot: 'absolute top-0 left-0 origin-center',
      },
    },
    {
      standalone: false,
      placement: 'bottom-right',
      class: {
        badge: 'absolute -bottom-2 -right-2 origin-center',
        dot: 'absolute bottom-0 right-0 origin-center',
      },
    },
    {
      standalone: false,
      placement: 'bottom-left',
      class: {
        badge: 'absolute -bottom-2 -left-2 origin-center',
        dot: 'absolute bottom-0 left-0 origin-center',
      },
    },
  ],
  defaultVariants: {
    color: 'default',
    status: 'default',
    size: 'md',
    placement: 'top-right',
    standalone: false,
  },
})

export type BadgeVariants = VariantProps<typeof badgeVariants>

// ==================== 类型定义 ====================

export interface BadgeProps {
  /** 显示的数字或自定义内容 */
  count?: number | JSX.Element
  /** 数字溢出时的最大值 */
  overflowCount?: number
  /** 显示小红点 */
  dot?: boolean
  /** 是否显示 0 */
  showZero?: boolean
  /** 颜色 */
  color?: BadgeVariants['color']
  /** 状态（用于独立状态点） */
  status?: BadgeVariants['status']
  /** 状态文本（与 status 配合使用） */
  text?: string
  /** 尺寸 */
  size?: BadgeVariants['size']
  /** 位置 */
  placement?: BadgeVariants['placement']
  /** 位置偏移 [x, y] */
  offset?: [number, number]
  /** 无障碍标题 */
  title?: string
  /** 自定义类名 */
  class?: string
  /** 子元素 */
  children?: JSX.Element
}

// ==================== Badge 组件 ====================

export const Badge: Component<BadgeProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'class',
    'children',
    'count',
    'overflowCount',
    'dot',
    'showZero',
    'color',
    'status',
    'text',
    'size',
    'placement',
    'offset',
    'title',
  ])

  const overflowCount = () => local.overflowCount ?? 99
  const isStandalone = () => !local.children
  const isStatusBadge = () => isStandalone() && local.status && local.text

  const styles = createMemo(() =>
    badgeVariants({
      color: local.color,
      status: local.status,
      size: local.size,
      placement: local.placement,
      standalone: isStandalone(),
    })
  )

  // 计算显示的数字
  const displayCount = createMemo(() => {
    const count = local.count
    if (typeof count !== 'number') {
      return count
    }
    if (count > overflowCount()) {
      return `${overflowCount()}+`
    }
    return count
  })

  // 是否应该显示徽标
  const shouldShow = createMemo(() => {
    if (local.dot) {
      return true
    }
    const count = local.count
    if (count === undefined) {
      return false
    }
    if (typeof count === 'number') {
      return count > 0 || local.showZero
    }
    return true
  })

  // 偏移样式
  const offsetStyle = (): JSX.CSSProperties | undefined => {
    if (!local.offset) {
      return undefined
    }
    const [x, y] = local.offset
    return {
      transform: `translate(${x}px, ${y}px)`,
    }
  }

  // 状态徽标（独立使用，带文字）
  if (isStatusBadge()) {
    return (
      <span class={['inline-flex items-center gap-2', local.class].filter(Boolean).join(' ')} {...rest}>
        <span class={styles().statusDot()} />
        <span class={styles().statusText()}>{local.text}</span>
      </span>
    )
  }

  return (
    <span class={styles().root({ class: local.class })} {...rest}>
      {local.children}

      <Show when={shouldShow()}>
        <Show
          when={local.dot}
          fallback={
            <span
              class={styles().badge()}
              style={offsetStyle()}
              title={local.title}
            >
              {displayCount()}
            </span>
          }
        >
          <span
            class={styles().dot()}
            style={offsetStyle()}
            title={local.title}
          />
        </Show>
      </Show>
    </span>
  )
}
