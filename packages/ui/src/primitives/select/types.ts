/**
 * @beeve/ui - Select Primitive Types
 * Select 组件类型定义
 */

import type * as select from '@zag-js/select'
import type { PropTypes } from '@zag-js/solid'

// ==================== 基础类型 ====================

/** 选项值类型 */
export type SelectValue = string | number

/** 选项数据 */
export interface SelectOption<Data = unknown, Value extends SelectValue = SelectValue> {
  /** 显示文本 */
  label: string
  /** 选项值 */
  value: Value
  /** 是否禁用 */
  disabled?: boolean
  /** 附加数据 */
  data?: Data
}

export type SelectOnChangeValue<Value extends SelectValue, Multiple extends boolean | undefined> = 
  Multiple extends true ? Value[] : Value | undefined

// ==================== API 类型 ====================

/** Select API 类型 */
export type SelectApi = select.Api<PropTypes, SelectOption>

// ==================== Props 类型 ====================

/** Select 组件 Props */
export interface SelectProps<Value extends SelectValue = SelectValue, Data = unknown, Multiple extends boolean | undefined = undefined> {
  // ==================== 数据 ====================
  /** 选项列表 */
  options: SelectOption<Data, Value>[]
  /** 当前值（受控） */
  value?: SelectOnChangeValue<Value, Multiple>
  /** 默认值（非受控） */
  defaultValue?: SelectOnChangeValue<Value, Multiple>
  /** 变更回调 */
  onChange?: (value: SelectOnChangeValue<Value, Multiple>) => void

  // ==================== 外观 ====================
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 变体 */
  variant?: 'default' | 'filled' | 'borderless'
  /** 状态 */
  status?: 'error' | 'warning'
  /** 占位符 */
  placeholder?: string

  // ==================== 状态 ====================
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 是否允许清除 */
  allowClear?: boolean

  // ==================== 回调 ====================
  /** 下拉展开/收起回调 */
  onOpenChange?: (open: boolean) => void
  /** 清除回调 */
  onClear?: () => void

  // ==================== 其他 ====================
  /** 自定义类名 */
  class?: string
  /** 组件 ID */
  id?: string
  /** 表单字段名 */
  name?: string
}

// ==================== Hook 返回类型 ====================

/** useSelect 返回类型 */
export interface UseSelectReturn<T = unknown> {
  /** Select API */
  api: () => SelectApi
  /** 是否有值 */
  hasValue: () => boolean
  /** 获取选中的 option */
  selectedOption: () => SelectOption<T> | undefined
}

