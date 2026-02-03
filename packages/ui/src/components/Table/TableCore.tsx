/**
 * TableCore - 表格基础渲染组件
 * 接收 TanStack Table instance，负责纯渲染逻辑
 */

import {createMemo, For, Show, type JSX} from 'solid-js'
import {
  flexRender,
  type Table as TableInstance,
  type RowData,
  type Row,
} from '@tanstack/solid-table'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
  Loader2,
} from 'lucide-solid'
import {tableVariants} from './styles'
import {Checkbox} from '../Checkbox'
import type {TableSize, TableVariant} from './types'

// ==================== Props ====================

export interface TableCoreProps<TData extends RowData> {
  /** TanStack Table 实例 */
  table: TableInstance<TData>
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

  // ===== 状态 =====
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
  /** 是否启用选中（用于渲染选中列） */
  selectable?: boolean
  /** 是否全选所有数据（true）或当前页（false） */
  selectAllRows?: boolean

  // ===== 展开 =====
  /** 是否启用展开（用于渲染展开列） */
  expandable?: boolean
  /** 渲染展开行内容 */
  renderExpanded?: (row: Row<TData>) => JSX.Element

  // ===== 列固定 =====
  /** 是否启用列固定 */
  enablePinning?: boolean
}

// ==================== TableCore 组件 ====================

export function TableCore<TData extends RowData>(
  props: TableCoreProps<TData>,
): JSX.Element {
  const styles = createMemo(() =>
    tableVariants({
      variant: props.variant,
      size: props.size,
      striped: props.striped,
      hoverable: props.hoverable,
    }),
  )

  const showHeader = () => props.showHeader !== false
  const showFooter = () => props.showFooter === true
  const isEmpty = () => props.table.getRowModel().rows.length === 0
  const columnCount = () => {
    let count = props.table.getAllColumns().length
    if (props.selectable) {
      count++
    }
    if (props.expandable) {
      count++
    }
    return count
  }

  // 获取列固定样式类
  const getPinningClass = (
    isPinned: false | 'left' | 'right',
    isHeader = false,
  ) => {
    if (!isPinned || !props.enablePinning) {
      return ''
    }
    if (isPinned === 'left') {
      return isHeader ? styles().thPinnedLeft() : styles().tdPinnedLeft()
    }
    return isHeader ? styles().thPinnedRight() : styles().tdPinnedRight()
  }

  // 获取列固定偏移样式
  const getPinningStyle = <T extends {column: {getSize: () => number}}>(
    isPinned: false | 'left' | 'right',
    index: number,
    items: T[],
    extraOffset = 0,
  ): Record<string, string> => {
    if (!isPinned || !props.enablePinning) {
      return {}
    }

    let offset = extraOffset
    if (isPinned === 'left') {
      for (let i = 0; i < index; i++) {
        const item = items[i]
        if (item) {
          offset += item.column.getSize()
        }
      }
      return {left: `${offset}px`}
    }

    for (let i = items.length - 1; i > index; i--) {
      const item = items[i]
      if (item) {
        offset += item.column.getSize()
      }
    }
    return {right: `${offset}px`}
  }

  // 渲染选中列表头
  const renderSelectionHeader = () => {
    const table = props.table
    const isAllSelected = props.selectAllRows
      ? table.getIsAllRowsSelected()
      : table.getIsAllPageRowsSelected()
    const isSomeSelected = props.selectAllRows
      ? table.getIsSomeRowsSelected()
      : table.getIsSomePageRowsSelected()
    const toggleAll = props.selectAllRows
      ? () => table.toggleAllRowsSelected()
      : () => table.toggleAllPageRowsSelected()

    return (
      <div class={styles().selectWrapper()}>
        <Checkbox
          checked={isAllSelected}
          indeterminate={isSomeSelected && !isAllSelected}
          onChange={toggleAll}
          size="sm"
          aria-label="选择所有行"
        />
      </div>
    )
  }

  // 渲染选中列单元格
  const renderSelectionCell = (row: Row<TData>) => (
    <div class={styles().selectWrapper()}>
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={() => row.toggleSelected()}
        size="sm"
        aria-label="选择该行"
      />
    </div>
  )

  // 渲染展开列单元格
  const renderExpandCell = (row: Row<TData>) => {
    if (!row.getCanExpand()) {
      return <div class={styles().expandWrapper()} />
    }

    return (
      <div class={styles().expandWrapper()}>
        <button
          type="button"
          class={styles().expandButton()}
          onClick={(e) => {
            e.stopPropagation()
            row.toggleExpanded()
          }}
          aria-label={row.getIsExpanded() ? '收起' : '展开'}
          aria-expanded={row.getIsExpanded()}
          data-state={row.getIsExpanded() ? 'expanded' : 'collapsed'}
        >
          <ChevronRight
            class={`${styles().expandIcon()} ${row.getIsExpanded() ? styles().expandIconExpanded() : ''}`}
          />
        </button>
      </div>
    )
  }

  return (
    <div class={styles().root({class: props.class})}>
      {/* Loading 覆盖层 */}
      <Show when={props.loading}>
        <div class={styles().loadingOverlay()}>
          <Loader2 class={styles().loadingSpinner()} />
        </div>
      </Show>

      {/* 滚动容器 - 支持横向滚动 */}
      <div class={styles().scrollWrapper()}>
        <table class={styles().table()}>
        {/* 表头 */}
        <Show when={showHeader()}>
          <thead class={styles().thead()}>
            <For each={props.table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr class={styles().tr()}>
                  {/* 选中列表头 */}
                  <Show when={props.selectable}>
                    <th class={`${styles().th()} ${styles().selectCell()}`}>
                      {renderSelectionHeader()}
                    </th>
                  </Show>
                  {/* 展开列表头 */}
                  <Show when={props.expandable}>
                    <th class={`${styles().th()} ${styles().expandCell()}`} />
                  </Show>
                  {/* 数据列表头 */}
                  <For each={headerGroup.headers}>
                    {(header, index) => {
                      const canSort = () => header.column.getCanSort()
                      const sortDirection = () => header.column.getIsSorted()
                      const isPinned = () => header.column.getIsPinned()

                      return (
                        <th
                          class={`${styles().th()} ${canSort() ? `${styles().thSortable()} group` : ''} ${getPinningClass(isPinned(), true)}`}
                          colSpan={header.colSpan}
                          style={{
                            width:
                              header.getSize() !== 150
                                ? `${header.getSize()}px`
                                : undefined,
                            ...getPinningStyle(
                              isPinned(),
                              index(),
                              headerGroup.headers,
                            ),
                          }}
                          onClick={
                            canSort()
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                          onKeyDown={
                            canSort()
                              ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    header.column.getToggleSortingHandler()?.(e)
                                  }
                                }
                              : undefined
                          }
                          tabIndex={canSort() ? 0 : undefined}
                          role={canSort() ? 'button' : undefined}
                        >
                          <Show when={!header.isPlaceholder}>
                            <div class="flex items-center gap-2 select-none">
                              <span class="truncate">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </span>
                              <Show when={canSort()}>
                                <span class="inline-flex size-4 flex-shrink-0 transition-all duration-200">
                                  <Show when={sortDirection() === 'asc'}>
                                    <ChevronUp class="size-4 text-primary drop-shadow-sm" />
                                  </Show>
                                  <Show when={sortDirection() === 'desc'}>
                                    <ChevronDown class="size-4 text-primary drop-shadow-sm" />
                                  </Show>
                                  <Show when={!sortDirection()}>
                                    <ChevronsUpDown class="size-4 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
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
                <td
                  colSpan={columnCount()}
                  class={styles().empty()}
                >
                  <div class="flex flex-col items-center justify-center gap-2">
                    <svg class="size-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" role="img" aria-label="空表格">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div class="text-sm text-muted-foreground">
                      {props.emptyContent ?? props.emptyText ?? '暂无数据'}
                    </div>
                  </div>
                </td>
              </tr>
            }
          >
            <For each={props.table.getRowModel().rows}>
              {(row) => {
                const isSelected = () => row.getIsSelected()
                const isExpanded = () => row.getIsExpanded()
                const visibleCells = () => row.getVisibleCells()

                return (
                  <>
                    <tr
                      class={`${styles().tr()} ${isSelected() ? styles().trSelected() : ''}`}
                      onClick={() => props.onRowClick?.(row.original)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          props.onRowClick?.(row.original)
                        }
                      }}
                      tabIndex={props.onRowClick ? 0 : undefined}
                      role={props.onRowClick ? 'button' : undefined}
                      data-state={isSelected() ? 'selected' : undefined}
                    >
                      {/* 选中列单元格 */}
                      <Show when={props.selectable}>
                        <td class={`${styles().td()} ${styles().selectCell()}`}>
                          {renderSelectionCell(row)}
                        </td>
                      </Show>
                      {/* 展开列单元格 */}
                      <Show when={props.expandable}>
                        <td class={`${styles().td()} ${styles().expandCell()}`}>
                          {renderExpandCell(row)}
                        </td>
                      </Show>
                      {/* 数据列单元格 */}
                      <For each={visibleCells()}>
                        {(cell, cellIndex) => {
                          const isPinned = () => cell.column.getIsPinned()

                          return (
                            <td
                              class={`${styles().td()} ${getPinningClass(isPinned())}`}
                              style={getPinningStyle(
                                isPinned(),
                                cellIndex(),
                                visibleCells(),
                              )}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          )
                        }}
                      </For>
                    </tr>
                    {/* 展开行 */}
                    <Show
                      when={
                        props.expandable && isExpanded() && props.renderExpanded
                      }
                    >
                      <tr
                        class={styles().expandedRow()}
                        data-state="expanded"
                      >
                        <td
                          colSpan={columnCount()}
                          class={styles().expandedContent()}
                        >
                          {props.renderExpanded?.(row)}
                        </td>
                      </tr>
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
            <For each={props.table.getFooterGroups()}>
              {(footerGroup) => (
                <tr class={styles().tr()}>
                  <Show when={props.selectable}>
                    <th class={styles().th()} />
                  </Show>
                  <Show when={props.expandable}>
                    <th class={styles().th()} />
                  </Show>
                  <For each={footerGroup.headers}>
                    {(header) => (
                      <th
                        class={styles().th()}
                        colSpan={header.colSpan}
                      >
                        <Show when={!header.isPlaceholder}>
                          {flexRender(
                            header.column.columnDef.footer,
                            header.getContext(),
                          )}
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
      </div>
      {/* 滚动容器结束 */}
    </div>
  )
}
