/**
 * @beeve/ui - Table Component
 * 数据表格组件，基于 @tanstack/solid-table 实现
 *
 * @example
 * ```tsx
 * // 基础表格
 * <Table data={data} columns={columns} />
 *
 * // 带边框和条纹
 * <Table data={data} columns={columns} variant="bordered" striped />
 *
 * // 紧凑尺寸
 * <Table data={data} columns={columns} size="sm" />
 *
 * // 行选择
 * <Table data={data} columns={[createSelectionColumn(), ...columns]} enableRowSelection />
 *
 * // 行展开
 * <Table data={data} columns={columns} enableExpanding renderExpandedRow={(row) => <Detail data={row} />} />
 *
 * // 列固定
 * <Table data={data} columns={columns} enableColumnPinning />
 * ```
 */

import {
  splitProps,
  createMemo,
  createSignal,
  For,
  Show,
  type JSX,
} from 'solid-js'
import {
  createSolidTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type TableOptions,
  type RowData,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
  type ExpandedState,
  type ColumnPinningState,
  type Row,
  type CellContext,
  type HeaderContext,
} from '@tanstack/solid-table'
import { tv, type VariantProps } from 'tailwind-variants'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from 'lucide-solid'
import { Pagination, type PaginationProps } from '../Pagination'
import { Checkbox } from '../Checkbox'

// ==================== 样式定义 ====================

const tableVariants = tv({
  slots: {
    root: 'w-full overflow-auto relative',
    table: 'w-full caption-bottom text-sm',
    thead: 'border-b border-border',
    tbody: '[&_tr:last-child]:border-0',
    tfoot: 'border-t border-border bg-muted/50 font-medium',
    tr: 'border-b border-border transition-colors',
    trSelected: 'bg-primary/5',
    th: [
      'text-left align-middle font-medium text-muted-foreground',
      '[&:has([role=checkbox])]:pr-0',
    ],
    thPinnedLeft: 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]',
    thPinnedRight: 'sticky right-0 z-10 bg-background shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]',
    td: 'align-middle [&:has([role=checkbox])]:pr-0',
    tdPinnedLeft: 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]',
    tdPinnedRight: 'sticky right-0 z-10 bg-background shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]',
    empty: 'text-center text-muted-foreground',
    expandedRow: 'bg-muted/20',
    expandIcon: 'size-4 transition-transform duration-200 text-muted-foreground',
    expandIconExpanded: 'rotate-90',
  },
  variants: {
    variant: {
      default: {
        table: '',
      },
      bordered: {
        table: 'border border-border',
        th: 'border-r border-border last:border-r-0',
        td: 'border-r border-border last:border-r-0',
      },
    },
    size: {
      sm: {
        th: 'h-8 px-2 text-xs',
        td: 'h-8 px-2 text-xs',
        empty: 'py-6 text-xs',
      },
      md: {
        th: 'h-9 px-3 text-sm',
        td: 'h-9 px-3 text-sm',
        empty: 'py-8 text-sm',
      },
      lg: {
        th: 'h-10 px-4 text-sm',
        td: 'h-10 px-4 text-sm',
        empty: 'py-10 text-sm',
      },
    },
    striped: {
      true: {
        tbody: '[&>tr:nth-child(odd)]:bg-muted/30',
      },
    },
    hoverable: {
      true: {
        tr: 'hover:bg-muted/50 cursor-pointer',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export type TableVariants = VariantProps<typeof tableVariants>

// ==================== 类型定义 ====================

export interface TableProps<TData extends RowData>
  extends Omit<TableVariants, 'striped' | 'hoverable'> {
  /** 表格数据 */
  data: TData[]
  /** 列定义 */
  columns: ColumnDef<TData, unknown>[]
  /** 是否显示条纹 */
  striped?: boolean
  /** 是否可悬停高亮 */
  hoverable?: boolean
  /** 空状态文本 */
  emptyText?: string
  /** 空状态自定义内容 */
  emptyContent?: JSX.Element
  /** 是否显示表头 */
  showHeader?: boolean
  /** 是否显示表尾 */
  showFooter?: boolean
  /** 行点击事件 */
  onRowClick?: (row: TData) => void
  /** 自定义类名 */
  class?: string
  /** 表格额外配置 */
  tableOptions?: Partial<Omit<TableOptions<TData>, 'data' | 'columns' | 'getCoreRowModel'>>
  /** 获取行 ID */
  getRowId?: (row: TData, index: number) => string

  // ========== 排序相关 ==========
  /** 启用排序 */
  enableSorting?: boolean
  /** 默认排序状态 */
  defaultSorting?: SortingState
  /** 排序状态变化回调 */
  onSortingChange?: (sorting: SortingState) => void

  // ========== 分页相关 ==========
  /** 启用分页 */
  pagination?: boolean
  /** 每页条数 */
  pageSize?: number
  /** 默认页码 */
  defaultPage?: number
  /** 分页组件属性 */
  paginationProps?: Partial<Omit<PaginationProps, 'current' | 'total' | 'pageSize' | 'onChange'>>
  /** 分页状态变化回调 */
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void

  // ========== 行选择相关 ==========
  /** 启用行选择 */
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
  /** 启用多选 */
  enableMultiRowSelection?: boolean
  /** 默认选中状态 */
  defaultRowSelection?: RowSelectionState
  /** 选中状态变化回调 */
  onRowSelectionChange?: (selection: RowSelectionState) => void

  // ========== 行展开相关 ==========
  /** 启用行展开 */
  enableExpanding?: boolean
  /** 默认展开状态 */
  defaultExpanded?: ExpandedState
  /** 展开状态变化回调 */
  onExpandedChange?: (expanded: ExpandedState) => void
  /** 渲染展开行内容 */
  renderExpandedRow?: (row: TData) => JSX.Element
  /** 判断行是否可展开，默认使用 renderExpandedRow 判断 */
  getRowCanExpand?: (row: Row<TData>) => boolean

  // ========== 列固定相关 ==========
  /** 启用列固定 */
  enableColumnPinning?: boolean
  /** 默认列固定状态 */
  defaultColumnPinning?: ColumnPinningState
  /** 列固定状态变化回调 */
  onColumnPinningChange?: (pinning: ColumnPinningState) => void
}

// ==================== Table 组件 ====================

export function Table<TData extends RowData>(props: TableProps<TData>): JSX.Element {
  const [local, variants, rest] = splitProps(
    props,
    [
      'class',
      'data',
      'columns',
      'emptyText',
      'emptyContent',
      'showHeader',
      'showFooter',
      'onRowClick',
      'tableOptions',
      'getRowId',
      // 排序
      'enableSorting',
      'defaultSorting',
      'onSortingChange',
      // 分页
      'pagination',
      'pageSize',
      'defaultPage',
      'paginationProps',
      'onPaginationChange',
      // 行选择
      'enableRowSelection',
      'enableMultiRowSelection',
      'defaultRowSelection',
      'onRowSelectionChange',
      // 行展开
      'enableExpanding',
      'defaultExpanded',
      'onExpandedChange',
      'renderExpandedRow',
      'getRowCanExpand',
      // 列固定
      'enableColumnPinning',
      'defaultColumnPinning',
      'onColumnPinningChange',
    ],
    ['variant', 'size', 'striped', 'hoverable']
  )

  const styles = createMemo(() => tableVariants(variants))

  // 排序状态
  const [sorting, setSorting] = createSignal<SortingState>(local.defaultSorting ?? [])

  // 分页状态
  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: (local.defaultPage ?? 1) - 1,
    pageSize: local.pageSize ?? 10,
  })

  // 行选择状态
  const [rowSelection, setRowSelection] = createSignal<RowSelectionState>(local.defaultRowSelection ?? {})

  // 行展开状态
  const [expanded, setExpanded] = createSignal<ExpandedState>(local.defaultExpanded ?? {})

  // 列固定状态
  const [columnPinning, setColumnPinning] = createSignal<ColumnPinningState>(
    local.defaultColumnPinning ?? { left: [], right: [] }
  )

  // 处理排序变化
  const handleSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updater === 'function' ? updater(sorting()) : updater
    setSorting(newSorting)
    local.onSortingChange?.(newSorting)
  }

  // 处理分页变化
  const handlePaginationChange = (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
    const newPagination = typeof updater === 'function' ? updater(pagination()) : updater
    setPagination(newPagination)
    local.onPaginationChange?.(newPagination)
  }

  // 处理行选择变化
  const handleRowSelectionChange = (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
    const newSelection = typeof updater === 'function' ? updater(rowSelection()) : updater
    setRowSelection(newSelection)
    local.onRowSelectionChange?.(newSelection)
  }

  // 处理行展开变化
  const handleExpandedChange = (updater: ExpandedState | ((old: ExpandedState) => ExpandedState)) => {
    const newExpanded = typeof updater === 'function' ? updater(expanded()) : updater
    setExpanded(newExpanded)
    local.onExpandedChange?.(newExpanded)
  }

  // 处理列固定变化
  const handleColumnPinningChange = (updater: ColumnPinningState | ((old: ColumnPinningState) => ColumnPinningState)) => {
    const newPinning = typeof updater === 'function' ? updater(columnPinning()) : updater
    setColumnPinning(newPinning)
    local.onColumnPinningChange?.(newPinning)
  }

  // 创建表格实例
  const table = createSolidTable({
    get data() {
      return local.data
    },
    get columns() {
      return local.columns
    },
    getRowId: local.getRowId,
    getCoreRowModel: getCoreRowModel(),
    // 排序
    ...(local.enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: handleSortingChange,
    }),
    // 分页
    ...(local.pagination && {
      getPaginationRowModel: getPaginationRowModel(),
      onPaginationChange: handlePaginationChange,
    }),
    // 行选择
    ...(local.enableRowSelection && {
      enableRowSelection: local.enableRowSelection,
      enableMultiRowSelection: local.enableMultiRowSelection ?? true,
      onRowSelectionChange: handleRowSelectionChange,
    }),
    // 行展开
    ...(local.enableExpanding && {
      getExpandedRowModel: getExpandedRowModel(),
      onExpandedChange: handleExpandedChange,
      getRowCanExpand: local.getRowCanExpand ?? (() => !!local.renderExpandedRow),
    }),
    // 列固定
    ...(local.enableColumnPinning && {
      enableColumnPinning: true,
      onColumnPinningChange: handleColumnPinningChange,
    }),
    // 合并 state
    state: (() => {
      const state: Record<string, unknown> = {}
      if (local.enableSorting) {
        Object.defineProperty(state, 'sorting', {
          get: () => sorting(),
          enumerable: true,
        })
      }
      if (local.pagination) {
        Object.defineProperty(state, 'pagination', {
          get: () => pagination(),
          enumerable: true,
        })
      }
      if (local.enableRowSelection) {
        Object.defineProperty(state, 'rowSelection', {
          get: () => rowSelection(),
          enumerable: true,
        })
      }
      if (local.enableExpanding) {
        Object.defineProperty(state, 'expanded', {
          get: () => expanded(),
          enumerable: true,
        })
      }
      if (local.enableColumnPinning) {
        Object.defineProperty(state, 'columnPinning', {
          get: () => columnPinning(),
          enumerable: true,
        })
      }
      return state
    })(),
    ...local.tableOptions,
  })

  const showHeader = () => local.showHeader !== false
  const showFooter = () => local.showFooter === true
  const isEmpty = () => table.getRowModel().rows.length === 0

  // 分页相关计算
  const totalRows = () => local.data.length
  const currentPage = () => pagination().pageIndex + 1
  const handlePageChange = (page: number) => {
    handlePaginationChange({
      ...pagination(),
      pageIndex: page - 1,
    })
  }

  // 获取列固定样式
  const getColumnPinningClass = (isPinned: false | 'left' | 'right', isHeader = false) => {
    if (!isPinned) { return '' }
    if (isPinned === 'left') {
      return isHeader ? styles().thPinnedLeft() : styles().tdPinnedLeft()
    }
    return isHeader ? styles().thPinnedRight() : styles().tdPinnedRight()
  }

  // 获取列固定偏移
  const getColumnPinningStyle = <T extends { column: { getSize: () => number } }>(
    isPinned: false | 'left' | 'right',
    index: number,
    items: T[]
  ): Record<string, string> => {
    if (!isPinned) { return {} }

    let offset = 0
    if (isPinned === 'left') {
      for (let i = 0; i < index; i++) {
        const item = items[i]
        if (item) {
          offset += item.column.getSize()
        }
      }
      return { left: `${offset}px` }
    }

    // 从右往左计算 right 偏移
    for (let i = items.length - 1; i > index; i--) {
      const item = items[i]
      if (item) {
        offset += item.column.getSize()
      }
    }
    return { right: `${offset}px` }
  }

  return (
    <div class={styles().root({ class: local.class })} {...rest}>
      <table class={styles().table()}>
        {/* 表头 */}
        <Show when={showHeader()}>
          <thead class={styles().thead()}>
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr class={styles().tr()}>
                  <For each={headerGroup.headers}>
                    {(header, index) => {
                      const canSort = () => local.enableSorting && header.column.getCanSort()
                      const sortDirection = () => header.column.getIsSorted()
                      const isPinned = () => header.column.getIsPinned()

                      return (
                        <th
                          class={`${styles().th()} ${canSort() ? 'cursor-pointer select-none' : ''} ${getColumnPinningClass(isPinned(), true)}`}
                          colSpan={header.colSpan}
                          style={{
                            width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined,
                            ...getColumnPinningStyle(isPinned(), index(), headerGroup.headers),
                          }}
                          onClick={canSort() ? header.column.getToggleSortingHandler() : undefined}
                          onKeyDown={canSort() ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              header.column.getToggleSortingHandler()?.(e)
                            }
                          } : undefined}
                          tabIndex={canSort() ? 0 : undefined}
                          role={canSort() ? 'button' : undefined}
                        >
                          <Show when={!header.isPlaceholder}>
                            <div class="flex items-center gap-1">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <Show when={canSort()}>
                                <span class="inline-flex size-4 flex-shrink-0">
                                  <Show when={sortDirection() === 'asc'}>
                                    <ChevronUp class="size-4 text-primary" />
                                  </Show>
                                  <Show when={sortDirection() === 'desc'}>
                                    <ChevronDown class="size-4 text-primary" />
                                  </Show>
                                  <Show when={!sortDirection()}>
                                    <ChevronsUpDown class="size-4 text-muted-foreground/50" />
                                  </Show>
                                </span>
                              </Show>
                            </div>
                          </Show>
                        </th>
                      )
                    }}
                  </For>
                </tr>
              )}
            </For>
          </thead>
        </Show>

        {/* 表体 */}
        <tbody class={styles().tbody()}>
          <Show
            when={!isEmpty()}
            fallback={
              <tr>
                <td colSpan={local.columns.length} class={styles().empty()}>
                  {local.emptyContent ?? local.emptyText ?? '暂无数据'}
                </td>
              </tr>
            }
          >
            <For each={table.getRowModel().rows}>
              {(row) => {
                const isSelected = () => row.getIsSelected()
                const isExpanded = () => row.getIsExpanded()
                const visibleCells = () => row.getVisibleCells()

                return (
                  <>
                    <tr
                      class={`${styles().tr()} ${isSelected() ? styles().trSelected() : ''}`}
                      onClick={() => local.onRowClick?.(row.original)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          local.onRowClick?.(row.original)
                        }
                      }}
                      tabIndex={local.onRowClick ? 0 : undefined}
                      role={local.onRowClick ? 'button' : undefined}
                      data-state={isSelected() ? 'selected' : undefined}
                    >
                      <For each={visibleCells()}>
                        {(cell, cellIndex) => {
                          const isPinned = () => cell.column.getIsPinned()

                          return (
                            <td
                              class={`${styles().td()} ${getColumnPinningClass(isPinned())} ${isSelected() ? 'bg-primary/5' : ''}`}
                              style={getColumnPinningStyle(isPinned(), cellIndex(), visibleCells())}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          )
                        }}
                      </For>
                    </tr>
                    {/* 展开行 */}
                    <Show when={local.enableExpanding && isExpanded() && local.renderExpandedRow}>
                      {(renderFn) => (
                        <tr class={styles().expandedRow()}>
                          <td colSpan={visibleCells().length} class={styles().td()}>
                            {renderFn()(row.original)}
                          </td>
                        </tr>
                      )}
                    </Show>
                  </>
                )
              }}
            </For>
          </Show>
        </tbody>

        {/* 表尾 */}
        <Show when={showFooter()}>
          <tfoot class={styles().tfoot()}>
            <For each={table.getFooterGroups()}>
              {(footerGroup) => (
                <tr class={styles().tr()}>
                  <For each={footerGroup.headers}>
                    {(header) => (
                      <th class={styles().th()} colSpan={header.colSpan}>
                        <Show when={!header.isPlaceholder}>
                          {flexRender(header.column.columnDef.footer, header.getContext())}
                        </Show>
                      </th>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tfoot>
        </Show>
      </table>

      {/* 分页 */}
      <Show when={local.pagination}>
        <div class="mt-4 flex justify-end">
          <Pagination
            current={currentPage()}
            total={totalRows()}
            pageSize={pagination().pageSize}
            onChange={handlePageChange}
            size={variants.size}
            {...local.paginationProps}
          />
        </div>
      </Show>
    </div>
  )
}

// ==================== Helper 函数 ====================

/**
 * 创建行选择列
 * @param options - 配置选项
 * @returns 选择列定义
 */
export function createSelectionColumn<TData extends RowData>(options?: {
  /** 列 ID */
  id?: string
  /** 列宽 */
  size?: number
}): ColumnDef<TData, unknown> {
  return {
    id: options?.id ?? 'select',
    size: options?.size ?? 40,
    header: ({ table }: HeaderContext<TData, unknown>) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={() => table.toggleAllRowsSelected()}
        size="sm"
      />
    ),
    cell: ({ row }: CellContext<TData, unknown>) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={() => row.toggleSelected()}
        size="sm"
      />
    ),
    enableSorting: false,
    enableColumnFilter: false,
  }
}

/**
 * 创建行展开列
 * @param options - 配置选项
 * @returns 展开列定义
 */
export function createExpandColumn<TData extends RowData>(options?: {
  /** 列 ID */
  id?: string
  /** 列宽 */
  size?: number
}): ColumnDef<TData, unknown> {
  return {
    id: options?.id ?? 'expand',
    size: options?.size ?? 40,
    header: () => null,
    cell: ({ row }: CellContext<TData, unknown>) => {
      if (!row.getCanExpand()) {
        return null
      }

      return (
        <button
          type="button"
          class="flex items-center justify-center size-6 rounded hover:bg-muted/50 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            row.toggleExpanded()
          }}
          aria-label={row.getIsExpanded() ? '收起' : '展开'}
        >
          <ChevronRight
            class={`size-4 transition-transform duration-200 ${row.getIsExpanded() ? 'rotate-90' : ''}`}
          />
        </button>
      )
    },
    enableSorting: false,
    enableColumnFilter: false,
  }
}

// 导出类型
export type { ColumnDef, Row, RowSelectionState, ExpandedState, ColumnPinningState } from '@tanstack/solid-table'

