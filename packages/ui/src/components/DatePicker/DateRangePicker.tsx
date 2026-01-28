import * as datePicker from '@zag-js/date-picker'
import { normalizeProps, useMachine } from '@zag-js/solid'
import {
  For,
  Show,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
  type Component,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-solid'
import { tv, type VariantProps } from 'tailwind-variants'
import { DatePickerCalendar } from './DatePickerCalendar'
import { DateFormatter } from '@internationalized/date'

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
      'z-50 rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    ],
    header: 'flex items-center justify-between pt-1 pb-4',
    heading: 'text-sm font-medium',
    grid: 'w-full border-collapse space-y-1',
    columnHeader: 'rounded-md text-[0.8rem] font-normal text-muted-foreground w-8 h-8',
    row: 'flex w-full mt-2',
    cell: [
      'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
      '[&:has([data-range-start])]:rounded-l-md [&:has([data-range-end])]:rounded-r-md',
      '[&:has([data-in-range])]:bg-primary/20',
      '[&:has([data-range-start])]:bg-primary/20 [&:has([data-range-end])]:bg-primary/20', 
       // Note: aria-selected might be present on start/end, so we might need to override default cell styles or ensure specificty
      'h-8 w-8',
    ],
    dayTrigger: [
      'size-8 p-0 font-normal rounded-md transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
      'data-[selected]:bg-primary data-[selected]:text-primary-foreground hover:data-[selected]:bg-primary hover:data-[selected]:text-primary-foreground',
      'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent',
      'data-[today]:bg-accent data-[today]:text-accent-foreground',
      'data-[range-start]:bg-primary data-[range-start]:text-primary-foreground',
      'data-[range-end]:bg-primary data-[range-end]:text-primary-foreground',
      'data-[in-range]:bg-primary/20 data-[in-range]:text-foreground data-[in-range]:rounded-none',
    ],
    monthTrigger: [
      'h-8 w-full p-2 font-normal rounded-md transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'data-[selected]:bg-primary data-[selected]:text-primary-foreground',
    ],
    yearTrigger: [
      'h-8 w-full p-2 font-normal rounded-md transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'data-[selected]:bg-primary data-[selected]:text-primary-foreground',
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

export interface DateRangePickerProps extends Partial<DatePickerContext>, VariantProps<typeof dateRangePickerStyles> {
  class?: string
  placeholder?: string
  label?: string
  locale?: string
  // For range picker, value is string[]
  value?: string[]
}

export const DateRangePicker: Component<DateRangePickerProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'placeholder', 'label', 'locale'],
    ['size', 'error']
  )

  const styles = createMemo(() => dateRangePickerStyles({ size: variants.size, error: variants.error }))

  // Store locale for use in formatter
  const localeValue = () => local.locale || 'zh-CN'

  // Default props
  const machineProps = createMemo(() => mergeProps(
    {
      id: createUniqueId(),
      numOfMonths: 2, // Range selection often shows 2 months
      selectionMode: 'range',
      locale: localeValue(),
    },
    rest
  ))

  const service = useMachine(datePicker.machine as any, machineProps)
  const api = createMemo(() => datePicker.connect(service as any, normalizeProps))

  const displayValue = createMemo(() => {
    if (api().valueAsString.length === 0) {
      return local.placeholder || 'Select date range'
    }
    return api().valueAsString.join(' - ')
  })

  return (
    <div class={styles().root({ class: local.class })}>
      <Show when={local.label}>
        <label {...api().getLabelProps()} class={styles().label()}>
          {local.label}
        </label>
      </Show>

      <div {...api().getControlProps()} class={styles().control()}>
        <button {...api().getTriggerProps()} class={styles().trigger()}>
          <span>{displayValue()}</span>
          <Calendar class="size-4 opacity-50" />
        </button>
      </div>

      <Portal>
        <div {...api().getPositionerProps()}>
           {/* Width needs to be wider for 2 months */}
          <div {...api().getContentProps()} class={styles().content({ class: 'w-auto max-w-[90vw]' })}> 
            
            <Show when={api().view === 'day'} fallback={<DatePickerCalendar api={api} styles={styles} />}>
               <div class="flex gap-4 p-3">
                  <For each={[0, 1]}>
                    {(offset) => {
                       // For offset 0, use api().weeks and api().visibleRange directly
                       // For offset > 0, use api().getOffset() which returns DateValueOffset
                       const offsetData = createMemo(() => {
                         if (offset === 0) {
                           return {
                             weeks: api().weeks,
                             visibleRange: api().visibleRange,
                           }
                         }
                         return api().getOffset({ months: offset })
                       })

                       const formatter = new DateFormatter(localeValue(), { month: 'long', year: 'numeric' })

                       // Get the display date for the header
                       const headerDate = createMemo(() => {
                         const data = offsetData()
                         if (data?.visibleRange?.start) {
                           // DateValue has toDate() but we need to pass a timezone
                           // Use 'UTC' as a safe default
                           return formatter.format(data.visibleRange.start.toDate('UTC'))
                         }
                         return ''
                       })

                       return (
                           <div class="space-y-4">
                                <div class="flex items-center justify-between pt-1 relative">
                                    <div class="size-7 flex items-center justify-center">
                                       <Show when={offset === 0}>
                                            <button {...api().getPrevTriggerProps()} class={styles().navTrigger()}>
                                                <ChevronLeft class="size-4" />
                                            </button>
                                       </Show>
                                    </div>

                                    <div class="text-sm font-medium">
                                       {headerDate()}
                                    </div>

                                    <div class="size-7 flex items-center justify-center">
                                       <Show when={offset === 1}>
                                            <button {...api().getNextTriggerProps()} class={styles().navTrigger()}>
                                                <ChevronRight class="size-4" />
                                            </button>
                                       </Show>
                                    </div>
                                </div>

                                <div class={styles().grid()}>
                                    <div {...api().getTableHeaderProps()} class="flex justify-between mb-2">
                                      <For each={api().weekDays}>
                                        {(day) => (
                                          <div
                                            class={styles().columnHeader()}
                                            aria-label={day.long}
                                          >
                                            {day.short}
                                          </div>
                                        )}
                                      </For>
                                    </div>
                                    <div {...api().getTableBodyProps()}>
                                      <For each={offsetData()?.weeks}>
                                        {(week) => (
                                          <div {...api().getTableRowProps()} class={styles().row()}>
                                            <For each={week}>
                                              {(value) => (
                                                <div {...api().getDayTableCellProps({ value })} class={styles().cell()}>
                                                  <button {...api().getDayTableCellTriggerProps({ value })} class={styles().dayTrigger()}>
                                                    {value.day}
                                                  </button>
                                                </div>
                                              )}
                                            </For>
                                          </div>
                                        )}
                                      </For>
                                    </div>
                               </div>
                           </div>
                       )
                    }}
                  </For>
               </div>
            </Show>
          </div>
        </div>
      </Portal>
    </div>
  )
}
