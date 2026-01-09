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
    root: 'flex flex-col gap-1 py-2 px-3',
    group: 'flex flex-col',
    groupLabel: [
      'flex h-9 items-center text-xs font-medium tracking-wide',
      'text-sidebar-foreground/40 uppercase select-none',
    ],
    divider: 'my-2 h-px bg-sidebar-border/50',
    item: [
      'group/item relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-left outline-none',
      'text-[13px] text-sidebar-foreground/70',
      'hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
      'focus-visible:text-sidebar-foreground focus-visible:bg-sidebar-accent/50',
      'transition-colors duration-150 cursor-pointer select-none',
      '[&>svg]:size-[18px] [&>svg]:shrink-0 [&>svg]:text-sidebar-foreground/40',
      '[&>svg]:transition-colors [&>svg]:duration-150',
      'hover:[&>svg]:text-sidebar-foreground/70',
    ],
    itemActive: [
      'text-sidebar-primary bg-sidebar-primary/8',
      '[&>svg]:text-sidebar-primary/70',
      'hover:text-sidebar-primary hover:bg-sidebar-primary/12',
      'hover:[&>svg]:text-sidebar-primary',
    ],
    // 父级菜单展开时的样式
    itemExpanded: [
      'text-sidebar-foreground bg-sidebar-accent/40',
      '[&>svg]:text-sidebar-foreground/60',
    ],
    itemDisabled: 'pointer-events-none opacity-40',
    itemLabel: 'flex-1 truncate font-medium',
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
    // 子菜单容器 - 带背景和左侧边框表示层级
    subMenuWrapper: [
      'relative mt-1 rounded-md overflow-hidden',
      'bg-sidebar-accent/25',
    ],
    subMenu: [
      'flex min-w-0 flex-col py-1',
      'overflow-hidden',
    ],
    // 子菜单项 - 简洁文字，通过缩进表示层级
    subMenuItem: [
      'text-[13px] py-1.5 px-3',
      'text-sidebar-foreground/60',
      'hover:text-sidebar-foreground',
    ],
    subMenuItemActive: [
      'text-sidebar-primary',
      'hover:text-sidebar-primary',
    ],
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
    root: 'flex items-center gap-1',
    list: 'flex items-center gap-1',
    item: 'relative',
    trigger: [
      'inline-flex items-center gap-1.5 px-3 py-2 rounded-md',
      'text-sm font-medium text-foreground/70',
      'hover:text-foreground hover:bg-accent/50',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      'transition-colors duration-150 cursor-pointer select-none',
      '[&>svg]:size-4 [&>svg]:shrink-0',
    ],
    triggerActive: [
      'text-primary bg-primary/8',
      'hover:text-primary hover:bg-primary/12',
    ],
    triggerOpen: [
      'text-foreground bg-accent/50',
    ],
    link: [
      'inline-flex items-center gap-1.5 px-3 py-2 rounded-md',
      'text-sm font-medium text-foreground/70',
      'hover:text-foreground hover:bg-accent/50',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      'transition-colors duration-150 cursor-pointer select-none',
      '[&>svg]:size-4 [&>svg]:shrink-0',
    ],
    linkActive: [
      'text-primary bg-primary/8',
      'hover:text-primary hover:bg-primary/12',
    ],
    content: [
      'absolute top-full left-0 mt-1 min-w-[200px] z-50',
      'rounded-md border border-border bg-popover p-1 shadow-lg',
      'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    ],
    contentLink: [
      'flex w-full items-center gap-2 rounded-sm px-3 py-2',
      'text-sm text-popover-foreground/80',
      'hover:text-popover-foreground hover:bg-accent',
      'focus-visible:outline-none focus-visible:bg-accent',
      'transition-colors duration-150 cursor-pointer select-none',
      '[&>svg]:size-4 [&>svg]:shrink-0',
    ],
    contentLinkActive: [
      'text-primary bg-primary/8',
      'hover:text-primary hover:bg-primary/12',
    ],
    chevron: [
      'size-3.5 text-foreground/40 transition-transform duration-200',
    ],
    chevronOpen: 'rotate-180',
    indicator: [
      'absolute bottom-0 left-0 h-0.5 bg-primary',
      'transition-all duration-200 ease-out',
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

  // 根据层级计算内容缩进
  const contentIndentStyle = () =>
    depth() > 0 ? { 'padding-left': `${depth() * 16}px` } : {}

  return (
    <button
      type="button"
      class={styles().item({
        class: [
          isActive() && styles().itemActive(),
          props.item.disabled && styles().itemDisabled(),
          depth() > 0 && styles().subMenuItem(),
          depth() > 0 && isActive() && styles().subMenuItemActive(),
        ].filter(Boolean).join(' '),
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

/** 渲染带子菜单的菜单项（支持多层级递归） */
const NavMenuSubItem: Component<{
  item: NavMenuItemData & { children: NavMenuItemData[] }
  depth?: number
}> = (props) => {
  const ctx = useNavMenuContext()
  const styles = createMemo(() => navMenuStyles({ collapsed: ctx.collapsed() }))
  const isExpanded = () => ctx.expandedKeys().includes(props.item.key)
  const depth = () => props.depth ?? 0

  const { api } = useCollapsible({
    // 传递 Accessor 而不是立即求值，保持响应式
    open: isExpanded,
    onOpenChange: () => ctx.toggleExpanded(props.item.key),
  })

  // 根据层级计算内容缩进
  const contentIndentStyle = () =>
    depth() > 0 ? { 'padding-left': `${depth() * 16}px` } : {}

  return (
    <div {...api().getRootProps()}>
      <button
        {...api().getTriggerProps()}
        type="button"
        class={styles().item({
          class: [
            props.item.disabled && styles().itemDisabled(),
            isExpanded() && styles().itemExpanded(),
            depth() > 0 && styles().subMenuItem(),
          ].filter(Boolean).join(' '),
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

/** 水平导航菜单 - 使用 @zag-js/navigation-menu */
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

  const handleLinkClick = (key: string, onClick?: () => void) => {
    onClick?.()
    props.onValueChange?.(key)
  }

  return (
    <nav {...api().getRootProps()} class={styles.root({ class: props.class })}>
      <ul {...api().getListProps()} class={styles.list()}>
        <For each={menuItems()}>
          {(item) => {
            const hasChildren = navMenuHasChildren(item)
            const isActive = () => props.value === item.key
            const isOpen = () => api().value === item.key

            // 检查子项是否有激活的
            const hasActiveChild = () => {
              if (!item.children) return false
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
                      ].filter(Boolean).join(' '),
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
                  <Show when={isOpen()}>
                    <div
                      {...api().getContentProps({ value: item.key })}
                      class={styles.content()}
                    >
                      <For each={item.children}>
                        {(child) => {
                          const childActive = () => props.value === child.key

                          return (
                            <button
                              type="button"
                              class={styles.contentLink({
                                class: childActive() ? styles.contentLinkActive() : '',
                              })}
                              onClick={() => handleLinkClick(child.key, child.onClick)}
                            >
                              <Show when={child.icon}>{child.icon}</Show>
                              <span>{child.label}</span>
                            </button>
                          )
                        }}
                      </For>
                    </div>
                  </Show>
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
      </ul>
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
