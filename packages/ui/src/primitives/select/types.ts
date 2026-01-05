/**
 * Select 组件类型定义
 * 基于 @zag-js/combobox 类型扩展
 */

import type { JSX } from 'solid-js'
import type * as combobox from '@zag-js/combobox'

// ==================== 复用 zag-js 类型 ====================

/** Collection 类型 - 复用 combobox.collection 返回类型 */
export type SelectCollection<T> = ReturnType<typeof combobox.collection<T>>

/** 值变化详情 - 复用 zag-js 类型 */
export type SelectValueChangeDetails = combobox.ValueChangeDetails

/** 输入值变化详情 */
export type SelectInputValueChangeDetails = combobox.InputValueChangeDetails

/** 开关状态变化详情 */
export type SelectOpenChangeDetails = combobox.OpenChangeDetails

/** 高亮变化详情 */
export type SelectHighlightChangeDetails = combobox.HighlightChangeDetails

// ==================== 基础类型 ====================

/** 值类型 - 仅支持 string | number */
export type SelectValue = string | number

/** Option 定义 - 兼容 zag-js CollectionItem */
export type SelectOption<T = unknown> = {
  label: string
  value: SelectValue
  disabled?: boolean
  /** 附加数据 */
  data?: T
  /** 子选项（Cascader 预留） */
  children?: SelectOption<T>[]
}

/** 字段名映射 */
export type SelectFieldNames = {
  label?: string
  value?: string
  disabled?: string
  children?: string
}

/** Option 渲染状态 - 与 zag-js ItemState 对齐 */
export type SelectOptionState = {
  selected: boolean
  highlighted: boolean
  disabled: boolean
}

// ==================== Select Props ====================

/** Select Props - 扩展部分 zag-js combobox.Props */
export type SelectProps<T = unknown> = {
  // ==================== 数据 ====================
  /** 选项列表 */
  options?: SelectOption<T>[]
  /** 当前值（受控） */
  value?: SelectValue | SelectValue[]
  /** 默认值（非受控） */
  defaultValue?: SelectValue | SelectValue[]
  /** 字段名映射 */
  fieldNames?: SelectFieldNames

  // ==================== 模式 ====================
  /** 选择模式，不设置为单选 */
  mode?: 'multiple' | 'tags'

  // ==================== 搜索 ====================
  /** 是否可搜索 */
  showSearch?: boolean
  /** 过滤函数，false 禁用内置过滤（用于远程搜索） */
  filterOption?: boolean | ((inputValue: string, option: SelectOption<T>) => boolean)
  /** 搜索回调 */
  onSearch?: (value: string) => void
  /** 搜索字段 */
  optionFilterProp?: 'label' | 'value'

  // ==================== 状态 ====================
  /** 加载中 */
  loading?: boolean
  /** 禁用 */
  disabled?: boolean
  /** 允许清除 */
  allowClear?: boolean
  /** 占位符 */
  placeholder?: string
  /** 状态 */
  status?: 'error' | 'warning'

  // ==================== 回调 ====================
  /** 值变化回调 */
  onChange?: (
    value: SelectValue | SelectValue[] | undefined,
    option: SelectOption<T> | SelectOption<T>[] | undefined
  ) => void
  /** 选中回调 */
  onSelect?: (value: SelectValue, option: SelectOption<T>) => void
  /** 取消选中回调（多选模式） */
  onDeselect?: (value: SelectValue, option: SelectOption<T>) => void
  /** 清除回调 */
  onClear?: () => void
  /** 下拉框展开/收起回调 */
  onOpenChange?: (open: boolean) => void

  // ==================== 渲染 ====================
  /** 自定义 Option 渲染 */
  optionRender?: (option: SelectOption<T>, state: SelectOptionState) => JSX.Element
  /** 自定义已选标签渲染 */
  labelRender?: (option: SelectOption<T>) => JSX.Element
  /** 空状态内容 */
  notFoundContent?: JSX.Element
  /** 下拉框底部内容 */
  dropdownRender?: (menu: JSX.Element) => JSX.Element

  // ==================== 样式 ====================
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 变体 */
  variant?: 'default' | 'filled' | 'borderless'
  /** 自定义类名 */
  class?: string
}

