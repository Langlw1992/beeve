/**
 * Cascader 组件类型定义
 */

import type { JSX } from 'solid-js'
import type { VariantProps } from 'tailwind-variants'
import type { cascaderStyles } from './styles'

/** 级联选择器选项 */
export interface CascaderOption<T = unknown> {
  /** 选项值 */
  value: string
  /** 显示标签 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
  /** 子选项 */
  children?: CascaderOption<T>[]
  /** 是否为叶子节点（用于动态加载场景） */
  isLeaf?: boolean
  /** 附加数据 */
  data?: T
}

/** 单选值变化详情 */
export interface CascaderValueChangeDetails<T = unknown> {
  /** 选中的值路径 */
  value: string[]
  /** 选中的选项路径 */
  selectedOptions: CascaderOption<T>[]
}

/** 多选值变化详情 */
export interface CascaderMultipleValueChangeDetails<T = unknown> {
  /** 选中的值路径数组 */
  value: string[][]
  /** 选中的选项路径数组 */
  selectedOptions: CascaderOption<T>[][]
}

/** 显示模式 */
export type CascaderShowPath = 'full' | 'last'

/** 可选节点策略 */
export type CascaderCheckStrategy = 'all' | 'parent' | 'child'

/** 级联选择器基础 Props */
interface CascaderBaseProps<T = unknown> extends VariantProps<typeof cascaderStyles> {
  /** 选项数据 */
  options: CascaderOption<T>[]

  /** 占位文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否可清除 */
  clearable?: boolean

  /** 展开触发方式 */
  expandTrigger?: 'click' | 'hover'
  /** 选择即改变（选择任意级别即触发 onChange，否则只有选择叶子节点才触发） */
  changeOnSelect?: boolean

  /** 动态加载子选项 */
  loadData?: (option: CascaderOption<T>) => Promise<CascaderOption<T>[]>

  /**
   * 显示路径模式
   * - 'full': 显示完整路径（如 "浙江 / 杭州 / 西湖区"）
   * - 'last': 仅显示最后一级（如 "西湖区"）
   * @default 'full'
   */
  showPath?: CascaderShowPath

  /**
   * 可选节点策略（仅多选模式有效）
   * - 'all': 所有节点都可选
   * - 'parent': 仅父节点可选（有子节点的节点）
   * - 'child': 仅叶子节点可选
   * @default 'child'
   */
  checkStrategy?: CascaderCheckStrategy

  /** 自定义类名 */
  class?: string
  /** 弹出层类名 */
  popupClass?: string

  /** 弹出层打开状态变化 */
  onOpenChange?: (open: boolean) => void
}

/** 单选模式 Props */
export interface CascaderSingleProps<T = unknown> extends CascaderBaseProps<T> {
  /** 是否多选 */
  multiple?: false
  /** 当前选中值（路径数组） */
  value?: string[]
  /** 默认选中值 */
  defaultValue?: string[]
  /** 值变化回调 */
  onChange?: (details: CascaderValueChangeDetails<T>) => void
  /** 自定义显示渲染 */
  displayRender?: (labels: string[], selectedOptions: CascaderOption<T>[]) => JSX.Element | string
}

/** 多选模式 Props */
export interface CascaderMultipleProps<T = unknown> extends CascaderBaseProps<T> {
  /** 是否多选 */
  multiple: true
  /** 当前选中值（路径数组的数组） */
  value?: string[][]
  /** 默认选中值 */
  defaultValue?: string[][]
  /** 值变化回调 */
  onChange?: (details: CascaderMultipleValueChangeDetails<T>) => void
  /** 自定义显示渲染 */
  displayRender?: (labels: string[][], selectedOptions: CascaderOption<T>[][]) => JSX.Element | string
  /** 多选时最多显示的标签数量，超出部分显示 +N */
  maxTagCount?: number
}

/** 级联选择器 Props（联合类型） */
export type CascaderProps<T = unknown> = CascaderSingleProps<T> | CascaderMultipleProps<T>

