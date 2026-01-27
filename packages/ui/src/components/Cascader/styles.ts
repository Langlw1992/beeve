/**
 * Cascader 组件样式定义
 * 与 Menu 组件保持一致的样式风格
 */

import { tv } from 'tailwind-variants'

export const cascaderStyles = tv({
  slots: {
    // 触发器
    trigger: [
      'group flex items-center justify-between w-full',
      'border bg-background text-foreground transition-colors',
      'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary',
    ],
    triggerText: 'flex-1 text-left truncate min-w-0',
    triggerPlaceholder: 'text-muted-foreground',
    triggerIcons: 'flex items-center shrink-0',
    clearIcon: [
      'text-muted-foreground hover:text-foreground shrink-0',
      'rounded-full p-0.5 hover:bg-accent transition-colors',
      'mr-1 cursor-pointer flex items-center justify-center',
    ],
    indicator: 'text-muted-foreground shrink-0 transition-transform duration-200',

    // 多选标签容器
    tagsContainer: 'flex flex-wrap gap-1 flex-1 min-w-0',
    // 多选标签
    tag: [
      'inline-flex items-center gap-1 max-w-full',
      'bg-accent text-accent-foreground',
      'rounded px-1.5 py-0.5',
    ],
    tagLabel: 'truncate',
    tagClose: [
      'shrink-0 rounded-full hover:bg-foreground/10 cursor-pointer',
      'flex items-center justify-center',
    ],
    tagCount: [
      'inline-flex items-center',
      'bg-accent text-accent-foreground',
      'rounded px-1.5 py-0.5',
    ],

    // 弹出层
    positioner: 'z-50',
    content: [
      'flex',
      'overflow-hidden',
      'rounded-md border border-border',
      'bg-popover',
      'text-popover-foreground',
      'shadow-md',
      '!outline-none',
      'data-[state=open]:animate-in',
      'data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0',
      'data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95',
      'data-[state=open]:zoom-in-95',
    ],

    // 列面板（高度由内容决定）
    column: [
      'min-w-[8rem]',
      'border-r border-border last:border-r-0',
      'p-1',
    ],

    // 选项
    item: [
      'relative flex',
      'cursor-default select-none items-center justify-between gap-2',
      'rounded-sm px-2 py-1.5',
      'text-sm',
      'outline-none',
      'transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'data-[highlighted]:bg-accent',
      'data-[highlighted]:text-accent-foreground',
      'data-[disabled]:pointer-events-none',
      'data-[disabled]:opacity-50',
      'data-[selected]:bg-accent',
      'data-[selected]:text-accent-foreground',
    ],
    itemLabel: 'flex-1 truncate',
    itemIndicator: 'size-4 shrink-0',
    // 多选复选框
    itemCheckbox: [
      'size-4 shrink-0 mr-1.5',
      'rounded border border-border',
      'flex items-center justify-center',
      'data-[checked]:bg-primary data-[checked]:border-primary data-[checked]:text-primary-foreground',
    ],

    // 错误状态
    errorText: 'text-[0.8rem] font-medium text-destructive mt-1.5',
  },
  variants: {
    size: {
      sm: {
        trigger: 'min-h-7 h-auto px-2 text-xs rounded-md py-0.5',
        column: 'min-w-[6rem] p-1',
        item: 'px-2 py-1 text-xs gap-1.5',
        itemIndicator: 'size-3.5',
        itemCheckbox: 'size-3.5',
        tag: 'text-xs px-1 py-0',
        tagClose: 'size-3',
        tagCount: 'text-xs px-1 py-0',
      },
      md: {
        trigger: 'min-h-8 h-auto px-3 text-sm rounded-md py-1',
        column: 'min-w-[8rem] p-1',
        item: 'px-2 py-1.5 text-sm gap-2',
        itemIndicator: 'size-4',
        itemCheckbox: 'size-4',
        tag: 'text-sm px-1.5 py-0.5',
        tagClose: 'size-3.5',
        tagCount: 'text-sm px-1.5 py-0.5',
      },
      lg: {
        trigger: 'min-h-9 h-auto px-4 text-sm rounded-md py-1.5',
        column: 'min-w-[10rem] p-1',
        item: 'px-3 py-2 text-base gap-2.5',
        itemIndicator: 'size-5',
        itemCheckbox: 'size-5',
        tag: 'text-sm px-2 py-1',
        tagClose: 'size-4',
        tagCount: 'text-sm px-2 py-1',
      },
    },
    error: {
      true: {
        trigger: '!border-destructive text-destructive focus-visible:ring-destructive/20',
        indicator: 'text-destructive/80',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

