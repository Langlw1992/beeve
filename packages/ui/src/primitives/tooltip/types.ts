/**
 * Tooltip Primitive Types
 */

import type { Placement, PositioningOptions } from '@zag-js/tooltip'

export type { Placement, PositioningOptions }

/** Tooltip 组件 Props */
export interface TooltipProps {
  /** 唯一 ID */
  id?: string
  /** 是否打开 (受控) */
  open?: boolean
  /** 默认打开状态 */
  defaultOpen?: boolean
  /** 打开延迟 (ms)，默认 700 */
  openDelay?: number
  /** 关闭延迟 (ms)，默认 300 */
  closeDelay?: number
  /** 是否在 pointer down 时关闭，默认 true */
  closeOnPointerDown?: boolean
  /** 是否在 ESC 时关闭，默认 true */
  closeOnEscape?: boolean
  /** 是否可交互（鼠标可移入 tooltip 内容），默认 false */
  interactive?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 定位配置 */
  positioning?: PositioningOptions
  /** 打开状态变化回调 */
  onOpenChange?: (details: { open: boolean }) => void
}

