/**
 * @beeve/ui - Form Stories
 * 演示基于 createFormHook 的新表单系统
 */

import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { useForm } from './Form'
import type { Component } from 'solid-js'
import { toast, Toaster } from '../Toast'

const meta = {
  title: 'Components/Form',
  component: () => null, // 不需要组件，因为我们使用 hook
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// ============================================================================
// Basic Form - 使用新的 createFormHook API
// ============================================================================

const BasicFormComponent: Component = () => {
  const form = useForm(() => ({
    defaultValues: {
      username: '',
      email: '',
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted:', value)
      toast.success('表单提交成功！', {
        description: `用户名: ${value.username}, 邮箱: ${value.email}`,
      })
    },
  }))

  return (
    <>
      <Toaster />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        noValidate
        class="max-w-md space-y-4"
      >
      <form.AppField name="username">
        {(field) => (
          <field.TextField
            label="用户名"
            placeholder="请输入用户名"
            description="这是您的公开显示名称"
          />
        )}
      </form.AppField>

      <form.AppField name="email">
        {(field) => (
          <field.TextField
            label="邮箱"
            type="email"
            placeholder="请输入邮箱地址"
          />
        )}
      </form.AppField>

      <form.AppForm>
        <form.SubmitButton />
      </form.AppForm>
      </form>
    </>
  )
}

export const Basic: Story = {
  render: () => <BasicFormComponent />,
}

// ============================================================================
// Form with Validation - 使用字段级验证
// ============================================================================

const WithValidationFormComponent: Component = () => {
  const form = useForm(() => ({
    defaultValues: {
      username: '',
      email: '',
      age: 18,
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted:', value)
      toast.success('表单验证通过并提交成功！', {
        description: `用户名: ${value.username}, 邮箱: ${value.email}`,
      })
    },
  }))

  return (
    <>
      <Toaster />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        noValidate
        class="max-w-md space-y-4"
      >
      <form.AppField
        name="username"
        validators={{
          onChange: ({ value }) => {
            if (!value) {
              return '用户名不能为空'
            }
            if (value.length < 3) {
              return '用户名至少 3 个字符'
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <field.TextField
            label="用户名"
            placeholder="请输入用户名"
            description="至少 3 个字符"
            required
          />
        )}
      </form.AppField>

      <form.AppField
        name="email"
        validators={{
          onChange: ({ value }) => {
            if (!value) {
              return '邮箱不能为空'
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return '请输入有效的邮箱地址'
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <field.TextField
            label="邮箱"
            type="email"
            placeholder="请输入邮箱地址"
            required
          />
        )}
      </form.AppField>

      <form.AppForm>
        <form.SubmitButton />
      </form.AppForm>
      </form>
    </>
  )
}

export const WithValidation: Story = {
  render: () => <WithValidationFormComponent />,
}

// ============================================================================
// All Field Types - 演示所有字段类型
// ============================================================================

const AllFieldTypesFormComponent: Component = () => {
  const form = useForm(() => ({
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      country: '',
      newsletter: false,
      notifications: true,
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted:', value)
      toast.success('设置已保存！', {
        description: '您的个人信息已成功更新',
      })
    },
  }))

  return (
    <>
      <Toaster />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        noValidate
        class="max-w-md space-y-4"
      >
      <form.AppField name="username">
        {(field) => (
          <field.TextField
            label="用户名"
            placeholder="请输入用户名"
            description="这是您的公开显示名称"
          />
        )}
      </form.AppField>

      <form.AppField name="email">
        {(field) => (
          <field.TextField
            label="邮箱"
            type="email"
            placeholder="请输入邮箱地址"
          />
        )}
      </form.AppField>

      <form.AppField name="bio">
        {(field) => (
          <field.TextField
            label="个人简介"
            placeholder="介绍一下自己"
            description="最多 200 字"
          />
        )}
      </form.AppField>

      <form.AppField name="country">
        {(field) => (
          <field.SelectField
            label="国家"
            placeholder="选择国家"
            options={[
              { label: '中国', value: 'cn' },
              { label: '美国', value: 'us' },
              { label: '日本', value: 'jp' },
              { label: '英国', value: 'uk' },
            ]}
          />
        )}
      </form.AppField>

      <form.AppField name="newsletter">
        {(field) => (
          <field.CheckboxField
            label="订阅新闻通讯"
            description="接收最新产品更新和优惠信息"
          />
        )}
      </form.AppField>

      <form.AppField name="notifications">
        {(field) => (
          <field.SwitchField
            label="启用通知"
            description="接收重要的系统通知"
          />
        )}
      </form.AppField>

      <form.AppForm>
        <form.SubmitButton label="保存设置" loadingLabel="保存中..." />
      </form.AppForm>
      </form>
    </>
  )
}

export const AllFieldTypes: Story = {
  render: () => <AllFieldTypesFormComponent />,
}

