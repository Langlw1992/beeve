import {tv} from 'tailwind-variants'

/**
 * DatePicker 和 DateRangePicker 共享的基础样式
 */
export const baseDatePickerStyles = {
  slots: {
    root: 'group flex flex-col gap-1.5',
    label: 'text-sm font-medium text-foreground',
    control: 'flex items-center gap-2',
    trigger: [
      'flex w-full items-center justify-between rounded-md border bg-transparent text-left font-normal transition-colors',
      'border-input hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
      'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
    ],
    content: [
      'z-50 rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    ],
    header: 'flex items-center justify-between pt-1 pb-4',
    heading: 'text-sm font-medium',
    grid: 'w-full border-collapse space-y-1',
    columnHeader:
      'rounded-md text-[0.8rem] font-normal text-muted-foreground w-8 h-8',
    row: 'flex w-full mt-2',
    monthTrigger: [
      'h-8 w-full p-2 font-normal rounded-md transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'aria-selected:bg-primary aria-selected:text-primary-foreground',
    ],
    yearTrigger: [
      'h-8 w-full p-2 font-normal rounded-md transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'aria-selected:bg-primary aria-selected:text-primary-foreground',
    ],
    navTrigger: [
      'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-input rounded-md flex items-center justify-center transition-opacity hover:bg-accent hover:text-accent-foreground',
    ],
  },
  variants: {
    size: {
      sm: {trigger: 'h-7 text-xs px-2'},
      md: {trigger: 'h-8 text-sm px-3'},
      lg: {trigger: 'h-9 text-sm px-3'},
    },
    error: {
      true: {trigger: 'border-destructive focus-visible:ring-destructive/20'},
    },
  },
  defaultVariants: {
    size: 'md' as const,
  },
}

/**
 * 共享的 cell 基础样式
 */
const baseCellStyles = [
  'relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20',
]

/**
 * 共享的 dayTrigger 基础样式
 */
const baseDayTriggerStyles = [
  'relative size-8 p-0 font-medium bg-transparent transition-all duration-200',
  // 基础 hover
  'hover:bg-accent/50 hover:text-accent-foreground',
  // 今天标记 - 底部小圆点
  'data-[today]:after:content-[""] data-[today]:after:absolute data-[today]:after:bottom-1 data-[today]:after:left-1/2 data-[today]:after:-translate-x-1/2',
  'data-[today]:after:size-1 data-[today]:after:rounded-full data-[today]:after:bg-primary',
  'data-[today][data-outside-range]:after:content-none',
  // 禁用状态
  'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
  // 外部日期（非当前月）
  'data-[outside-range]:text-muted-foreground/40 data-[outside-range]:hover:bg-transparent',
  // 焦点状态
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1',
]

/**
 * DatePicker 单日选择样式
 */
export const datePickerStyles = tv({
  ...baseDatePickerStyles,
  slots: {
    ...baseDatePickerStyles.slots,
    cell: [
      ...baseCellStyles,
      // 单日选择特有：选中状态的行背景
      '[&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
    ],
    dayTrigger: [
      ...baseDayTriggerStyles,
      // 单日选择特有：选中样式
      'rounded-md',
      'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:shadow-sm',
      'data-[selected]:font-semibold data-[selected]:scale-105',
      'hover:data-[selected]:bg-primary/90',
      // 今天在选中状态下的标记颜色
      'data-[today][data-selected]:after:bg-primary-foreground',
    ],
  },
})

/**
 * DateRangePicker 范围选择样式
 */
export const dateRangePickerStyles = tv({
  ...baseDatePickerStyles,
  slots: {
    ...baseDatePickerStyles.slots,
    // 范围选择特有的 header 和 row 样式
    header: 'flex items-center justify-between',
    grid: 'w-full border-collapse',
    row: ['group flex w-full mt-1', 'data-[week-mode]:cursor-pointer'],
    cell: [
      ...baseCellStyles,
      // 范围选择特有：范围内背景
      'data-[in-range]:bg-primary/10',
      'data-[in-range]:before:content-[""] data-[in-range]:before:absolute data-[in-range]:before:inset-y-1 data-[in-range]:before:inset-x-0',
      'data-[in-range]:before:bg-primary/5 data-[in-range]:before:-z-10',
      'data-[range-start]:before:rounded-l-md',
      'data-[range-end]:before:rounded-r-md',
      // 周 hover 效果
      'data-[week-hovered]:bg-accent/40',
      'data-[week-hovered]:before:content-[""] data-[week-hovered]:before:absolute data-[week-hovered]:before:inset-y-1 data-[week-hovered]:before:inset-x-0',
      'data-[week-hovered]:before:bg-accent/20 data-[week-hovered]:before:-z-10',
      'first:data-[week-hovered]:before:rounded-l-md last:data-[week-hovered]:before:rounded-r-md',
      'data-[week-hovered][data-in-range]:bg-primary/15',
    ],
    dayTrigger: [
      ...baseDayTriggerStyles,
      // 范围选择特有：范围内日期样式
      'data-[in-range]:bg-transparent data-[in-range]:text-foreground data-[in-range]:hover:bg-transparent',
      'data-[in-range]:font-medium',
      // 范围起始/结束日期 - 强调样式
      'data-[range-start]:bg-primary data-[range-start]:text-primary-foreground data-[range-start]:rounded-md',
      'data-[range-start]:hover:bg-primary/90 data-[range-start]:shadow-sm',
      'data-[range-start]:font-semibold data-[range-start]:scale-105',
      'data-[range-end]:bg-primary data-[range-end]:text-primary-foreground data-[range-end]:rounded-md',
      'data-[range-end]:hover:bg-primary/90 data-[range-end]:shadow-sm',
      'data-[range-end]:font-semibold data-[range-end]:scale-105',
      // 周选择模式
      'group-data-[week-mode]:hover:bg-accent/60',
      'data-[week-hovered]:bg-transparent data-[week-hovered]:text-foreground',
      // 今天在不同状态下的标记颜色
      'data-[today][data-in-range]:after:bg-primary/60',
      'data-[today][data-range-start]:after:bg-primary-foreground',
      'data-[today][data-range-end]:after:bg-primary-foreground',
      // 外部日期（非当前月）- 必须放在最后以覆盖所有其他样式
      'data-[outside-range]:bg-transparent! data-[outside-range]:text-muted-foreground/40!',
      'data-[outside-range]:font-medium! data-[outside-range]:scale-100!',
      'data-[outside-range]:shadow-none! data-[outside-range]:hover:bg-transparent!',
    ],
    presetButton: [
      'w-full justify-start text-left font-normal px-2 py-1.5 text-xs rounded-md transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'data-[selected]:bg-primary/10 data-[selected]:text-primary',
    ],
    clearButton: [
      'size-6 p-0 rounded-full flex items-center justify-center transition-colors',
      'hover:bg-accent text-muted-foreground hover:text-foreground',
    ],
  },
})

export type DatePickerStylesReturn = ReturnType<typeof datePickerStyles>
export type DateRangePickerStylesReturn = ReturnType<
  typeof dateRangePickerStyles
>
