/**
 * @beeve/ui - Tabs Component
 * 选项卡组件 - 基于 @zag-js/tabs 实现
 *
 * 功能特性：
 * - 水平/垂直布局
 * - 多种样式变体（default/filled/card/pill/underline）
 * - 懒加载（lazyMount）- 首次激活时才挂载内容
 * - Keep-alive（keepAlive）- 切换后保持状态不销毁
 * - 卸载控制（unmountOnExit）- 离开后卸载内容
 * - 键盘导航支持
 */

import {
  createMemo,
  createUniqueId,
  splitProps,
  Show,
  createSignal,
  createEffect,
  type Component,
  type JSX,
  createContext,
  useContext,
} from 'solid-js'
import * as tabs from '@zag-js/tabs'
import {normalizeProps, useMachine} from '@zag-js/solid'
import {tv, type VariantProps} from 'tailwind-variants'

// ==================== Styles ====================

const tabsStyles = tv({
  slots: {
    root: 'flex data-[orientation=horizontal]:flex-col data-[orientation=vertical]:flex-row gap-2',
    list: [
      'flex',
      'data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:border-b data-[orientation=horizontal]:border-border',
      'data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-r data-[orientation=vertical]:border-border',
    ],
    trigger: [
      'inline-flex items-center justify-center whitespace-nowrap',
      'font-medium transition-all duration-200',
      'disabled:pointer-events-none disabled:opacity-50',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20',
      'data-[orientation=horizontal]:border-b-2 data-[orientation=horizontal]:border-transparent',
      'data-[orientation=vertical]:border-r-2 data-[orientation=vertical]:border-transparent',
    ],
    content: [
      'ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20',
    ],
    indicator: [
      'absolute bg-primary transition-all duration-200',
      'data-[orientation=horizontal]:bottom-0 data-[orientation=horizontal]:h-0.5',
      'data-[orientation=vertical]:right-0 data-[orientation=vertical]:w-0.5',
    ],
  },
  variants: {
    variant: {
      default: {
        trigger: [
          'hover:text-foreground data-[selected]:text-primary data-[selected]:border-primary',
          'text-muted-foreground',
        ],
      },
      filled: {
        list: 'gap-1 p-1 bg-muted rounded-[var(--radius)]',
        trigger: [
          'rounded-[calc(var(--radius)-4px)]',
          'hover:bg-accent hover:text-accent-foreground',
          'data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm',
          'data-[selected]:border-transparent',
        ],
      },
      card: {
        list: 'gap-2 p-0',
        trigger: [
          'border border-border rounded-[var(--radius)]',
          'hover:bg-accent hover:text-accent-foreground',
          'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:border-primary',
        ],
      },
      pill: {
        list: 'gap-1 p-1 bg-muted rounded-full',
        trigger: [
          'rounded-full',
          'hover:bg-accent hover:text-accent-foreground',
          'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:shadow-sm',
          'data-[selected]:border-transparent',
        ],
      },
      underline: {
        trigger: [
          'hover:text-foreground',
          'data-[selected]:text-primary data-[selected]:border-primary',
          'text-muted-foreground',
        ],
      },
    },
    size: {
      sm: {
        trigger: 'h-7 px-2 text-xs gap-1.5',
        content: 'mt-2 text-xs',
      },
      md: {
        trigger: 'h-8 px-3 text-sm gap-2',
        content: 'mt-3 text-sm',
      },
      lg: {
        trigger: 'h-9 px-4 text-sm gap-2',
        content: 'mt-4 text-sm',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export type TabsVariants = VariantProps<typeof tabsStyles>

// ==================== Context ====================

interface TabsContextValue {
  api: () => tabs.Api
  styles: ReturnType<typeof tabsStyles>
  lazyMount?: boolean
  keepAlive?: boolean
  unmountOnExit?: boolean
}

const TabsContext = createContext<TabsContextValue>()

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs compound components must be used within <Tabs>')
  }
  return context
}

// ==================== Tabs Root ====================

export interface TabsProps extends TabsVariants {
  /** 当前激活的 tab（受控模式） */
  value?: string
  /** 默认激活的 tab（非受控模式） */
  defaultValue?: string
  /** tab 值变化时的回调 */
  onValueChange?: (details: tabs.ValueChangeDetails) => void
  /** 焦点 tab 变化时的回调 */
  onFocusChange?: (details: tabs.FocusChangeDetails) => void
  /** 布局方向 */
  orientation?: 'horizontal' | 'vertical'
  /** 是否循环键盘导航 */
  loop?: boolean
  /** 激活模式：automatic（获得焦点即激活）或 manual（需要 Enter 或点击） */
  activationMode?: 'automatic' | 'manual'
  /** 首次激活时才挂载内容（性能优化） */
  lazyMount?: boolean
  /** 切换后保持挂载状态（状态保持） */
  keepAlive?: boolean
  /** 离开后卸载（内存优化，与 keepAlive 互斥） */
  unmountOnExit?: boolean
  /** 自定义 class */
  class?: string
  /** 子元素 */
  children?: JSX.Element
}

export const Tabs: Component<TabsProps> = (props) => {
  const [local, variants] = splitProps(
    props,
    [
      'class',
      'children',
      'value',
      'defaultValue',
      'onValueChange',
      'onFocusChange',
      'orientation',
      'loop',
      'activationMode',
      'lazyMount',
      'keepAlive',
      'unmountOnExit',
    ],
    ['variant', 'size'],
  )

  const service = useMachine(tabs.machine, () => ({
    id: createUniqueId(),
    value: local.value,
    defaultValue: local.defaultValue,
    onValueChange: local.onValueChange,
    onFocusChange: local.onFocusChange,
    orientation: local.orientation,
    loopFocus: local.loop,
    activationMode: local.activationMode,
  }))

  const api = createMemo(() => tabs.connect(service, normalizeProps))
  const styles = tabsStyles(variants)

  const contextValue: TabsContextValue = {
    api,
    styles,
    lazyMount: local.lazyMount,
    keepAlive: local.keepAlive,
    unmountOnExit: local.unmountOnExit,
  }

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        {...api().getRootProps()}
        class={styles.root({class: local.class})}
      >
        {local.children}
      </div>
    </TabsContext.Provider>
  )
}

// ==================== TabsList ====================

export interface TabsListProps {
  class?: string
  children?: JSX.Element
}

export const TabsList: Component<TabsListProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const {api, styles} = useTabsContext()

  return (
    <div
      {...api().getListProps()}
      class={styles.list({class: local.class})}
      {...rest}
    >
      {local.children}
    </div>
  )
}

// ==================== TabsTrigger ====================

export interface TabsTriggerProps {
  /** tab 的唯一标识 */
  value: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义 class */
  class?: string
  /** 子元素 */
  children?: JSX.Element
}

export const TabsTrigger: Component<TabsTriggerProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'class',
    'children',
    'value',
    'disabled',
  ])
  const {api, styles} = useTabsContext()

  return (
    <button
      {...api().getTriggerProps({value: local.value, disabled: local.disabled})}
      class={styles.trigger({class: local.class})}
      {...rest}
    >
      {local.children}
    </button>
  )
}

// ==================== TabsContent ====================

export interface TabsContentProps {
  /** tab 的唯一标识 */
  value: string
  /** 自定义 class */
  class?: string
  /** 子元素 */
  children?: JSX.Element
}

export const TabsContent: Component<TabsContentProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children', 'value'])
  const {api, styles, lazyMount, keepAlive, unmountOnExit} = useTabsContext()

  // 追踪是否曾经被激活过（用于 lazyMount）
  const [everActivated, setEverActivated] = createSignal(false)
  const isActive = () => api().value === local.value

  createEffect(() => {
    if (isActive()) {
      setEverActivated(true)
    }
  })

  // 计算是否应该渲染
  const shouldRender = () => {
    // 如果开启 lazyMount 且从未激活过，不渲染
    if (lazyMount && !everActivated()) {
      return false
    }

    // 如果开启 keepAlive，始终渲染（用 hidden 控制显示）
    if (keepAlive) {
      return true
    }

    // 如果开启 unmountOnExit，只在激活时渲染
    if (unmountOnExit) {
      return isActive()
    }

    // 默认：首次激活后始终渲染（用 hidden 控制显示）
    return everActivated()
  }

  return (
    <Show when={shouldRender()}>
      <div
        {...api().getContentProps({value: local.value})}
        class={styles.content({class: local.class})}
        hidden={keepAlive && !isActive()}
        {...rest}
      >
        {local.children}
      </div>
    </Show>
  )
}

// ==================== TabsIndicator ====================

export interface TabsIndicatorProps {
  class?: string
}

export const TabsIndicator: Component<TabsIndicatorProps> = (props) => {
  const [local, rest] = splitProps(props, ['class'])
  const {api, styles} = useTabsContext()

  return (
    <div
      {...api().getIndicatorProps()}
      class={styles.indicator({class: local.class})}
      {...rest}
    />
  )
}
