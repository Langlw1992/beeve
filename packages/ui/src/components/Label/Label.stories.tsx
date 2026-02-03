import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {Label} from '@beeve/ui'

/**
 * # Label 标签
 *
 * 表单标签组件，用于标识表单控件。
 */
const meta = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    required: {
      control: 'boolean',
      description: '是否必填（显示 * 标记）',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    for: {
      control: 'text',
      description: '关联的表单元素 ID',
    },
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

/** 基础用法 */
export const Basic: Story = {
  args: {
    children: '用户名',
  },
}

/** 必填标记 */
export const Required: Story = {
  args: {
    children: '邮箱地址',
    required: true,
  },
}

/** 禁用状态 */
export const Disabled: Story = {
  args: {
    children: '禁用的标签',
    disabled: true,
  },
}

/** 与表单元素配合 */
export const WithInput: Story = {
  render: () => (
    <div class="flex flex-col gap-2">
      <Label
        for="email"
        required
      >
        邮箱地址
      </Label>
      <input
        id="email"
        type="email"
        class="h-10 px-3 rounded-md border border-input bg-background"
        placeholder="请输入邮箱"
      />
    </div>
  ),
}
