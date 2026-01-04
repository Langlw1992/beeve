/**
 * NumberInput Types
 * 数字输入框类型定义
 */

/** NumberInput 组件 Props */
export interface NumberInputProps {
  /** 当前值 */
  value?: number
  /** 默认值 */
  defaultValue?: number
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步长 */
  step?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 占位符 */
  placeholder?: string
  /** 表单名称 */
  name?: string
  /** 是否允许鼠标滚轮修改值 */
  allowMouseWheel?: boolean
  /** 长按按钮是否连续变化 */
  spinOnPress?: boolean
  /** 失焦时是否钳制到 min/max */
  clampValueOnBlur?: boolean
  /** 数字格式化选项 (Intl.NumberFormatOptions) */
  formatOptions?: Intl.NumberFormatOptions
  /** 是否无效 */
  invalid?: boolean

  /** 值变化回调 */
  onValueChange?: (details: { value: string; valueAsNumber: number }) => void
  /** 失焦回调 */
  onBlur?: (e: FocusEvent) => void
  /** 聚焦回调 */
  onFocus?: (e: FocusEvent) => void
}

