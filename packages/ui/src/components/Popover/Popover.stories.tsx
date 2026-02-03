import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {createSignal} from 'solid-js'
import {Popover, PopoverTitle, PopoverDescription} from './Popover'
import {Button} from '../Button'
import {Input} from '../Input'
import {Label} from '../Label'

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
    },
    arrow: {
      control: 'boolean',
    },
    modal: {
      control: 'boolean',
    },
    closeOnInteractOutside: {
      control: 'boolean',
    },
    closeOnEscape: {
      control: 'boolean',
    },
    openDelay: {
      control: {type: 'number', min: 0, max: 2000, step: 100},
    },
    closeDelay: {
      control: {type: 'number', min: 0, max: 1000, step: 50},
    },
  },
}

export default meta
type Story = StoryObj<typeof Popover>

// ==================== Stories ====================

/**
 * ## 基础用法
 */
export const Default: Story = {
  args: {
    content: (
      <div class="space-y-2">
        <PopoverTitle>气泡卡片标题</PopoverTitle>
        <PopoverDescription>这是气泡卡片的描述内容。</PopoverDescription>
      </div>
    ),
    children: <Button variant="outline">点击打开</Button>,
  },
}

/**
 * ## 带箭头
 */
export const WithArrow: Story = {
  args: {
    content: (
      <div class="space-y-2">
        <PopoverTitle>带箭头的气泡卡片</PopoverTitle>
        <PopoverDescription>箭头会指向触发元素。</PopoverDescription>
      </div>
    ),
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
      <Popover
        content={<PopoverDescription>顶部弹出</PopoverDescription>}
        positioning={{placement: 'top'}}
        arrow
      >
        <Button
          variant="outline"
          size="sm"
        >
          Top
        </Button>
      </Popover>
      <Popover
        content={<PopoverDescription>底部弹出</PopoverDescription>}
        positioning={{placement: 'bottom'}}
        arrow
      >
        <Button
          variant="outline"
          size="sm"
        >
          Bottom
        </Button>
      </Popover>
      <Popover
        content={<PopoverDescription>左侧弹出</PopoverDescription>}
        positioning={{placement: 'left'}}
        arrow
      >
        <Button
          variant="outline"
          size="sm"
        >
          Left
        </Button>
      </Popover>
      <Popover
        content={<PopoverDescription>右侧弹出</PopoverDescription>}
        positioning={{placement: 'right'}}
        arrow
      >
        <Button
          variant="outline"
          size="sm"
        >
          Right
        </Button>
      </Popover>
    </div>
  ),
}

/**
 * ## 表单内容
 */
export const WithForm: Story = {
  render: () => (
    <Popover
      content={
        <div class="space-y-4">
          <PopoverTitle>编辑信息</PopoverTitle>
          <div class="space-y-2">
            <Label for="name">名称</Label>
            <Input
              id="name"
              placeholder="请输入名称"
            />
          </div>
          <div class="space-y-2">
            <Label for="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱"
            />
          </div>
          <div class="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
            >
              取消
            </Button>
            <Button size="sm">保存</Button>
          </div>
        </div>
      }
    >
      <Button variant="outline">编辑</Button>
    </Popover>
  ),
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
          <Button
            size="sm"
            onClick={() => setOpen(true)}
          >
            打开
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            关闭
          </Button>
        </div>
        <Popover
          content={
            <div class="space-y-2">
              <PopoverTitle>受控模式</PopoverTitle>
              <PopoverDescription>
                通过外部状态控制显示/隐藏。
              </PopoverDescription>
            </div>
          }
          open={open()}
          onOpenChange={(d) => setOpen(d.open)}
        >
          <Button variant="outline">受控 Popover</Button>
        </Popover>
      </div>
    )
  },
}

/**
 * ## 模态模式
 */
export const Modal: Story = {
  args: {
    content: (
      <div class="space-y-2">
        <PopoverTitle>模态模式</PopoverTitle>
        <PopoverDescription>
          模态模式下会阻止外部交互，必须先关闭 Popover。
        </PopoverDescription>
      </div>
    ),
    modal: true,
    children: <Button variant="outline">模态 Popover</Button>,
  },
}

/**
 * ## Hover 触发
 * 使用 `trigger="hover"` 开启悬停触发模式
 */
export const HoverTrigger: Story = {
  args: {
    trigger: 'hover',
    content: (
      <div class="space-y-2">
        <PopoverTitle>悬停触发</PopoverTitle>
        <PopoverDescription>鼠标悬停时自动显示。</PopoverDescription>
      </div>
    ),
    arrow: true,
    children: <Button variant="outline">悬停显示</Button>,
  },
}

/**
 * ## Hover 触发 - 自定义延迟
 */
export const HoverWithDelay: Story = {
  render: () => (
    <div class="flex gap-4">
      <Popover
        trigger="hover"
        openDelay={0}
        closeDelay={0}
        arrow
        content={<PopoverDescription>立即显示</PopoverDescription>}
      >
        <Button variant="outline">无延迟</Button>
      </Popover>
      <Popover
        trigger="hover"
        openDelay={500}
        closeDelay={200}
        arrow
        content={<PopoverDescription>延迟 500ms 显示</PopoverDescription>}
      >
        <Button variant="outline">500ms 延迟</Button>
      </Popover>
    </div>
  ),
}
