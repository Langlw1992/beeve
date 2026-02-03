/**
 * useDataTable - DataTable 状态管理 Hook
 * 管理分页/排序/选中/展开状态，返回可直接透传给 DataTable 的 props
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
 *     <>
 *       <Button onClick={() => handleBatch(selectedRows())}>
 *         批量操作 ({selectedRows().length})
 *       </Button>
 *       <DataTable
 *         data={query.data?.items ?? []}
 *         columns={cols}
 *         rowCount={query.data?.total ?? 0}
 *         loading={query.isPending}
 *         {...tableProps}
 *       />
 *     </>
 *   )
 * }
 * ```
 */

import {createSignal, createEffect, on, batch, type Accessor} from 'solid-js'
import type {
  SortingState,
  PaginationState,
  RowSelectionState,
  ExpandedState,
  OnChangeFn,
} from '@tanstack/solid-table'
import type {UseDataTableOptions, UseDataTableReturn} from './types'

// ==================== useDataTable Hook ====================

export function useDataTable(
  options?: UseDataTableOptions,
): UseDataTableReturn {
  const pageSize = options?.pageSize ?? 10

  // ===== 状态 =====
  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const [sorting, setSorting] = createSignal<SortingState>([])
  const [selection, setSelection] = createSignal<RowSelectionState>({})
  const [expanded, setExpanded] = createSignal<ExpandedState>({})

  // ===== 排序变化时重置分页 =====
  createEffect(
    on(
      sorting,
      () => {
        setPagination((prev) => ({...prev, pageIndex: 0}))
      },
      {defer: true},
    ),
  )

  // ===== deps 变化时重置分页和选中 =====
  createEffect(
    on(
      () => options?.deps?.(),
      () => {
        batch(() => {
          setPagination((prev) => ({...prev, pageIndex: 0}))
          setSelection({})
        })
      },
      {defer: true},
    ),
  )

  // ===== 状态访问器（用于 Query Key）=====
  const state: Accessor<{
    pagination: PaginationState
    sorting: SortingState
  }> = () => ({
    pagination: pagination(),
    sorting: sorting(),
  })

  // ===== 重置方法 =====
  const reset = () => {
    batch(() => {
      setPagination({pageIndex: 0, pageSize})
      setSorting([])
      setSelection({})
      setExpanded({})
    })
  }

  const resetSelection = () => {
    setSelection({})
  }

  // ===== 选中行 ID 列表 =====
  const selectedRows: Accessor<string[]> = () => Object.keys(selection())

  // ===== 透传给 DataTable 的 props =====
  const tableProps = {
    get pagination() {
      return pagination()
    },
    get sorting() {
      return sorting()
    },
    get selection() {
      return selection()
    },
    get expanded() {
      return expanded()
    },
    onPagination: setPagination as OnChangeFn<PaginationState>,
    onSort: setSorting as OnChangeFn<SortingState>,
    onSelection: setSelection as OnChangeFn<RowSelectionState>,
    onExpand: setExpanded as OnChangeFn<ExpandedState>,
  }

  return {
    state,
    tableProps,
    reset,
    resetSelection,
    selectedRows,
  }
}
