/**
 * @beeve/ui - Progress Component
 * 进度条组件，展示操作的当前进度
 *
 * @example
 * ```tsx
 * // 线性进度条
 * <Progress percent={30} />
 *
 * // 环形进度
 * <Progress type="circle" percent={75} />
 *
 * // 分段进度
 * <Progress.Steps steps={5} current={3} />
 * ```
 */

import { splitProps, Show, createMemo, For, type Component, type JSX } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'
import { Check, X } from 'lucide-solid'

// ==================== 样式定义 ====================

const progressVariants = tv({
  slots: {
    root: 'w-full',
    wrapper: 'flex items-center gap-3',
    track: 'flex-1 bg-muted overflow-hidden rounded-full',
    indicator: 'h-full rounded-full transition-all duration-300 ease-out',
    info: 'shrink-0 text-muted-foreground tabular-nums',
  },
  variants: {
    status: {
      normal: { indicator: 'bg-primary' },
      success: { indicator: 'bg-green-500', info: 'text-green-500' },
      exception: { indicator: 'bg-destructive', info: 'text-destructive' },
      active: { indicator: 'bg-primary animate-progress-stripe' },
    },
    size: {
      sm: { track: 'h-1', info: 'text-xs' },
      md: { track: 'h-2', info: 'text-sm' },
      lg: { track: 'h-3', info: 'text-base' },
    },
  },
  defaultVariants: {
    status: 'normal',
    size: 'md',
  },
})

const circleProgressVariants = tv({
  slots: {
    root: 'relative inline-flex items-center justify-center',
    svg: 'transform -rotate-90',
    track: 'stroke-muted',
    indicator: 'transition-all duration-300 ease-out',
    info: 'absolute inset-0 flex items-center justify-center',
    text: 'font-medium tabular-nums',
  },
  variants: {
    status: {
      normal: { indicator: 'stroke-primary', text: 'text-foreground' },
      success: { indicator: 'stroke-green-500', text: 'text-green-500' },
      exception: { indicator: 'stroke-destructive', text: 'text-destructive' },
      active: { indicator: 'stroke-primary', text: 'text-foreground' },
    },
    size: {
      sm: { root: 'size-16', text: 'text-xs' },
      md: { root: 'size-24', text: 'text-sm' },
      lg: { root: 'size-32', text: 'text-base' },
    },
  },
  defaultVariants: {
    status: 'normal',
    size: 'md',
  },
})

const stepsProgressVariants = tv({
  slots: {
    root: 'flex items-center gap-1',
    step: 'flex-1 rounded-full transition-colors duration-200',
  },
  variants: {
    status: {
      normal: {},
      success: {},
      exception: {},
    },
    size: {
      sm: { step: 'h-1' },
      md: { step: 'h-2' },
      lg: { step: 'h-3' },
    },
  },
  defaultVariants: {
    status: 'normal',
    size: 'md',
  },
})

export type ProgressVariants = VariantProps<typeof progressVariants>

// ==================== 类型定义 ====================

export interface ProgressProps extends ProgressVariants {
  /** 当前百分比 (0-100) */
  percent?: number
  /** 进度条类型 */
  type?: 'line' | 'circle'
  /** 是否显示进度信息 */
  showInfo?: boolean
  /** 自定义进度信息格式 */
  format?: (percent: number) => JSX.Element | string
  /** 进度条宽度（仅 circle 类型） */
  strokeWidth?: number
  /** 进度条颜色 */
  strokeColor?: string
  /** 轨道颜色 */
  trailColor?: string
  /** 自定义类名 */
  class?: string
}

export interface ProgressStepsProps {
  /** 总步数 */
  steps: number
  /** 当前完成步数 */
  current?: number
  /** 当前步骤内的进度百分比 */
  percent?: number
  /** 状态 */
  status?: 'normal' | 'success' | 'exception'
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 步骤间距 */
  gap?: number
  /** 自定义类名 */
  class?: string
}

// ==================== 工具函数 ====================

const clampPercent = (percent: number): number => {
  return Math.min(100, Math.max(0, percent))
}

// ==================== 线性进度条 ====================

const LineProgress: Component<ProgressProps> = (props) => {
  const [local, variants] = splitProps(
    props,
    ['class', 'percent', 'showInfo', 'format', 'strokeColor', 'trailColor'],
    ['status', 'size']
  )

  const percent = () => clampPercent(local.percent ?? 0)

  // 自动判断状态
  const status = () => {
    if (variants.status) {
      return variants.status
    }
    if (percent() >= 100) {
      return 'success'
    }
    return 'normal'
  }

  const styles = createMemo(() =>
    progressVariants({
      status: status(),
      size: variants.size,
    })
  )

  const defaultFormat = (p: number): JSX.Element | string => {
    if (status() === 'success') {
      return <Check class="size-4" />
    }
    if (status() === 'exception') {
      return <X class="size-4" />
    }
    return `${Math.round(p)}%`
  }

  const formatFn = () => local.format ?? defaultFormat

  return (
    <div class={styles().root({ class: local.class })}>
      <div class={styles().wrapper()}>
        <div
          class={styles().track()}
          style={{ 'background-color': local.trailColor }}
        >
          <div
            class={styles().indicator()}
            style={{
              width: `${percent()}%`,
              'background-color': local.strokeColor,
            }}
          />
        </div>
        <Show when={local.showInfo !== false}>
          <span class={styles().info()}>{formatFn()(percent())}</span>
        </Show>
      </div>
    </div>
  )
}

// ==================== 环形进度条 ====================

const circleSizes = {
  sm: { size: 64, strokeWidth: 4 },
  md: { size: 96, strokeWidth: 6 },
  lg: { size: 128, strokeWidth: 8 },
}

const CircleProgress: Component<ProgressProps> = (props) => {
  const [local, variants] = splitProps(
    props,
    ['class', 'percent', 'showInfo', 'format', 'strokeWidth', 'strokeColor', 'trailColor'],
    ['status', 'size']
  )

  const percent = () => clampPercent(local.percent ?? 0)

  // 自动判断状态
  const status = () => {
    if (variants.status) {
      return variants.status
    }
    if (percent() >= 100) {
      return 'success'
    }
    return 'normal'
  }

  const styles = createMemo(() =>
    circleProgressVariants({
      status: status(),
      size: variants.size,
    })
  )

  const sizeConfig = () => circleSizes[variants.size ?? 'md']
  const size = () => sizeConfig().size
  const strokeWidth = () => local.strokeWidth ?? sizeConfig().strokeWidth
  const radius = () => (size() - strokeWidth()) / 2
  const circumference = () => 2 * Math.PI * radius()
  const offset = () => circumference() - (percent() / 100) * circumference()

  const defaultFormat = (p: number): JSX.Element | string => {
    if (status() === 'success') {
      return <Check class="size-6" />
    }
    if (status() === 'exception') {
      return <X class="size-6" />
    }
    return `${Math.round(p)}%`
  }

  const formatFn = () => local.format ?? defaultFormat

  return (
    <div class={styles().root({ class: local.class })}>
      <svg class={styles().svg()} width={size()} height={size()} aria-hidden="true">
        <circle
          class={styles().track()}
          cx={size() / 2}
          cy={size() / 2}
          r={radius()}
          fill="none"
          stroke-width={strokeWidth()}
          style={{ stroke: local.trailColor }}
        />
        <circle
          class={styles().indicator()}
          cx={size() / 2}
          cy={size() / 2}
          r={radius()}
          fill="none"
          stroke-width={strokeWidth()}
          stroke-linecap="round"
          stroke-dasharray={String(circumference())}
          stroke-dashoffset={offset()}
          style={{ stroke: local.strokeColor }}
        />
      </svg>
      <Show when={local.showInfo !== false}>
        <div class={styles().info()}>
          <span class={styles().text()}>{formatFn()(percent())}</span>
        </div>
      </Show>
    </div>
  )
}

// ==================== 分段进度条 ====================

const ProgressSteps: Component<ProgressStepsProps> = (props) => {
  const [local] = splitProps(props, [
    'class',
    'steps',
    'current',
    'percent',
    'status',
    'size',
    'gap',
  ])

  const current = () => local.current ?? 0
  const steps = () => local.steps

  const styles = createMemo(() =>
    stepsProgressVariants({
      status: local.status,
      size: local.size,
    })
  )

  const getStepStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (index < current()) {
      return 'completed'
    }
    if (index === current()) {
      return 'current'
    }
    return 'pending'
  }

  const getStepColor = (status: 'completed' | 'current' | 'pending'): string => {
    if (status === 'completed') {
      if (local.status === 'success') {
        return 'bg-green-500'
      }
      if (local.status === 'exception') {
        return 'bg-destructive'
      }
      return 'bg-primary'
    }
    if (status === 'current') {
      return 'bg-primary/50'
    }
    return 'bg-muted'
  }

  return (
    <div
      class={styles().root({ class: local.class })}
      style={{ gap: local.gap ? `${local.gap}px` : undefined }}
    >
      <For each={Array(steps()).fill(0)}>
        {(_, index) => {
          const stepStatus = () => getStepStatus(index())
          return (
            <div
              class={[styles().step(), getStepColor(stepStatus())].join(' ')}
            />
          )
        }}
      </For>
    </div>
  )
}

// ==================== 主组件 ====================

const ProgressBase: Component<ProgressProps> = (props) => {
  return (
    <Show
      when={props.type === 'circle'}
      fallback={<LineProgress {...props} />}
    >
      <CircleProgress {...props} />
    </Show>
  )
}

// ==================== 导出 ====================

type ProgressComponent = Component<ProgressProps> & {
  Steps: typeof ProgressSteps
}

export const Progress: ProgressComponent = Object.assign(ProgressBase, {
  Steps: ProgressSteps,
})
