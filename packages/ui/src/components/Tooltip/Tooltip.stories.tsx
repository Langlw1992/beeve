import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { createSignal } from 'solid-js'
import { Tooltip } from './Tooltip'
import { Button } from '../Button'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    arrow: {
      control: 'boolean',
    },
    openDelay: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
    },
    closeDelay: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
    },
    interactive: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Tooltip>

// ==================== Stories ====================

/**
 * ## 基础用法
 */
export const Default: Story = {
  args: {
    content: '这是一个提示文字',
    children: <Button variant="outline">悬停查看提示</Button>,
  },
}

/**
 * ## 带箭头
 */
export const WithArrow: Story = {
  args: {
    content: '带箭头的提示',
    arrow: true,
    children: <Button variant="outline">带箭头</Button>,
  },
}

/**
 * ## 不同位置
 */
export const Placements: Story = {
  render: () => (
    <div class="flex flex-wrap gap-4 p-8">
      <Tooltip content="Top" positioning={{ placement: 'top' }} arrow>
        <Button variant="outline" size="sm">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom" positioning={{ placement: 'bottom' }} arrow>
        <Button variant="outline" size="sm">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left" positioning={{ placement: 'left' }} arrow>
        <Button variant="outline" size="sm">Left</Button>
      </Tooltip>
      <Tooltip content="Right" positioning={{ placement: 'right' }} arrow>
        <Button variant="outline" size="sm">Right</Button>
      </Tooltip>
      <Tooltip content="Top Start" positioning={{ placement: 'top-start' }} arrow>
        <Button variant="outline" size="sm">Top Start</Button>
      </Tooltip>
      <Tooltip content="Top End" positioning={{ placement: 'top-end' }} arrow>
        <Button variant="outline" size="sm">Top End</Button>
      </Tooltip>
    </div>
  ),
}

/**
 * ## 可交互
 */
export const Interactive: Story = {
  args: {
    content: (
      <div class="flex flex-col gap-1">
        <span>可交互的提示</span>
        <a href="#example" class="text-primary underline">点击链接</a>
      </div>
    ),
    interactive: true,
    children: <Button variant="outline">可交互</Button>,
  },
}

/**
 * ## 自定义延迟
 */
export const CustomDelay: Story = {
  args: {
    content: '立即显示',
    openDelay: 0,
    closeDelay: 0,
    children: <Button variant="outline">无延迟</Button>,
  },
}

/**
 * ## 受控模式
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false)
    return (
      <div class="flex flex-col gap-4">
        <div class="flex gap-2">
          <Button size="sm" onClick={() => setOpen(true)}>显示</Button>
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>隐藏</Button>
        </div>
        <Tooltip
          content="受控的 Tooltip"
          open={open()}
          onOpenChange={(d) => setOpen(d.open)}
        >
          <Button variant="outline">受控模式</Button>
        </Tooltip>
      </div>
    )
  },
}

/**
 * ## 禁用状态
 */
export const Disabled: Story = {
  args: {
    content: '不会显示',
    disabled: true,
    children: <Button variant="outline">禁用 Tooltip</Button>,
  },
}

