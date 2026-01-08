/**
 * @beeve/ui - Sidebar Component
 * 侧边栏组件，用于应用程序的主导航区域
 *
 * 借鉴 shadcn/ui sidebar 实现：
 * - 使用 data-state 属性控制状态
 * - 使用 CSS 变量控制宽度
 * - 支持多种折叠模式
 *
 * @example
 * ```tsx
 * <SidebarProvider>
 *   <Sidebar>
 *     <Sidebar.Header>
 *       <Logo />
 *     </Sidebar.Header>
 *     <Sidebar.Content>
 *       <NavMenu items={menuItems} />
 *     </Sidebar.Content>
 *     <Sidebar.Footer>
 *       <Sidebar.Trigger />
 *     </Sidebar.Footer>
 *   </Sidebar>
 *   <main class="flex-1">...</main>
 * </SidebarProvider>
 * ```
 */

import {
  createContext,
  createEffect,
  createSignal,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type ComponentProps,
  type JSX,
} from 'solid-js'
import { tv } from 'tailwind-variants'
import { PanelLeftIcon } from 'lucide-solid'

// ==================== 常量 ====================

const SIDEBAR_WIDTH = '16rem' // 256px
const SIDEBAR_WIDTH_ICON = '3rem' // 48px
const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

// ==================== 样式定义 ====================

const sidebarStyles = tv({
  slots: {
    // 外层 wrapper，包含 sidebar 和主内容
    wrapper: [
      'group/sidebar-wrapper flex min-h-svh w-full',
      'has-[[data-variant=inset]]:bg-sidebar',
    ],
    // Sidebar 的外层容器（处理宽度占位）
    root: [
      'group peer hidden md:block text-sidebar-foreground',
    ],
    // 宽度占位（用于动画过渡）
    gap: [
      'relative bg-transparent transition-[width] duration-200 ease-linear',
      'w-[--sidebar-width]',
      // offcanvas 模式折叠时宽度为 0
      'group-data-[collapsible=offcanvas]:w-0',
      // icon 模式折叠时保持图标宽度
      'group-data-[collapsible=icon]:w-[--sidebar-width-icon]',
    ],
    // 实际的 sidebar 容器（fixed 定位）
    container: [
      'fixed inset-y-0 z-10 hidden h-svh md:flex',
      'w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear',
      // 左侧 sidebar
      'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]',
      // icon 模式宽度
      'group-data-[collapsible=icon]:w-[--sidebar-width-icon]',
      // 边框
      'border-r border-sidebar-border',
    ],
    // 内部内容区
    inner: [
      'flex h-full w-full flex-col bg-sidebar',
    ],
    header: [
      'flex flex-col gap-2 p-2',
    ],
    content: [
      'flex min-h-0 flex-1 flex-col gap-2 overflow-auto',
      'group-data-[collapsible=icon]:overflow-hidden',
    ],
    footer: [
      'flex flex-col gap-2 p-2 mt-auto',
    ],
    trigger: [
      'flex items-center justify-center size-7 rounded-md',
      'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      'transition-colors cursor-pointer outline-none',
      'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
    ],
  },
})

// ==================== Context ====================

type SidebarState = 'expanded' | 'collapsed'
type CollapsibleMode = 'offcanvas' | 'icon' | 'none'

interface SidebarContextValue {
  state: Accessor<SidebarState>
  open: Accessor<boolean>
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
  collapsible: CollapsibleMode
}

const SidebarContext = createContext<SidebarContextValue>()

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    throw new Error('Sidebar components must be used within SidebarProvider')
  }
  return ctx
}

// ==================== Types ====================

export interface SidebarProviderProps extends ComponentProps<'div'> {
  /** 是否展开（受控） */
  open?: boolean
  /** 默认是否展开 */
  defaultOpen?: boolean
  /** 展开状态变化回调 */
  onOpenChange?: (open: boolean) => void
}

export interface SidebarProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** 折叠模式：offcanvas（滑出）| icon（仅图标）| none（不可折叠） */
  collapsible?: CollapsibleMode
  /** 子元素 */
  children: JSX.Element
}

export interface SidebarHeaderProps extends ComponentProps<'div'> {}
export interface SidebarContentProps extends ComponentProps<'div'> {}
export interface SidebarFooterProps extends ComponentProps<'div'> {}
export interface SidebarTriggerProps extends Omit<ComponentProps<'button'>, 'children'> {}

// ==================== Provider ====================

const SidebarProvider: Component<SidebarProviderProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'open',
    'defaultOpen',
    'onOpenChange',
    'children',
    'class',
    'style',
  ])

  // 内部状态
  const [internalOpen, setInternalOpen] = createSignal(local.defaultOpen ?? true)

  // 计算当前状态
  const open = () => local.open ?? internalOpen()
  const state = () => (open() ? 'expanded' : 'collapsed') as SidebarState

  const setOpen = (value: boolean) => {
    setInternalOpen(value)
    local.onOpenChange?.(value)

    // 保存到 cookie
    if (typeof document !== 'undefined') {
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    }
  }

  const toggleSidebar = () => setOpen(!open())

  // 键盘快捷键
  createEffect(() => {
    if (typeof window === 'undefined') { return }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const styles = sidebarStyles()

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        toggleSidebar,
        collapsible: 'icon', // 默认使用 icon 模式
      }}
    >
      <div
        data-slot="sidebar-wrapper"
        style={{
          '--sidebar-width': SIDEBAR_WIDTH,
          '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
          ...(typeof local.style === 'object' ? local.style : {}),
        }}
        class={styles.wrapper({ class: local.class })}
        {...rest}
      >
        {local.children}
      </div>
    </SidebarContext.Provider>
  )
}

// ==================== 子组件 ====================

const SidebarHeader: Component<SidebarHeaderProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const styles = sidebarStyles()

  return (
    <div data-slot="sidebar-header" class={styles.header({ class: local.class })} {...rest}>
      {local.children}
    </div>
  )
}

const SidebarContent: Component<SidebarContentProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const styles = sidebarStyles()

  return (
    <div data-slot="sidebar-content" class={styles.content({ class: local.class })} {...rest}>
      {local.children}
    </div>
  )
}

const SidebarFooter: Component<SidebarFooterProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const styles = sidebarStyles()

  return (
    <div data-slot="sidebar-footer" class={styles.footer({ class: local.class })} {...rest}>
      {local.children}
    </div>
  )
}

const SidebarTrigger: Component<SidebarTriggerProps> = (props) => {
  const [local, rest] = splitProps(props, ['class'])
  const { toggleSidebar } = useSidebar()
  const styles = sidebarStyles()

  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      class={styles.trigger({ class: local.class })}
      onClick={toggleSidebar}
      {...rest}
    >
      <PanelLeftIcon class="size-4" />
      <span class="sr-only">Toggle Sidebar</span>
    </button>
  )
}

// ==================== 主 Sidebar 组件 ====================

const SidebarRoot: Component<SidebarProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'collapsible',
    'children',
    'class',
  ])

  const { state, collapsible: ctxCollapsible } = useSidebar()
  const collapsible = () => local.collapsible ?? ctxCollapsible
  const styles = sidebarStyles()

  // 不可折叠模式
  if (collapsible() === 'none') {
    return (
      <div
        data-slot="sidebar"
        class={styles.inner({ class: ['w-[--sidebar-width] h-full border-r border-sidebar-border', local.class] })}
        {...rest}
      >
        {local.children}
      </div>
    )
  }

  return (
    <div
      class={styles.root({ class: local.class })}
      data-state={state()}
      data-collapsible={state() === 'collapsed' ? collapsible() : ''}
      data-slot="sidebar"
      {...rest}
    >
      {/* 宽度占位 - 用于动画过渡 */}
      <div data-slot="sidebar-gap" class={styles.gap()} />

      {/* 实际 sidebar 容器 */}
      <div data-slot="sidebar-container" class={styles.container()}>
        <div data-slot="sidebar-inner" class={styles.inner()}>
          {local.children}
        </div>
      </div>
    </div>
  )
}

// ==================== 复合组件导出 ====================

export const Sidebar = Object.assign(SidebarRoot, {
  Provider: SidebarProvider,
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Trigger: SidebarTrigger,
})

