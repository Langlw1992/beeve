/**
 * @beeve/ui - Sidebar Component
 * 侧边栏组件，用于应用程序的主导航区域
 *
 * 支持三种折叠模式：
 * - none: 不可折叠
 * - icon: 折叠为仅显示图标
 * - offcanvas: 完全隐藏
 *
 * @example
 * ```tsx
 * <Sidebar.Provider defaultOpen collapsible="icon">
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
 * </Sidebar.Provider>
 * ```
 */

import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  Show,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type ComponentProps,
} from 'solid-js'
import { tv } from 'tailwind-variants'
import { PanelLeft, PanelLeftClose } from 'lucide-solid'

// ==================== 常量 ====================

const SIDEBAR_WIDTH = '16rem' // 256px
const SIDEBAR_WIDTH_ICON = '3.5rem' // 56px
const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

// ==================== 样式定义 ====================

const sidebarStyles = tv({
  slots: {
    wrapper: 'group/sidebar flex min-h-svh w-full',
    sidebar: [
      'relative flex h-svh flex-col bg-sidebar text-sidebar-foreground',
      'border-r border-sidebar-border/60',
      'transition-[width] duration-200 ease-in-out',
    ],
    header: [
      'flex h-14 shrink-0 items-center gap-2 px-4',
    ],
    content: [
      'flex-1 overflow-y-auto overflow-x-hidden',
    ],
    footer: [
      'mt-auto shrink-0 p-3',
    ],
    trigger: [
      'inline-flex items-center justify-center size-8 rounded-md',
      'text-sidebar-foreground/50 hover:text-sidebar-foreground',
      'hover:bg-sidebar-accent/60',
      'transition-colors duration-150 cursor-pointer outline-none',
      'focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
    ],
  },
  variants: {
    collapsed: {
      true: {
        sidebar: 'w-(--sidebar-width-icon)',
        header: 'px-0 justify-center',
        content: 'px-0',
        footer: 'px-0 flex justify-center',
      },
      false: {
        sidebar: 'w-(--sidebar-width)',
      },
    },
    hidden: {
      true: {
        sidebar: 'w-0 border-r-0 overflow-hidden',
      },
    },
  },
  defaultVariants: {
    collapsed: false,
    hidden: false,
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
  collapsible: Accessor<CollapsibleMode>
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
  /** 折叠模式：offcanvas（完全隐藏）| icon（仅图标）| none（不可折叠） */
  collapsible?: CollapsibleMode
}

export interface SidebarProps extends ComponentProps<'aside'> {}
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
    'collapsible',
    'children',
    'class',
    'style',
  ])

  // 内部状态
  const [internalOpen, setInternalOpen] = createSignal(local.defaultOpen ?? true)

  // 计算当前状态
  const open = () => local.open ?? internalOpen()
  const state = () => (open() ? 'expanded' : 'collapsed') as SidebarState
  const collapsible = () => local.collapsible ?? 'icon'

  const setOpen = (value: boolean) => {
    // 如果不可折叠，忽略
    if (collapsible() === 'none') {
      return
    }
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
    if (typeof window === 'undefined') {
      return
    }
    if (collapsible() === 'none') {
      return
    }

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
        collapsible,
      }}
    >
      <div
        data-slot="sidebar-wrapper"
        data-state={state()}
        data-collapsible={collapsible()}
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

const SidebarRoot: Component<SidebarProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const { state, open, collapsible } = useSidebar()

  const styles = createMemo(() => {
    const mode = collapsible()
    const isOpen = open()

    if (mode === 'none') {
      return sidebarStyles({ collapsed: false, hidden: false })
    }

    if (mode === 'offcanvas') {
      return sidebarStyles({ collapsed: false, hidden: !isOpen })
    }

    // icon mode
    return sidebarStyles({ collapsed: !isOpen, hidden: false })
  })

  return (
    <aside
      data-slot="sidebar"
      data-state={state()}
      data-collapsible={collapsible()}
      class={styles().sidebar({ class: local.class })}
      {...rest}
    >
      {local.children}
    </aside>
  )
}

const SidebarHeader: Component<SidebarHeaderProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const { open, collapsible } = useSidebar()

  const styles = createMemo(() => {
    const mode = collapsible()
    const isOpen = open()
    if (mode === 'icon' && !isOpen) {
      return sidebarStyles({ collapsed: true })
    }
    return sidebarStyles({ collapsed: false })
  })

  return (
    <div data-slot="sidebar-header" class={styles().header({ class: local.class })} {...rest}>
      {local.children}
    </div>
  )
}

const SidebarContent: Component<SidebarContentProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const { open, collapsible } = useSidebar()

  const styles = createMemo(() => {
    const mode = collapsible()
    const isOpen = open()
    if (mode === 'icon' && !isOpen) {
      return sidebarStyles({ collapsed: true })
    }
    return sidebarStyles({ collapsed: false })
  })

  return (
    <div data-slot="sidebar-content" class={styles().content({ class: local.class })} {...rest}>
      {local.children}
    </div>
  )
}

const SidebarFooter: Component<SidebarFooterProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const { open, collapsible } = useSidebar()

  const styles = createMemo(() => {
    const mode = collapsible()
    const isOpen = open()
    if (mode === 'icon' && !isOpen) {
      return sidebarStyles({ collapsed: true })
    }
    return sidebarStyles({ collapsed: false })
  })

  return (
    <div data-slot="sidebar-footer" class={styles().footer({ class: local.class })} {...rest}>
      {local.children}
    </div>
  )
}

const SidebarTrigger: Component<SidebarTriggerProps> = (props) => {
  const [local, rest] = splitProps(props, ['class'])
  const { toggleSidebar, open, collapsible } = useSidebar()
  const styles = sidebarStyles()

  // 不可折叠时不显示
  if (collapsible() === 'none') {
    return null
  }

  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      class={styles.trigger({ class: local.class })}
      onClick={toggleSidebar}
      title={open() ? '收起侧边栏' : '展开侧边栏'}
      {...rest}
    >
      <Show when={open()} fallback={<PanelLeft class="size-4" />}>
        <PanelLeftClose class="size-4" />
      </Show>
      <span class="sr-only">Toggle Sidebar</span>
    </button>
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
