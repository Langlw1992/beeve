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
    // Cell 样式：提供范围内的背景色（data 属性只在当前月内设置）
    cell: [
      'relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20',
      // 范围内背景
      'data-[in-range]:bg-primary/10',
      // 范围起始：左侧有圆角
      'data-[range-start]:rounded-l-md data-[range-start]:bg-primary/10',
      // 范围结束：右侧有圆角
      'data-[range-end]:rounded-r-md data-[range-end]:bg-primary/10',
      // 同时是起始和结束（单天选择状态）
      'data-[range-start][data-range-end]:rounded-md',
    ],
    // Day trigger 样式
    dayTrigger: [
      'size-8 p-0 font-normal transition-colors rounded-md',
      'hover:bg-accent hover:text-accent-foreground hover:rounded-md',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
      // 禁用状态
      'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent',
      // outside-range 样式（不在当前月）
      'data-[outside-range]:text-muted-foreground/50',
      // 今天（仅当不在范围内时显示）
      'data-[today]:bg-accent data-[today]:text-accent-foreground',
      // 范围内：无圆角，覆盖今天样式
      'data-[in-range]:rounded-none data-[in-range]:bg-transparent data-[in-range]:text-foreground',
      // 范围内 hover：保持无圆角
      'data-[in-range]:hover:bg-primary/20 data-[in-range]:hover:rounded-none',
      // 范围起始点：圆角 + 高亮，覆盖 in-range 样式
      'data-[range-start]:rounded-md data-[range-start]:bg-primary data-[range-start]:text-primary-foreground',
      // 范围起始点 hover：保持圆角
      'data-[range-start]:hover:bg-primary/90 data-[range-start]:hover:rounded-md',
      // 范围结束点：圆角 + 高亮，覆盖 in-range 样式
      'data-[range-end]:rounded-md data-[range-end]:bg-primary data-[range-end]:text-primary-foreground',
      // 范围结束点 hover：保持圆角
      'data-[range-end]:hover:bg-primary/90 data-[range-end]:hover:rounded-md',
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
  /** 自定义类名 */
  class?: string
  /** 占位文字 */
  placeholder?: string
  /** 标签 */
  label?: string
  /** 语言环境 */
  locale?: string
  /** 选中的日期范围（ISO 格式字符串数组 [start, end]） */
  value?: string[]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 是否显示快捷选择 */
  showPresets?: boolean
  /** 自定义预设 */
  presets?: DateRangePresetOption[]
  /** 值变化回调 */
  onValueChange?: (details: { value: DateValue[]; valueAsString: string[] }) => void
  /** 最小可选日期 */
  min?: DateValue
  /** 最大可选日期 */
  max?: DateValue
  /** 一周开始于周几 (0=周日, 1=周一) */
  startOfWeek?: number
}

export interface DateRangePresetOption {
  label: string
  value: DateRangePreset | readonly DateValue[]
}

// 类型守卫：检查是否为 DateRangePreset
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
  // 获取偏移月份的数据
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

  // 获取标题日期
  const headerDate = createMemo(() => {
    const data = offsetData()
    if (data?.visibleRange?.start) {
      return formatter.format(data.visibleRange.start.toDate(getLocalTimeZone()))
    }
    return ''
  })

  // 是否是第一个月（显示左箭头）- 固定2个月
  const isFirstMonth = () => props.offset === 0
  // 是否是最后一个月（显示右箭头）- 固定2个月
  const isLastMonth = () => props.offset === 1

  return (
    <div class="space-y-4">
      {/* 月份导航头 */}
      <div class={props.styles().header()}>
        <div class="size-7 flex items-center justify-center">
          <Show when={isFirstMonth()}>
            <button {...props.api().getPrevTriggerProps()} class={props.styles().navTrigger()}>
              <ChevronLeft class="size-4" />
            </button>
          </Show>
        </div>

        {/* 月份标题（不再是按钮，移除点击切换视图功能） */}
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

      {/* 日历网格 */}
      <div {...props.api().getTableProps({ view: 'day' })} class={props.styles().grid()}>
        {/* 星期标题 */}
        <div {...props.api().getTableHeaderProps({ view: 'day' })} class="flex justify-between mb-1">
          <For each={props.api().weekDays}>
            {(day) => (
              <div class={props.styles().columnHeader()} aria-label={day.long}>
                {day.short}
              </div>
            )}
          </For>
        </div>

        {/* 日期单元格 */}
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

                    // 只在当前月内（非 outsideRange）设置范围相关的 data 属性
                    const isOutside = () => cellState().outsideRange
                    const inRangeData = () => (!isOutside() && cellState().inRange) || undefined
                    const rangeStartData = () => (!isOutside() && cellState().firstInRange) || undefined
                    const rangeEndData = () => (!isOutside() && cellState().lastInRange) || undefined
                    // 今天：只在非范围内时显示
                    const todayData = () => {
                      const state = cellState()
                      if (isOutside()) { return undefined }
                      if (state.inRange || state.firstInRange || state.lastInRange) { return undefined }
                      return state.today || undefined
                    }

                    return (
                      <div
                        {...props.api().getDayTableCellProps({
                          value: dayValue,
                          visibleRange: offsetData().visibleRange,
                        })}
                        class={props.styles().cell()}
                        data-in-range={inRangeData()}
                        data-range-start={rangeStartData()}
                        data-range-end={rangeEndData()}
                        data-outside-range={isOutside() || undefined}
                      >
                        <button
                          {...props.api().getDayTableCellTriggerProps({
                            value: dayValue,
                            visibleRange: offsetData().visibleRange,
                          })}
                          class={props.styles().dayTrigger()}
                          data-in-range={inRangeData()}
                          data-range-start={rangeStartData()}
                          data-range-end={rangeEndData()}
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
      {/* 月份视图 */}
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

      {/* 年份视图 */}
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
    ],
    ['size', 'error']
  )

  const styles = createMemo(() => dateRangePickerStyles({ size: variants.size, error: variants.error }))

  // 解析字符串值为 DateValue
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

  // Machine 配置（固定显示2个月）
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
    closeOnSelect: true, // 范围选择完成后自动关闭
    onValueChange: (details: datePicker.ValueChangeDetails) => {
      local.onValueChange?.({
        value: details.value,
        valueAsString: details.valueAsString,
      })
    },
  }))

  const service = useMachine(datePicker.machine, machineProps)
  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  // 显示值
  const displayValue = createMemo(() => {
    const strings = api().valueAsString
    if (strings.length === 0) {
      return local.placeholder
    }
    if (strings.length === 1) {
      return strings[0]
    }
    return `${strings[0]} - ${strings[1]}`
  })

  // 预设列表
  const presetList = createMemo(() => local.presets ?? getDefaultPresets())

  // 固定显示2个月
  const monthOffsets = [0, 1] as const

  // 处理预设点击
  const handlePresetClick = (preset: DateRangePresetOption) => {
    const presetValue = preset.value
    if (isDateRangePreset(presetValue)) {
      // 是 DateRangePreset 字符串
      const rangeValues = api().getRangePresetValue(presetValue)
      api().setValue(rangeValues)
    } else {
      // 是 DateValue[]
      api().setValue([...presetValue])
    }
    // 选择预设后关闭弹出层
    api().setOpen(false)
  }

  // 清除值
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
              {/* 快捷选择面板 */}
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

              {/* 日历主体 */}
              <div class="p-3">
                <Show when={api().view === 'day'} fallback={<YearMonthView api={api} styles={styles} />}>
                  <div class="flex gap-4">
                    <For each={monthOffsets}>
                      {(offset) => (
                        <MonthGrid api={api} styles={styles} offset={offset} locale={local.locale} />
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
