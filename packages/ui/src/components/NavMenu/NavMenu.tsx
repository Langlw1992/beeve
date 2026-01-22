/**
 * @beeve/ui - NavMenu Component
 * 导航菜单组件，适用于侧边栏导航
 *
 * @example
 * ```tsx
 * const items = [
 *   { key: 'home', label: '首页', icon: <Home /> },
 *   { type: 'divider' },
 *   {
 *     type: 'group',
 *     key: 'content',
 *     label: '内容管理',
 *     children: [
 *       { key: 'pages', label: '页面', icon: <FileText /> },
 *       { key: 'posts', label: '文章', icon: <Edit />, badge: 12 },
 *     ]
 *   },
 *   {
 *     key: 'settings',
 *     label: '设置',
 *     icon: <Settings />,
 *     children: [
 *       { key: 'profile', label: '个人资料' },
 *       { key: 'security', label: '安全设置' },
 *     ]
 *   },
 * ]
 *
 * <NavMenu
 *   items={items}
 *   value={activeKey()}
 *   onValueChange={setActiveKey}
 * />
 * ```
 */

import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  Show,
  splitProps,
  useContext,
  type Accessor,
  type Component,
} from 'solid-js'
import { tv } from 'tailwind-variants'
import { ChevronRight, ChevronDown } from 'lucide-solid'
import * as navigationMenu from '@zag-js/navigation-menu'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { useCollapsible } from '../../primitives/collapsible'
import type {
  NavMenuProps,
  NavMenuItemType,
  NavMenuItemData,
  NavMenuGroupData,
} from './types'
import {
  isNavMenuDivider,
  isNavMenuGroup,
  isNavMenuItem,
  navMenuHasChildren,
} from './types'

// ==================== 样式定义 ====================

const navMenuStyles = tv({
  slots: {
    root: 'flex flex-col gap-1 p-3',
    group: 'flex flex-col gap-1',
    groupLabel: [
      'flex h-9 items-center text-xs font-medium tracking-wide',
      'text-sidebar-foreground/40 uppercase select-none',
    ],
    divider: 'my-2 h-px bg-sidebar-border/50',
    item: [
      'group/item relative flex w-full items-center gap-2 rounded-md p-2 text-left outline-none',
      'text-[13px] text-sidebar-foreground/70',
      'hover:bg-sidebar-accent',
      'focus-visible:bg-sidebar-accent',
      'transition-colors duration-150 cursor-pointer select-none',
      '[&>svg]:size-[18px] [&>svg]:shrink-0 [&>svg]:text-sidebar-foreground/40',
    ],
    // active 状态：主题色文字 + 背景，hover 保持
    itemActive: 'text-sidebar-primary bg-sidebar-primary/10 hover:bg-sidebar-primary/15 [&>svg]:text-sidebar-primary/70',
    // 父级菜单展开时的样式：无特殊高亮
    itemExpanded: '',
    // 子节点被选中时，父节点高亮
    itemHasActiveChild: 'text-sidebar-primary [&>svg]:text-sidebar-primary/70',
    itemDisabled: 'pointer-events-none opacity-40',
    itemLabel: 'flex-1 truncate',
    itemBadge: [
      'ml-auto flex h-5 min-w-5 items-center justify-center rounded px-1.5',
      'text-[10px] font-medium tabular-nums',
      'bg-sidebar-foreground/8 text-sidebar-foreground/60',
    ],
    itemBadgeActive: 'bg-sidebar-primary/15 text-sidebar-primary',
    itemChevron: [
      'ml-auto size-4 shrink-0 text-sidebar-foreground/30',
      'transition-transform duration-200 ease-out',
    ],
    itemChevronOpen: 'rotate-90',
    // 子菜单容器
    subMenuWrapper: [
      'relative mt-1 overflow-hidden',
    ],
    subMenu: [
      'flex min-w-0 flex-col gap-1',
      'overflow-hidden',
    ],
    // 子菜单项：简化为选中/未选中两种状态
    subMenuItem: 'text-[13px] py-1.5 px-3 text-sidebar-foreground/60 hover:bg-sidebar-accent',
    subMenuItemActive: 'text-sidebar-primary bg-sidebar-primary/10 hover:bg-sidebar-primary/15',
  },
  variants: {
    collapsed: {
      true: {
        root: 'py-2 px-2 items-center',
        item: 'justify-center px-0 py-2 size-10 rounded-md',
        itemLabel: 'sr-only',
        itemBadge: 'hidden',
        itemChevron: 'hidden',
        groupLabel: 'sr-only',
        divider: 'mx-0',
        subMenuWrapper: 'hidden',
        subMenu: 'hidden',
      },
    },
  },
  defaultVariants: {
    collapsed: false,
  },
})

// 水平导航菜单样式
const horizontalNavStyles = tv({
  slots: {
    root: 'relative',
    list: 'relative flex items-center gap-1',
    item: 'relative',
    trigger: [
      'inline-flex items-center gap-1.5 px-3 py-2 rounded-md',
      'text-sm font-medium text-foreground/70',
      'hover:bg-accent',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      'transition-colors duration-150 cursor-pointer select-none',
      '[&>svg]:size-4 [&>svg]:shrink-0',
    ],
    // active 状态：无 hover 变化
    triggerActive: 'text-primary bg-primary/8 hover:bg-primary/8',
    triggerOpen: 'text-primary bg-accent',
    link: [
      'inline-flex items-center gap-1.5 px-3 py-2 rounded-md',
      'text-sm font-medium text-foreground/70',
      'hover:bg-accent',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      'transition-colors duration-150 cursor-pointer select-none',
      '[&>svg]:size-4 [&>svg]:shrink-0',
    ],
    linkActive: 'text-primary bg-primary/8 hover:bg-primary/8',
    // Viewport 相关样式 - 使用 CSS 变量实现位置移动动画
    viewportPositioner: [
      'absolute top-full left-0',
      // transform 通过内联 style 设置，使用 --viewport-x CSS 变量
      'transition-transform duration-300 ease-out',
    ],
    viewport: [
      'relative mt-1.5',
      'w-[var(--viewport-width)] h-[var(--viewport-height)]',
      'rounded-md border border-border bg-popover shadow-lg',
      'origin-top-left overflow-hidden',
      // 进入/退出动画
      'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      // 尺寸过渡动画
      'transition-[width,height] duration-300 ease-out',
    ],
    content: [
      'absolute top-0 left-0 min-w-[420px] p-3',
      // 2列网格布局（用于卡片式菜单）
      'grid grid-cols-2 gap-1',
      // 方向性动画
      'data-[motion=from-start]:animate-in data-[motion=from-start]:slide-in-from-left-4',
      'data-[motion=from-end]:animate-in data-[motion=from-end]:slide-in-from-right-4',
      'data-[motion=to-start]:animate-out data-[motion=to-start]:slide-out-to-left-4',
      'data-[motion=to-end]:animate-out data-[motion=to-end]:slide-out-to-right-4',
    ],
    contentLink: [
      'flex w-full items-start gap-3 rounded-md px-3 py-2',
      'text-sm text-popover-foreground/80',
      'hover:bg-accent',
      'focus-visible:outline-none focus-visible:bg-accent',
      'transition-colors duration-150 cursor-pointer select-none',
      '[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:mt-0.5',
    ],
    contentLinkActive: 'text-primary bg-primary/8 hover:bg-primary/8',
    contentLinkText: 'flex flex-col gap-0.5 items-start',
    contentLinkLabel: 'font-medium text-popover-foreground',
    contentLinkDescription: 'text-xs text-muted-foreground font-normal',
    chevron: [
      'size-3.5 text-foreground/40 transition-transform duration-200',
    ],
    chevronOpen: 'rotate-180',
    // 指示器样式 - 使用 CSS 变量实现平滑移动
    // 注意: 位置和尺寸通过内联样式的 CSS 变量控制
    indicator: [
      'absolute bottom-0 left-0 h-0.5 bg-primary rounded-full',
      // 使用 translate 和 width 的过渡动画
      '[transition:translate_250ms_ease,width_250ms_ease]',
    ],
  },
})

// ==================== Context ====================

interface NavMenuContextValue {
  value: Accessor<string | undefined>
  onValueChange: (key: string) => void
  expandedKeys: Accessor<string[]>
  toggleExpanded: (key: string) => void
  collapsed: Accessor<boolean>
}

const NavMenuContext = createContext<NavMenuContextValue>()

function useNavMenuContext() {
  const ctx = useContext(NavMenuContext)
  if (!ctx) {
    throw new Error('NavMenu components must be used within NavMenuContext')
  }
  return ctx
}

// ==================== 子组件 ====================

/** 渲染普通菜单项 */
const NavMenuItem: Component<{
  item: NavMenuItemData
  depth?: number
}> = (props) => {
  const ctx = useNavMenuContext()
  const styles = createMemo(() => navMenuStyles({ collapsed: ctx.collapsed() }))
  const isActive = () => ctx.value() === props.item.key
  const depth = () => props.depth ?? 0

  const handleClick = () => {
    if (props.item.disabled) {
      return
    }
    props.item.onClick?.()
    ctx.onValueChange(props.item.key)
  }

  // 根据层级计算内容缩进（与 icon 宽度 18px + gap 8px 一致）
  const contentIndentStyle = () =>
    depth() > 0 ? { 'padding-left': `${depth() * 26}px` } : {}

  return (
    <button
      type="button"
      class={styles().item({
        class: [
          isActive() && styles().itemActive(),
          props.item.disabled && styles().itemDisabled(),
          depth() > 0 && styles().subMenuItem(),
          depth() > 0 && isActive() && styles().subMenuItemActive(),
        ],
      })}
      style={contentIndentStyle()}
      onClick={handleClick}
      disabled={props.item.disabled}
      title={ctx.collapsed() ? props.item.label : undefined}
    >
      <Show when={props.item.icon}>{props.item.icon}</Show>
      <span class={styles().itemLabel()}>{props.item.label}</span>
      <Show when={props.item.badge !== undefined}>
        <span class={styles().itemBadge({ class: isActive() ? styles().itemBadgeActive() : '' })}>
          {props.item.badge}
        </span>
      </Show>
    </button>
  )
}

/** 递归检查子节点是否包含选中项 */
function hasActiveChild(children: NavMenuItemData[], activeKey: string | undefined): boolean {
  if (!activeKey) { return false }
  for (const child of children) {
    if (child.key === activeKey) { return true }
    if (navMenuHasChildren(child)) {
      const childWithChildren = child as NavMenuItemData & { children: NavMenuItemData[] }
      if (hasActiveChild(childWithChildren.children, activeKey)) { return true }
    }
  }
  return false
}

/** 渲染带子菜单的菜单项（支持多层级递归） */
const NavMenuSubItem: Component<{
  item: NavMenuItemData & { children: NavMenuItemData[] }
  depth?: number
}> = (props) => {
  const ctx = useNavMenuContext()
  const styles = createMemo(() => navMenuStyles({ collapsed: ctx.collapsed() }))
  const isExpanded = () => ctx.expandedKeys().includes(props.item.key)
  const depth = () => props.depth ?? 0
  const isChildActive = () => hasActiveChild(props.item.children, ctx.value())

  // 受控模式：open 和 onOpenChange 配合使用
  const { api } = useCollapsible({
    open: isExpanded,
    onOpenChange: () => {
      ctx.toggleExpanded(props.item.key)
    },
  })

  // 根据层级计算内容缩进（与 icon 宽度 18px + gap 8px 一致）
  const contentIndentStyle = () =>
    depth() > 0 ? { 'padding-left': `${depth() * 26}px` } : {}

  return (
    <div {...api().getRootProps()}>
      <button
        {...api().getTriggerProps()}
        type="button"
        class={styles().item({
          class: [
            props.item.disabled && styles().itemDisabled(),
            isChildActive() && styles().itemHasActiveChild(),
            depth() > 0 && styles().subMenuItem(),
          ],
        })}
        style={contentIndentStyle()}
        disabled={props.item.disabled}
        title={ctx.collapsed() ? props.item.label : undefined}
      >
        <Show when={props.item.icon}>{props.item.icon}</Show>
        <span class={styles().itemLabel()}>{props.item.label}</span>
        <ChevronRight
          class={styles().itemChevron({
            class: isExpanded() ? styles().itemChevronOpen() : '',
          })}
        />
      </button>
      <div {...api().getContentProps()}>
        <div class={styles().subMenuWrapper()}>
          <div class={styles().subMenu()}>
            <For each={props.item.children}>
              {(child) => {
                // 递归：如果子项还有 children，渲染 NavMenuSubItem
                if (navMenuHasChildren(child)) {
                  return (
                    <NavMenuSubItem
                      item={child as NavMenuItemData & { children: NavMenuItemData[] }}
                      depth={depth() + 1}
                    />
                  )
                }
                return <NavMenuItem item={child} depth={depth() + 1} />
              }}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 渲染分组 */
const NavMenuGroup: Component<{
  group: NavMenuGroupData
}> = (props) => {
  const ctx = useNavMenuContext()
  const styles = createMemo(() => navMenuStyles({ collapsed: ctx.collapsed() }))

  return (
    <div class={styles().group()}>
      <Show when={props.group.label}>
        <div class={styles().groupLabel()}>{props.group.label}</div>
      </Show>
      <NavMenuItems items={props.group.children} />
    </div>
  )
}

/** 渲染菜单项列表 */
const NavMenuItems: Component<{
  items: NavMenuItemType[]
}> = (props) => {
  const ctx = useNavMenuContext()
  const styles = createMemo(() => navMenuStyles({ collapsed: ctx.collapsed() }))

  return (
    <For each={props.items}>
      {(item) => {
        if (isNavMenuDivider(item)) {
          return <hr class={styles().divider()} />
        }

        if (isNavMenuGroup(item)) {
          return <NavMenuGroup group={item} />
        }

        if (isNavMenuItem(item)) {
          if (navMenuHasChildren(item)) {
            return (
              <NavMenuSubItem
                item={item as NavMenuItemData & { children: NavMenuItemData[] }}
              />
            )
          }
          return <NavMenuItem item={item} />
        }

        return null
      }}
    </For>
  )
}

// ==================== 水平导航菜单组件 ====================

/** 水平导航菜单 - 使用 @zag-js/navigation-menu 的 viewport 模式 */
const HorizontalNavMenu: Component<{
  items: NavMenuItemType[]
  value?: string
  onValueChange?: (key: string) => void
  class?: string
}> = (props) => {
  const styles = horizontalNavStyles()

  const service = useMachine(navigationMenu.machine, {
    id: createUniqueId(),
  })

  const api = createMemo(() => navigationMenu.connect(service, normalizeProps))

  // 手动跟踪指示器位置（因为 zag-js 的 --trigger-x 变量有问题）
  let listRef: HTMLUListElement | undefined
  const [indicatorStyle, setIndicatorStyle] = createSignal<{
    x: number
    width: number
    visible: boolean
  }>({ x: 0, width: 0, visible: false })

  // 当 api().value 变化时更新指示器位置
  createEffect(() => {
    const value = api().value
    if (!value || !listRef) {
      setIndicatorStyle({ x: 0, width: 0, visible: false })
      return
    }

    // 查找当前激活的触发器元素
    const trigger = listRef.querySelector(`[data-part="trigger"][data-value="${value}"]`)
    if (trigger instanceof HTMLElement) {
      const listRect = listRef.getBoundingClientRect()
      const triggerRect = trigger.getBoundingClientRect()
      setIndicatorStyle({
        x: triggerRect.left - listRect.left,
        width: triggerRect.width,
        visible: true,
      })
    }
  })

  // 过滤出有效的菜单项（排除分隔线和分组）
  const menuItems = createMemo(() => {
    const result: NavMenuItemData[] = []
    for (const item of props.items) {
      if (isNavMenuItem(item)) {
        result.push(item)
      } else if (isNavMenuGroup(item)) {
        // 将分组内的项目展平
        for (const child of item.children) {
          if (isNavMenuItem(child)) {
            result.push(child)
          }
        }
      }
    }
    return result
  })

  // 有子菜单的项
  const itemsWithChildren = createMemo(() =>
    menuItems().filter((item) => navMenuHasChildren(item))
  )

  const handleLinkClick = (key: string, onClick?: () => void) => {
    onClick?.()
    props.onValueChange?.(key)
  }

  return (
    <nav {...api().getRootProps()} class={styles.root({ class: props.class })}>
      {/* 列表容器 - 需要 relative 定位来正确放置指示器 */}
      <ul
        ref={(el) => {
          listRef = el
        }}
        {...api().getListProps()}
        class={styles.list()}
      >
          <For each={menuItems()}>
            {(item) => {
              const hasChildren = navMenuHasChildren(item)
              const isActive = () => props.value === item.key
              const isOpen = () => api().value === item.key

              // 检查子项是否有激活的
              const hasActiveChild = () => {
                if (!item.children) {
                  return false
                }
                return item.children.some((child) => props.value === child.key)
              }

              if (hasChildren) {
                // 带下拉菜单的项
                return (
                  <li {...api().getItemProps({ value: item.key })} class={styles.item()}>
                    <button
                      {...api().getTriggerProps({ value: item.key })}
                      class={styles.trigger({
                        class: [
                          (isActive() || hasActiveChild()) && styles.triggerActive(),
                          isOpen() && styles.triggerOpen(),
                        ],
                      })}
                    >
                      <Show when={item.icon}>{item.icon}</Show>
                      <span>{item.label}</span>
                      <ChevronDown
                        class={styles.chevron({
                          class: isOpen() ? styles.chevronOpen() : '',
                        })}
                      />
                    </button>
                    {/* 焦点管理代理 */}
                    <span {...api().getTriggerProxyProps({ value: item.key })} />
                    <span {...api().getViewportProxyProps({ value: item.key })} />
                  </li>
                )
              }

              // 普通链接项
              return (
                <li {...api().getItemProps({ value: item.key })} class={styles.item()}>
                  <button
                    type="button"
                    class={styles.link({
                      class: isActive() ? styles.linkActive() : '',
                    })}
                    onClick={() => handleLinkClick(item.key, item.onClick)}
                  >
                    <Show when={item.icon}>{item.icon}</Show>
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            }}
          </For>
          {/* 指示器 - 手动计算位置（因为 zag-js 的 --trigger-x 有问题） */}
          <Show when={indicatorStyle().visible}>
            <div
              class={styles.indicator()}
              style={{
                translate: `${indicatorStyle().x}px 0`,
                width: `${indicatorStyle().width}px`,
              }}
            />
          </Show>
      </ul>

      {/* 共享 Viewport - 所有下拉内容都在这里渲染 */}
      <div
        {...api().getViewportPositionerProps()}
        class={styles.viewportPositioner()}
        style={{ transform: 'translateX(var(--viewport-x, 0))' }}
      >
        <div {...api().getViewportProps()} class={styles.viewport()}>
          <For each={itemsWithChildren()}>
            {(item) => {
              const childActive = (childKey: string) => props.value === childKey

              return (
                <div
                  {...api().getContentProps({ value: item.key })}
                  class={styles.content()}
                >
                  <For each={item.children}>
                    {(child) => (
                      <button
                        type="button"
                        class={styles.contentLink({
                          class: childActive(child.key) ? styles.contentLinkActive() : '',
                        })}
                        onClick={() => handleLinkClick(child.key, child.onClick)}
                      >
                        <Show when={child.icon}>{child.icon}</Show>
                        <Show
                          when={child.description}
                          fallback={<span>{child.label}</span>}
                        >
                          <div class={styles.contentLinkText()}>
                            <span class={styles.contentLinkLabel()}>{child.label}</span>
                            <span class={styles.contentLinkDescription()}>{child.description}</span>
                          </div>
                        </Show>
                      </button>
                    )}
                  </For>
                </div>
              )
            }}
          </For>
        </div>
      </div>
    </nav>
  )
}

// ==================== 主组件 ====================

export const NavMenu: Component<NavMenuProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'items',
    'value',
    'defaultValue',
    'onValueChange',
    'defaultExpandedKeys',
    'expandedKeys',
    'onExpandedKeysChange',
    'collapsed',
    'direction',
    'class',
  ])

  // 方向：默认垂直
  const direction = () => local.direction ?? 'vertical'

  // 内部状态
  const [internalValue, setInternalValue] = createSignal(local.defaultValue)
  const [internalExpandedKeys, setInternalExpandedKeys] = createSignal<string[]>(
    local.defaultExpandedKeys ?? []
  )

  // 计算当前值
  const currentValue = () => local.value ?? internalValue()
  const currentExpandedKeys = () => local.expandedKeys ?? internalExpandedKeys()
  const collapsed = () => local.collapsed ?? false

  const handleValueChange = (key: string) => {
    setInternalValue(key)
    local.onValueChange?.(key)
  }

  const toggleExpanded = (key: string) => {
    const current = currentExpandedKeys()
    const newKeys = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key]
    setInternalExpandedKeys(newKeys)
    local.onExpandedKeysChange?.(newKeys)
  }

  // 水平模式
  if (direction() === 'horizontal') {
    return (
      <HorizontalNavMenu
        items={local.items}
        value={currentValue()}
        onValueChange={handleValueChange}
        class={local.class}
        {...rest}
      />
    )
  }

  // 垂直模式（默认）
  const styles = createMemo(() => navMenuStyles({ collapsed: collapsed() }))

  return (
    <NavMenuContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        expandedKeys: currentExpandedKeys,
        toggleExpanded,
        collapsed,
      }}
    >
      <nav class={styles().root({ class: local.class })} {...rest}>
        <NavMenuItems items={local.items} />
      </nav>
    </NavMenuContext.Provider>
  )
}
