/**
 * @beeve/ui - Slider Component
 * 滑块组件，基于 @zag-js/slider 实现
 * 支持单值/范围模式、刻度标记、thumb tooltip、手动输入
 */

import {
  Show,
  For,
  splitProps,
  createSignal,
  createEffect,
  createMemo,
  type Component,
  type JSX,
} from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'
import { useSlider, type SliderProps as BaseProps, type SliderMark } from '../../primitives/slider'
import { Input } from '../Input'

// ==================== 样式定义 ====================

const sliderStyles = tv({
  slots: {
    root: [
      'relative flex w-full touch-none select-none flex-col gap-2',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    label: 'text-sm font-medium text-foreground',
    controlWrapper: 'flex items-center gap-3',
    sliderWrapper: 'relative flex-1 flex flex-col',
    control: 'relative flex items-center',
    track: 'relative grow overflow-hidden rounded-full bg-muted',
    range: 'absolute bg-primary rounded-full',
    thumb: [
      'block rounded-full bg-background border-2 border-primary',
      'shadow-sm transition-shadow duration-150',
      'ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
      'cursor-grab active:cursor-grabbing',
      'hover:shadow-md',
    ],
    tooltip: [
      'absolute left-1/2 -translate-x-1/2 z-10',
      'px-2 py-1 text-xs font-medium',
      'bg-foreground text-background rounded-md shadow-md',
      'whitespace-nowrap pointer-events-none',
      // Arrow
      'after:content-[""] after:absolute after:left-1/2 after:-translate-x-1/2',
      'after:border-4 after:border-transparent',
    ],
    markerGroup: 'relative w-full h-5 mt-1',
    marker: 'absolute top-0 flex flex-col items-center -translate-x-1/2',
    markerTick: 'w-px bg-border transition-colors duration-150',
    markerLabel: 'text-xs text-muted-foreground mt-0.5 whitespace-nowrap transition-colors duration-150',
    inputContainer: 'shrink-0',
  },
  variants: {
    size: {
      sm: {
        track: 'h-1',
        range: 'h-full',
        thumb: 'size-3',
        markerTick: 'h-1.5',
      },
      md: {
        track: 'h-1.5',
        range: 'h-full',
        thumb: 'size-4',
        markerTick: 'h-2',
      },
      lg: {
        track: 'h-2',
        range: 'h-full',
        thumb: 'size-5',
        markerTick: 'h-2.5',
      },
    },
    orientation: {
      horizontal: {
        root: 'w-full',
        sliderWrapper: 'w-full',
        control: 'h-5 w-full',
        track: 'w-full',
        range: 'h-full',
        tooltip: 'bottom-full mb-2 after:top-full after:border-t-foreground',
      },
      vertical: {
        root: 'h-full inline-flex',
        sliderWrapper: 'h-full',
        control: 'w-5 h-full flex-col',
        track: 'h-full w-full',
        range: 'w-full',
        tooltip:
          'left-full ml-2 top-1/2 -translate-y-1/2 translate-x-0 after:right-full after:top-1/2 after:-translate-y-1/2 after:border-r-foreground after:border-t-transparent',
        markerGroup: 'absolute left-full ml-1 h-full flex flex-col justify-between mt-0',
        marker: 'flex-row translate-x-0 translate-y-1/2',
        markerTick: 'h-px w-1.5',
        markerLabel: 'mt-0 ml-1',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    orientation: 'horizontal',
  },
})

// ==================== 类型定义 ====================

export type { SliderMark }

export interface SliderProps extends BaseProps, VariantProps<typeof sliderStyles> {
  /** 自定义类名 */
  class?: string
  /** 标签 */
  label?: JSX.Element
  /** 刻度标记 */
  marks?: SliderMark[]
  /** 是否显示 tooltip，默认 true */
  showTooltip?: boolean
  /** tooltip 格式化函数 */
  formatTooltip?: (value: number) => string
  /** 是否显示输入框，默认 false */
  showInput?: boolean
  /** 输入框宽度 */
  inputWidth?: string
  /** Ref */
  ref?: (el: HTMLDivElement) => void
}

// ==================== 组件实现 ====================

// Thumb 尺寸映射，用于 thumbAlignment: 'contain' 时避免布局闪动
const THUMB_SIZES = {
  sm: { width: 12, height: 12 }, // size-3 = 12px
  md: { width: 16, height: 16 }, // size-4 = 16px
  lg: { width: 20, height: 20 }, // size-5 = 20px
} as const

export const Slider: Component<SliderProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'label', 'marks', 'showTooltip', 'formatTooltip', 'showInput', 'inputWidth', 'ref'],
    ['size', 'orientation']
  )

  // 获取 thumb 尺寸，避免 marker 位置闪动
  const thumbSize = () => rest.thumbSize ?? THUMB_SIZES[variants.size ?? 'md']

  const { api } = useSlider({
    ...rest,
    thumbSize: thumbSize(),
  })
  const styles = createMemo(() =>
    sliderStyles({ size: variants.size, orientation: variants.orientation ?? 'horizontal' })
  )

  // 是否为范围模式
  const isRange = () => api().value.length > 1

  // 格式化 tooltip 值
  const formatValue = (value: number) => {
    if (local.formatTooltip) {
      return local.formatTooltip(value)
    }
    return String(value)
  }

  return (
    <div ref={local.ref} {...api().getRootProps()} class={styles().root({ class: local.class })}>
      {/* Label */}
      <Show when={local.label}>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: zag-js getLabelProps provides htmlFor */}
        <label {...api().getLabelProps()} class={styles().label()}>
          {local.label}
        </label>
      </Show>

      {/* Control Wrapper (slider + optional input) */}
      <div class={styles().controlWrapper()}>
        {/* Slider with markers */}
        <div class={styles().sliderWrapper()}>
          {/* Slider Control */}
          <div {...api().getControlProps()} class={styles().control()}>
            <div {...api().getTrackProps()} class={styles().track()}>
              <div {...api().getRangeProps()} class={styles().range()} />
            </div>

            {/* Thumbs */}
            <For each={api().value}>
              {(_, index) => (
                <SliderThumb
                  api={api()}
                  index={index()}
                  showTooltip={local.showTooltip !== false}
                  formatValue={formatValue}
                  styles={styles()}
                />
              )}
            </For>
          </div>

          {/* Markers - 在 track 下方 */}
          <Show when={local.marks && local.marks.length > 0}>
            <div {...api().getMarkerGroupProps()} class={styles().markerGroup()}>
              <For each={local.marks}>
                {(mark) => (
                  <span {...api().getMarkerProps({ value: mark.value })} class={styles().marker()}>
                    <span class={styles().markerTick()} />
                    <Show when={mark.label}>
                      <span class={styles().markerLabel()}>{mark.label}</span>
                    </Show>
                  </span>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Input(s) */}
        <Show when={local.showInput}>
          <div class={styles().inputContainer()} style={{ width: local.inputWidth ?? '70px' }}>
            <Show
              when={!isRange()}
              fallback={
                <div class="flex gap-1 items-center">
                  <SliderInput
                    api={api()}
                    index={0}
                    size={variants.size}
                    min={rest.min ?? 0}
                    max={rest.max ?? 100}
                  />
                  <span class="text-muted-foreground text-sm">-</span>
                  <SliderInput
                    api={api()}
                    index={1}
                    size={variants.size}
                    min={rest.min ?? 0}
                    max={rest.max ?? 100}
                  />
                </div>
              }
            >
              <SliderInput
                api={api()}
                index={0}
                size={variants.size}
                min={rest.min ?? 0}
                max={rest.max ?? 100}
              />
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}

// ==================== Thumb 组件 ====================

interface SliderThumbProps {
  api: ReturnType<typeof useSlider>['api'] extends () => infer R ? R : never
  index: number
  showTooltip: boolean
  formatValue: (value: number) => string
  styles: ReturnType<typeof sliderStyles>
}

const SliderThumb: Component<SliderThumbProps> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false)

  const thumbValue = () => props.api.value[props.index] ?? 0
  const isDragging = () => props.api.dragging

  // Tooltip 仅在 hover 或 dragging 时显示
  const showTooltip = () => props.showTooltip && (isHovered() || isDragging())

  return (
    <div
      {...props.api.getThumbProps({ index: props.index })}
      class={props.styles.thumb()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <input {...props.api.getHiddenInputProps({ index: props.index })} />
      <Show when={showTooltip()}>
        <div
          class={props.styles.tooltip()}
          style={{
            opacity: showTooltip() ? 1 : 0,
            transition: 'opacity 150ms, transform 150ms',
          }}
        >
          {props.formatValue(thumbValue())}
        </div>
      </Show>
    </div>
  )
}

// ==================== Input 组件 ====================

interface SliderInputProps {
  api: ReturnType<typeof useSlider>['api'] extends () => infer R ? R : never
  index: number
  size?: 'sm' | 'md' | 'lg'
  min: number
  max: number
}

const SliderInput: Component<SliderInputProps> = (props) => {
  const [inputValue, setInputValue] = createSignal('')
  const [isEditing, setIsEditing] = createSignal(false)

  // 同步 slider 值到 input（仅在非编辑状态时）
  createEffect(() => {
    if (!isEditing()) {
      setInputValue(String(props.api.value[props.index] ?? 0))
    }
  })

  // 更新 slider 值
  const updateSliderValue = (value: number) => {
    const clampedValue = Math.min(Math.max(value, props.min), props.max)
    const newValue = [...props.api.value]
    newValue[props.index] = clampedValue
    props.api.setValue(newValue)
  }

  const handleInput = (value: string) => {
    setInputValue(value)
    // 如果是有效数字，立即更新 slider（支持增减按钮）
    const num = Number(value)
    if (!Number.isNaN(num)) {
      updateSliderValue(num)
    }
  }

  const handleFocus = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    const num = Number(inputValue())
    if (!Number.isNaN(num)) {
      updateSliderValue(num)
    }
    // 同步显示值（处理超出范围或无效输入）
    setInputValue(String(props.api.value[props.index] ?? 0))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement)?.blur()
    }
  }

  return (
    <Input
      inputType="number"
      size={props.size === 'lg' ? 'md' : 'sm'}
      value={inputValue()}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      showControls
      min={props.min}
      max={props.max}
      class="text-center"
    />
  )
}
