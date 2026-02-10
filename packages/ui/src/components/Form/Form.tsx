/**
 * @beeve/ui - Form Component
 * 基于 @tanstack/solid-form 的表单组件系统
 *
 * 使用 createFormHook 创建自定义表单系统，提供：
 * 1. 自动注册的字段组件（TextField, SelectField 等）
 * 2. 完整的 TypeScript 类型推断
 * 3. 统一的样式和布局
 * 4. 支持 Zod schema 验证
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   defaultValues: { username: '', email: '' },
 *   onSubmit: ({ value }) => console.log(value)
 * })
 *
 * <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
 *   <form.AppField name="username">
 *     {(field) => <field.TextField label="用户名" />}
 *   </form.AppField>
 *   <form.AppField name="email">
 *     {(field) => <field.TextField label="邮箱" type="email" />}
 *   </form.AppField>
 *   <form.AppForm>
 *     <form.SubmitButton />
 *   </form.AppForm>
 * </form>
 * ```
 */

import {
  splitProps,
  Show,
  type JSX,
} from 'solid-js'
import { tv } from 'tailwind-variants'
import { createFormHook, createFormHookContexts } from '@tanstack/solid-form'
import { Input, type InputProps } from '../Input'
import { Select, type SelectProps, type SelectValue } from '../Select'
import { Checkbox, type CheckboxProps } from '../Checkbox'
import { Switch, type SwitchProps } from '../Switch'
import { Button } from '../Button'

// ============================================================================
// Form Hook Contexts
// ============================================================================

/**
 * 创建表单和字段的 Context
 * 用于在组件之间共享表单状态
 */
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

// ============================================================================
// Styles
// ============================================================================

const formItemStyles = tv({
  base: 'flex flex-col',
  variants: {
    size: {
      sm: 'gap-1',
      md: 'gap-1.5',
      lg: 'gap-2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const formLabelStyles = tv({
  base: 'font-medium leading-none',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const formDescriptionStyles = tv({
  base: 'text-muted-foreground',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-xs',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const formMessageStyles = tv({
  base: 'font-medium',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-xs',
    },
    status: {
      error: 'text-destructive',
      warning: 'text-warning',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

// ============================================================================
// Field Components
// ============================================================================

/**
 * TextField 组件
 * 文本输入字段，自动绑定到表单字段
 */
interface TextFieldProps extends Omit<InputProps, 'value' | 'onInput' | 'onBlur'> {
  /** 标签文本 */
  label?: JSX.Element
  /** 描述文本 */
  description?: JSX.Element
  /** 是否必填 */
  required?: boolean
}

function TextField(props: TextFieldProps) {
  const field = useFieldContext<string>()
  const [local, inputProps] = splitProps(props, ['label', 'description', 'required'])

  const hasError = () => field().state.meta.errors.length > 0

  return (
    <div class={formItemStyles()}>
      {local.label && (
        <label
          for={field().name}
          class={formLabelStyles()}
          classList={{
            "after:content-['*'] after:ml-0.5 after:text-destructive": local.required,
          }}
        >
          {local.label}
        </label>
      )}
      <Input
        id={field().name}
        name={field().name}
        value={field().state.value}
        onInput={(value) => field().handleChange(value)}
        onBlur={field().handleBlur}
        status={hasError() ? 'error' : undefined}
        {...inputProps}
      />
      {local.description && (
        <p class={formDescriptionStyles()}>{local.description}</p>
      )}
      <Show when={hasError()}>
        <p class={formMessageStyles({ status: 'error' })} role="alert">
          {field().state.meta.errors.join(', ')}
        </p>
      </Show>
    </div>
  )
}

/**
 * SelectField 组件
 * 下拉选择字段，自动绑定到表单字段
 */
interface SelectFieldProps
  extends Omit<SelectProps<SelectValue, unknown, undefined>, 'value' | 'onChange' | 'label'> {
  /** 标签文本 */
  label?: string
  /** 描述文本 */
  description?: JSX.Element
  /** 是否必填 */
  required?: boolean
}

function SelectField(props: SelectFieldProps) {
  // biome-ignore lint/suspicious/noExplicitAny: 字段值类型由表单数据决定
  const field = useFieldContext<any>()
  const [local, selectProps] = splitProps(props, ['label', 'description', 'required'])

  const hasError = () => field().state.meta.errors.length > 0

  return (
    <div class={formItemStyles()}>
      {local.label && (
        // biome-ignore lint/a11y/noLabelWithoutControl: Select 组件内部处理 label 关联
        <label
          class={formLabelStyles()}
          classList={{
            "after:content-['*'] after:ml-0.5 after:text-destructive": local.required,
          }}
        >
          {local.label}
        </label>
      )}
      <Select
        value={field().state.value}
        onChange={(value) => field().handleChange(value)}
        error={hasError()}
        {...selectProps}
      />
      {local.description && (
        <p class={formDescriptionStyles()}>{local.description}</p>
      )}
      <Show when={hasError()}>
        <p class={formMessageStyles({ status: 'error' })} role="alert">
          {field().state.meta.errors.join(', ')}
        </p>
      </Show>
    </div>
  )
}

/**
 * CheckboxField 组件
 * 复选框字段，自动绑定到表单字段
 */
interface CheckboxFieldProps extends Omit<CheckboxProps, 'checked' | 'onChange'> {
  /** 标签文本 */
  label?: JSX.Element
  /** 描述文本 */
  description?: JSX.Element
}

function CheckboxField(props: CheckboxFieldProps) {
  const field = useFieldContext<boolean>()
  const [local, checkboxProps] = splitProps(props, ['label', 'description'])

  const hasError = () => field().state.meta.errors.length > 0

  return (
    <div class={formItemStyles()}>
      <Checkbox
        checked={field().state.value}
        onChange={(checked) => field().handleChange(checked)}
        {...checkboxProps}
      >
        {local.label}
      </Checkbox>
      {local.description && (
        <p class={formDescriptionStyles()}>{local.description}</p>
      )}
      <Show when={hasError()}>
        <p class={formMessageStyles({ status: 'error' })} role="alert">
          {field().state.meta.errors.join(', ')}
        </p>
      </Show>
    </div>
  )
}

/**
 * SwitchField 组件
 * 开关字段，自动绑定到表单字段
 */
interface SwitchFieldProps extends Omit<SwitchProps, 'checked' | 'onChange'> {
  /** 标签文本 */
  label?: JSX.Element
  /** 描述文本 */
  description?: JSX.Element
}

function SwitchField(props: SwitchFieldProps) {
  const field = useFieldContext<boolean>()
  const [local, switchProps] = splitProps(props, ['label', 'description'])

  const hasError = () => field().state.meta.errors.length > 0

  return (
    <div class={formItemStyles()}>
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          {local.label && <span class={formLabelStyles()}>{local.label}</span>}
          {local.description && (
            <p class={formDescriptionStyles()}>{local.description}</p>
          )}
        </div>
        <Switch
          checked={field().state.value}
          onChange={(checked) => field().handleChange(checked)}
          {...switchProps}
        />
      </div>
      <Show when={hasError()}>
        <p class={formMessageStyles({ status: 'error' })} role="alert">
          {field().state.meta.errors.join(', ')}
        </p>
      </Show>
    </div>
  )
}

// ============================================================================
// Form Components
// ============================================================================

/**
 * SubmitButton 组件
 * 提交按钮，自动订阅表单状态
 */
interface SubmitButtonProps {
  /** 按钮文本 */
  label?: string
  /** 提交中文本 */
  loadingLabel?: string
}

function SubmitButton(props: SubmitButtonProps) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
      {(state) => (
        <Button type="submit" disabled={!state().canSubmit}>
          {state().isSubmitting ? (props.loadingLabel || '提交中...') : (props.label || '提交')}
        </Button>
      )}
    </form.Subscribe>
  )
}

// ============================================================================
// Create Form Hook
// ============================================================================

/**
 * 创建自定义表单 Hook
 * 注册所有字段组件和表单组件，提供完整的类型推断
 */
export const { useAppForm: useForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    SelectField,
    CheckboxField,
    SwitchField,
  },
  formComponents: {
    SubmitButton,
  },
})


