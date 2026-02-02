/**
 * Slider Primitive Types
 */

/** Slider 组件 Props */
export interface SliderProps {
  /** 唯一 ID */
  id?: string
  /** 值数组（单值模式传 [n]，范围模式传 [min, max]）*/
  value?: number[]
  /** 默认值 */
  defaultValue?: number[]
  /** 最小值，默认 0 */
  min?: number
  /** 最大值，默认 100 */
  max?: number
  /** 步长，默认 1 */
  step?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 是否无效 */
  invalid?: boolean
  /** 方向：horizontal | vertical */
  orientation?: 'horizontal' | 'vertical'
  /** 起始位置：start | center | end */
  origin?: 'start' | 'center' | 'end'
  /** thumb 对齐方式：contain | center */
  thumbAlignment?: 'contain' | 'center'
  /** thumb 尺寸（用于 contain 模式防止抖动）*/
  thumbSize?: { width: number; height: number }
  /** 表单名称 */
  name?: string
  /** 文本方向：ltr | rtl */
  dir?: 'ltr' | 'rtl'
  /** 值变化时回调（拖拽中） */
  onChange?: (details: { value: number[] }) => void
  /** 值变化结束回调（拖拽结束） */
  onChangeEnd?: (details: { value: number[] }) => void
  /** 获取 aria-valuetext */
  getAriaValueText?: (details: { value: number; index: number }) => string
}

/** Slider Mark 配置 */
export interface SliderMark {
  value: number
  label?: string
}

