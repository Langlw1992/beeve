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
  flexRender,
  type ColumnDef,
  type TableOptions,
  type RowData,
  type SortingState,
  type PaginationState,
} from '@tanstack/solid-table'
import { tv, type VariantProps } from 'tailwind-variants'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-solid'
import { Pagination, type PaginationProps } from '../Pagination'

// ==================== 样式定义 ====================

const tableVariants = tv({
  slots: {
    root: 'w-full overflow-auto',
    table: 'w-full caption-bottom text-sm',
    thead: 'border-b border-border',
    tbody: '[&_tr:last-child]:border-0',
    tfoot: 'border-t border-border bg-muted/50 font-medium',
    tr: 'border-b border-border transition-colors',
    th: [
      'text-left align-middle font-medium text-muted-foreground',
      '[&:has([role=checkbox])]:pr-0',
    ],
    td: 'align-middle [&:has([role=checkbox])]:pr-0',
    empty: 'text-center text-muted-foreground',
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

  // 创建表格实例
  const table = createSolidTable({
    get data() {
      return local.data
    },
    get columns() {
      return local.columns
    },
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
    // 合并 state（排序和分页可能同时启用）
    // 使用 Object.defineProperty 确保 getter 正确工作
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
                    {(header) => {
                      const canSort = () => local.enableSorting && header.column.getCanSort()
                      const sortDirection = () => header.column.getIsSorted()

                      return (
                        <th
                          class={`${styles().th()} ${canSort() ? 'cursor-pointer select-none' : ''}`}
                          colSpan={header.colSpan}
                          style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }}
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
              {(row) => (
                <tr
                  class={styles().tr()}
                  onClick={() => local.onRowClick?.(row.original)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      local.onRowClick?.(row.original)
                    }
                  }}
                  tabIndex={local.onRowClick ? 0 : undefined}
                  role={local.onRowClick ? 'button' : undefined}
                >
                  <For each={row.getVisibleCells()}>
                    {(cell) => (
                      <td class={styles().td()}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )}
                  </For>
                </tr>
              )}
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

// 导出类型
export type { ColumnDef } from '@tanstack/solid-table'

