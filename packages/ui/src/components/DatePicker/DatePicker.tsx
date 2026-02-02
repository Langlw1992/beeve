import * as datePicker from '@zag-js/date-picker'
import { normalizeProps, useMachine } from '@zag-js/solid'
import type { DateValue } from '@internationalized/date'
import {
  type Component,
  createMemo,
  createUniqueId,
  Show,
  splitProps,
  mergeProps,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-solid'
import type { VariantProps } from 'tailwind-variants'
import { DatePickerCalendar } from './DatePickerCalendar'
import { formatDate } from '../../utils/formatDate'
import { datePickerStyles, type DatePickerStylesReturn } from './date-picker-styles'
import { parseDateValue, dateValueToDate } from './date-utils'

export interface DatePickerProps extends VariantProps<typeof datePickerStyles> {
  // 基础属性
  class?: string
  label?: string
  placeholder?: string
  name?: string

  // 值和变化 - 支持多种格式
  value?: string | Date | DateValue
  defaultValue?: string | Date | DateValue
  onChange?: (details: {
    value: DateValue | undefined
    valueAsString: string | undefined
    valueAsDate: Date | undefined
  }) => void

  // 日期限制 - 支持多种格式
  min?: string | Date | DateValue
  max?: string | Date | DateValue
  isDateUnavailable?: (date: DateValue, locale: string) => boolean

  // 格式化
  format?: string
  locale?: string

  // 状态
  disabled?: boolean
  readOnly?: boolean
  required?: boolean

  // UI 配置
  numOfMonths?: number
  positioning?: datePicker.PositioningOptions
}

export const DatePicker: Component<DatePickerProps> = (props) => {
  const [local, variants, machineContext] = splitProps(
    props,
    ['class', 'placeholder', 'label', 'format', 'value', 'defaultValue', 'onChange', 'min', 'max'],
    ['size', 'error']
  )

  const styles = createMemo(() => datePickerStyles({ size: variants.size, error: variants.error }))

  // 解析 value
  const parsedValue = createMemo(() => {
    const val = parseDateValue(local.value)
    return val ? [val] : undefined
  })

  // 解析 defaultValue
  const parsedDefaultValue = createMemo(() => {
    const val = parseDateValue(local.defaultValue)
    return val ? [val] : undefined
  })

  // 解析 min/max
  const parsedMin = createMemo(() => parseDateValue(local.min))
  const parsedMax = createMemo(() => parseDateValue(local.max))

  // Machine 配置
  const service = useMachine(
    datePicker.machine,
    createMemo(() =>
      mergeProps(
        {
          id: createUniqueId(),
          locale: 'zh-CN',
          numOfMonths: 1,
        },
        machineContext,
        {
          value: parsedValue(),
          defaultValue: parsedDefaultValue(),
          min: parsedMin(),
          max: parsedMax(),
          onValueChange: (details: datePicker.ValueChangeDetails) => {
            const dateValue = details.value[0]
            local.onChange?.({
              value: dateValue,
              valueAsString: dateValue?.toString(),
              valueAsDate: dateValueToDate(dateValue),
            })
          },
        }
      )
    )
  )

  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  // 格式化显示值
  const displayValue = createMemo(() => {
    const dateValue = api().value[0]
    if (!dateValue) {
      return local.placeholder || '选择日期'
    }

    // 使用自定义格式
    if (local.format) {
      return formatDate(dateValue, local.format)
    }

    // 默认使用 Zag.js 的格式
    return api().valueAsString[0] || ''
  })

  return (
    <div class={styles().root({ class: local.class })}>
      <Show when={local.label}>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Zag.js getLabelProps() handles ARIA associations */}
        <label {...api().getLabelProps()} class={styles().label()}>
          {local.label}
        </label>
      </Show>

      <div {...api().getControlProps()} class={styles().control()}>
        <button {...api().getTriggerProps()} class={styles().trigger()}>
          <span class={api().value.length === 0 ? 'text-muted-foreground' : ''}>
            {displayValue()}
          </span>
          <Calendar class="size-4 opacity-50" />
        </button>
      </div>

      <Portal>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()} class={styles().content()}>
            {/* Header */}
            <div class={styles().header()}>
              <button {...api().getPrevTriggerProps()} class={styles().navTrigger()}>
                <ChevronLeft class="size-4" />
              </button>

              <div class={styles().heading()}>
                <button {...api().getViewTriggerProps()} class="hover:bg-accent rounded px-2 py-1">
                  {api().visibleRangeText.start}
                </button>
              </div>

              <button {...api().getNextTriggerProps()} class={styles().navTrigger()}>
                <ChevronRight class="size-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <DatePickerCalendar api={api} styles={styles} />
          </div>
        </div>
      </Portal>
    </div>
  )
}

export type { DatePickerStylesReturn }
export default DatePicker
