/**
 * Table - 客户端数据表格组件
 * 处理全量数据，内部管理分页/排序/选中/展开状态
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Table data={users} columns={cols} />
 *
 * // 带选中和展开
 * <Table
 *   data={users}
 *   columns={cols}
 *   selectable
 *   expandable
 *   renderExpanded={(row) => <Detail data={row.original} />}
 *   onSelection={(s) => console.log('selected:', s)}
 * />
 * ```
 */

import {splitProps, createSignal, createMemo, type JSX} from 'solid-js'
import {
  createSolidTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  type RowData,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
  type ExpandedState,
  type ColumnPinningState,
} from '@tanstack/solid-table'
import {TableCore} from './TableCore'
import {Pagination} from '../Pagination'
import type {TableProps} from './types'
import {Show} from 'solid-js'

// ==================== Table 组件 ====================

export function Table<TData extends RowData>(
  props: TableProps<TData>,
): JSX.Element {
  const [local, rest] = splitProps(props, [
    // 数据
    'data',
    'columns',
    'getRowId',
    // 样式
    'class',
    'variant',
    'size',
    'striped',
    'hoverable',
    // 状态展示
    'loading',
    'emptyText',
    'emptyContent',
    // 表头/表尾
    'showHeader',
    'showFooter',
    // 行点击
    'onRowClick',
    // 选中
    'selectable',
    'selection',
    'onSelection',
    'defaultSelection',
    // 展开
    'expandable',
    'expanded',
    'onExpand',
    'defaultExpanded',
    'renderExpanded',
    'getRowCanExpand',
    // 排序
    'sorting',
    'onSort',
    'defaultSorting',
    // 分页
    'pagination',
    'onPagination',
    'pageSize',
    // 固定
    'pinning',
  ])

  // ===== 内部状态 =====
  const [internalSorting, setInternalSorting] = createSignal<SortingState>(
    local.defaultSorting ?? [],
  )
  const [internalPagination, setInternalPagination] =
    createSignal<PaginationState>({
      pageIndex: 0,
      pageSize: local.pageSize ?? 10,
    })
  const [internalSelection, setInternalSelection] =
    createSignal<RowSelectionState>(local.defaultSelection ?? {})
  const [internalExpanded, setInternalExpanded] = createSignal<ExpandedState>(
    local.defaultExpanded ?? {},
  )

  // ===== 状态访问器（支持受控和非受控）=====
  const sorting = () => local.sorting ?? internalSorting()
  const pagination = () => local.pagination ?? internalPagination()
  const selection = () => local.selection ?? internalSelection()
  const expanded = () => local.expanded ?? internalExpanded()

  // ===== 状态更新处理 =====
  const handleSortingChange = (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => {
    const newValue =
      typeof updater === 'function' ? updater(sorting()) : updater
    if (local.sorting === undefined) {
      setInternalSorting(newValue)
    }
    local.onSort?.(newValue)
  }

  const handlePaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => {
    const newValue =
      typeof updater === 'function' ? updater(pagination()) : updater
    if (local.pagination === undefined) {
      setInternalPagination(newValue)
    }
    local.onPagination?.(newValue)
  }

  const handleSelectionChange = (
    updater:
      | RowSelectionState
      | ((old: RowSelectionState) => RowSelectionState),
  ) => {
    const newValue =
      typeof updater === 'function' ? updater(selection()) : updater
    if (local.selection === undefined) {
      setInternalSelection(newValue)
    }
    local.onSelection?.(newValue)
  }

  const handleExpandedChange = (
    updater: ExpandedState | ((old: ExpandedState) => ExpandedState),
  ) => {
    const newValue =
      typeof updater === 'function' ? updater(expanded()) : updater
    if (local.expanded === undefined) {
      setInternalExpanded(newValue)
    }
    local.onExpand?.(newValue)
  }

  // ===== 列固定处理 =====
  const columnPinning = createMemo<ColumnPinningState>(() => {
    if (local.pinning) {
      return local.pinning
    }
    // 从列定义中提取固定配置
    const left: string[] = []
    const right: string[] = []
    for (const col of local.columns) {
      const pin = (col.meta as {pin?: 'left' | 'right'} | undefined)?.pin
      if (pin === 'left' && col.id) {
        left.push(col.id)
      } else if (pin === 'right' && col.id) {
        right.push(col.id)
      }
    }
    return {left, right}
  })

  // ===== 创建表格实例 =====
  const table = createSolidTable({
    get data() {
      return local.data
    },
    get columns() {
      return local.columns
    },
    getRowId: local.getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // 启用特性
    enableSorting: true,
    enableRowSelection: local.selectable ?? false,
    enableMultiRowSelection: true,
    enableExpanding: local.expandable ?? false,
    enableColumnPinning: true,
    // 展开判断
    getRowCanExpand: local.getRowCanExpand ?? (() => !!local.renderExpanded),
    // 状态
    state: {
      get sorting() {
        return sorting()
      },
      get pagination() {
        return pagination()
      },
      get rowSelection() {
        return selection()
      },
      get expanded() {
        return expanded()
      },
      get columnPinning() {
        return columnPinning()
      },
    },
    // 回调
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: handleSelectionChange,
    onExpandedChange: handleExpandedChange,
  })

  // ===== 分页处理 =====
  const totalRows = () => local.data.length
  const currentPage = () => pagination().pageIndex + 1
  const handlePageChange = (page: number) => {
    handlePaginationChange({
      ...pagination(),
      pageIndex: page - 1,
    })
  }

  return (
    <div {...rest}>
      <TableCore
        table={table}
        variant={local.variant}
        size={local.size}
        striped={local.striped}
        hoverable={local.hoverable}
        class={local.class}
        loading={local.loading}
        emptyText={local.emptyText}
        emptyContent={local.emptyContent}
        showHeader={local.showHeader}
        showFooter={local.showFooter}
        onRowClick={local.onRowClick}
        selectable={local.selectable}
        selectAllRows={true}
        expandable={local.expandable}
        renderExpanded={local.renderExpanded}
        enablePinning={
          (columnPinning().left?.length ?? 0) > 0 ||
          (columnPinning().right?.length ?? 0) > 0
        }
      />
      {/* 分页 */}
      <Show when={totalRows() > pagination().pageSize}>
        <div class="mt-4 flex justify-end">
          <Pagination
            current={currentPage()}
            total={totalRows()}
            pageSize={pagination().pageSize}
            onChange={handlePageChange}
            size={local.size}
          />
        </div>
      </Show>
    </div>
  )
}

// 导出类型
export type {TableProps} from './types'
