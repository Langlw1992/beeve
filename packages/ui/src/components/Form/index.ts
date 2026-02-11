/**
 * @beeve/ui - Form
 * 基于 @tanstack/solid-form 的表单系统
 *
 * 使用 createFormHook 创建的自定义表单系统，提供：
 * - useForm hook 创建表单实例
 * - 自动注册的字段组件（TextField, SelectField 等）
 * - 完整的 TypeScript 类型推断
 *
 * @example
 * ```tsx
 * import { useForm } from '@beeve/ui'
 *
 * const form = useForm({
 *   defaultValues: { username: '', email: '' },
 *   onSubmit: ({ value }) => console.log(value)
 * })
 *
 * <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
 *   <form.AppField name="username">
 *     {(field) => <field.TextField label="用户名" />}
 *   </form.AppField>
 *   <form.AppForm>
 *     <form.SubmitButton />
 *   </form.AppForm>
 * </form>
 * ```
 */

export {
  useForm,
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
} from './Form'
