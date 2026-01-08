/**
 * @beeve/ui - Collapsible Primitive Types
 * 基于 @zag-js/collapsible 的类型定义
 */

import type * as collapsible from '@zag-js/collapsible'
import type { PropTypes } from '@zag-js/solid'
import type { Accessor } from 'solid-js'

export type CollapsibleApi = collapsible.Api<PropTypes>
export type CollapsibleService = collapsible.Service

/** 可以是值或 Accessor */
export type MaybeAccessor<T> = T | Accessor<T>

export interface UseCollapsibleProps {
  /** 唯一标识 */
  id?: string
  /** 是否展开（受控），支持响应式 Accessor */
  open?: MaybeAccessor<boolean>
  /** 默认是否展开（非受控） */
  defaultOpen?: boolean
  /** 是否禁用 */
  disabled?: MaybeAccessor<boolean>
  /** 展开状态变化回调 */
  onOpenChange?: (details: { open: boolean }) => void
}

export interface UseCollapsibleReturn {
  api: () => CollapsibleApi
  service: CollapsibleService
}

