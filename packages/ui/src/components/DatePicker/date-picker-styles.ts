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
 * DatePicker 单日选择样式
 */
export const datePickerStyles = tv({
  ...baseDatePickerStyles,
  slots: {
    ...baseDatePickerStyles.slots,
    cell: [
      'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
      'h-8 w-8',
    ],
    dayTrigger: [
      'relative size-8 p-0 font-normal rounded-md transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
      'data-[selected]:bg-primary data-[selected]:text-primary-foreground hover:data-[selected]:bg-primary hover:data-[selected]:text-primary-foreground',
      'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent',
      'data-[outside-range]:text-muted-foreground/50',
      'data-[today]:after:content-[""] data-[today]:after:absolute data-[today]:after:bottom-1 data-[today]:after:left-1/2 data-[today]:after:-translate-x-1/2',
      'data-[today]:after:size-1 data-[today]:after:rounded-full data-[today]:after:bg-primary',
      'data-[today][data-outside-range]:after:content-none',
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
    header: 'flex items-center justify-between', // 去掉 padding
    grid: 'w-full border-collapse', // 去掉 space-y-1
    row: ['group flex w-full mt-1', 'data-[week-mode]:cursor-pointer'],
    cell: [
      'relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20',
      'data-[in-range]:bg-primary/20',
      'data-[week-hover]:bg-accent/50',
      'data-[week-hover][data-in-range]:bg-primary/30',
      'first:data-[week-hover]:rounded-l-md last:data-[week-hover]:rounded-r-md',
    ],
    dayTrigger: [
      'relative size-8 p-0 font-normal bg-transparent transition-colors',
      'data-[today]:after:content-[""] data-[today]:after:absolute data-[today]:after:bottom-1 data-[today]:after:left-1/2 data-[today]:after:-translate-x-1/2',
      'data-[today]:after:size-1 data-[today]:after:rounded-full data-[today]:after:bg-primary',
      'data-[today][data-outside-range]:after:content-none',
      'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
      'data-[outside-range]:text-muted-foreground/50',
      'group-data-[week-mode]:rounded-md group-data-[week-mode]:hover:bg-accent group-data-[week-mode]:hover:text-accent-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
      'data-[in-range]:bg-transparent data-[in-range]:rounded-none data-[in-range]:hover:!bg-transparent',
      'data-[range-edge]:!rounded-md data-[range-edge]:!bg-primary data-[range-edge]:!text-primary-foreground',
      'data-[range-edge]:hover:!bg-primary/90',
      'data-[week-hover]:!bg-transparent data-[week-hover]:!rounded-none',
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
