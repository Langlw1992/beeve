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
      <div style={{ width: '400px', padding: '40px 20px' }}>
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
 * 默认显示 tooltip（hover/dragging 时）
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
        <p class="text-sm text-muted-foreground mb-4">Small</p>
        <Slider size="sm" defaultValue={[30]} />
      </div>
      <div>
        <p class="text-sm text-muted-foreground mb-4">Medium (default)</p>
        <Slider size="md" defaultValue={[50]} />
      </div>
      <div>
        <p class="text-sm text-muted-foreground mb-4">Large</p>
        <Slider size="lg" defaultValue={[70]} />
      </div>
    </div>
  ),
}

/**
 * ## 带标签
 */
export const WithLabel: Story = {
  args: {
    label: '音量',
    defaultValue: [50],
    min: 0,
    max: 100,
  },
}

/**
 * ## 带输入框
 */
export const WithInput: Story = {
  args: {
    label: '亮度',
    defaultValue: [50],
    showInput: true,
    min: 0,
    max: 100,
  },
}

/**
 * ## 带刻度标记
 */
export const WithMarks: Story = {
  args: {
    label: '温度',
    defaultValue: [20],
    min: 0,
    max: 40,
    step: 5,
    marks: [
      { value: 0, label: '0°C' },
      { value: 10, label: '10°C' },
      { value: 20, label: '20°C' },
      { value: 30, label: '30°C' },
      { value: 40, label: '40°C' },
    ],
  },
}

/**
 * ## 范围选择
 */
export const Range: Story = {
  args: {
    label: '价格区间',
    defaultValue: [25, 75],
    showInput: true,
    inputWidth: '130px',
    min: 0,
    max: 100,
  },
}

/**
 * ## 自定义步长
 */
export const CustomStep: Story = {
  args: {
    label: '步长为 10',
    defaultValue: [50],
    step: 10,
    showInput: true,
    min: 0,
    max: 100,
  },
}

/**
 * ## 自定义 Tooltip 格式
 */
export const CustomTooltipFormat: Story = {
  args: {
    label: '折扣',
    defaultValue: [25],
    min: 0,
    max: 100,
    formatTooltip: (value) => `${value}%`,
  },
}

/**
 * ## 禁用状态
 */
export const Disabled: Story = {
  args: {
    label: '已禁用',
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
    showInput: true,
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
          label="受控滑块"
          value={value()}
          onValueChange={(details) => setValue(details.value)}
          showInput
        />
        <p class="text-sm text-muted-foreground">当前值: {value().join(', ')}</p>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md"
            onClick={() => setValue([0])}
          >
            重置为 0
          </button>
          <button
            type="button"
            class="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md"
            onClick={() => setValue([100])}
          >
            设为 100
          </button>
        </div>
      </div>
    )
  },
}

/**
 * ## 完整示例
 * 结合所有功能：标签、刻度、输入框、自定义格式
 */
export const FullExample: Story = {
  render: () => (
    <div class="space-y-8">
      <Slider
        label="CPU 限制"
        defaultValue={[2]}
        min={1}
        max={8}
        step={1}
        showInput
        inputWidth="60px"
        marks={[
          { value: 1, label: '1核' },
          { value: 2, label: '2核' },
          { value: 4, label: '4核' },
          { value: 8, label: '8核' },
        ]}
        formatTooltip={(v) => `${v} 核心`}
      />
      <Slider
        label="内存分配"
        defaultValue={[512, 2048]}
        min={256}
        max={4096}
        step={256}
        showInput
        inputWidth="140px"
        marks={[
          { value: 256, label: '256MB' },
          { value: 1024, label: '1GB' },
          { value: 2048, label: '2GB' },
          { value: 4096, label: '4GB' },
        ]}
        formatTooltip={(v) => (v >= 1024 ? `${v / 1024}GB` : `${v}MB`)}
      />
    </div>
  ),
}

