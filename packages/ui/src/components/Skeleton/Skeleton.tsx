/**
 * @beeve/ui - Skeleton Component
 * 骨架屏组件，用于加载状态占位
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Skeleton width={200} height={16} />
 *
 * // 语义化组件
 * <Skeleton.Text rows={3} />
 * <Skeleton.Avatar size="md" />
 * <Skeleton.Button size="md" />
 * <Skeleton.Paragraph title rows={3} />
 * ```
 */

import {splitProps, For, Show, type Component, type JSX} from 'solid-js'
import {tv, type VariantProps} from 'tailwind-variants'

// ==================== 样式定义 ====================

const skeletonVariants = tv({
  base: 'bg-muted rounded',
  variants: {
    animation: {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: '',
    },
  },
  defaultVariants: {
    animation: 'pulse',
  },
})

export type SkeletonVariants = VariantProps<typeof skeletonVariants>

// ==================== 类型定义 ====================

export interface SkeletonProps extends SkeletonVariants {
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 圆形 */
  circle?: boolean
  /** 自定义类名 */
  class?: string
  /** 自定义样式 */
  style?: JSX.CSSProperties
}

export interface SkeletonTextProps extends SkeletonVariants {
  /** 行数 */
  rows?: number
  /** 最后一行宽度 */
  lastRowWidth?: string | number
  /** 自定义类名 */
  class?: string
}

export interface SkeletonAvatarProps extends SkeletonVariants {
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg' | number
  /** 形状 */
  shape?: 'circle' | 'square'
  /** 自定义类名 */
  class?: string
  /** 其他属性 */
  [key: string]: unknown
}

export interface SkeletonButtonProps extends SkeletonVariants {
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 自定义类名 */
  class?: string
  /** 其他属性 */
  [key: string]: unknown
}

export interface SkeletonImageProps extends SkeletonVariants {
  /** 宽高比 */
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9'
  /** 自定义类名 */
  class?: string
  /** 其他属性 */
  [key: string]: unknown
}

export interface SkeletonParagraphProps extends SkeletonVariants {
  /** 显示标题 */
  title?: boolean
  /** 标题宽度 */
  titleWidth?: string | number
  /** 段落行数 */
  rows?: number
  /** 自定义类名 */
  class?: string
}

// ==================== 工具函数 ====================

const formatSize = (size: string | number | undefined): string | undefined => {
  if (size === undefined) {
    return undefined
  }
  return typeof size === 'number' ? `${size}px` : size
}

// ==================== 基础 Skeleton ====================

const SkeletonBase: Component<SkeletonProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'style', 'width', 'height', 'circle'],
    ['animation'],
  )

  const style = (): JSX.CSSProperties => ({
    width: formatSize(local.width),
    height: formatSize(local.height),
    ...local.style,
  })

  return (
    <div
      class={skeletonVariants({
        ...variants,
        class: [local.circle && 'rounded-full', local.class]
          .filter(Boolean)
          .join(' '),
      })}
      style={style()}
      {...rest}
    />
  )
}

// ==================== Skeleton.Text ====================

const SkeletonText: Component<SkeletonTextProps> = (props) => {
  const [local, variants] = splitProps(
    props,
    ['class', 'rows', 'lastRowWidth'],
    ['animation'],
  )

  const rows = () => local.rows ?? 3

  return (
    <div class={['space-y-3', local.class].filter(Boolean).join(' ')}>
      <For each={Array(rows()).fill(0)}>
        {(_, index) => {
          const isLast = () => index() === rows() - 1
          const width = () =>
            isLast() ? (local.lastRowWidth ?? '60%') : '100%'

          return (
            <SkeletonBase
              animation={variants.animation}
              height={16}
              width={width()}
            />
          )
        }}
      </For>
    </div>
  )
}

// ==================== Skeleton.Avatar ====================

const avatarSizes = {
  sm: 32,
  md: 40,
  lg: 56,
}

const SkeletonAvatar: Component<SkeletonAvatarProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'size', 'shape'],
    ['animation'],
  )

  const size = () => {
    const s = local.size ?? 'md'
    return typeof s === 'number' ? s : avatarSizes[s]
  }

  const isCircle = () => (local.shape ?? 'circle') === 'circle'

  return (
    <SkeletonBase
      animation={variants.animation}
      width={size()}
      height={size()}
      circle={isCircle()}
      class={local.class}
      {...rest}
    />
  )
}

// ==================== Skeleton.Button ====================

const buttonSizes = {
  sm: {width: 64, height: 28},
  md: {width: 80, height: 32},
  lg: {width: 96, height: 36},
}

const SkeletonButton: Component<SkeletonButtonProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'size'],
    ['animation'],
  )

  const size = () => buttonSizes[local.size ?? 'md']

  return (
    <SkeletonBase
      animation={variants.animation}
      width={size().width}
      height={size().height}
      class={local.class}
      {...rest}
    />
  )
}

// ==================== Skeleton.Image ====================

const aspectRatios = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '21:9': 'aspect-[21/9]',
}

const SkeletonImage: Component<SkeletonImageProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'aspectRatio'],
    ['animation'],
  )

  const aspectClass = () => aspectRatios[local.aspectRatio ?? '16:9']

  return (
    <SkeletonBase
      animation={variants.animation}
      class={[aspectClass(), 'w-full', local.class].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}

// ==================== Skeleton.Paragraph ====================

const SkeletonParagraph: Component<SkeletonParagraphProps> = (props) => {
  const [local, variants] = splitProps(
    props,
    ['class', 'title', 'titleWidth', 'rows'],
    ['animation'],
  )

  return (
    <div class={['space-y-4', local.class].filter(Boolean).join(' ')}>
      <Show when={local.title !== false}>
        <SkeletonBase
          animation={variants.animation}
          height={24}
          width={local.titleWidth ?? '40%'}
        />
      </Show>
      <SkeletonText
        animation={variants.animation}
        rows={local.rows ?? 3}
      />
    </div>
  )
}

// ==================== 导出 ====================

type SkeletonComponent = Component<SkeletonProps> & {
  Text: typeof SkeletonText
  Avatar: typeof SkeletonAvatar
  Button: typeof SkeletonButton
  Image: typeof SkeletonImage
  Paragraph: typeof SkeletonParagraph
}

export const Skeleton: SkeletonComponent = Object.assign(SkeletonBase, {
  Text: SkeletonText,
  Avatar: SkeletonAvatar,
  Button: SkeletonButton,
  Image: SkeletonImage,
  Paragraph: SkeletonParagraph,
})
