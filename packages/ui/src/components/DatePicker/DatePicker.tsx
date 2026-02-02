import * as datePicker from '@zag-js/date-picker'
import { normalizeProps, useMachine } from '@zag-js/solid'
import {
  Show,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
  createSignal,
  createEffect,
  type Component,
} from 'solid-js'
import { Portal } from 'solid-js/web'
// @ts-ignore
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-solid'
import { tv, type VariantProps } from 'tailwind-variants'
import { DatePickerCalendar } from './DatePickerCalendar'
import { TimePicker } from './TimePickerInput'
import { CalendarDateTime, parseTime } from '@internationalized/date'
import { formatDate } from '../../utils/formatDate'

const datePickerStyles = tv({
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
    columnHeader: 'rounded-md text-[0.8rem] font-normal text-muted-foreground w-8 h-8',
    row: 'flex w-full mt-2',
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
      // 非当月日期样式
      'data-[outside-range]:text-muted-foreground/50',
      // 今日指示器：使用下方小点，非当月日期不显示
      'data-[today]:after:content-[""] data-[today]:after:absolute data-[today]:after:bottom-1 data-[today]:after:left-1/2 data-[today]:after:-translate-x-1/2',
      'data-[today]:after:size-1 data-[today]:after:rounded-full data-[today]:after:bg-primary',
      // 非当月的今日不显示指示器
      'data-[today][data-outside-range]:after:content-none',
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
      'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-input rounded-md flex items-center justify-center transition-opacity hover:bg-accent hover:text-accent-foreground',
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

// @ts-ignore
type DatePickerContext = any

export interface DatePickerProps extends Partial<DatePickerContext>, VariantProps<typeof datePickerStyles> {
  class?: string
  placeholder?: string
  label?: string
  showTime?: boolean
  locale?: string
  /** 日期格式化字符串，如 "YYYY-MM-DD", "DD/MM/YYYY" */
  format?: string
  onChange?: (value: string | undefined) => void
}

export const DatePicker: Component<DatePickerProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'placeholder', 'label', 'showTime', 'locale', 'value', 'onChange', 'format'],
    ['size', 'error']
  )

  const styles = createMemo(() => datePickerStyles({ size: variants.size, error: variants.error }))

  // Time State
  const [timeValue, setTimeValue] = createSignal<string>('')

  // Initialize time from value if provided
  createEffect(() => {
    if (local.value && typeof local.value === 'string' && local.value.includes('T')) {
       try {
         const timePart = local.value.split('T')[1]
         if (timePart) {
           setTimeValue(timePart.substring(0, 5)) // HH:mm
         }
       } catch (e) {
         // ignore
       }
    }
  })

  // Machine Props
  const machineProps = createMemo(() => mergeProps(
    {
      id: createUniqueId(),
      numOfMonths: 1,
      locale: local.locale || 'zh-CN',
      onValueChange: (details: datePicker.ValueChangeDetails) => {
        const date = details.value[0]
        if (!date) {
          local.onChange?.(undefined)
          return
        }

        let finalValue = date.toString()
        
        if (local.showTime) {
          const currentTime = timeValue() || '00:00'
          try {
             // Use @internationalized/date to merge cleanly
             const timeObj = parseTime(currentTime)
             const dateTime = new CalendarDateTime(
               date.year, date.month, date.day,
               timeObj.hour, timeObj.minute, timeObj.second
             )
             finalValue = dateTime.toString()
          } catch (e) {
            finalValue = `${date.toString()}T${currentTime}`
          }
        }
        
        local.onChange?.(finalValue)
      }
    },
    rest
  ))

  // Parse the value string into DateValue[] format required by zag-js
  const parsedValue = createMemo(() => {
    if (!local.value || typeof local.value !== 'string') {
      return undefined
    }
    try {
      // Extract date part (before T if datetime, or full string if date only)
      const dateStr = local.value.split('T')[0]
      if (!dateStr) {
        return undefined
      }
      const parsed = datePicker.parse(dateStr)
      return parsed ? [parsed] : undefined
    } catch {
      return undefined
    }
  })

  const extendedMachineProps = createMemo(() => ({
    ...machineProps(),
    closeOnSelect: !local.showTime, // Keep open if time selection is needed
    value: parsedValue(),
  }))

  const service = useMachine(datePicker.machine as any, extendedMachineProps)
  const api = createMemo(() => datePicker.connect(service as any, normalizeProps))

  // 格式化显示值
  const displayValue = createMemo(() => {
    const dateValue = api().value[0]
    if (!dateValue) {
      return local.placeholder || 'Select date'
    }

    // 如果提供了自定义格式
    if (local.format) {
      const formatted = formatDate(dateValue, local.format)
      if (local.showTime && timeValue()) {
        return `${formatted} ${timeValue()}`
      }
      return formatted
    }

    // 默认使用 Zag.js 的格式
    const defaultFormatted = api().valueAsString[0]
    if (local.showTime && timeValue()) {
      return `${defaultFormatted} ${timeValue()}`
    }
    return defaultFormatted
  })

  // Handle Time Change from Input
  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime)
    const currentDate = api().value[0]
    if (currentDate) {
       let finalValue = currentDate.toString()
       try {
          const date = currentDate
          const timeObj = parseTime(newTime)
          const dateTime = new CalendarDateTime(
             date.year, date.month, date.day,
             timeObj.hour, timeObj.minute, timeObj.second
          )
          finalValue = dateTime.toString()
       } catch {
          finalValue = `${currentDate.toString()}T${newTime}`
       }
       local.onChange?.(finalValue)
    }
  }

  return (
    <div class={styles().root({ class: local.class })}>
      <Show when={local.label}>
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
                   {api().visibleRangeText?.start ?? ''}
                </button>
              </div>

              <button {...api().getNextTriggerProps()} class={styles().navTrigger()}>
                <ChevronRight class="size-4" />
              </button>
            </div>

            {/* Grid */}
            <DatePickerCalendar api={api} styles={styles} />

            {/* Time Picker Footer */}
            <Show when={local.showTime}>
              <TimePicker 
                value={timeValue()} 
                onChange={handleTimeChange} 
                label="时间" 
              />
            </Show>
          </div>
        </div>
      </Portal>
    </div>
  )
}
