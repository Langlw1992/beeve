/**
 * 列定义工具函数
 * 提供简化的列定义 API，转换为 TanStack Table 的 ColumnDef
 */

import type { JSX } from 'solid-js'
import type { ColumnDef, RowData, CellContext } from '@tanstack/solid-table'
import type { Column } from './types'

// ==================== 工具函数 ====================

/**
 * 将字符串首字母大写，并在驼峰处添加空格
 * @example 'firstName' => 'First Name'
 */
function formatTitle(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

// ==================== 列定义转换 ====================

/**
 * 将简化的列定义转换为 TanStack Table 的 ColumnDef
 *
 * @example
 * ```tsx
 * const cols = columns<User>([
 *   { key: 'name', sort: true },
 *   { key: 'email', width: 200 },
 *   { key: 'status', render: (v) => <Badge>{v}</Badge> },
 * ])
 * ```
 */
export function columns<TData extends RowData>(
  defs: Column<TData>[]
): ColumnDef<TData, unknown>[] {
  return defs.map((col) => {
    const columnDef: ColumnDef<TData, unknown> = {
      id: col.key,
      accessorKey: col.key,
      header: col.title ?? formatTitle(col.key),
      enableSorting: col.sort ?? false,
    }

    // 设置列宽
    if (col.width !== undefined) {
      columnDef.size = col.width
    }

    // 设置列固定
    if (col.pin) {
      columnDef.enablePinning = true
      // meta 用于传递额外信息
      columnDef.meta = {
        ...(columnDef.meta as object),
        pin: col.pin,
      }
    }

    // 设置对齐方式
    if (col.align) {
      columnDef.meta = {
        ...(columnDef.meta as object),
        align: col.align,
      }
    }

    // 设置自定义渲染
    if (col.render) {
      columnDef.cell = (ctx: CellContext<TData, unknown>) =>
        col.render?.(ctx.getValue(), ctx.row.original, ctx.row.index)
    }

    return columnDef
  })
}

// ==================== 预设列 ====================

/**
 * 创建操作列
 *
 * @example
 * ```tsx
 * const cols = columns<User>([
 *   { key: 'name' },
 *   actionColumn<User>({
 *     render: (row) => (
 *       <>
 *         <Button onClick={() => edit(row)}>编辑</Button>
 *         <Button onClick={() => delete(row)}>删除</Button>
 *       </>
 *     ),
 *   }),
 * ])
 * ```
 */
export function actionColumn<TData extends RowData>(options: {
  /** 列标题，默认为 "操作" */
  title?: string
  /** 列宽 */
  width?: number
  /** 固定位置 */
  pin?: 'left' | 'right'
  /** 渲染函数 */
  render: (row: TData, index: number) => JSX.Element
}): ColumnDef<TData, unknown> {
  return {
    id: 'actions',
    header: options.title ?? '操作',
    size: options.width,
    enableSorting: false,
    enableColumnFilter: false,
    ...(options.pin && {
      enablePinning: true,
      meta: { pin: options.pin },
    }),
    cell: (ctx: CellContext<TData, unknown>) =>
      options.render(ctx.row.original, ctx.row.index),
  }
}

/**
 * 创建序号列
 *
 * @example
 * ```tsx
 * const cols = [
 *   indexColumn(),
 *   ...columns<User>([{ key: 'name' }]),
 * ]
 * ```
 */
export function indexColumn<TData extends RowData>(options?: {
  /** 列标题，默认为 "#" */
  title?: string
  /** 列宽，默认为 60 */
  width?: number
}): ColumnDef<TData, unknown> {
  return {
    id: 'index',
    header: options?.title ?? '#',
    size: options?.width ?? 60,
    enableSorting: false,
    enableColumnFilter: false,
    cell: (ctx: CellContext<TData, unknown>) => ctx.row.index + 1,
  }
}
