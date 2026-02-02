/**
 * @beeve/ui - NavMenu Types
 * 导航菜单组件类型定义
 */

import type { JSX, ComponentProps } from 'solid-js'

/** 导航菜单项 */
export interface NavMenuItemData {
  /** 菜单项唯一标识 */
  key: string
  /** 菜单项标签 */
  label: string
  /** 描述文本（用于卡片式菜单） */
  description?: string
  /** 图标 */
  icon?: JSX.Element
  /** 徽标（数字或文本） */
  badge?: string | number
  /** 是否禁用 */
  disabled?: boolean
  /** 子菜单项 */
  children?: NavMenuItemData[]
  /** 点击回调 */
  onClick?: () => void
}

/** 导航菜单分组 */
export interface NavMenuGroupData {
  /** 类型标识 */
  type: 'group'
  /** 分组唯一标识 */
  key: string
  /** 分组标签 */
  label?: string
  /** 分组内的菜单项 */
  children: NavMenuItemType[]
}

/** 分隔线 */
export interface NavMenuDividerData {
  /** 类型标识 */
  type: 'divider'
  /** 可选的唯一标识 */
  key?: string
}

/** 菜单项类型联合 */
export type NavMenuItemType = NavMenuItemData | NavMenuGroupData | NavMenuDividerData

/** 导航菜单方向 */
export type NavMenuDirection = 'vertical' | 'horizontal'

/** NavMenu 组件 Props */
export interface NavMenuProps extends Omit<ComponentProps<'nav'>, 'onChange'> {
  /** 菜单项数据 */
  items: NavMenuItemType[]
  /** 当前激活项的 key（受控） */
  value?: string
  /** 默认激活项的 key（非受控） */
  defaultValue?: string
  /** 激活项变化回调 */
  onChange?: (key: string) => void
  /** 默认展开的子菜单 keys */
  defaultExpandedKeys?: string[]
  /** 展开的子菜单 keys（受控） */
  expandedKeys?: string[]
  /** 展开状态变化回调 */
  onExpandedKeysChange?: (keys: string[]) => void
  /** 是否折叠模式（仅显示图标，仅垂直模式有效） */
  collapsed?: boolean
  /** 菜单方向：vertical（垂直，用于侧边栏）| horizontal（水平，用于顶部导航） */
  direction?: NavMenuDirection
}

// ==================== 类型守卫 ====================

/** 判断是否为分隔线 */
export function isNavMenuDivider(item: NavMenuItemType): item is NavMenuDividerData {
  return 'type' in item && item.type === 'divider'
}

/** 判断是否为分组 */
export function isNavMenuGroup(item: NavMenuItemType): item is NavMenuGroupData {
  return 'type' in item && item.type === 'group'
}

/** 判断是否为普通菜单项 */
export function isNavMenuItem(item: NavMenuItemType): item is NavMenuItemData {
  return !('type' in item) || (item.type !== 'divider' && item.type !== 'group')
}

/** 判断是否有子菜单 */
export function navMenuHasChildren(item: NavMenuItemData): boolean {
  return Array.isArray(item.children) && item.children.length > 0
}

