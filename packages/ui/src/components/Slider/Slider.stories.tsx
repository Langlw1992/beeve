import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { createSignal } from 'solid-js'
import { Slider } from './Slider'

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '滑块尺寸',
    },
    min: {
      control: 'number',
      description: '最小值',
    },
    max: {
      control: 'number',
      description: '最大值',
    },
    step: {
      control: 'number',
      description: '步长',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    showTooltip: {
      control: 'boolean',
      description: '是否显示 tooltip',
    },
    showInput: {
      control: 'boolean',
      description: '是否显示输入框',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Slider>

// ==================== Stories ====================

/**
 * ## 基础用法
 */
export const Default: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
  },
}

/**
 * ## 不同尺寸
 */
export const Sizes: Story = {
  render: () => (
    <div class="space-y-8">
      <div>
        <p class="text-sm text-muted-foreground mb-2">Small</p>
        <Slider size="sm" defaultValue={[30]} />
      </div>
      <div>
        <p class="text-sm text-muted-foreground mb-2">Medium (default)</p>
        <Slider size="md" defaultValue={[50]} />
      </div>
      <div>
        <p class="text-sm text-muted-foreground mb-2">Large</p>
        <Slider size="lg" defaultValue={[70]} />
      </div>
    </div>
  ),
}

/**
 * ## 带输入框
 */
export const WithInput: Story = {
  args: {
    defaultValue: [50],
    showInput: true,
    min: 0,
    max: 100,
  },
}

/**
 * ## 范围选择
 */
export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    showInput: true,
    inputWidth: '120px',
    min: 0,
    max: 100,
  },
}

/**
 * ## 自定义步长
 */
export const CustomStep: Story = {
  args: {
    defaultValue: [50],
    step: 10,
    showInput: true,
    min: 0,
    max: 100,
  },
}

/**
 * ## 禁用状态
 */
export const Disabled: Story = {
  args: {
    defaultValue: [50],
    disabled: true,
  },
}

/**
 * ## 不显示 Tooltip
 */
export const NoTooltip: Story = {
  args: {
    defaultValue: [50],
    showTooltip: false,
  },
}

/**
 * ## 受控模式
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal([50])
    return (
      <div class="space-y-4">
        <Slider
          value={value()}
          onValueChange={(details) => setValue(details.value)}
          showInput
        />
        <p class="text-sm text-muted-foreground">
          当前值: {value().join(', ')}
        </p>
      </div>
    )
  },
}

