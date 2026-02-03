/**
 * useSlider hook - 基于 @zag-js/slider 实现
 *
 * 使用方式：传入一个返回 props 的函数，以保持 SolidJS 的响应性
 * @example
 * ```tsx
 * const { api } = useSlider(() => ({
 *   value: props.value,
 *   onChange: props.onChange,
 * }))
 * ```
 */

import {createMemo, createUniqueId, type Accessor} from 'solid-js'
import * as slider from '@zag-js/slider'
import {useMachine, normalizeProps} from '@zag-js/solid'
import type {PropTypes} from '@zag-js/solid'
import type {SliderProps} from './types'

export type UseSliderProps = Accessor<SliderProps>

export type UseSliderReturn = {
  /** slider API accessor */
  api: () => slider.Api<PropTypes>
}

export function useSlider(getProps: UseSliderProps): UseSliderReturn {
  const id = createUniqueId()

  // 使用函数形式确保 props 的响应性
  // zag-js 在 SolidJS 中会追踪此函数内部读取的响应式值
  const service = useMachine(slider.machine, (): Partial<slider.Props> => {
    const props = getProps()
    return {
      id: props.id ?? id,
      value: props.value,
      defaultValue: props.defaultValue ?? [0],
      min: props.min ?? 0,
      max: props.max ?? 100,
      step: props.step ?? 1,
      disabled: props.disabled,
      readOnly: props.readOnly,
      invalid: props.invalid,
      orientation: props.orientation ?? 'horizontal',
      origin: props.origin ?? 'start',
      thumbAlignment: props.thumbAlignment ?? 'contain',
      thumbSize: props.thumbSize,
      dir: props.dir ?? 'ltr',
      name: props.name,
      onValueChange: props.onChange,
      onValueChangeEnd: props.onChangeEnd,
      getAriaValueText: props.getAriaValueText,
    }
  })

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return {api}
}
