/**
 * @beeve/ui - Menu Primitive Types
 * 基于 @zag-js/menu 的类型定义
 * 采用 Ant Design 风格的数据驱动 API
 */

import type {JSX} from 'solid-js'
import type * as menu from '@zag-js/menu'

/** 定位选项（从 @zag-js/menu 导入） */
export type PositioningOptions = menu.PositioningOptions

// ==================== 数据驱动 API 类型（Ant Design 风格）====================

/** 基础菜单项类型 */
export type MenuItemType =
  | MenuItemData
  | MenuDividerData
  | MenuGroupData
  | MenuRadioGroupData
  | MenuCheckboxData

/** 普通菜单项 */
export interface MenuItemData {
  /** 菜单项唯一标识 */
  key: string
  /** 菜单项标签 */
  label: JSX.Element | string
  /** 图标 */
  icon?: JSX.Element
  /** 快捷键提示 */
  shortcut?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否危险操作（红色） */
  danger?: boolean
  /** 子菜单项（嵌套菜单） */
  children?: MenuItemType[]
  /** 点击回调 */
  onClick?: () => void
}

/** 分隔线 */
export interface MenuDividerData {
  type: 'divider'
  /** 可选的唯一标识 */
  key?: string
}

/** 菜单分组 */
export interface MenuGroupData {
  type: 'group'
  /** 分组唯一标识 */
  key: string
  /** 分组标签 */
  label?: JSX.Element | string
  /** 分组内的菜单项 */
  children: MenuItemType[]
}

/** 单选组 */
export interface MenuRadioGroupData {
  type: 'radio'
  /** 单选组唯一标识 */
  key: string
  /** 单选组名称 */
  name: string
  /** 当前选中值 */
  value?: string
  /** 选中变化回调 */
  onChange?: (value: string) => void
  /** 单选项列表 */
  children: MenuRadioItemData[]
}

/** 单选项 */
export interface MenuRadioItemData {
  /** 选项唯一标识/值 */
  key: string
  /** 选项标签 */
  label: JSX.Element | string
  /** 是否禁用 */
  disabled?: boolean
}

/** 复选框项 */
export interface MenuCheckboxData {
  type: 'checkbox'
  /** 复选框唯一标识 */
  key: string
  /** 复选框标签 */
  label: JSX.Element | string
  /** 是否选中 */
  checked?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 选中变化回调 */
  onChange?: (checked: boolean) => void
}

// ==================== 组件 Props ====================

/** Hook Props */
export interface UseMenuProps {
  /** 菜单唯一标识 */
  id?: string

  /** 是否打开（受控） */
  open?: boolean

  /** 默认是否打开（非受控） */
  defaultOpen?: boolean

  /** 打开状态变化回调 */
  onOpenChange?: (details: {open: boolean}) => void

  /** 定位选项 */
  positioning?: PositioningOptions

  /** 选中后是否关闭菜单 */
  closeOnSelect?: boolean

  /** 是否循环导航 */
  loop?: boolean

  /** ARIA label */
  'aria-label'?: string
}

/** Menu 组件 Props（数据驱动 API） */
export interface MenuProps {
  /** 菜单项数据 */
  items: MenuItemType[]
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 菜单项点击回调 */
  onClick?: (key: string) => void
  /** 菜单唯一标识 */
  id?: string
  /** 选中后是否关闭菜单 */
  closeOnSelect?: boolean
  /** 是否循环导航 */
  loop?: boolean
  /** 自定义类名 */
  class?: string
}

/** Dropdown 组件 Props */
export interface DropdownProps extends MenuProps {
  /** 触发器内容 */
  children: JSX.Element
  /** 定位选项 */
  positioning?: PositioningOptions
  /** 打开状态变化回调 */
  onOpenChange?: (details: {open: boolean}) => void
}

/** ContextMenu 组件 Props */
export interface ContextMenuProps extends MenuProps {
  /** 触发区域内容 */
  children: JSX.Element
  /** 打开状态变化回调 */
  onOpenChange?: (details: {open: boolean}) => void
}

// ==================== 内部组件 Props（用于渲染）====================

/** 内部菜单内容 Props */
export interface MenuContentInternalProps {
  /** 子元素 */
  children: JSX.Element
  /** 自定义类名 */
  class?: string
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
}

/** 内部菜单项 Props */
export interface MenuItemInternalProps {
  /** 菜单项的值 */
  value: string
  /** 是否禁用 */
  disabled?: boolean
  /** 选中后是否关闭菜单 */
  closeOnSelect?: boolean
  /** 选中回调 */
  onSelect?: () => void
  /** 子元素 */
  children: JSX.Element
  /** 自定义类名 */
  class?: string
  /** 是否危险操作 */
  danger?: boolean
}

// ==================== 辅助函数类型 ====================

/** 判断是否为分隔线 */
export function isDivider(item: MenuItemType): item is MenuDividerData {
  return 'type' in item && item.type === 'divider'
}

/** 判断是否为分组 */
export function isGroup(item: MenuItemType): item is MenuGroupData {
  return 'type' in item && item.type === 'group'
}

/** 判断是否为单选组 */
export function isRadioGroup(item: MenuItemType): item is MenuRadioGroupData {
  return 'type' in item && item.type === 'radio'
}

/** 判断是否为复选框 */
export function isCheckbox(item: MenuItemType): item is MenuCheckboxData {
  return 'type' in item && item.type === 'checkbox'
}

/** 判断是否为普通菜单项 */
export function isMenuItem(item: MenuItemType): item is MenuItemData {
  return !('type' in item)
}

/** 判断是否有子菜单 */
export function hasChildren(
  item: MenuItemType,
): item is MenuItemData & {children: MenuItemType[]} {
  return (
    isMenuItem(item) && Array.isArray(item.children) && item.children.length > 0
  )
}
