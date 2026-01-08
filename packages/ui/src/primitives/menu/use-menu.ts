/**
 * @beeve/ui - Menu Hook
 * 基于 @zag-js/menu 实现
 */

import { createMemo, createUniqueId, type Accessor } from 'solid-js'
import * as menu from '@zag-js/menu'
import { useMachine, normalizeProps, type PropTypes } from '@zag-js/solid'
import type { UseMenuProps } from './types'

export type MenuApi = menu.Api<PropTypes>

/** Menu Service 类型 - 对应 @zag-js/menu 导出的 Service 类型 */
export type MenuService = menu.Service

export interface UseMenuReturn {
  api: Accessor<MenuApi>
  service: MenuService
}

/**
 * useMenu Hook
 *
 * 封装 @zag-js/menu 的状态机逻辑
 *
 * @example
 * ```tsx
 * const { api, service } = useMenu({
 *   onOpenChange: (open) => console.log('Menu open:', open)
 * })
 *
 * return <button {...api().getTriggerProps()}>Open Menu</button>
 * ```
 */
export function useMenu(props: UseMenuProps = {}): UseMenuReturn {
  const service = useMachine(menu.machine, () => ({
    id: props.id ?? createUniqueId(),
    open: props.open,
    defaultOpen: props.defaultOpen,
    closeOnSelect: props.closeOnSelect ?? true,
    loop: props.loop ?? true,
    positioning: props.positioning ?? {
      placement: 'bottom-start' as const,
    },
    'aria-label': props['aria-label'],
    onOpenChange: props.onOpenChange,
  }))

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return { api, service }
}
