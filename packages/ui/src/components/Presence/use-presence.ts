/**
 * usePresence hook - 基于 @zag-js/presence 实现
 * 用于处理元素的进入/退出动画，确保退出动画完成后再卸载元素
 *
 * 参考 ark-ui 的实现：
 * https://github.com/chakra-ui/ark/blob/main/packages/solid/src/components/presence/use-presence.ts
 */

import * as presence from '@zag-js/presence'
import {normalizeProps, useMachine} from '@zag-js/solid'
import {createEffect, createMemo, createSignal} from 'solid-js'

export interface UsePresenceProps {
  /**
   * 控制元素是否显示
   */
  present: boolean
  /**
   * 是否懒加载（首次 present=true 时才挂载）
   * @default false
   */
  lazyMount?: boolean
  /**
   * 退出动画完成后是否卸载元素
   * @default false
   */
  unmountOnExit?: boolean
  /**
   * 退出动画完成时的回调
   */
  onExitComplete?: () => void
}

export interface UsePresenceReturn {
  /**
   * 元素是否应该被卸载（不渲染）
   */
  unmounted: boolean
  /**
   * 元素是否处于显示状态（包括退出动画进行中）
   */
  isPresent: boolean
  /**
   * 需要绑定到目标元素的 ref
   */
  setRef: (node: HTMLElement | null) => void
  /**
   * 需要绑定到目标元素的属性
   */
  presenceProps: {
    hidden: boolean
    'data-state': 'open' | 'closed'
  }
}

export function usePresence(
  props: () => UsePresenceProps,
): () => UsePresenceReturn {
  const [wasEverPresent, setWasEverPresent] = createSignal(false)

  // 使用 @zag-js/presence 状态机
  const service = useMachine(presence.machine, () => ({
    present: props().present,
    onExitComplete: props().onExitComplete,
  }))

  const api = createMemo(() => presence.connect(service, normalizeProps))

  // 追踪是否曾经显示过
  createEffect(() => {
    if (api().present) {
      setWasEverPresent(true)
    }
  })

  // 设置节点引用
  const setRef = (node: HTMLElement | null) => {
    if (!node) {
      return
    }
    service.send({type: 'NODE.SET', node})
  }

  return createMemo(() => {
    const currentProps = props()
    const isPresent = api().present

    // 计算是否应该卸载
    const shouldUnmount =
      // 懒加载：首次显示前不挂载
      (!isPresent && !wasEverPresent() && currentProps.lazyMount) ||
      // 退出时卸载：退出动画完成后卸载
      (currentProps.unmountOnExit && !isPresent && wasEverPresent())

    return {
      unmounted: shouldUnmount ?? false,
      isPresent,
      setRef,
      presenceProps: {
        hidden: !isPresent,
        'data-state': (currentProps.present ? 'open' : 'closed') as
          | 'open'
          | 'closed',
      },
    }
  })
}
