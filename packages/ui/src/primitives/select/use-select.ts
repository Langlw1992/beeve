/**
 * useSelect hook - 基于 @zag-js/combobox 实现
 */

import { type Accessor, createMemo, createSignal, createUniqueId } from 'solid-js'
import * as combobox from '@zag-js/combobox'
import { type PropTypes, useMachine, normalizeProps } from '@zag-js/solid'
import type {
  SelectOption,
  SelectProps,
  SelectValue,
  SelectCollection,
} from './types'

// ==================== 类型定义 ====================

/** combobox API 类型 */
export type SelectApi = combobox.Api<PropTypes, SelectOption>

/** useSelect 返回类型 */
export type UseSelectReturn<T = unknown> = {
  /** combobox API accessor - 调用 api() 获取当前状态 */
  api: Accessor<SelectApi>
  /** 当前过滤后的选项 */
  filteredOptions: Accessor<SelectOption<T>[]>
  /** 是否有值 */
  hasValue: Accessor<boolean>
  /** 获取 option 对象 by value */
  getOption: (value: SelectValue) => SelectOption<T> | undefined
  /** Collection 对象 */
  collection: Accessor<SelectCollection<SelectOption<T>>>
}

// ==================== 工具函数 ====================

/** 将 SelectOption 转换为 zag-js collection */
function createSelectCollection<T>(
  options: SelectOption<T>[],
  fieldNames?: SelectProps['fieldNames']
): SelectCollection<SelectOption<T>> {
  const labelKey = fieldNames?.label ?? 'label'
  const valueKey = fieldNames?.value ?? 'value'
  const disabledKey = fieldNames?.disabled ?? 'disabled'

  return combobox.collection({
    items: options,
    itemToValue: (item) => String((item as Record<string, unknown>)[valueKey]),
    itemToString: (item) => String((item as Record<string, unknown>)[labelKey]),
    isItemDisabled: (item) => Boolean((item as Record<string, unknown>)[disabledKey]),
  })
}

// ==================== Hook 实现 ====================

export function useSelect<T = unknown>(props: SelectProps<T>): UseSelectReturn<T> {
  const options = () => props.options ?? []

  // 用于存储过滤后的选项
  const [filteredOptions, setFilteredOptions] = createSignal<SelectOption<T>[]>(options())

  // 创建 collection
  const collection = createMemo(() => createSelectCollection(filteredOptions(), props.fieldNames))

  // 值查找 map
  const optionMap = createMemo(() => {
    const map = new Map<string, SelectOption<T>>()
    for (const opt of options()) {
      map.set(String(opt.value), opt)
    }
    return map
  })

  const getOption = (value: SelectValue): SelectOption<T> | undefined => optionMap().get(String(value))

  // 过滤函数
  const filterFn = (inputValue: string): SelectOption<T>[] => {
    if (props.filterOption === false) {
      return options()
    }

    const filterProp = props.optionFilterProp ?? 'label'

    if (typeof props.filterOption === 'function') {
      const customFilter = props.filterOption
      return options().filter((opt) => customFilter(inputValue, opt))
    }

    // 默认过滤逻辑
    const lowerInput = inputValue.toLowerCase()
    return options().filter((opt) => {
      const fieldValue = String(opt[filterProp as keyof SelectOption] ?? opt.label)
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
    disabled: props.disabled || props.loading,
    // 不使用 readOnly，让 zag-js 正常处理点击事件
    // 搜索功能通过 inputBehavior 控制
    placeholder: props.placeholder,
    value: getInitialValue(),
    // inputBehavior: 'none' 时输入不会触发过滤，但点击仍可打开
    inputBehavior: props.showSearch ? 'autocomplete' as const : 'none' as const,
    selectionBehavior: props.mode ? 'preserve' as const : 'replace' as const,
    // 确保点击能打开
    openOnClick: true,
    openOnKeyPress: true,
    allowCustomValue: props.mode === 'tags',

    onOpenChange: (details) => {
      props.onOpenChange?.(details.open)
      if (details.open) {
        // 重置过滤
        setFilteredOptions(options())
      }
    },

    onInputValueChange: (details) => {
      props.onSearch?.(details.inputValue)

      if (props.showSearch && props.filterOption !== false) {
        const filtered = filterFn(details.inputValue)
        setFilteredOptions(filtered)
      }
    },

    onValueChange: (details) => {
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

  const hasValue = createMemo(() => api().value.length > 0)

  return {
    api,
    filteredOptions,
    hasValue,
    getOption,
    collection,
  }
}

