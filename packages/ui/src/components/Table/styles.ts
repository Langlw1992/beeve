/**
 * Table 组件共享样式定义
 */

import { tv } from 'tailwind-variants'

export const tableVariants = tv({
  slots: {
    root: 'w-full overflow-auto relative',
    table: 'w-full caption-bottom text-sm',
    thead: '[&_tr]:border-b',
    tbody: '[&_tr:last-child]:border-0',
    tfoot: 'border-t border-border bg-muted/50 font-medium',
    tr: 'border-b border-border transition-colors data-[state=selected]:bg-muted',
    trSelected: 'bg-muted',
    th: [
      'text-left align-middle font-medium text-muted-foreground',
      '[&:has([role=checkbox])]:pr-0',
    ],
    thSortable: 'cursor-pointer select-none hover:bg-muted/50',
    thPinnedLeft: 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]',
    thPinnedRight: 'sticky right-0 z-10 bg-background shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]',
    td: 'align-middle [&:has([role=checkbox])]:pr-0',
    tdPinnedLeft: 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]',
    tdPinnedRight: 'sticky right-0 z-10 bg-background shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]',
    empty: 'text-center text-muted-foreground',
    expandedRow: 'bg-muted/50 border-b-0',
    expandedContent: 'p-4',
    // 选择列样式 - 紧凑宽度，左侧 padding
    selectCell: 'w-8 pl-3 pr-0',
    selectWrapper: 'flex items-center',
    // 展开列样式 - 紧凑宽度
    expandCell: 'w-8 pl-2 pr-0',
    expandWrapper: 'flex items-center',
    expandButton: [
      'inline-flex items-center justify-center',
      'size-6 rounded-sm',
      'text-muted-foreground',
      'hover:bg-muted hover:text-foreground',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      'transition-colors',
    ],
    expandIcon: 'size-4 shrink-0 transition-transform duration-200',
    expandIconExpanded: 'rotate-90',
    loadingOverlay: 'absolute inset-0 bg-background/60 flex items-center justify-center z-20',
    loadingSpinner: 'size-6 animate-spin text-primary',
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
        tbody: '[&>tr:nth-child(odd):not([data-state=selected])]:bg-muted/30',
      },
    },
    hoverable: {
      true: {
        tr: 'hover:bg-muted/50 cursor-pointer data-[state=selected]:hover:bg-muted',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})
