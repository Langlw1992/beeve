/**
 * useSlider hook - 基于 @zag-js/slider 实现
 */

import { createMemo, createUniqueId } from 'solid-js'
import * as slider from '@zag-js/slider'
import { useMachine, normalizeProps } from '@zag-js/solid'
import type { PropTypes } from '@zag-js/solid'
import type { SliderProps } from './types'

export type UseSliderProps = SliderProps

export type UseSliderReturn = {
  /** slider API accessor */
  api: () => slider.Api<PropTypes>
}

export function useSlider(props: UseSliderProps): UseSliderReturn {
  const service = useMachine(slider.machine, () => ({
    id: props.id ?? createUniqueId(),
    // 值相关
    value: props.value,
    defaultValue: props.defaultValue ?? [0],
    // 范围限制
    min: props.min ?? 0,
    max: props.max ?? 100,
    step: props.step ?? 1,
    // 状态
    disabled: props.disabled,
    readOnly: props.readOnly,
    invalid: props.invalid,
    // 布局
    orientation: props.orientation ?? 'horizontal',
    origin: props.origin ?? 'start',
    thumbAlignment: props.thumbAlignment ?? 'contain',
    thumbSize: props.thumbSize,
    dir: props.dir ?? 'ltr',
    // 表单
    name: props.name,
    // 回调
    onValueChange: props.onValueChange,
    onValueChangeEnd: props.onValueChangeEnd,
    getAriaValueText: props.getAriaValueText,
  }))

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return { api }
}

