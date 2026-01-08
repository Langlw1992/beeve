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
  For,
  Show,
  splitProps,
  useContext,
  type Accessor,
  type Component,
} from 'solid-js'
import { tv } from 'tailwind-variants'
import { ChevronDown } from 'lucide-solid'
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
    root: 'flex flex-col gap-1',
    group: 'flex flex-col gap-1',
    groupLabel: [
      'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium',
      'text-sidebar-foreground/70',
    ],
    divider: 'my-2 h-px bg-sidebar-border mx-2',
    item: [
      'flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none',
      'text-sidebar-foreground',
      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
      'transition-colors cursor-pointer select-none',
      '[&>svg]:size-4 [&>svg]:shrink-0',
    ],
    itemActive: [
      'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
    ],
    itemDisabled: 'pointer-events-none opacity-50',
    itemLabel: 'flex-1 truncate',
    itemBadge: [
      'ml-auto flex h-5 min-w-5 items-center justify-center rounded-md px-1',
      'text-xs font-medium tabular-nums',
      'text-sidebar-foreground',
    ],
    itemBadgeActive: 'text-sidebar-accent-foreground',
    itemChevron: 'ml-auto shrink-0 transition-transform duration-200',
    itemChevronOpen: 'rotate-180',
    // 子菜单：使用左边框线样式（shadcn 风格）
    subMenu: [
      'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5',
      'overflow-hidden',
    ],
    subMenuItem: '',
  },
  variants: {
    collapsed: {
      true: {
        item: 'justify-center p-2 size-8',
        itemLabel: 'sr-only',
        itemBadge: 'hidden',
        itemChevron: 'hidden',
        groupLabel: 'sr-only',
        subMenu: 'hidden',
      },
    },
  },
  defaultVariants: {
    collapsed: false,
  },
})

// ==================== Context ====================

interface NavMenuContextValue {
  value: Accessor<string | undefined>
  onValueChange: (key: string) => void
  expandedKeys: Accessor<string[]>
  toggleExpanded: (key: string) => void
  collapsed: boolean
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
  const styles = createMemo(() => navMenuStyles({ collapsed: ctx.collapsed }))
  const isActive = () => ctx.value() === props.item.key
  const depth = () => props.depth ?? 0

  const handleClick = () => {
    if (props.item.disabled) { return }
    props.item.onClick?.()
    ctx.onValueChange(props.item.key)
  }

  return (
    <button
      type="button"
      class={styles().item({
        class: [
          isActive() && styles().itemActive(),
          props.item.disabled && styles().itemDisabled(),
          depth() > 0 && styles().subMenuItem(),
        ].filter(Boolean).join(' '),
      })}
      onClick={handleClick}
      disabled={props.item.disabled}
      title={ctx.collapsed ? props.item.label : undefined}
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
  const styles = createMemo(() => navMenuStyles({ collapsed: ctx.collapsed }))
  const isExpanded = () => ctx.expandedKeys().includes(props.item.key)
  const depth = () => props.depth ?? 0

  const { api } = useCollapsible({
    // 传递 Accessor 而不是立即求值，保持响应式
    open: isExpanded,
    onOpenChange: () => ctx.toggleExpanded(props.item.key),
  })

  return (
    <div {...api().getRootProps()}>
      <button
        {...api().getTriggerProps()}
        type="button"
        class={styles().item({
          class: props.item.disabled ? styles().itemDisabled() : '',
        })}
        disabled={props.item.disabled}
        title={ctx.collapsed ? props.item.label : undefined}
      >
        <Show when={props.item.icon}>{props.item.icon}</Show>
        <span class={styles().itemLabel()}>{props.item.label}</span>
        <ChevronDown
          class={styles().itemChevron({
            class: isExpanded() ? styles().itemChevronOpen() : '',
          })}
        />
      </button>
      <div {...api().getContentProps()} class={styles().subMenu()}>
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
  )
}

/** 渲染分组 */
const NavMenuGroup: Component<{
  group: NavMenuGroupData
}> = (props) => {
  const ctx = useNavMenuContext()
  const styles = createMemo(() => navMenuStyles({ collapsed: ctx.collapsed }))

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
  const styles = createMemo(() => navMenuStyles({ collapsed: ctx.collapsed }))

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
    'class',
  ])

  // 内部状态
  const [internalValue, setInternalValue] = createSignal(local.defaultValue)
  const [internalExpandedKeys, setInternalExpandedKeys] = createSignal<string[]>(
    local.defaultExpandedKeys ?? []
  )

  // 计算当前值
  const currentValue = () => local.value ?? internalValue()
  const currentExpandedKeys = () => local.expandedKeys ?? internalExpandedKeys()

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

  const collapsed = () => local.collapsed ?? false
  const styles = createMemo(() => navMenuStyles({ collapsed: collapsed() }))

  return (
    <NavMenuContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        expandedKeys: currentExpandedKeys,
        toggleExpanded,
        collapsed: collapsed(),
      }}
    >
      <nav class={styles().root({ class: local.class })} {...rest}>
        <NavMenuItems items={local.items} />
      </nav>
    </NavMenuContext.Provider>
  )
}

