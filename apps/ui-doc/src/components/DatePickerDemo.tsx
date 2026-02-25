import {DatePicker, DateRangePicker} from '@beeve/ui'
import {createSignal} from 'solid-js'

export function DatePickerBasic() {
  const [val, setVal] = createSignal<string | undefined>('')
  return (
    <div class="w-[350px] flex flex-col gap-2">
      <DatePicker
        placeholder="Pick a date"
        value={val()}
        onChange={(details) => {
          setVal(details.valueAsString)
        }}
      />
      <div class="text-xs text-muted-foreground">Selected: {val()}</div>
    </div>
  )
}

export function DatePickerWithTime() {
  const [val, setVal] = createSignal<string | undefined>('')
  return (
    <div class="w-[350px] flex flex-col gap-2">
      <DatePicker
        placeholder="Pick date & time"
        value={val()}
        onChange={(details) => {
          setVal(details.valueAsString)
        }}
      />
      <div class="text-xs text-muted-foreground">Selected: {val()}</div>
    </div>
  )
}

export function DateRangePickerDemo() {
  const [val, setVal] = createSignal<string[]>(['', ''])
  return (
    <div class="w-[350px] flex flex-col gap-2">
      <DateRangePicker
        placeholder="Select date range"
        value={val()}
        onChange={(details) => {
          if (details.valueAsString.length === 2) {
            setVal(details.valueAsString)
          }
        }}
      />
      <div class="text-xs text-muted-foreground">
        Range: {val()[0]} - {val()[1]}
      </div>
    </div>
  )
}

export function DatePickerSizes() {
  return (
    <div class="flex flex-col gap-4 w-[350px]">
      <DatePicker
        size="sm"
        placeholder="Small (sm)"
      />
      <DatePicker
        size="md"
        placeholder="Default (md)"
      />
      <DatePicker
        size="lg"
        placeholder="Large (lg)"
      />
    </div>
  )
}

export function DatePickerStates() {
  return (
    <div class="flex flex-col gap-4 w-[350px]">
      <DatePicker label="With Label" />
      <DatePicker
        label="Error State"
        error
      />
      <DatePicker
        label="Disabled"
        disabled
      />
    </div>
  )
}
