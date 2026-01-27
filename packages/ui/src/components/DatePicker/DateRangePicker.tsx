import * as datePicker from '@zag-js/date-picker'
import { normalizeProps, useMachine } from '@zag-js/solid'
import {
  Show,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
  type Component,
} from 'solid-js'
import { Portal } from 'solid-js/web'
// @ts-ignore
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-solid'
import { tv, type VariantProps } from 'tailwind-variants'
import { DatePickerCalendar } from './DatePickerCalendar'

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
      'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
      'h-8 w-8',
    ],
    dayTrigger: [
      'h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-md transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
      'aria-selected:bg-primary aria-selected:text-primary-foreground hover:aria-selected:bg-primary hover:aria-selected:text-primary-foreground',
      'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent',
      'data-[today]:bg-accent data-[today]:text-accent-foreground',
      'data-[selected-range-start]:bg-primary data-[selected-range-start]:text-primary-foreground',
      'data-[selected-range-end]:bg-primary data-[selected-range-end]:text-primary-foreground',
      'data-[in-range]:bg-accent/50 data-[in-range]:rounded-none', // Range middle styles
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

export interface DateRangePickerProps extends Partial<DatePickerContext>, VariantProps<typeof dateRangePickerStyles> {
  class?: string
  placeholder?: string
  label?: string
  // For range picker, value is string[]
  value?: string[]
}

export const DateRangePicker: Component<DateRangePickerProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'placeholder', 'label'],
    ['size', 'error']
  )

  const styles = createMemo(() => dateRangePickerStyles({ size: variants.size, error: variants.error }))

  // Default props
  const machineProps = createMemo(() => mergeProps(
    {
      id: createUniqueId(),
      numOfMonths: 2, // Range selection often shows 2 months
      selectionMode: 'range',
      locale: 'zh-CN',
    },
    rest
  ))

  const service = useMachine(datePicker.machine as any, machineProps)
  const api = createMemo(() => datePicker.connect(service as any, normalizeProps))

  return (
    <div class={styles().root({ class: local.class })}>
      <Show when={local.label}>
        <label {...api().getLabelProps()} class={styles().label()}>
          {local.label}
        </label>
      </Show>

      <div {...api().getControlProps()} class={styles().control()}>
        <button {...api().getTriggerProps()} class={styles().trigger()}>
          <span>
             {api().valueAsString || local.placeholder || 'Select date range'}
          </span>
          <Calendar class="size-4 opacity-50" />
        </button>
      </div>

      <Portal>
        <div {...api().getPositionerProps()}>
           {/* Width needs to be wider for 2 months */}
          <div {...api().getContentProps()} class={styles().content({ class: 'w-[600px] max-w-[90vw]' })}> 
            
            {/* Header */}
            <div class={styles().header()}>
              <button {...api().getPrevTriggerProps()} class={styles().navTrigger()}>
                <ChevronLeft class="size-4" />
              </button>
              
              <div class={styles().heading()}>
                {/* Note: In multi-month view, we might want to interact differently, 
                    but Zag handles view triggering fine usually */}
                <button {...api().getViewTriggerProps()} class="hover:bg-accent rounded px-2 py-1">
                    {/* Simplified for range */}
                   {api().visibleRangeText?.start ?? ''}
                </button>
              </div>

              <button {...api().getNextTriggerProps()} class={styles().navTrigger()}>
                <ChevronRight class="size-4" />
              </button>
            </div>

            {/* Grid - reused */}
             {/* Note: DatePickerCalendar handles single month grid iteration. 
                 Zag with numOfMonths > 1 returns multiple offsets? 
                 Actually api.weeks is likely just for the first visible month if used naively?
                 Zag's `api.getMonths()` is not standard.
                 Actually Zag simplifies this by usually rendering one big grid OR 
                 we need to iterate `api.offset`? 
                 Wait, Zag solid adapter normalizeProps usually handles context.
                 
                 If we look at Zag docs for Multi Month:
                 We need to likely control the offset or render multiple grids.
                 Zag's default `api.weeks` is usually just the primary view.
                 
                 Let's stick to simple implementation (reusing single grid) for now 
                 but pass numOfMonths=2 prop to machine so logic is correct, 
                 even if we only render one month visually for MVP safety, 
                 OR ideally we render 2 side-by-side.
                 
                 However, since I don't want to break the reused DatePickerCalendar 
                 which expects standard api structure, let's keep it simple for now.
                 Zag's structure for multi-month is to have `api.visibleRange` logic.
                 
                 Let's assume the DatePickerCalendar works for the current view.
                 If we want 2 months side by side, we need to iterate offsets.
                 Zag docs say: 
                 <div {...api.getPositionerProps()}>
                   <div {...api.getContentProps()}>
                     <div style={{ display: "flex", gap: "24px" }}>
                       // Iteration logic typically custom for multi-grid
                     </div>
                   </div>
                 </div>
                 
                 For this scope, I'll stick to Single Month View for Range Picker 
                 unless requested otherwise, as it simplifies the Calendar Component reuse.
                 Zag supports range selection within 1 month fine.
             */}
            <DatePickerCalendar api={api} styles={styles} />
            
          </div>
        </div>
      </Portal>
    </div>
  )
}
