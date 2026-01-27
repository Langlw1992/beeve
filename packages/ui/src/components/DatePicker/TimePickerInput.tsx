// TimePicker.tsx
import { Show, splitProps, type Component } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'

const timePickerStyles = tv({
  slots: {
    container: 'flex items-center gap-2 border-t border-border mt-3 pt-3',
    label: 'text-xs text-muted-foreground font-medium',
    input: [
      'flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm transition-colors',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    ],
  },
})

export interface TimePickerProps extends VariantProps<typeof timePickerStyles> {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
}

export const TimePicker: Component<TimePickerProps> = (props) => {
  const [local, _rest] = splitProps(props, ['value', 'onChange', 'label', 'disabled'])
  const styles = timePickerStyles()

  return (
    <div class={styles.container()}>
      <Show when={local.label}>
        <span class={styles.label()}>{local.label}</span>
      </Show>
      <input
        type="time"
        class={styles.input()}
        // Fallback to "00:00" or empty if undefined to keep controlled
        value={local.value || ''}
        onInput={(e) => local.onChange(e.currentTarget.value)}
        disabled={local.disabled}
        step="1" // Enable valid seconds selection if browser supports
      />
    </div>
  )
}
