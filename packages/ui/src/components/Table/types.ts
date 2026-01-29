/**
 * Table 组件共享类型定义
 * 复用 TanStack Table 原生类型
 */

import type { JSX, Accessor } from 'solid-js'
import type {
  ColumnDef,
  Row,
  RowData,
  RowSelectionState,
  ExpandedState,
  SortingState,
  PaginationState,
  ColumnPinningState,
  OnChangeFn,
} from '@tanstack/solid-table'
import type { VariantProps } from 'tailwind-variants'
import type { tableVariants } from './styles'

// ==================== 基础类型 ====================

export type TableVariants = VariantProps<typeof tableVariants>

/** 表格尺寸 */
export type TableSize = 'sm' | 'md' | 'lg'

/** 表格变体 */
export type TableVariant = 'default' | 'bordered'

// ==================== 共享 Props ====================

export interface BaseTableProps<TData extends RowData> {
  /** 表格数据 */
  data: TData[]
  /** 列定义 */
  columns: ColumnDef<TData, unknown>[]
  /** 获取行 ID */
  getRowId?: (row: TData, index: number) => string
  /** 表格变体 */
  variant?: TableVariant
  /** 表格尺寸 */
  size?: TableSize
  /** 是否显示条纹 */
  striped?: boolean
  /** 是否可悬停高亮 */
  hoverable?: boolean
  /** 自定义类名 */
  class?: string

  // ===== 状态展示 =====
  /** 加载状态 */
  loading?: boolean
  /** 空状态文本 */
  emptyText?: string
  /** 空状态自定义内容 */
  emptyContent?: JSX.Element

  // ===== 表头/表尾 =====
  /** 是否显示表头 */
  showHeader?: boolean
  /** 是否显示表尾 */
  showFooter?: boolean

  // ===== 行点击 =====
  /** 行点击事件 */
  onRowClick?: (row: TData) => void

  // ===== 选中 =====
  /** 启用行选中 */
  selectable?: boolean
  /** 选中状态（受控） */
  selection?: RowSelectionState
  /** 选中状态变化回调 */
  onSelection?: OnChangeFn<RowSelectionState>

  // ===== 展开 =====
  /** 启用行展开 */
  expandable?: boolean
  /** 展开状态（受控） */
  expanded?: ExpandedState
  /** 展开状态变化回调 */
  onExpand?: OnChangeFn<ExpandedState>
  /** 渲染展开行内容 */
  renderExpanded?: (row: Row<TData>) => JSX.Element
  /** 判断行是否可展开 */
  getRowCanExpand?: (row: Row<TData>) => boolean

  // ===== 排序 =====
  /** 排序状态（受控） */
  sorting?: SortingState
  /** 排序状态变化回调 */
  onSort?: OnChangeFn<SortingState>

  // ===== 分页 =====
  /** 分页状态（受控） */
  pagination?: PaginationState
  /** 分页状态变化回调 */
  onPagination?: OnChangeFn<PaginationState>

  // ===== 列固定 =====
  /** 列固定配置 */
  pinning?: ColumnPinningState
}

// ==================== Table Props (客户端分页) ====================

export interface TableProps<TData extends RowData> extends BaseTableProps<TData> {
  /** 默认每页条数 */
  pageSize?: number
  /** 默认排序 */
  defaultSorting?: SortingState
  /** 默认选中 */
  defaultSelection?: RowSelectionState
  /** 默认展开 */
  defaultExpanded?: ExpandedState
}

// ==================== DataTable Props (服务端分页) ====================

export interface DataTableProps<TData extends RowData> extends BaseTableProps<TData> {
  /** 数据总条数（必传，用于分页计算） */
  rowCount: number
}

// ==================== Hook 类型 ====================

export interface UseDataTableOptions {
  /** 每页条数 */
  pageSize?: number
  /** 依赖项，变化时重置分页和选中 */
  deps?: Accessor<unknown[]>
}

export interface UseDataTableReturn {
  /** 状态（用于 Query Key） */
  state: Accessor<{
    pagination: PaginationState
    sorting: SortingState
  }>
  /** 透传给 DataTable 的 props */
  tableProps: {
    pagination: PaginationState
    sorting: SortingState
    selection: RowSelectionState
    expanded: ExpandedState
    onPagination: OnChangeFn<PaginationState>
    onSort: OnChangeFn<SortingState>
    onSelection: OnChangeFn<RowSelectionState>
    onExpand: OnChangeFn<ExpandedState>
  }
  /** 重置所有状态 */
  reset: () => void
  /** 重置选中状态 */
  resetSelection: () => void
  /** 获取选中的行 ID 列表 */
  selectedRows: Accessor<string[]>
}

// ==================== 列定义简化类型 ====================

export interface Column<TData> {
  /** 数据字段名（必填） */
  key: keyof TData & string
  /** 列标题（默认从 key 推断） */
  title?: string
  /** 列宽 */
  width?: number
  /** 固定位置 */
  pin?: 'left' | 'right'
  /** 是否可排序 */
  sort?: boolean
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 自定义渲染 */
  render?: (value: unknown, row: TData, index: number) => JSX.Element
}

// ==================== 重新导出 TanStack Table 类型 ====================

export type {
  ColumnDef,
  Row,
  RowData,
  RowSelectionState,
  ExpandedState,
  SortingState,
  PaginationState,
  ColumnPinningState,
  OnChangeFn,
  CellContext,
  HeaderContext,
} from '@tanstack/solid-table'
