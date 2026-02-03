/**
 * @beeve/ui - useCollapsible Hook
 * 封装 @zag-js/collapsible 的状态机逻辑
 */

import {createMemo, createUniqueId} from 'solid-js'
import * as collapsible from '@zag-js/collapsible'
import {useMachine, normalizeProps} from '@zag-js/solid'
import type {
  UseCollapsibleProps,
  UseCollapsibleReturn,
  MaybeAccessor,
} from './types'

/** 解析 MaybeAccessor 为实际值 */
function access<T>(value: MaybeAccessor<T>): T {
  return typeof value === 'function' ? (value as () => T)() : value
}

/**
 * useCollapsible Hook
 *
 * @example
 * ```tsx
 * const { api } = useCollapsible({
 *   onOpenChange: ({ open }) => console.log('Open:', open)
 * })
 *
 * return (
 *   <div {...api().getRootProps()}>
 *     <button {...api().getTriggerProps()}>Toggle</button>
 *     <div {...api().getContentProps()}>Content</div>
 *   </div>
 * )
 * ```
 */
export function useCollapsible(
  props: UseCollapsibleProps = {},
): UseCollapsibleReturn {
  const service = useMachine(collapsible.machine, () => ({
    id: props.id ?? createUniqueId(),
    open: props.open !== undefined ? access(props.open) : undefined,
    defaultOpen: props.defaultOpen,
    disabled: props.disabled !== undefined ? access(props.disabled) : undefined,
    onOpenChange: props.onOpenChange,
  }))

  const api = createMemo(() => collapsible.connect(service, normalizeProps))

  return {api, service}
}
