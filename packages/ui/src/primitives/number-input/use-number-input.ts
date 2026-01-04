/**
 * useNumberInput hook - 基于 @zag-js/number-input 实现
 */

import { createMemo, createUniqueId } from 'solid-js'
import * as numberInput from '@zag-js/number-input'
import { useMachine, normalizeProps } from '@zag-js/solid'
import type { PropTypes } from '@zag-js/solid'
import type { NumberInputProps } from './types'

export type UseNumberInputProps = NumberInputProps

export type UseNumberInputReturn = {
  /** number-input API accessor */
  api: () => numberInput.Api<PropTypes>
}

export function useNumberInput(props: UseNumberInputProps): UseNumberInputReturn {
  const service = useMachine(numberInput.machine as numberInput.Machine, () => ({
    id: createUniqueId(),
    // 值相关
    defaultValue: props.defaultValue !== undefined ? String(props.defaultValue) : undefined,
    value: props.value !== undefined ? String(props.value) : undefined,
    // 范围限制
    min: props.min,
    max: props.max,
    step: props.step,
    // 状态
    disabled: props.disabled,
    readOnly: props.readOnly,
    invalid: props.invalid,
    // 行为
    allowMouseWheel: props.allowMouseWheel ?? false,
    spinOnPress: props.spinOnPress ?? true,
    clampValueOnBlur: props.clampValueOnBlur ?? true,
    // 格式化
    formatOptions: props.formatOptions,
    // 表单
    name: props.name,

    onValueChange: (details: numberInput.ValueChangeDetails) => {
      props.onValueChange?.(details)
    },
  }))

  const api = createMemo(() =>
    numberInput.connect(service as numberInput.Service, normalizeProps)
  )

  return { api }
}

