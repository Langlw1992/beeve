/**
 * @beeve/ui - Card Component
 * 卡片容器组件
 *
 * @example
 * ```tsx
 * // 基础卡片
 * <Card title="标题">内容</Card>
 *
 * // 带操作
 * <Card title="标题" extra={<Button>操作</Button>}>
 *   内容
 * </Card>
 *
 * // 加载状态
 * <Card loading>内容</Card>
 * ```
 */

import { splitProps, Show, createMemo, type Component, type JSX } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'
import { Skeleton } from '../Skeleton'

// ==================== 样式定义 ====================

const cardVariants = tv({
  slots: {
    root: [
      'bg-card text-card-foreground',
      'rounded-lg',
      'overflow-hidden',
    ],
    header: 'flex items-center justify-between gap-4',
    title: 'font-semibold leading-none tracking-tight',
    description: 'text-sm text-muted-foreground mt-1',
    extra: 'shrink-0',
    cover: 'w-full overflow-hidden',
    coverImage: 'w-full h-auto object-cover',
    body: '',
    footer: 'flex items-center gap-4 border-t border-border',
    actions: 'flex items-center gap-2 ml-auto',
  },
  variants: {
    variant: {
      elevated: { root: 'shadow-md' },
      outlined: { root: 'border border-border' },
      filled: { root: 'bg-muted' },
    },
    size: {
      sm: {
        root: '',
        header: 'px-3 pt-3',
        body: 'p-3',
        footer: 'px-3 py-2',
        title: 'text-base',
      },
      md: {
        root: '',
        header: 'px-4 pt-4',
        body: 'p-4',
        footer: 'px-4 py-3',
        title: 'text-lg',
      },
      lg: {
        root: '',
        header: 'px-6 pt-6',
        body: 'p-6',
        footer: 'px-6 py-4',
        title: 'text-xl',
      },
    },
    hoverable: {
      true: { root: 'cursor-pointer transition-shadow duration-200 hover:shadow-lg' },
    },
    loading: {
      true: { root: 'pointer-events-none' },
    },
  },
  defaultVariants: {
    variant: 'outlined',
    size: 'md',
  },
})

export type CardVariants = VariantProps<typeof cardVariants>

// ==================== 类型定义 ====================

export interface CardProps extends Omit<CardVariants, 'loading'> {
  /** 标题 */
  title?: JSX.Element
  /** 描述/副标题 */
  description?: JSX.Element
  /** 标题栏右侧额外内容 */
  extra?: JSX.Element
  /** 封面图片 URL */
  cover?: string
  /** 封面图片 alt 文本 */
  coverAlt?: string
  /** 封面位置 */
  coverPosition?: 'top' | 'bottom'
  /** 底部内容 */
  footer?: JSX.Element
  /** 底部操作按钮 */
  actions?: JSX.Element
  /** 加载状态 */
  loading?: boolean
  /** 加载骨架配置 */
  loadingConfig?: {
    avatar?: boolean
    title?: boolean
    rows?: number
  }
  /** 自定义类名 */
  class?: string
  /** 自定义样式 */
  style?: JSX.CSSProperties
  /** 子元素 */
  children?: JSX.Element
  /** 点击事件 */
  onClick?: (e: MouseEvent) => void
}

// ==================== Card 组件 ====================

export const Card: Component<CardProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    [
      'class',
      'style',
      'children',
      'title',
      'description',
      'extra',
      'cover',
      'coverAlt',
      'coverPosition',
      'footer',
      'actions',
      'loading',
      'loadingConfig',
      'onClick',
    ],
    ['variant', 'size', 'hoverable']
  )

  const styles = createMemo(() =>
    cardVariants({
      ...variants,
      loading: local.loading,
    })
  )

  const hasHeader = () => local.title || local.description || local.extra
  const coverPosition = () => local.coverPosition ?? 'top'

  // 渲染加载骨架
  const renderLoading = () => {
    const config = local.loadingConfig ?? { title: true, rows: 3 }

    return (
      <div class={styles().body()}>
        <div class="space-y-4">
          <Show when={config.avatar}>
            <div class="flex items-center gap-3">
              <Skeleton.Avatar size="md" />
              <div class="flex-1 space-y-2">
                <Skeleton width="60%" height={16} />
                <Skeleton width="40%" height={12} />
              </div>
            </div>
          </Show>
          <Show when={!config.avatar && config.title}>
            <Skeleton width="50%" height={20} />
          </Show>
          <Skeleton.Text rows={config.rows ?? 3} />
        </div>
      </div>
    )
  }

  // 渲染封面
  const renderCover = () => (
    <Show when={local.cover}>
      <div class={styles().cover()}>
        <img
          src={local.cover}
          alt={local.coverAlt ?? ''}
          class={styles().coverImage()}
        />
      </div>
    </Show>
  )

  // 渲染头部
  const renderHeader = () => (
    <Show when={hasHeader()}>
      <div class={styles().header()}>
        <div class="flex-1 min-w-0">
          <Show when={local.title}>
            <div class={styles().title()}>{local.title}</div>
          </Show>
          <Show when={local.description}>
            <div class={styles().description()}>{local.description}</div>
          </Show>
        </div>
        <Show when={local.extra}>
          <div class={styles().extra()}>{local.extra}</div>
        </Show>
      </div>
    </Show>
  )

  // 渲染内容
  const renderBody = () => (
    <Show when={local.children}>
      <div class={styles().body()}>{local.children}</div>
    </Show>
  )

  // 渲染底部
  const renderFooter = () => (
    <Show when={local.footer || local.actions}>
      <div class={styles().footer()}>
        {local.footer}
        <Show when={local.actions}>
          <div class={styles().actions()}>{local.actions}</div>
        </Show>
      </div>
    </Show>
  )

  return (
    <div
      class={styles().root({ class: local.class })}
      style={local.style}
      onClick={local.onClick}
      {...rest}
    >
      <Show when={local.loading} fallback={
        <>
          <Show when={coverPosition() === 'top'}>{renderCover()}</Show>
          {renderHeader()}
          {renderBody()}
          <Show when={coverPosition() === 'bottom'}>{renderCover()}</Show>
          {renderFooter()}
        </>
      }>
        {renderLoading()}
      </Show>
    </div>
  )
}
