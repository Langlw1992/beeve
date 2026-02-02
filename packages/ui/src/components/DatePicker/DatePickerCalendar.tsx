import { For, Show, type Accessor, type Component } from 'solid-js'
import type * as datePicker from '@zag-js/date-picker'
import type { DatePickerStylesReturn } from './DatePicker'

interface CalendarViewProps {
  api: Accessor<datePicker.Api>
  styles: Accessor<DatePickerStylesReturn>
}

export const DatePickerCalendar: Component<CalendarViewProps> = (props) => {
  return (
    <div {...props.api().getTableProps()} class={props.styles().grid()}>
      <Show when={props.api().view === 'day'}>
        <div {...props.api().getTableHeaderProps()} class="flex justify-between mb-2">
          <For each={props.api().weekDays}>
            {(day) => (
              <div class={props.styles().columnHeader()} aria-label={day.long}>
                {day.short}
              </div>
            )}
          </For>
        </div>
        <div {...props.api().getTableBodyProps()}>
          <For each={props.api().weeks}>
            {(week) => (
              <div {...props.api().getTableRowProps()} class={props.styles().row()}>
                <For each={week}>
                  {(value) => (
                    <div {...props.api().getDayTableCellProps({ value })} class={props.styles().cell()}>
                      <button
                        {...props.api().getDayTableCellTriggerProps({ value })}
                        class={props.styles().dayTrigger()}
                      >
                        {value.day}
                      </button>
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Month View */}
      <Show when={props.api().view === 'month'}>
        <div {...props.api().getTableBodyProps()} class="grid grid-cols-3 gap-2 py-4">
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
      </Show>

      {/* Year View */}
      <Show when={props.api().view === 'year'}>
        <div {...props.api().getTableBodyProps()} class="grid grid-cols-4 gap-2 py-4">
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
      </Show>
    </div>
  )
}
