/**
 * @beeve/ui - Label Component
 * 表单标签组件
 */

import {splitProps, type Component, type JSX} from 'solid-js'
import {tv, type VariantProps} from 'tailwind-variants'

const labelVariants = tv({
  base: [
    'text-sm font-medium leading-none',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  ],
  variants: {
    required: {
      true: "after:content-['*'] after:ml-0.5 after:text-destructive",
    },
    disabled: {
      true: 'cursor-not-allowed opacity-70',
    },
  },
})

export type LabelVariants = VariantProps<typeof labelVariants>

export interface LabelProps extends LabelVariants {
  /** 标签文本 */
  children?: JSX.Element
  /** 关联的表单元素 ID */
  for?: string
  /** 自定义类名 */
  class?: string
  /** 是否必填 */
  required?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

export const Label: Component<LabelProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'children', 'for'],
    ['required', 'disabled'],
  )

  return (
    <label
      for={local.for}
      class={labelVariants({...variants, class: local.class})}
      {...rest}
    >
      {local.children}
    </label>
  )
}
