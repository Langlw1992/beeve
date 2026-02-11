/**
 * Table 组件样式 - 简洁实用风格
 * 参考：Ant Design, Shadcn/ui, Material-UI
 */

import {tv} from 'tailwind-variants'

export const tableVariants = tv({
  slots: {
    // ==================== 容器 ====================
    root: [
      'w-full relative',
      'border border-border rounded-lg',
      'bg-card',
      'overflow-hidden',
    ],

    // 滚动容器
    scrollWrapper: ['overflow-x-auto', 'scroll-smooth'],

    // 表格
    table: ['w-full', 'text-sm', 'border-collapse'],

    // ==================== 表头 ====================
    thead: ['bg-muted/50', 'border-b border-border'],

    th: [
      'text-left align-middle',
      'font-medium text-xs',
      'text-muted-foreground',
      'whitespace-nowrap',
      // 复选框列特殊处理
      '[&:has([role=checkbox])]:w-[40px]',
    ],

    thSortable: [
      'cursor-pointer select-none',
      'transition-colors duration-150',
      'hover:bg-muted/80 hover:text-foreground',
      // 焦点状态
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    ],

    // 固定列
    thPinnedLeft: [
      'sticky left-0 z-20',
      'bg-muted/50',
      'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)]',
    ],

    thPinnedRight: [
      'sticky right-0 z-20',
      'bg-muted/50',
      'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.1)]',
    ],

    // ==================== 表体 ====================
    tbody: ['divide-y divide-border'],

    tr: [
      'transition-colors duration-150',
      // 选中状态
      'data-[state=selected]:bg-primary/[0.05]',
    ],

    trSelected: ['bg-primary/[0.05]'],

    td: [
      'align-middle',
      'text-foreground',
      // 复选框列特殊处理
      '[&:has([role=checkbox])]:w-[40px]',
    ],

    tdPinnedLeft: [
      'sticky left-0 z-10',
      'bg-card',
      'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]',
    ],

    tdPinnedRight: [
      'sticky right-0 z-10',
      'bg-card',
      'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]',
    ],

    // ==================== 表尾 ====================
    tfoot: ['border-t border-border', 'bg-muted/30', 'font-medium'],

    // ==================== 空状态 ====================
    empty: ['text-center text-muted-foreground', 'font-normal'],

    // ==================== 展开行 ====================
    expandedRow: [
      'bg-muted/20',
      // 简单的淡入动画
      'animate-in fade-in duration-200',
    ],

    expandedContent: ['border-l-2 border-primary/40', 'bg-muted/10'],

    // ==================== 选择列（极度紧凑）====================
    selectCell: [
      'w-[40px] min-w-[40px] max-w-[40px]',
      'px-3',
      // 视觉层次 - 使用渐变背景和内阴影
      'bg-gradient-to-b from-muted/40 to-muted/30',
      'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]',
      // 分隔边框
      'border-r-2 border-border/60',
      'transition-colors duration-200',
    ],

    selectWrapper: ['flex items-center justify-center', 'h-full', 'relative'],

    // ==================== 展开列（极度紧凑）====================
    expandCell: [
      'w-[40px] min-w-[40px] max-w-[40px]',
      'px-2',
      // 视觉层次 - 使用更深的渐变
      'bg-gradient-to-b from-muted/50 to-muted/40',
      'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]',
      // 分隔边框
      'border-r-2 border-border/60',
      'transition-colors duration-200',
    ],

    expandWrapper: ['flex items-center justify-center', 'h-full', 'relative'],

    expandButton: [
      'inline-flex items-center justify-center',
      'size-8 rounded-full',
      // 基础样式 - 明显的背景
      'bg-muted/50',
      'text-muted-foreground',
      'border-2 border-border/50',
      'shadow-sm',
      // 过渡动画
      'transition-all duration-200 ease-out',
      // 悬停状态 - 更明显的反馈
      'hover:bg-muted/80 hover:text-foreground hover:border-border hover:shadow-md hover:scale-105',
      // 焦点状态
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
      // 激活状态
      'active:scale-95 active:shadow-sm',
      // 禁用状态
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-muted/50 disabled:hover:scale-100',
      // 展开状态 - 使用主题色突出显示
      'data-[state=expanded]:bg-primary data-[state=expanded]:text-primary-foreground',
      'data-[state=expanded]:border-primary data-[state=expanded]:shadow-lg',
      'data-[state=expanded]:shadow-primary/20',
    ],

    expandIcon: [
      'size-4 shrink-0',
      'transition-transform duration-300 ease-out',
      'drop-shadow-sm',
    ],

    expandIconExpanded: 'rotate-90',

    // ==================== 加载状态 ====================
    loadingOverlay: [
      'absolute inset-0',
      'bg-background/60 backdrop-blur-sm',
      'flex items-center justify-center',
      'z-50',
      'animate-in fade-in duration-200',
    ],

    loadingSpinner: ['size-5', 'animate-spin', 'text-primary'],
  },

  variants: {
    // ==================== 变体：样式 ====================
    variant: {
      default: {},
      bordered: {
        th: 'border-r border-border last:border-r-0',
        td: 'border-r border-border last:border-r-0',
      },
    },

    // ==================== 变体：尺寸 ====================
    size: {
      sm: {
        th: 'h-8 px-3 py-1.5',
        td: 'h-8 px-3 py-1.5',
        empty: 'py-6',
        expandButton: 'size-5',
        expandIcon: 'size-3.5',
        expandedContent: 'p-3',
      },
      md: {
        th: 'h-10 px-4 py-2.5',
        td: 'h-10 px-4 py-2.5',
        empty: 'py-10',
        expandButton: 'size-6',
        expandIcon: 'size-4',
        expandedContent: 'p-4',
      },
      lg: {
        th: 'h-12 px-5 py-3',
        td: 'h-12 px-5 py-3',
        empty: 'py-12',
        expandButton: 'size-7',
        expandIcon: 'size-4.5',
        expandedContent: 'p-5',
      },
    },

    // ==================== 变体：条纹 ====================
    striped: {
      true: {
        tbody: '[&>tr:nth-child(even):not([data-state=selected])]:bg-muted/30',
      },
    },

    // ==================== 变体：可悬停 ====================
    hoverable: {
      true: {
        tr: [
          'cursor-pointer',
          'hover:bg-muted/50',
          'data-[state=selected]:hover:bg-primary/[0.08]',
        ],
      },
    },
  },

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})
