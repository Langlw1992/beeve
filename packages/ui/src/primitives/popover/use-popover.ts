/**
 * usePopover hook - 基于 @zag-js/popover 和 @zag-js/hover-card 实现
 */

import {createMemo, createUniqueId} from 'solid-js'
import * as popover from '@zag-js/popover'
import * as hoverCard from '@zag-js/hover-card'
import {useMachine, normalizeProps} from '@zag-js/solid'
import type {PopoverProps} from './types'

export type UsePopoverProps = PopoverProps

/** 统一的 API 类型 */
export interface PopoverApi {
  open: boolean
  getTriggerProps: () => Record<string, unknown>
  getPositionerProps: () => Record<string, unknown>
  getContentProps: () => Record<string, unknown>
  getArrowProps: () => Record<string, unknown>
  getArrowTipProps: () => Record<string, unknown>
}

export type UsePopoverReturn = {
  /** popover API accessor */
  api: () => PopoverApi
  /** 是否为 hover 模式 */
  isHover: boolean
}

export function usePopover(props: UsePopoverProps): UsePopoverReturn {
  const isHover = props.trigger === 'hover'

  if (isHover) {
    // 使用 hover-card
    const service = useMachine(hoverCard.machine, () => ({
      id: props.id ?? createUniqueId(),
      open: props.open,
      defaultOpen: props.defaultOpen,
      openDelay: props.openDelay ?? 700,
      closeDelay: props.closeDelay ?? 300,
      positioning: props.positioning ?? {placement: 'bottom' as const},
      onOpenChange: props.onOpenChange,
    }))

    const api = createMemo(() => {
      const hc = hoverCard.connect(service, normalizeProps)
      return {
        open: hc.open,
        getTriggerProps: () => hc.getTriggerProps() as Record<string, unknown>,
        getPositionerProps: () =>
          hc.getPositionerProps() as Record<string, unknown>,
        getContentProps: () => hc.getContentProps() as Record<string, unknown>,
        getArrowProps: () => hc.getArrowProps() as Record<string, unknown>,
        getArrowTipProps: () =>
          hc.getArrowTipProps() as Record<string, unknown>,
      } satisfies PopoverApi
    })

    return {api, isHover: true}
  }

  // 使用 popover (click 模式)
  const service = useMachine(popover.machine, () => ({
    id: props.id ?? createUniqueId(),
    open: props.open,
    defaultOpen: props.defaultOpen,
    autoFocus: props.autoFocus ?? true,
    closeOnInteractOutside: props.closeOnInteractOutside ?? true,
    closeOnEscape: props.closeOnEscape ?? true,
    modal: props.modal ?? false,
    portalled: props.portalled ?? true,
    positioning: props.positioning ?? {placement: 'bottom' as const},
    onOpenChange: props.onOpenChange,
  }))

  const api = createMemo(() => {
    const p = popover.connect(service, normalizeProps)
    return {
      open: p.open,
      getTriggerProps: () => p.getTriggerProps() as Record<string, unknown>,
      getPositionerProps: () =>
        p.getPositionerProps() as Record<string, unknown>,
      getContentProps: () => p.getContentProps() as Record<string, unknown>,
      getArrowProps: () => p.getArrowProps() as Record<string, unknown>,
      getArrowTipProps: () => p.getArrowTipProps() as Record<string, unknown>,
    } satisfies PopoverApi
  })

  return {api, isHover: false}
}
