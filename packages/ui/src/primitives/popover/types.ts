/**
 * Popover Primitive Types
 */

import type {PositioningOptions} from '@zag-js/popover'

export type {PositioningOptions}

/** 触发方式 */
export type PopoverTrigger = 'click' | 'hover'

/** Popover 组件 Props */
export interface PopoverProps {
  /** 唯一 ID */
  id?: string
  /** 触发方式，默认 'click' */
  trigger?: PopoverTrigger
  /** 是否打开 (受控) */
  open?: boolean
  /** 默认打开状态 */
  defaultOpen?: boolean
  /** 是否自动聚焦到内容，默认 true（仅 click 模式） */
  autoFocus?: boolean
  /** 是否在点击外部时关闭，默认 true */
  closeOnInteractOutside?: boolean
  /** 是否在 ESC 时关闭，默认 true */
  closeOnEscape?: boolean
  /** 是否为模态模式（阻止外部交互），默认 false（仅 click 模式） */
  modal?: boolean
  /** 是否使用 Portal 渲染，默认 true */
  portalled?: boolean
  /** 定位配置 */
  positioning?: PositioningOptions
  /** 打开延迟 (ms)，仅 hover 模式有效，默认 700 */
  openDelay?: number
  /** 关闭延迟 (ms)，仅 hover 模式有效，默认 300 */
  closeDelay?: number
  /** 打开状态变化回调 */
  onOpenChange?: (details: {open: boolean}) => void
}
