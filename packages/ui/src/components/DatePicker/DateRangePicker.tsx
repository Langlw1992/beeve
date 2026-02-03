import * as datePicker from '@zag-js/date-picker'
import type {DateRangePreset} from '@zag-js/date-picker'
import {normalizeProps, useMachine} from '@zag-js/solid'
import {
  For,
  Show,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
  splitProps,
  type Accessor,
  type Component,
} from 'solid-js'
import {Portal} from 'solid-js/web'
import {Calendar, ChevronLeft, ChevronRight, X} from 'lucide-solid'
import type {VariantProps} from 'tailwind-variants'
import {
  DateFormatter,
  type DateValue,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  today,
  getLocalTimeZone,
} from '@internationalized/date'
import {formatDate} from '../../utils/formatDate'
import {
  dateRangePickerStyles,
  type DateRangePickerStylesReturn,
} from './date-picker-styles'

// ============================================================================
// Types
// ============================================================================

export interface DateRangePickerProps
  extends VariantProps<typeof dateRangePickerStyles> {
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
  onChange?: (details: {value: DateValue[]; valueAsString: string[]}) => void
  /** 最小可选日期 */
  min?: DateValue
  /** 最大可选日期 */
  max?: DateValue
  /** 一周开始于周几 (0=周日, 1=周一) */
  startOfWeek?: number
  /** 选择粒度：day（默认）或 week（整周选择） */
  granularity?: 'day' | 'week'
  /** 日期格式化字符串，如 \"YYYY-MM-DD\", \"DD/MM/YYYY\" */
  format?: string
}

export interface DateRangePresetOption {
  label: string
  value: DateRangePreset | readonly DateValue[]
}

/**
 * 类型守卫：检查是否为 DateRangePreset 字符串
 * 简化版本：直接判断是否为字符串即可，zag.js 会处理无效值
 */
function isDateRangePreset(value: unknown): value is DateRangePreset {
  return typeof value === 'string'
}

// ============================================================================
// Default Presets
// ============================================================================

function getDefaultPresets(): DateRangePresetOption[] {
  const tz = getLocalTimeZone()
  const todayDate = today(tz)

  return [
    {label: '今天', value: [todayDate, todayDate]},
    {
      label: '昨天',
      value: [todayDate.subtract({days: 1}), todayDate.subtract({days: 1})],
    },
    {
      label: '本周',
      value: [startOfWeek(todayDate, 'zh-CN'), endOfWeek(todayDate, 'zh-CN')],
    },
    {
      label: '上周',
      value: [
        startOfWeek(todayDate.subtract({weeks: 1}), 'zh-CN'),
        endOfWeek(todayDate.subtract({weeks: 1}), 'zh-CN'),
      ],
    },
    {label: '本月', value: [startOfMonth(todayDate), endOfMonth(todayDate)]},
    {
      label: '上月',
      value: [
        startOfMonth(todayDate.subtract({months: 1})),
        endOfMonth(todayDate.subtract({months: 1})),
      ],
    },
    {label: '最近 7 天', value: 'last7Days'},
    {label: '最近 30 天', value: 'last30Days'},
  ]
}

// ============================================================================
// Sub-components
// ============================================================================

interface MonthGridProps {
  api: Accessor<datePicker.Api>
  styles: Accessor<DateRangePickerStylesReturn>
  offset: 0 | 1
  locale: string
  granularity: 'day' | 'week'
  hoveredWeek: Accessor<DateValue[] | null>
  onWeekHover: (week: DateValue[] | null) => void
  onWeekClick: (week: DateValue[]) => void
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
    return props.api().getOffset({months: props.offset})
  })

  const formatter = new DateFormatter(props.locale, {
    month: 'long',
    year: 'numeric',
  })

  // 获取标题日期
  const headerDate = createMemo(() => {
    const data = offsetData()
    if (data?.visibleRange?.start) {
      return formatter.format(
        data.visibleRange.start.toDate(getLocalTimeZone()),
      )
    }
    return ''
  })

  // 是否是第一个月（显示左箭头）- 固定2个月
  const isFirstMonth = () => props.offset === 0
  // 是否是最后一个月（显示右箭头）- 固定2个月
  const isLastMonth = () => props.offset === 1

  // 检查某个日期是否在 hover 的周内
  const isInHoveredWeek = (dayValue: DateValue) => {
    const hovered = props.hoveredWeek()
    if (!hovered || hovered.length === 0) {
      return false
    }
    return hovered.some((d) => d.compare(dayValue) === 0)
  }

  // 处理行 hover（周选择模式）
  const handleRowMouseEnter = (week: DateValue[]) => {
    if (props.granularity === 'week') {
      props.onWeekHover(week)
    }
  }

  const handleRowMouseLeave = () => {
    if (props.granularity === 'week') {
      props.onWeekHover(null)
    }
  }

  // 处理行点击（周选择模式）
  const handleRowClick = (week: DateValue[]) => {
    if (props.granularity === 'week') {
      props.onWeekClick(week)
    }
  }

  return (
    <div class="space-y-4">
      {/* 月份导航头 */}
      <div class={props.styles().header()}>
        <div class="size-7 flex items-center justify-center">
          <Show when={isFirstMonth()}>
            <button
              {...props.api().getPrevTriggerProps()}
              class={props.styles().navTrigger()}
            >
              <ChevronLeft class="size-4" />
            </button>
          </Show>
        </div>

        {/* 月份标题（不再是按钮，移除点击切换视图功能） */}
        <span class="text-sm font-medium">{headerDate()}</span>

        <div class="size-7 flex items-center justify-center">
          <Show when={isLastMonth()}>
            <button
              {...props.api().getNextTriggerProps()}
              class={props.styles().navTrigger()}
            >
              <ChevronRight class="size-4" />
            </button>
          </Show>
        </div>
      </div>

      {/* 日历网格 */}
      <div
        {...props.api().getTableProps({view: 'day'})}
        class={props.styles().grid()}
      >
        {/* 星期标题 */}
        <div
          {...props.api().getTableHeaderProps({view: 'day'})}
          class="flex justify-between mb-1"
        >
          <For each={props.api().weekDays}>
            {(day) => (
              <div
                class={props.styles().columnHeader()}
                aria-label={day.long}
              >
                {day.short}
              </div>
            )}
          </For>
        </div>

        {/* 日期单元格 */}
        <div {...props.api().getTableBodyProps({view: 'day'})}>
          <For each={offsetData().weeks}>
            {(week) => (
              <div
                {...props.api().getTableRowProps({view: 'day'})}
                class={props.styles().row()}
                data-week-mode={props.granularity === 'week' || undefined}
                onMouseEnter={() => handleRowMouseEnter(week)}
                onMouseLeave={handleRowMouseLeave}
                onClick={() => handleRowClick(week)}
              >
                <For each={week}>
                  {(dayValue) => {
                    const cellState = createMemo(() =>
                      props.api().getDayTableCellState({
                        value: dayValue,
                        visibleRange: offsetData().visibleRange,
                      }),
                    )

                    // 只在当前月内（非 outsideRange）设置范围相关的 data 属性
                    const isOutside = () => cellState().outsideRange
                    const inRangeData = () =>
                      (!isOutside() && cellState().inRange) || undefined
                    const rangeStartData = () =>
                      (!isOutside() && cellState().firstInRange) || undefined
                    const rangeEndData = () =>
                      (!isOutside() && cellState().lastInRange) || undefined
                    // 今天：只在非范围内时显示
                    const todayData = () => {
                      const state = cellState()
                      if (isOutside()) {
                        return undefined
                      }
                      if (
                        state.inRange ||
                        state.firstInRange ||
                        state.lastInRange
                      ) {
                        return undefined
                      }
                      return state.today || undefined
                    }
                    // 周选择模式下的 hover 状态
                    const weekHoveredData = () => {
                      if (props.granularity !== 'week') {
                        return undefined
                      }
                      return isInHoveredWeek(dayValue) || undefined
                    }

                    // 周选择模式：禁止点击单日触发选择
                    const cellProps = props.api().getDayTableCellProps({
                      value: dayValue,
                      visibleRange: offsetData().visibleRange,
                    })

                    const triggerProps = props
                      .api()
                      .getDayTableCellTriggerProps({
                        value: dayValue,
                        visibleRange: offsetData().visibleRange,
                      })

                    // 周选择模式下移除 onClick
                    const finalTriggerProps =
                      props.granularity === 'week'
                        ? {...triggerProps, onClick: undefined}
                        : triggerProps

                    return (
                      <div
                        {...cellProps}
                        class={props.styles().cell()}
                        data-in-range={inRangeData()}
                        data-range-start={rangeStartData()}
                        data-range-end={rangeEndData()}
                        data-outside-range={isOutside() || undefined}
                        data-week-hovered={weekHoveredData()}
                      >
                        <button
                          {...finalTriggerProps}
                          class={props.styles().dayTrigger()}
                          data-in-range={inRangeData()}
                          data-range-start={rangeStartData()}
                          data-range-end={rangeEndData()}
                          data-outside-range={isOutside() || undefined}
                          data-today={todayData()}
                          data-week-hovered={weekHoveredData()}
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
  styles: Accessor<DateRangePickerStylesReturn>
}

const YearMonthView: Component<YearMonthViewProps> = (props) => {
  return (
    <div class="p-3">
      {/* 月份视图 */}
      <Show when={props.api().view === 'month'}>
        <div class="space-y-4">
          <div class={props.styles().header()}>
            <button
              {...props.api().getPrevTriggerProps({view: 'month'})}
              class={props.styles().navTrigger()}
            >
              <ChevronLeft class="size-4" />
            </button>
            <button
              {...props.api().getViewTriggerProps({view: 'month'})}
              class="text-sm font-medium hover:bg-accent rounded px-2 py-1"
            >
              {props.api().visibleRange.start.year}
            </button>
            <button
              {...props.api().getNextTriggerProps({view: 'month'})}
              class={props.styles().navTrigger()}
            >
              <ChevronRight class="size-4" />
            </button>
          </div>
          <div
            {...props.api().getTableBodyProps({view: 'month'})}
            class="grid grid-cols-3 gap-2"
          >
            <For
              each={props.api().getMonthsGrid({columns: 3, format: 'short'})}
            >
              {(months) => (
                <For each={months}>
                  {(month) => (
                    <button
                      {...props
                        .api()
                        .getMonthTableCellTriggerProps({...month, columns: 3})}
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
            <button
              {...props.api().getPrevTriggerProps({view: 'year'})}
              class={props.styles().navTrigger()}
            >
              <ChevronLeft class="size-4" />
            </button>
            <span class="text-sm font-medium">
              {props.api().getDecade().start} - {props.api().getDecade().end}
            </span>
            <button
              {...props.api().getNextTriggerProps({view: 'year'})}
              class={props.styles().navTrigger()}
            >
              <ChevronRight class="size-4" />
            </button>
          </div>
          <div
            {...props.api().getTableBodyProps({view: 'year'})}
            class="grid grid-cols-4 gap-2"
          >
            <For each={props.api().getYearsGrid({columns: 4})}>
              {(years) => (
                <For each={years}>
                  {(year) => (
                    <button
                      {...props
                        .api()
                        .getYearTableCellTriggerProps({...year, columns: 4})}
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
      granularity: 'day' as const,
    },
    props,
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
      'onChange',
      'min',
      'max',
      'startOfWeek',
      'granularity',
      'format',
    ],
    ['size', 'error'],
  )

  const styles = createMemo(() =>
    dateRangePickerStyles({size: variants.size, error: variants.error}),
  )

  // 周选择模式下的 hover 状态
  const [hoveredWeek, setHoveredWeek] = createSignal<DateValue[] | null>(null)

  // 解析字符串值为 DateValue - 使用 zag.js 内置 parse
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
      local.onChange?.({
        value: details.value,
        valueAsString: details.valueAsString,
      })
    },
  }))

  const service = useMachine(datePicker.machine, machineProps)
  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  // 显示值
  const displayValue = createMemo(() => {
    const values = api().value
    if (values.length === 0) {
      return local.placeholder
    }

    // 如果提供了自定义格式
    if (local.format && values[0]) {
      if (values.length === 1) {
        return formatDate(values[0], local.format)
      }
      if (values[1]) {
        return `${formatDate(values[0], local.format)} - ${formatDate(values[1], local.format)}`
      }
    }

    // 默认使用 Zag.js 的格式
    const strings = api().valueAsString
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
      // 是 DateRangePreset 字符串 - zag.js 会处理
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

  // 处理周点击（周选择模式）
  const handleWeekClick = (week: DateValue[]) => {
    const start = week[0]
    const end = week[week.length - 1]
    if (start && end) {
      api().setValue([start, end])
      api().setOpen(false)
    }
  }

  return (
    <div class={styles().root({class: local.class})}>
      <Show when={local.label}>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: zag-js getLabelProps provides htmlFor */}
        <label
          {...api().getLabelProps()}
          class={styles().label()}
        >
          {local.label}
        </label>
      </Show>

      <div
        {...api().getControlProps()}
        class={styles().control()}
      >
        <button
          {...api().getTriggerProps()}
          class={styles().trigger()}
        >
          <span
            class={
              api().valueAsString.length === 0 ? 'text-muted-foreground' : ''
            }
          >
            {displayValue()}
          </span>
          <div class="flex items-center gap-1">
            <Show when={api().value.length > 0}>
              <button
                type="button"
                class={styles().clearButton()}
                onClick={handleClear}
              >
                <X class="size-3.5" />
              </button>
            </Show>
            <Calendar class="size-4 opacity-50" />
          </div>
        </button>
      </div>

      <Portal>
        <div {...api().getPositionerProps()}>
          <div
            {...api().getContentProps()}
            class={styles().content()}
          >
            <div class="flex">
              {/* 快捷选择面板 */}
              <Show when={local.showPresets}>
                <div class="border-r border-border py-2 px-1.5 w-[90px]">
                  <div class="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
                    快捷选择
                  </div>
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
                <Show
                  when={api().view === 'day'}
                  fallback={
                    <YearMonthView
                      api={api}
                      styles={styles}
                    />
                  }
                >
                  <div class="flex gap-4">
                    <For each={monthOffsets}>
                      {(offset) => (
                        <MonthGrid
                          api={api}
                          styles={styles}
                          offset={offset}
                          locale={local.locale}
                          granularity={local.granularity}
                          hoveredWeek={hoveredWeek}
                          onWeekHover={setHoveredWeek}
                          onWeekClick={handleWeekClick}
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
