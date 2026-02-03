/**
 * DataTable - 服务端数据表格组件
 * 处理分页数据，状态由 useDataTable Hook 管理
 *
 * @example
 * ```tsx
 * function UserList() {
 *   const [filters, setFilters] = createSignal({ status: 'active' })
 *
 *   const { tableProps, state, reset, selectedRows } = useDataTable({
 *     deps: () => [filters()],
 *   })
 *
 *   const query = createQuery(() => ({
 *     queryKey: ['users', filters(), state()],
 *     queryFn: () => api.getUsers({ ...filters(), ...state() }),
 *   }))
 *
 *   return (
 *     <DataTable
 *       data={query.data?.items ?? []}
 *       columns={cols}
 *       rowCount={query.data?.total ?? 0}
 *       selectable
 *       loading={query.isPending}
 *       {...tableProps}
 *     />
 *   )
 * }
 * ```
 */

import {splitProps, createMemo, Show, type JSX} from 'solid-js'
import {
  createSolidTable,
  getCoreRowModel,
  getExpandedRowModel,
  type RowData,
  type ColumnPinningState,
} from '@tanstack/solid-table'
import {TableCore} from './TableCore'
import {Pagination} from '../Pagination'
import type {DataTableProps} from './types'

// ==================== DataTable 组件 ====================

export function DataTable<TData extends RowData>(
  props: DataTableProps<TData>,
): JSX.Element {
  const [local, rest] = splitProps(props, [
    // 数据
    'data',
    'columns',
    'rowCount',
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
    // 展开
    'expandable',
    'expanded',
    'onExpand',
    'renderExpanded',
    'getRowCanExpand',
    // 排序
    'sorting',
    'onSort',
    // 分页
    'pagination',
    'onPagination',
    // 固定
    'pinning',
  ])

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
    getExpandedRowModel: getExpandedRowModel(),
    // 服务端模式
    manualPagination: true,
    manualSorting: true,
    get rowCount() {
      return local.rowCount
    },
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
        return local.sorting ?? []
      },
      get pagination() {
        return local.pagination ?? {pageIndex: 0, pageSize: 10}
      },
      get rowSelection() {
        return local.selection ?? {}
      },
      get expanded() {
        return local.expanded ?? {}
      },
      get columnPinning() {
        return columnPinning()
      },
    },
    // 回调
    onSortingChange: (updater) => {
      if (local.onSort) {
        const current = local.sorting ?? []
        const newValue =
          typeof updater === 'function' ? updater(current) : updater
        local.onSort(newValue)
      }
    },
    onPaginationChange: (updater) => {
      if (local.onPagination) {
        const current = local.pagination ?? {pageIndex: 0, pageSize: 10}
        const newValue =
          typeof updater === 'function' ? updater(current) : updater
        local.onPagination(newValue)
      }
    },
    onRowSelectionChange: (updater) => {
      if (local.onSelection) {
        const current = local.selection ?? {}
        const newValue =
          typeof updater === 'function' ? updater(current) : updater
        local.onSelection(newValue)
      }
    },
    onExpandedChange: (updater) => {
      if (local.onExpand) {
        const current = local.expanded ?? {}
        const newValue =
          typeof updater === 'function' ? updater(current) : updater
        local.onExpand(newValue)
      }
    },
  })

  // ===== 分页处理 =====
  const currentPage = () => (local.pagination?.pageIndex ?? 0) + 1
  const pageSize = () => local.pagination?.pageSize ?? 10
  const handlePageChange = (page: number) => {
    local.onPagination?.({
      pageIndex: page - 1,
      pageSize: pageSize(),
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
        selectAllRows={false}
        expandable={local.expandable}
        renderExpanded={local.renderExpanded}
        enablePinning={
          (columnPinning().left?.length ?? 0) > 0 ||
          (columnPinning().right?.length ?? 0) > 0
        }
      />
      {/* 分页 */}
      <Show when={local.rowCount > pageSize()}>
        <div class="mt-4 flex justify-end">
          <Pagination
            current={currentPage()}
            total={local.rowCount}
            pageSize={pageSize()}
            onChange={handlePageChange}
            size={local.size}
          />
        </div>
      </Show>
    </div>
  )
}

// 导出类型
export type {DataTableProps} from './types'
