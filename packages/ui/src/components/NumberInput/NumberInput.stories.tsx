import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { createSignal } from 'solid-js'
import { NumberInput } from './NumberInput'

const meta: Meta<typeof NumberInput> = {
  title: 'Components/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'filled', 'borderless'],
    },
    status: {
      control: 'select',
      options: [undefined, 'error', 'warning'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NumberInput>

// ==================== Stories ====================

/**
 * ## 基础用法
 */
export const Default: Story = {
  args: {
    placeholder: '请输入数字',
  },
}

/**
 * ## 设置范围
 */
export const WithRange: Story = {
  args: {
    min: 0,
    max: 100,
    defaultValue: 50,
    placeholder: '0-100',
  },
}

/**
 * ## 设置步长
 */
export const WithStep: Story = {
  args: {
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 25,
  },
}

/**
 * ## 尺寸
 */
export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-3 w-64">
      <NumberInput size="sm" placeholder="Small" defaultValue={10} />
      <NumberInput size="md" placeholder="Medium" defaultValue={20} />
      <NumberInput size="lg" placeholder="Large" defaultValue={30} />
    </div>
  ),
}

/**
 * ## 变体样式
 */
export const Variants: Story = {
  render: () => (
    <div class="flex flex-col gap-3 w-64">
      <NumberInput variant="default" placeholder="Default" />
      <NumberInput variant="filled" placeholder="Filled" />
      <NumberInput variant="borderless" placeholder="Borderless" />
    </div>
  ),
}

/**
 * ## 状态
 */
export const Status: Story = {
  render: () => (
    <div class="flex flex-col gap-3 w-64">
      <NumberInput placeholder="Normal" />
      <NumberInput status="error" placeholder="Error" />
      <NumberInput status="warning" placeholder="Warning" />
      <NumberInput disabled placeholder="Disabled" />
    </div>
  ),
}

/**
 * ## 隐藏控制按钮
 */
export const NoControls: Story = {
  args: {
    showControls: false,
    placeholder: '无控制按钮',
  },
}

/**
 * ## 受控模式
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal(42)
    return (
      <div class="flex flex-col gap-3 w-64">
        <NumberInput
          value={value()}
          onValueChange={(details) => setValue(details.valueAsNumber)}
          min={0}
          max={100}
        />
        <div class="text-xs text-muted-foreground">
          当前值: {value()}
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3 py-1 text-sm border rounded"
            onClick={() => setValue(0)}
          >
            重置为 0
          </button>
          <button
            type="button"
            class="px-3 py-1 text-sm border rounded"
            onClick={() => setValue(100)}
          >
            设为 100
          </button>
        </div>
      </div>
    )
  },
}

/**
 * ## 货币格式
 */
export const Currency: Story = {
  args: {
    defaultValue: 99.99,
    formatOptions: {
      style: 'currency',
      currency: 'CNY',
    },
    step: 0.01,
  },
}

/**
 * ## 百分比格式
 */
export const Percentage: Story = {
  args: {
    defaultValue: 0.25,
    formatOptions: {
      style: 'percent',
    },
    step: 0.01,
    min: 0,
    max: 1,
  },
}

