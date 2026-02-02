import * as datePicker from '@zag-js/date-picker'
import type { DateRangePreset } from '@zag-js/date-picker'
import { normalizeProps, useMachine } from '@zag-js/solid'
import {
  For,
  Show,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
  type Accessor,
  type Component,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-solid'
import { tv, type VariantProps } from 'tailwind-variants'
import { DateFormatter, type DateValue, startOfWeek, endOfWeek, startOfMonth, endOfMonth, today, getLocalTimeZone } from '@internationalized/date'
import { formatDate } from '../../utils/formatDate'

// ============================================================================
// Styles
// ============================================================================

const dateRangePickerStyles = tv({
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
      'z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    ],
    header: 'flex items-center justify-between',
    heading: 'text-sm font-medium',
    grid: 'w-full border-collapse',
    columnHeader: 'size-8 rounded-md text-[0.8rem] font-normal text-muted-foreground',
    row: 'flex w-full mt-1',
    cell: [
      'relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20',
      // 范围内的背景色由 dayTrigger 控制
    ],
    dayTrigger: [
      'relative size-8 p-0 font-normal bg-transparent rounded-[var(--radius)] transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
      // Today indicator
      'data-[today]:after:content-[""] data-[today]:after:absolute data-[today]:after:bottom-1 data-[today]:after:left-1/2 data-[today]:after:-translate-x-1/2',
      'data-[today]:after:size-1 data-[today]:after:rounded-full data-[today]:after:bg-primary',
      // Disabled state
      'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
      // In range: 主题色半透明背景，无圆角
      'data-[in-range]:bg-primary/10 data-[in-range]:rounded-none',
      'data-[in-range]:hover:bg-primary/15',
      // Range start: 完整圆角 + 高亮背景色 + 白色文字
      'data-[range-start]:rounded-[var(--radius)] data-[range-start]:bg-primary data-[range-start]:text-primary-foreground',
      'data-[range-start]:hover:bg-primary/90',
      // Range end: 完整圆角 + 高亮背景色 + 白色文字
      'data-[range-end]:rounded-[var(--radius)] data-[range-end]:bg-primary data-[range-end]:text-primary-foreground',
      'data-[range-end]:hover:bg-primary/90',
      // Outside range (non-current month): 强制覆盖所有范围样式，确保非当月日期无任何样式
      'data-[outside-range]:!bg-transparent data-[outside-range]:!text-muted-foreground/50',
      'data-[outside-range]:hover:!bg-transparent data-[outside-range]:hover:!text-muted-foreground/50',
      // 隐藏范围边缘日期的今日指示器
      'data-[range-start][data-today]:after:content-none data-[range-end][data-today]:after:content-none',
    ],
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
      'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-input rounded-md flex items-center justify-center transition-opacity hover:bg-accent hover:text-accent-foreground',
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
  variants: {
    size: {
      sm: { trigger: 'h-7 text-xs px-2' },
      md: { trigger: 'h-8 text-sm px-3' },
      lg: { trigger: 'h-9 text-sm px-4' },
    },
    error: {
      true: { trigger: 'border-destructive focus-visible:ring-destructive/20' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

// ============================================================================
// Types
// ============================================================================

export interface DateRangePickerProps extends VariantProps<typeof dateRangePickerStyles> {
  /** Custom class name */
  class?: string
  /** Placeholder text */
  placeholder?: string
  /** Label */
  label?: string
  /** Locale */
  locale?: string
  /** Selected date range (ISO format string array [start, end]) */
  value?: string[]
  /** Disabled state */
  disabled?: boolean
  /** Readonly state */
  readOnly?: boolean
  /** Show preset shortcuts */
  showPresets?: boolean
  /** Custom presets */
  presets?: DateRangePresetOption[]
  /** Value change callback */
  onValueChange?: (details: { value: DateValue[]; valueAsString: string[] }) => void
  /** Minimum selectable date */
  min?: DateValue
  /** Maximum selectable date */
  max?: DateValue
  /** Start of week (0=Sunday, 1=Monday) */
  startOfWeek?: number
  /** Date format string, e.g. "YYYY-MM-DD", "DD/MM/YYYY" */
  format?: string
}

export interface DateRangePresetOption {
  label: string
  value: DateRangePreset | readonly DateValue[]
}

// Type guard: check if value is DateRangePreset
const DATE_RANGE_PRESETS: readonly DateRangePreset[] = [
  'thisWeek',
  'lastWeek',
  'thisMonth',
  'lastMonth',
  'thisQuarter',
  'lastQuarter',
  'thisYear',
  'lastYear',
  'last3Days',
  'last7Days',
  'last14Days',
  'last30Days',
  'last90Days',
] satisfies DateRangePreset[]

function isDateRangePreset(value: unknown): value is DateRangePreset {
  return typeof value === 'string' && DATE_RANGE_PRESETS.includes(value as DateRangePreset)
}

// ============================================================================
// Default Presets
// ============================================================================

function getDefaultPresets(): DateRangePresetOption[] {
  const tz = getLocalTimeZone()
  const todayDate = today(tz)

  return [
    { label: '今天', value: [todayDate, todayDate] },
    { label: '昨天', value: [todayDate.subtract({ days: 1 }), todayDate.subtract({ days: 1 })] },
    { label: '本周', value: [startOfWeek(todayDate, 'zh-CN'), endOfWeek(todayDate, 'zh-CN')] },
    { label: '上周', value: [startOfWeek(todayDate.subtract({ weeks: 1 }), 'zh-CN'), endOfWeek(todayDate.subtract({ weeks: 1 }), 'zh-CN')] },
    { label: '本月', value: [startOfMonth(todayDate), endOfMonth(todayDate)] },
    { label: '上月', value: [startOfMonth(todayDate.subtract({ months: 1 })), endOfMonth(todayDate.subtract({ months: 1 }))] },
    { label: '最近 7 天', value: 'last7Days' },
    { label: '最近 30 天', value: 'last30Days' },
  ]
}

// ============================================================================
// Sub-components
// ============================================================================

interface MonthGridProps {
  api: Accessor<datePicker.Api>
  styles: Accessor<ReturnType<typeof dateRangePickerStyles>>
  offset: 0 | 1
  locale: string
}

const MonthGrid: Component<MonthGridProps> = (props) => {
  const offsetData = createMemo(() => {
    if (props.offset === 0) {
      return {
        weeks: props.api().weeks,
        visibleRange: props.api().visibleRange,
      }
    }
    return props.api().getOffset({ months: props.offset })
  })

  const formatter = new DateFormatter(props.locale, { month: 'long', year: 'numeric' })

  const headerDate = createMemo(() => {
    const data = offsetData()
    if (data?.visibleRange?.start) {
      return formatter.format(data.visibleRange.start.toDate(getLocalTimeZone()))
    }
    return ''
  })

  const isFirstMonth = () => props.offset === 0
  const isLastMonth = () => props.offset === 1

  return (
    <div class="space-y-4">
      {/* Month navigation header */}
      <div class={props.styles().header()}>
        <div class="size-7 flex items-center justify-center">
          <Show when={isFirstMonth()}>
            <button {...props.api().getPrevTriggerProps()} class={props.styles().navTrigger()}>
              <ChevronLeft class="size-4" />
            </button>
          </Show>
        </div>

        <span class="text-sm font-medium">
          {headerDate()}
        </span>

        <div class="size-7 flex items-center justify-center">
          <Show when={isLastMonth()}>
            <button {...props.api().getNextTriggerProps()} class={props.styles().navTrigger()}>
              <ChevronRight class="size-4" />
            </button>
          </Show>
        </div>
      </div>

      {/* Calendar grid */}
      <div {...props.api().getTableProps({ view: 'day' })} class={props.styles().grid()}>
        {/* Week day headers */}
        <div {...props.api().getTableHeaderProps({ view: 'day' })} class="flex justify-between mb-1">
          <For each={props.api().weekDays}>
            {(day) => (
              <div class={props.styles().columnHeader()} aria-label={day.long}>
                {day.short}
              </div>
            )}
          </For>
        </div>

        {/* Date cells */}
        <div {...props.api().getTableBodyProps({ view: 'day' })}>
          <For each={offsetData().weeks}>
            {(week) => (
              <div {...props.api().getTableRowProps({ view: 'day' })} class={props.styles().row()}>
                <For each={week}>
                  {(dayValue) => {
                    const cellState = createMemo(() =>
                      props.api().getDayTableCellState({
                        value: dayValue,
                        visibleRange: offsetData().visibleRange,
                      })
                    )

                    // 直接使用 Zag.js 提供的状态，不做过滤
                    const state = cellState()
                    const isOutside = () => state.outsideRange

                    // 范围内的日期
                    const inRangeData = () => (!isOutside() && state.inRange) || undefined

                    // 范围开始日期
                    const isRangeStart = () => (!isOutside() && state.firstInRange) || undefined

                    // 范围结束日期（Zag.js 的 lastInRange 会同时处理预览和确认状态）
                    const isRangeEnd = () => (!isOutside() && state.lastInRange) || undefined

                    // 今日指示器（CSS 会处理范围边缘的隐藏）
                    const todayData = () => (!isOutside() && state.today) || undefined

                    return (
                      <div
                        {...props.api().getDayTableCellProps({
                          value: dayValue,
                          visibleRange: offsetData().visibleRange,
                        })}
                        class={props.styles().cell()}
                      >
                        <button
                          {...props.api().getDayTableCellTriggerProps({
                            value: dayValue,
                            visibleRange: offsetData().visibleRange,
                          })}
                          class={props.styles().dayTrigger()}
                          data-in-range={inRangeData()}
                          data-range-start={isRangeStart()}
                          data-range-end={isRangeEnd()}
                          data-outside-range={isOutside() || undefined}
                          data-today={todayData()}
                        >
                          {dayValue.day}
                        </button>
                      </div>
                    )
                  }}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}

interface YearMonthViewProps {
  api: Accessor<datePicker.Api>
  styles: Accessor<ReturnType<typeof dateRangePickerStyles>>
}

const YearMonthView: Component<YearMonthViewProps> = (props) => {
  return (
    <div class="p-3">
      {/* Month view */}
      <Show when={props.api().view === 'month'}>
        <div class="space-y-4">
          <div class={props.styles().header()}>
            <button {...props.api().getPrevTriggerProps({ view: 'month' })} class={props.styles().navTrigger()}>
              <ChevronLeft class="size-4" />
            </button>
            <button {...props.api().getViewTriggerProps({ view: 'month' })} class="text-sm font-medium hover:bg-accent rounded px-2 py-1">
              {props.api().visibleRange.start.year}
            </button>
            <button {...props.api().getNextTriggerProps({ view: 'month' })} class={props.styles().navTrigger()}>
              <ChevronRight class="size-4" />
            </button>
          </div>
          <div {...props.api().getTableBodyProps({ view: 'month' })} class="grid grid-cols-3 gap-2">
            <For each={props.api().getMonthsGrid({ columns: 3, format: 'short' })}>
              {(months) => (
                <For each={months}>
                  {(month) => (
                    <button
                      {...props.api().getMonthTableCellTriggerProps({ ...month, columns: 3 })}
                      class={props.styles().monthTrigger()}
                    >
                      {month.label}
                    </button>
                  )}
                </For>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Year view */}
      <Show when={props.api().view === 'year'}>
        <div class="space-y-4">
          <div class={props.styles().header()}>
            <button {...props.api().getPrevTriggerProps({ view: 'year' })} class={props.styles().navTrigger()}>
              <ChevronLeft class="size-4" />
            </button>
            <span class="text-sm font-medium">
              {props.api().getDecade().start} - {props.api().getDecade().end}
            </span>
            <button {...props.api().getNextTriggerProps({ view: 'year' })} class={props.styles().navTrigger()}>
              <ChevronRight class="size-4" />
            </button>
          </div>
          <div {...props.api().getTableBodyProps({ view: 'year' })} class="grid grid-cols-4 gap-2">
            <For each={props.api().getYearsGrid({ columns: 4 })}>
              {(years) => (
                <For each={years}>
                  {(year) => (
                    <button
                      {...props.api().getYearTableCellTriggerProps({ ...year, columns: 4 })}
                      class={props.styles().yearTrigger()}
                    >
                      {year.label}
                    </button>
                  )}
                </For>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export const DateRangePicker: Component<DateRangePickerProps> = (props) => {
  const merged = mergeProps(
    {
      locale: 'zh-CN',
      numOfMonths: 2,
      showPresets: false,
      placeholder: '选择日期范围',
    },
    props
  )

  const [local, variants] = splitProps(
    merged,
    [
      'class',
      'placeholder',
      'label',
      'locale',
      'value',
      'disabled',
      'readOnly',
      'showPresets',
      'presets',
      'onValueChange',
      'min',
      'max',
      'startOfWeek',
      'format',
    ],
    ['size', 'error']
  )

  const styles = createMemo(() => dateRangePickerStyles({ size: variants.size, error: variants.error }))

  const parsedValue = createMemo(() => {
    if (!local.value || local.value.length === 0) {
      return undefined
    }
    try {
      const parsed = local.value.map((v) => datePicker.parse(v))
      return parsed.every(Boolean) ? parsed : undefined
    } catch {
      return undefined
    }
  })

  const machineProps = createMemo(() => ({
    id: createUniqueId(),
    numOfMonths: 2,
    selectionMode: 'range' as datePicker.SelectionMode,
    locale: local.locale,
    disabled: local.disabled,
    readOnly: local.readOnly,
    value: parsedValue(),
    min: local.min,
    max: local.max,
    startOfWeek: local.startOfWeek,
    closeOnSelect: true,
    onValueChange: (details: datePicker.ValueChangeDetails) => {
      local.onValueChange?.({
        value: details.value,
        valueAsString: details.valueAsString,
      })
    },
  }))

  const service = useMachine(datePicker.machine, machineProps)
  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  const displayValue = createMemo(() => {
    const values = api().value
    if (values.length === 0) {
      return local.placeholder
    }

    if (local.format && values[0]) {
      if (values.length === 1) {
        return formatDate(values[0], local.format)
      }
      if (values[1]) {
        return `${formatDate(values[0], local.format)} - ${formatDate(values[1], local.format)}`
      }
    }

    const strings = api().valueAsString
    if (strings.length === 1) {
      return strings[0]
    }
    return `${strings[0]} - ${strings[1]}`
  })

  const presetList = createMemo(() => local.presets ?? getDefaultPresets())

  const monthOffsets = [0, 1] as const

  const handlePresetClick = (preset: DateRangePresetOption) => {
    const presetValue = preset.value
    if (isDateRangePreset(presetValue)) {
      const rangeValues = api().getRangePresetValue(presetValue)
      api().setValue(rangeValues)
    } else {
      api().setValue([...presetValue])
    }
    api().setOpen(false)
  }

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    api().clearValue()
  }

  return (
    <div class={styles().root({ class: local.class })}>
      <Show when={local.label}>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: zag-js getLabelProps provides htmlFor */}
        <label {...api().getLabelProps()} class={styles().label()}>
          {local.label}
        </label>
      </Show>

      <div {...api().getControlProps()} class={styles().control()}>
        <button {...api().getTriggerProps()} class={styles().trigger()}>
          <span class={api().valueAsString.length === 0 ? 'text-muted-foreground' : ''}>
            {displayValue()}
          </span>
          <div class="flex items-center gap-1">
            <Show when={api().value.length > 0}>
              <button type="button" class={styles().clearButton()} onClick={handleClear}>
                <X class="size-3.5" />
              </button>
            </Show>
            <Calendar class="size-4 opacity-50" />
          </div>
        </button>
      </div>

      <Portal>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()} class={styles().content()}>
            <div class="flex">
              {/* Preset shortcuts panel */}
              <Show when={local.showPresets}>
                <div class="border-r border-border py-2 px-1.5 w-[90px]">
                  <div class="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">快捷选择</div>
                  <For each={presetList()}>
                    {(preset) => (
                      <button
                        type="button"
                        class={styles().presetButton()}
                        onClick={() => handlePresetClick(preset)}
                      >
                        {preset.label}
                      </button>
                    )}
                  </For>
                </div>
              </Show>

              {/* Calendar body */}
              <div class="p-3">
                <Show when={api().view === 'day'} fallback={<YearMonthView api={api} styles={styles} />}>
                  <div class="flex gap-4">
                    <For each={monthOffsets}>
                      {(offset) => (
                        <MonthGrid
                          api={api}
                          styles={styles}
                          offset={offset}
                          locale={local.locale}
                        />
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </div>
  )
}
