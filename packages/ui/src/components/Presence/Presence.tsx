/**
 * Presence 组件 - 用于处理元素的进入/退出动画
 *
 * 基于 @zag-js/presence 实现，确保退出动画完成后再卸载元素
 */

import { type JSX, Show, createMemo } from 'solid-js'
import { usePresence, type UsePresenceProps } from './use-presence'

export interface PresenceProps extends UsePresenceProps {
  /**
   * 子元素（函数形式可以获取 presence 状态）
   */
  children: JSX.Element | ((props: { isPresent: boolean }) => JSX.Element)
}

/**
 * Presence 组件
 *
 * @example
 * ```tsx
 * <Presence present={isOpen()} unmountOnExit>
 *   <div class="data-[state=open]:animate-in data-[state=closed]:animate-out">
 *     Content with exit animation
 *   </div>
 * </Presence>
 * ```
 */
export function Presence(props: PresenceProps) {
  const presence = usePresence(() => ({
    present: props.present,
    lazyMount: props.lazyMount,
    unmountOnExit: props.unmountOnExit,
    onExitComplete: props.onExitComplete,
  }))

  const resolved = createMemo(() => {
    const child = props.children
    if (typeof child === 'function') {
      return child({ isPresent: presence().isPresent })
    }
    return child
  })

  return (
    <Show when={!presence().unmounted}>
      {resolved()}
    </Show>
  )
}

