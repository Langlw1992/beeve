/**
 * useSelect hook - 基于 @zag-js/combobox 实现
 */

import { createMemo, createSignal, createUniqueId } from 'solid-js'
import * as combobox from '@zag-js/combobox'
import { useMachine, normalizeProps } from '@zag-js/solid'
import type { SelectOption, SelectProps, SelectValue } from './types'

/** 将 SelectOption 转换为 zag-js collection item */
function createCollection<T>(
  options: SelectOption<T>[],
  fieldNames?: SelectProps<T>['fieldNames']
) {
  const labelKey = fieldNames?.label ?? 'label'
  const valueKey = fieldNames?.value ?? 'value'
  const disabledKey = fieldNames?.disabled ?? 'disabled'

  return combobox.collection({
    items: options,
    itemToValue: (item: SelectOption<T>) => String((item as Record<string, unknown>)[valueKey]),
    itemToString: (item: SelectOption<T>) => String((item as Record<string, unknown>)[labelKey]),
    isItemDisabled: (item: SelectOption<T>) => Boolean((item as Record<string, unknown>)[disabledKey]),
  })
}

export type UseSelectProps<T = unknown> = SelectProps<T>

export type UseSelectReturn<T = unknown> = {
  /** combobox API accessor - 调用 api() 获取当前状态 */
  api: () => ReturnType<typeof combobox.connect>
  /** 当前过滤后的选项 */
  filteredOptions: () => SelectOption<T>[]
  /** 是否有值 */
  hasValue: () => boolean
  /** 获取 option 对象 by value */
  getOption: (value: SelectValue) => SelectOption<T> | undefined
}

export function useSelect<T = unknown>(props: UseSelectProps<T>): UseSelectReturn<T> {
  const options = () => props.options ?? []

  // 用于存储过滤后的选项
  const [filteredOptions, setFilteredOptions] = createSignal<SelectOption<T>[]>(options())

  // 创建 collection
  const collection = createMemo(() => createCollection(filteredOptions(), props.fieldNames))

  // 值查找 map
  const optionMap = createMemo(() => {
    const map = new Map<string, SelectOption<T>>()
    for (const opt of options()) {
      map.set(String(opt.value), opt)
    }
    return map
  })

  const getOption = (value: SelectValue) => optionMap().get(String(value))

  // 过滤函数
  const filterFn = (inputValue: string) => {
    if (props.filterOption === false) {
      return options()
    }

    const filterProp = props.optionFilterProp ?? 'label'

    if (typeof props.filterOption === 'function') {
      const filterFn = props.filterOption
      return options().filter((opt) => filterFn(inputValue, opt))
    }

    // 默认过滤逻辑
    const lowerInput = inputValue.toLowerCase()
    return options().filter((opt) => {
      const fieldValue = String(opt[filterProp as keyof SelectOption<T>] ?? opt.label)
      return fieldValue.toLowerCase().includes(lowerInput)
    })
  }

  // 计算初始值
  const getInitialValue = (): string[] => {
    const val = props.value ?? props.defaultValue
    if (val === undefined) { return [] }
    if (Array.isArray(val)) { return val.map(String) }
    return [String(val)]
  }

  // zag-js machine
  const service = useMachine(combobox.machine, () => ({
    id: createUniqueId(),
    collection: collection(),
    multiple: props.mode === 'multiple' || props.mode === 'tags',
    disabled: props.disabled,
    // readOnly 只影响输入框是否可编辑，不影响下拉菜单的打开
    // 当 showSearch 为 false 时，输入框只读但仍可打开下拉选择
    readOnly: props.showSearch === false,
    placeholder: props.placeholder,
    value: getInitialValue(),
    inputBehavior: (props.showSearch ? 'autocomplete' : 'none') as 'autocomplete' | 'none',
    selectionBehavior: (props.mode ? 'preserve' : 'replace') as 'preserve' | 'replace',
    openOnClick: true,
    allowCustomValue: props.mode === 'tags',

    onOpenChange: (details: { open: boolean }) => {
      props.onOpenChange?.(details.open)
      if (details.open) {
        // 重置过滤
        setFilteredOptions(options())
      }
    },

    onInputValueChange: (details: { inputValue: string }) => {
      props.onSearch?.(details.inputValue)

      if (props.showSearch && props.filterOption !== false) {
        const filtered = filterFn(details.inputValue)
        setFilteredOptions(filtered)
      }
    },

    onValueChange: (details: { value: string[] }) => {
      const selectedValues = details.value
      const isMultiple = props.mode === 'multiple' || props.mode === 'tags'

      if (isMultiple) {
        const selectedOptions = selectedValues
          .map((v) => getOption(v))
          .filter((opt): opt is SelectOption<T> => opt !== undefined)
        const typedValues = selectedValues.map((v) => {
          const opt = getOption(v)
          return opt ? opt.value : v
        })
        props.onChange?.(typedValues, selectedOptions)
      } else {
        const value = selectedValues[0]
        const option = value ? getOption(value) : undefined
        const typedValue = option?.value ?? value
        props.onChange?.(typedValue, option)
      }
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  const hasValue = () => api().value.length > 0

  return {
    api, // 返回 accessor 函数，保持响应式
    filteredOptions,
    hasValue,
    getOption,
  }
}

