/**
 * useTooltip hook - 基于 @zag-js/tooltip 实现
 */

import {createMemo, createUniqueId} from 'solid-js'
import * as tooltip from '@zag-js/tooltip'
import {useMachine, normalizeProps} from '@zag-js/solid'
import type {PropTypes} from '@zag-js/solid'
import type {TooltipProps} from './types'

export type UseTooltipProps = TooltipProps

export type UseTooltipReturn = {
  /** tooltip API accessor */
  api: () => tooltip.Api<PropTypes>
}

export function useTooltip(props: UseTooltipProps): UseTooltipReturn {
  const service = useMachine(tooltip.machine, () => ({
    id: props.id ?? createUniqueId(),
    // 状态
    open: props.open,
    defaultOpen: props.defaultOpen,
    disabled: props.disabled,
    // 延迟
    openDelay: props.openDelay ?? 700,
    closeDelay: props.closeDelay ?? 300,
    // 行为
    closeOnPointerDown: props.closeOnPointerDown ?? true,
    closeOnEscape: props.closeOnEscape ?? true,
    interactive: props.interactive ?? false,
    // 定位
    positioning: props.positioning ?? {placement: 'top' as const},
    // 回调
    onOpenChange: props.onOpenChange,
  }))

  const api = createMemo(() => tooltip.connect(service, normalizeProps))

  return {api}
}
