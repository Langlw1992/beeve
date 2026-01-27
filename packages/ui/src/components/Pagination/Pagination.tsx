/**
 * @beeve/ui - Pagination Component
 * 分页组件，可独立使用或与 Table/List 组件配合
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Pagination
 *   current={page()}
 *   total={100}
 *   pageSize={10}
 *   onChange={setPage}
 * />
 *
 * // 简洁模式
 * <Pagination current={1} total={50} simple />
 *
 * // 显示快速跳转
 * <Pagination current={1} total={100} showQuickJumper />
 * ```
 */

import {
  splitProps,
  createMemo,
  createSignal,
  For,
  Show,
  type Component,
  type JSX,
} from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-solid'
import { Button } from '../Button'
import { Input } from '../Input'

// ==================== 样式定义 ====================

const paginationVariants = tv({
  slots: {
    root: 'flex items-center gap-1',
    item: [
      'min-w-8 h-8 px-2',
      'inline-flex items-center justify-center',
      'text-sm font-medium rounded-md',
      'transition-colors',
      'hover:bg-muted',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    itemActive: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ellipsis: 'min-w-8 h-8 inline-flex items-center justify-center text-muted-foreground',
    info: 'text-sm text-muted-foreground',
    jumper: 'flex items-center gap-2 text-sm',
    jumperInput: 'w-16',
  },
  variants: {
    size: {
      sm: {
        root: 'gap-0.5',
        item: 'min-w-7 h-7 px-1.5 text-xs',
        ellipsis: 'min-w-7 h-7',
        info: 'text-xs',
        jumperInput: 'w-14',
      },
      md: {
        root: 'gap-1',
        item: 'min-w-8 h-8 px-2 text-sm',
        ellipsis: 'min-w-8 h-8',
        info: 'text-sm',
        jumperInput: 'w-16',
      },
      lg: {
        root: 'gap-1.5',
        item: 'min-w-9 h-9 px-2.5 text-sm',
        ellipsis: 'min-w-9 h-9',
        info: 'text-sm',
        jumperInput: 'w-18',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type PaginationVariants = VariantProps<typeof paginationVariants>

// ==================== 类型定义 ====================

export interface PaginationProps extends PaginationVariants {
  /** 当前页码（从 1 开始） */
  current: number
  /** 总条数 */
  total: number
  /** 每页条数 */
  pageSize?: number
  /** 页码改变回调 */
  onChange?: (page: number) => void
  /** 每页条数改变回调 */
  onPageSizeChange?: (pageSize: number) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 简洁模式 */
  simple?: boolean
  /** 显示总数 */
  showTotal?: boolean | ((total: number, range: [number, number]) => JSX.Element)
  /** 显示快速跳转 */
  showQuickJumper?: boolean
  /** 显示每页条数选择器 */
  showSizeChanger?: boolean
  /** 每页条数选项 */
  pageSizeOptions?: number[]
  /** 最多显示的页码按钮数 */
  maxPageButtons?: number
  /** 自定义类名 */
  class?: string
}

// ==================== Pagination 组件 ====================

export const Pagination: Component<PaginationProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    [
      'class',
      'current',
      'total',
      'pageSize',
      'onChange',
      'onPageSizeChange',
      'disabled',
      'simple',
      'showTotal',
      'showQuickJumper',
      'showSizeChanger',
      'pageSizeOptions',
      'maxPageButtons',
    ],
    ['size']
  )

  const styles = createMemo(() => paginationVariants(variants))

  // 计算属性
  const pageSize = () => local.pageSize ?? 10
  const totalPages = () => Math.max(1, Math.ceil(local.total / pageSize()))
  const currentPage = () => Math.min(Math.max(1, local.current), totalPages())
  const maxButtons = () => local.maxPageButtons ?? 7

  // 跳转输入
  const [jumperValue, setJumperValue] = createSignal('')

  // 页码范围
  const range = createMemo<[number, number]>(() => {
    const start = (currentPage() - 1) * pageSize() + 1
    const end = Math.min(currentPage() * pageSize(), local.total)
    return [start, end]
  })

  // 生成页码列表
  const pageNumbers = createMemo(() => {
    const total = totalPages()
    const current = currentPage()
    const max = maxButtons()

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
    const sideCount = Math.floor((max - 3) / 2) // 两侧显示的页码数

    // 始终显示第一页
    pages.push(1)

    if (current <= sideCount + 2) {
      // 靠近开头
      for (let i = 2; i <= max - 2; i++) {
        pages.push(i)
      }
      pages.push('ellipsis-end')
    } else if (current >= total - sideCount - 1) {
      // 靠近结尾
      pages.push('ellipsis-start')
      for (let i = total - max + 3; i < total; i++) {
        pages.push(i)
      }
    } else {
      // 中间
      pages.push('ellipsis-start')
      for (let i = current - sideCount + 1; i <= current + sideCount - 1; i++) {
        pages.push(i)
      }
      pages.push('ellipsis-end')
    }

    // 始终显示最后一页
    pages.push(total)

    return pages
  })

  // 事件处理
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages() || page === currentPage() || local.disabled) {
      return
    }
    local.onChange?.(page)
  }

  const handleJumperKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const page = Number.parseInt(jumperValue(), 10)
      if (!Number.isNaN(page)) {
        goToPage(page)
        setJumperValue('')
      }
    }
  }

  // 渲染总数信息
  const renderTotal = () => {
    if (!local.showTotal) {
      return null
    }
    if (typeof local.showTotal === 'function') {
      return <span class={styles().info()}>{local.showTotal(local.total, range())}</span>
    }
    return <span class={styles().info()}>共 {local.total} 条</span>
  }

  // 简洁模式
  if (local.simple) {
    return (
      <div class={styles().root({ class: local.class })} {...rest}>
        <Button
          variant="ghost"
          size={variants.size ?? 'md'}
          disabled={local.disabled || currentPage() <= 1}
          onClick={() => goToPage(currentPage() - 1)}
        >
          <ChevronLeft class="size-4" />
        </Button>
        <span class={styles().info()}>
          {currentPage()} / {totalPages()}
        </span>
        <Button
          variant="ghost"
          size={variants.size ?? 'md'}
          disabled={local.disabled || currentPage() >= totalPages()}
          onClick={() => goToPage(currentPage() + 1)}
        >
          <ChevronRight class="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div class={styles().root({ class: local.class })} {...rest}>
      {/* 总数信息 */}
      {renderTotal()}

      {/* 上一页 */}
      <Button
        variant="ghost"
        size={variants.size ?? 'md'}
        disabled={local.disabled || currentPage() <= 1}
        onClick={() => goToPage(currentPage() - 1)}
      >
        <ChevronLeft class="size-4" />
      </Button>

      {/* 页码按钮 */}
      <For each={pageNumbers()}>
        {(item) => (
          <Show
            when={typeof item === 'number'}
            fallback={
              <span class={styles().ellipsis()}>
                <Show when={item === 'ellipsis-start'}>
                  <ChevronsLeft class="size-4" />
                </Show>
                <Show when={item === 'ellipsis-end'}>
                  <ChevronsRight class="size-4" />
                </Show>
              </span>
            }
          >
            <button
              type="button"
              class={`${styles().item()} ${item === currentPage() ? styles().itemActive() : ''}`}
              disabled={local.disabled}
              onClick={() => goToPage(item as number)}
            >
              {item}
            </button>
          </Show>
        )}
      </For>

      {/* 下一页 */}
      <Button
        variant="ghost"
        size={variants.size ?? 'md'}
        disabled={local.disabled || currentPage() >= totalPages()}
        onClick={() => goToPage(currentPage() + 1)}
      >
        <ChevronRight class="size-4" />
      </Button>

      {/* 快速跳转 */}
      <Show when={local.showQuickJumper}>
        <div class={styles().jumper()}>
          <span>跳至</span>
          <Input
            size={variants.size ?? 'md'}
            class={styles().jumperInput()}
            value={jumperValue()}
            onInput={(value) => setJumperValue(value)}
            onKeyDown={handleJumperKeyDown}
            disabled={local.disabled}
          />
          <span>页</span>
        </div>
      </Show>
    </div>
  )
}

