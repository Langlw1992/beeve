/**
 * @beeve/ui - Slider Component
 * 滑块组件，基于 @zag-js/slider 实现
 * 支持单值/范围模式、手动输入、thumb hover tooltip
 */

import { Show, For, splitProps, createSignal, createEffect, type Component, type JSX } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'
import { useSlider, type SliderProps as BaseProps, type SliderMark } from '../../primitives/slider'
import { Input } from '../Input'

// ==================== 样式定义 ====================

const sliderStyles = tv({
  slots: {
    root: 'relative flex w-full touch-none select-none items-center',
    control: 'relative flex items-center',
    track: 'relative grow overflow-hidden rounded-full bg-muted',
    range: 'absolute bg-primary',
    thumb: [
      'group block rounded-full border-2 border-primary bg-background',
      'ring-offset-background transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'cursor-grab active:cursor-grabbing',
    ],
    thumbTooltip: [
      'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
      'px-2 py-1 text-xs font-medium',
      'bg-foreground text-background rounded-md shadow-md',
      'opacity-0 scale-95 transition-all duration-150',
      'group-hover:opacity-100 group-hover:scale-100',
      'group-focus-within:opacity-100 group-focus-within:scale-100',
      'pointer-events-none whitespace-nowrap',
    ],
    markerGroup: 'relative w-full',
    marker: 'absolute text-xs text-muted-foreground',
    inputWrapper: 'flex items-center gap-3',
    inputContainer: 'shrink-0',
  },
  variants: {
    size: {
      sm: {
        track: 'h-1',
        range: 'h-1',
        thumb: 'size-3.5',
      },
      md: {
        track: 'h-1.5',
        range: 'h-1.5',
        thumb: 'size-4',
      },
      lg: {
        track: 'h-2',
        range: 'h-2',
        thumb: 'size-5',
      },
    },
    orientation: {
      horizontal: {
        root: 'flex-row',
        control: 'h-5 w-full',
        track: 'h-full w-full',
        range: 'h-full',
      },
      vertical: {
        root: 'flex-col h-full',
        control: 'w-5 h-full',
        track: 'w-full h-full',
        range: 'w-full',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    orientation: 'horizontal',
  },
})

// ==================== 类型定义 ====================

export interface SliderProps extends BaseProps, VariantProps<typeof sliderStyles> {
  /** 自定义类名 */
  class?: string
  /** 标签 */
  label?: JSX.Element
  /** 刻度标记 */
  marks?: SliderMark[]
  /** 是否显示 tooltip，默认 true */
  showTooltip?: boolean
  /** 是否显示输入框，默认 false */
  showInput?: boolean
  /** 输入框宽度 */
  inputWidth?: string
}

// ==================== 组件实现 ====================

export const Slider: Component<SliderProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'label', 'marks', 'showTooltip', 'showInput', 'inputWidth'],
    ['size', 'orientation']
  )

  const { api } = useSlider(rest)
  const styles = () => sliderStyles({ size: variants.size, orientation: variants.orientation ?? 'horizontal' })

  // 是否为范围模式
  const isRange = () => api().value.length > 1

  return (
    <div {...api().getRootProps()} class={styles().root({ class: local.class })}>
      {/* Label */}
      <Show when={local.label}>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: zag-js getLabelProps provides htmlFor */}
        <label {...api().getLabelProps()} class="text-sm font-medium mb-2">
          {local.label}
        </label>
      </Show>

      {/* Main Content */}
      <div class={local.showInput ? styles().inputWrapper() : 'w-full'}>
        {/* Slider Control */}
        <div {...api().getControlProps()} class={styles().control()}>
          <div {...api().getTrackProps()} class={styles().track()}>
            <div {...api().getRangeProps()} class={styles().range()} />
          </div>

          {/* Thumbs */}
          <For each={api().value}>
            {(_, index) => {
              const thumbProps = () => api().getThumbProps({ index: index() })
              const hiddenInputProps = () => api().getHiddenInputProps({ index: index() })
              const thumbValue = () => api().value[index()]

              return (
                <div {...thumbProps()} class={styles().thumb()}>
                  <input {...hiddenInputProps()} />
                  <Show when={local.showTooltip !== false}>
                    <div class={styles().thumbTooltip()}>{thumbValue()}</div>
                  </Show>
                </div>
              )
            }}
          </For>
        </div>

        {/* Input(s) */}
        <Show when={local.showInput}>
          <div class={styles().inputContainer()} style={{ width: local.inputWidth ?? '70px' }}>
            <Show
              when={!isRange()}
              fallback={
                <div class="flex gap-1 items-center">
                  <SliderInput api={api()} index={0} size={variants.size} min={rest.min ?? 0} max={rest.max ?? 100} />
                  <span class="text-muted-foreground">-</span>
                  <SliderInput api={api()} index={1} size={variants.size} min={rest.min ?? 0} max={rest.max ?? 100} />
                </div>
              }
            >
              <SliderInput api={api()} index={0} size={variants.size} min={rest.min ?? 0} max={rest.max ?? 100} />
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}

// ==================== 辅助组件 ====================

interface SliderInputProps {
  api: ReturnType<typeof useSlider>['api'] extends () => infer R ? R : never
  index: number
  size?: 'sm' | 'md' | 'lg'
  min: number
  max: number
}

const SliderInput: Component<SliderInputProps> = (props) => {
  const [inputValue, setInputValue] = createSignal('')

  // 同步 slider 值到 input
  createEffect(() => {
    setInputValue(String(props.api.value[props.index] ?? 0))
  })

  const handleBlur = () => {
    const num = Number(inputValue())
    if (!Number.isNaN(num)) {
      const newValue = [...props.api.value]
      newValue[props.index] = Math.min(Math.max(num, props.min), props.max)
      props.api.setValue(newValue)
    } else {
      // 恢复原值
      setInputValue(String(props.api.value[props.index] ?? 0))
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    }
  }

  return (
    <Input
      size={props.size === 'lg' ? 'md' : 'sm'}
      value={inputValue()}
      onInput={(value) => setInputValue(value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      class="text-center"
    />
  )
}
