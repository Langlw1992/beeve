import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { createSignal } from 'solid-js'
import { Select } from '@beeve/ui'
import { action } from 'storybook/actions'

const fruitOptions = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
  { label: '葡萄', value: 'grape', disabled: true },
  { label: '西瓜', value: 'watermelon' },
]

/**
 * # Select 选择器
 *
 * 下拉选择器，支持单选、多选、搜索过滤等功能。
 *
 * ## 何时使用
 *
 * - 弹出一个下拉菜单给用户选择操作
 * - 用于代替原生的选择器
 * - 当选项少时（少于 5 项），建议直接将选项平铺
 */
const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: '占位文本',
      table: { category: '基础' },
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
      table: { category: '状态' },
    },
    loading: {
      control: 'boolean',
      description: '加载状态',
      table: { category: '状态' },
    },
    showSearch: {
      control: 'boolean',
      description: '是否支持搜索',
      table: { category: '功能' },
    },
    allowClear: {
      control: 'boolean',
      description: '是否允许清空',
      table: { category: '功能' },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '尺寸',
      table: { category: '外观' },
    },
    variant: {
      control: 'select',
      options: ['default', 'borderless'],
      description: '变体',
      table: { category: '外观' },
    },
    status: {
      control: 'select',
      options: ['default', 'error', 'warning'],
      description: '状态样式',
      table: { category: '外观' },
    },
  },
  args: {
    options: fruitOptions,
    placeholder: '请选择水果',
    onChange: action('onChange'),
    onSelect: action('onSelect'),
    onClear: action('onClear'),
    onSearch: action('onSearch'),
    onOpenChange: action('onOpenChange'),
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

/** 基础用法 */
export const Basic: Story = {}

/** 带搜索 */
export const WithSearch: Story = {
  args: {
    showSearch: true,
    placeholder: '搜索并选择',
  },
}

/** 允许清空 */
export const WithClear: Story = {
  args: {
    allowClear: true,
    value: 'apple',
  },
}

/** 禁用状态 */
export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'apple',
  },
}

/** 加载状态 */
export const Loading: Story = {
  args: {
    loading: true,
  },
}

/** 不同尺寸 */
export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-64">
      <Select options={fruitOptions} size="sm" placeholder="小尺寸" />
      <Select options={fruitOptions} size="md" placeholder="中等尺寸（默认）" />
      <Select options={fruitOptions} size="lg" placeholder="大尺寸" />
    </div>
  ),
}

/** 状态样式 */
export const Status: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-64">
      <Select options={fruitOptions} status="error" placeholder="错误状态" />
      <Select options={fruitOptions} status="warning" placeholder="警告状态" />
    </div>
  ),
}

/** 受控模式 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal<string | undefined>('banana')
    return (
      <div class="flex flex-col gap-4 w-64">
        <Select
          options={fruitOptions}
          value={value()}
          onChange={(v) => setValue(v as string)}
          placeholder="受控选择"
        />
        <p class="text-sm text-muted-foreground">当前值: {value() || '无'}</p>
      </div>
    )
  },
}

