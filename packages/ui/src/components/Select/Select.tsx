/**
 * @beeve/ui - Select Component
 * Refactored Select using @zag-js/select
 * Supports: Single/Multi selection, Search, Clear, Tags, Custom Rendering
 */

import {
  createMemo,
  createUniqueId,
  splitProps,
  Show,
  For,
  createSignal,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import * as select from '@zag-js/select'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { tv, type VariantProps } from 'tailwind-variants'
import {
  ChevronDown,
  X,
  Check,
  Search,
} from 'lucide-solid'

import type {
  SelectOption,
  SelectValue,
  SelectOnChangeValue,
} from '../../primitives/select'
export type { SelectOption, SelectValue, SelectOnChangeValue }

// ==================== Styles ====================

const selectStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5 w-full',
    
    // Trigger
    trigger: [
      'group flex items-center justify-between w-full',
      'border bg-background text-foreground transition-colors',
      'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary',
    ],
    
    // Value / Tags
    valueText: 'flex-1 text-left truncate min-w-0 mr-2',
    tagsWrapper: 'flex flex-wrap gap-1 flex-1 min-w-0 mr-2 items-center',
    tag: [
      'inline-flex items-center gap-1 rounded px-1 h-5',
      'bg-secondary text-secondary-foreground text-xs font-medium',
      'border border-transparent',
    ],
    tagClose: [
      'rounded-sm opacity-60 hover:opacity-100 transition-opacity',
      'cursor-pointer focus:outline-none focus:ring-1 ring-primary/20',
      'flex items-center justify-center p-0.5',
    ],

    // Icons
    indicator: 'text-muted-foreground shrink-0 transition-transform duration-200',
    clearIcon: [
      'text-muted-foreground hover:text-foreground shrink-0',
      'rounded-full p-0.5 hover:bg-accent transition-colors',
      'mr-1 cursor-pointer flex items-center justify-center',
    ],

    // Portal Content
    positioner: 'z-50',
    content: [
      'z-50 min-w-[var(--reference-width)]',
      'bg-popover text-popover-foreground',
      'rounded-[var(--radius)] border shadow-md',
      'animate-in fade-in-0 zoom-in-95',
      'outline-none overflow-hidden',
      'flex flex-col',
    ],

    // Search
    searchWrapper: 'p-2 border-b sticky top-0 bg-popover z-10',
    searchInput: [
      'flex w-full rounded-[calc(var(--radius)-4px)] border border-input bg-background text-foreground',
      'px-3 py-1 text-sm shadow-sm transition-colors',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    ],

    // List
    list: 'p-1 max-h-[300px] overflow-y-auto overflow-x-hidden',
    item: [
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none',
      'transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ],
    itemIndicator: 'absolute right-2 flex items-center justify-center',
    itemGroup: 'py-1',
    itemGroupLabel: 'px-2 py-1.5 text-sm font-semibold text-muted-foreground',
    
    // Error
    errorText: 'text-[0.8rem] font-medium text-destructive',
  },
  variants: {
    size: {
      sm: {
        trigger: 'min-h-7 h-auto px-2 text-xs rounded-md py-0.5',
        item: 'py-1 text-xs',
        searchInput: 'h-7 text-xs',
      },
      md: {
        trigger: 'min-h-8 h-auto px-3 text-sm rounded-md py-1',
        item: 'py-1.5 text-sm',
        searchInput: 'h-8 text-sm',
      },
      lg: {
        trigger: 'min-h-9 h-auto px-4 text-sm rounded-md py-1.5',
        item: 'py-2 text-base',
        searchInput: 'h-9 text-base',
      },
    },
    error: {
      true: {
        trigger: '!border-destructive text-destructive focus-visible:ring-destructive/20',
        indicator: 'text-destructive/80',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

// Remove duplicate types that are now imported
// export type SelectOnChangeValue is removed from here

export interface SelectProps<Value extends SelectValue = SelectValue, Data = unknown, Multiple extends boolean | undefined = undefined> extends VariantProps<typeof selectStyles> {
  // Data
  options: SelectOption<Data, Value>[]
  value?: SelectOnChangeValue<Value, Multiple>
  defaultValue?: SelectOnChangeValue<Value, Multiple>
  
  // Handlers
  onChange?: (value: SelectOnChangeValue<Value, Multiple>) => void
  
  // Features
  label?: string
  placeholder?: string
  multiple?: Multiple
  maxCount?: number
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  name?: string
  errorMessage?: string
  
  // Customization
  class?: string
}

export function Select<Value extends SelectValue = SelectValue, Data = unknown, Multiple extends boolean | undefined = undefined>(props: SelectProps<Value, Data, Multiple>) {
  const [local, styleProps, _rest] = splitProps(
    props as SelectProps<Value, Data, boolean | undefined>,
    [
      'options',
      'value',
      'defaultValue',
      'onChange',
      'label',
      'placeholder',
      'maxCount',
      'multiple',
      'searchable',
      'clearable',
      'disabled',
      'name',
      'errorMessage',
      'class',
    ],
    ['size', 'error']
  )

  const styles = selectStyles({ ...styleProps, error: !!local.errorMessage || styleProps.error })
  
  // Search State
  const [searchTerm, setSearchTerm] = createSignal('')

  // Derived Options (Filtered)
  const filteredOptions = createMemo(() => {
    if (!local.searchable || !searchTerm()) {
      return local.options
    }
    const lowerTerm = searchTerm().toLowerCase()
    return local.options.filter((opt) => 
      opt.label.toLowerCase().includes(lowerTerm)
    )
  })

  // Collection
  const collection = createMemo(() =>
    select.collection<SelectOption<Data, Value>>({
      items: filteredOptions(),
      itemToString: (item) => item.label,
      itemToValue: (item) => String(item.value),
    })
  )

  // Machine Props
  const machineProps = createMemo(() => ({
    id: createUniqueId(),
    collection: collection(),
    multiple: local.multiple,
    disabled: local.disabled,
    name: local.name,
    value: local.value 
      ? Array.isArray(local.value) 
        ? local.value.map(String) 
        : [String(local.value)]
      : undefined,
    defaultValue: local.defaultValue
      ? Array.isArray(local.defaultValue)
        ? local.defaultValue.map(String)
        : [String(local.defaultValue)]
      : undefined,
    onValueChange: (details: select.ValueChangeDetails<SelectOption<Data, Value>>) => {
      if (local.onChange) {
        if (local.multiple) {
          // Multi: return array, filter out values not found in options to ensure strict Value type
          const rawValues = details.value
            .map((v) => local.options.find((o) => String(o.value) === v)?.value)
            .filter((v): v is Value => v !== undefined)
          
          // Cast to specific signature based on multiple check
          const onChange = local.onChange as (val: Value[]) => void
          onChange(rawValues)
        } else {
          // Single: return single value
          const v = details.value[0]
          const opt = v ? local.options.find((o) => String(o.value) === v) : undefined
          
          // Cast to specific signature based on multiple check
          const onChange = local.onChange as (val: Value | undefined) => void
          onChange(opt?.value)
        }
      }
    },
    // Closing behavior
    closeOnSelect: !local.multiple,
  }))

  const service = useMachine(select.machine, machineProps)
  const api = createMemo(() => select.connect(service, normalizeProps))

  // Clear Handler
  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    api().clearValue()
    if (local.onChange) {
      if (local.multiple) {
        (local.onChange as (val: Value[]) => void)([])
      } else {
        (local.onChange as (val: Value | undefined) => void)(undefined)
      }
    }
  }

  // Remove Tag Handler
  const handleRemoveTag = (value: string, e: MouseEvent) => {
    e.stopPropagation()
    const current = api().value
    api().setValue(current.filter(v => v !== value))
    // Zag calls onValueChange automatically
  }

  return (
    <div class={styles.root({ class: local.class })}>
      {/* Trigger */}
      <div {...api().getControlProps()} class="relative">
        <button {...api().getTriggerProps()} class={styles.trigger()}>
          
          {/* Value Render */}
          <Show 
            when={local.multiple && api().value.length > 0}
            fallback={
              <span class={styles.valueText()}>
                 {api().valueAsString || <span class="text-muted-foreground">{local.placeholder || "Select an option"}</span>}
              </span>
            }
          >
            {/* Tags Mode */}
            <div class={styles.tagsWrapper()}>
              <For each={local.maxCount ? api().value.slice(0, local.maxCount) : api().value}>
                {(val) => {
                  const opt = local.options.find(o => String(o.value) === val)
                  return (
                    <span class={styles.tag()}>
                      {opt?.label || val}
                      <button 
                        type="button"
                        class={styles.tagClose()}
                        onClick={(e) => handleRemoveTag(val, e)}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )
                }}
              </For>
              <Show when={local.maxCount && api().value.length > local.maxCount}>
                <span class={styles.tag()}>
                  +{api().value.length - (local.maxCount || 0)}
                </span>
              </Show>
            </div>
          </Show>

          {/* Icons Group: Clear + Chevron */}
          <div class="flex items-center">
            <Show when={local.clearable && api().value.length > 0 && !local.disabled}>
              <button 
                type="button"
                class={styles.clearIcon()} 
                onClick={handleClear}
                title="Clear selection"
              >
                <X class="size-3.5" />
              </button>
            </Show>
            
            <Show when={!local.multiple || !local.searchable}>
               <ChevronDown class={styles.indicator({ 
                 class: api().open ? 'rotate-180' : '' 
               })} size={14} />
            </Show>
          </div>
        </button>
      </div>

      {/* Portal Content */}
      <Portal>
        <div {...api().getPositionerProps()} class={styles.positioner()}>
          <div {...api().getContentProps()} class={styles.content()}>
            
            {/* Search Input */}
            <Show when={local.searchable}>
               <div class={styles.searchWrapper()}>
                 <div class="relative">
                   <div class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-muted-foreground">
                      <Search size={14} />
                   </div>
                   <input 
                     class={styles.searchInput({ class: "pl-8" })}
                     type="text" 
                     placeholder="Search..."
                     value={searchTerm()}
                     onInput={(e) => setSearchTerm(e.currentTarget.value)}
                     onKeyDown={(e) => e.stopPropagation()} 
                   />
                 </div>
               </div>
            </Show>

            <ul class={styles.list()}>
              <For each={filteredOptions()}>
                {(item) => (
                  <li {...api().getItemProps({ item })} class={styles.item()}>
                    <span class="truncate">{item.label}</span>
                    <span {...api().getItemIndicatorProps({ item })} class={styles.itemIndicator()}>
                      <Check size={14} />
                    </span>
                  </li>
                )}
              </For>
              <Show when={filteredOptions().length === 0}>
                <li class="p-2 text-sm text-muted-foreground text-center">
                  No options found
                </li>
              </Show>
            </ul>
          </div>
        </div>
      </Portal>
      
      {/* Error Message */}
      <Show when={local.errorMessage}>
        <div class={styles.errorText()}>{local.errorMessage}</div>
      </Show>

      {/* Hidden Select for Form Submission */}
      <select {...api().getHiddenSelectProps()} />
    </div>
  )
}
