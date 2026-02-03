/**
 * @beeve/ui - Badge Stories
 */

import type {JSX} from 'solid-js'
import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {Badge} from './Badge'
import {
  Bell,
  Mail,
  ShoppingCart,
  MessageSquare,
  Settings,
  Heart,
} from 'lucide-solid'
import {Button} from '../Button'

/**
 * # Badge 徽标
 *
 * 用于展示状态标记，如未读消息数、在线状态等。
 *
 * ## 何时使用
 *
 * - 需要展示未读消息数量
 * - 需要展示状态标记（如在线/离线）
 * - 需要在图标或头像上添加状态指示
 */
const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

// ==================== 辅助组件 ====================

/** 图标按钮容器 */
const IconButton = (props: {children: JSX.Element}) => (
  <div class="flex size-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
    {props.children}
  </div>
)

/** 头像占位 */
const Avatar = (props: {size?: 'sm' | 'md' | 'lg'}) => {
  const sizes = {sm: 'size-8', md: 'size-10', lg: 'size-12'}
  return (
    <div
      class={`${sizes[props.size ?? 'md']} rounded-full bg-gradient-to-br from-blue-400 to-blue-600`}
    />
  )
}

/** Story 区块 */
const Section = (props: {
  title: string
  description?: string
  children: JSX.Element
}) => (
  <div class="space-y-4">
    <div>
      <h3 class="text-sm font-medium text-foreground">{props.title}</h3>
      {props.description && (
        <p class="text-xs text-muted-foreground mt-1">{props.description}</p>
      )}
    </div>
    {props.children}
  </div>
)

// ==================== Stories ====================

/** 基础用法 - 在图标上显示数字徽标 */
export const Basic: Story = {
  render: () => (
    <div class="flex items-center gap-10">
      <Badge count={5}>
        <IconButton>
          <Bell class="size-6" />
        </IconButton>
      </Badge>

      <Badge count={12}>
        <IconButton>
          <Mail class="size-6" />
        </IconButton>
      </Badge>

      <Badge count={99}>
        <IconButton>
          <ShoppingCart class="size-6" />
        </IconButton>
      </Badge>
    </div>
  ),
}

/** 数字溢出处理 */
export const Overflow: Story = {
  render: () => (
    <Section
      title="溢出处理"
      description="超过 overflowCount 时显示为 99+"
    >
      <div class="flex items-center gap-10">
        <Badge count={99}>
          <IconButton>
            <Mail class="size-6" />
          </IconButton>
        </Badge>

        <Badge count={100}>
          <IconButton>
            <Mail class="size-6" />
          </IconButton>
        </Badge>

        <Badge
          count={1000}
          overflowCount={999}
        >
          <IconButton>
            <Mail class="size-6" />
          </IconButton>
        </Badge>
      </div>
    </Section>
  ),
}

/** 小红点模式 */
export const Dot: Story = {
  render: () => (
    <Section
      title="小红点"
      description="不显示具体数字，仅显示红点提示"
    >
      <div class="flex items-center gap-10">
        <Badge dot>
          <IconButton>
            <Bell class="size-6" />
          </IconButton>
        </Badge>

        <Badge dot>
          <IconButton>
            <Mail class="size-6" />
          </IconButton>
        </Badge>

        <Badge dot>
          <IconButton>
            <MessageSquare class="size-6" />
          </IconButton>
        </Badge>
      </div>
    </Section>
  ),
}

/** 颜色 */
export const Colors: Story = {
  render: () => (
    <Section
      title="自定义颜色"
      description="支持多种预设颜色"
    >
      <div class="flex items-center gap-10">
        <Badge
          count={5}
          color="red"
        >
          <IconButton>
            <Bell class="size-6" />
          </IconButton>
        </Badge>

        <Badge
          count={5}
          color="blue"
        >
          <IconButton>
            <Bell class="size-6" />
          </IconButton>
        </Badge>

        <Badge
          count={5}
          color="green"
        >
          <IconButton>
            <Bell class="size-6" />
          </IconButton>
        </Badge>

        <Badge
          count={5}
          color="orange"
        >
          <IconButton>
            <Bell class="size-6" />
          </IconButton>
        </Badge>
      </div>
    </Section>
  ),
}

/** 尺寸 */
export const Sizes: Story = {
  render: () => (
    <Section
      title="尺寸"
      description="small 和 default 两种尺寸"
    >
      <div class="flex items-center gap-12">
        <div class="text-center space-y-3">
          <Badge
            count={5}
            size="sm"
          >
            <IconButton>
              <Bell class="size-6" />
            </IconButton>
          </Badge>
          <p class="text-xs text-muted-foreground">small</p>
        </div>

        <div class="text-center space-y-3">
          <Badge
            count={5}
            size="md"
          >
            <IconButton>
              <Bell class="size-6" />
            </IconButton>
          </Badge>
          <p class="text-xs text-muted-foreground">default</p>
        </div>
      </div>
    </Section>
  ),
}

/** 状态点 - 独立使用 */
export const StatusBadge: Story = {
  render: () => (
    <Section
      title="状态点"
      description="独立使用，展示状态信息"
    >
      <div class="space-y-3">
        <Badge
          status="success"
          text="已完成"
        />
        <Badge
          status="processing"
          text="进行中"
        />
        <Badge
          status="default"
          text="待处理"
        />
        <Badge
          status="warning"
          text="警告"
        />
        <Badge
          status="error"
          text="错误"
        />
      </div>
    </Section>
  ),
}

/** 显示零值 */
export const ShowZero: Story = {
  render: () => (
    <Section
      title="零值显示"
      description="默认隐藏零值，可通过 showZero 显示"
    >
      <div class="flex items-center gap-12">
        <div class="text-center space-y-3">
          <Badge count={0}>
            <IconButton>
              <Mail class="size-6" />
            </IconButton>
          </Badge>
          <p class="text-xs text-muted-foreground">隐藏</p>
        </div>

        <div class="text-center space-y-3">
          <Badge
            count={0}
            showZero
          >
            <IconButton>
              <Mail class="size-6" />
            </IconButton>
          </Badge>
          <p class="text-xs text-muted-foreground">showZero</p>
        </div>
      </div>
    </Section>
  ),
}

/** 位置 */
export const Placement: Story = {
  render: () => (
    <Section
      title="位置"
      description="支持四个角落的位置"
    >
      <div class="flex items-center gap-10">
        <div class="text-center space-y-2">
          <Badge
            count={1}
            placement="top-right"
          >
            <Avatar size="lg" />
          </Badge>
          <p class="text-xs text-muted-foreground">右上</p>
        </div>

        <div class="text-center space-y-2">
          <Badge
            count={1}
            placement="top-left"
          >
            <Avatar size="lg" />
          </Badge>
          <p class="text-xs text-muted-foreground">左上</p>
        </div>

        <div class="text-center space-y-2">
          <Badge
            count={1}
            placement="bottom-right"
          >
            <Avatar size="lg" />
          </Badge>
          <p class="text-xs text-muted-foreground">右下</p>
        </div>

        <div class="text-center space-y-2">
          <Badge
            count={1}
            placement="bottom-left"
          >
            <Avatar size="lg" />
          </Badge>
          <p class="text-xs text-muted-foreground">左下</p>
        </div>
      </div>
    </Section>
  ),
}

/** 用户头像在线状态 */
export const OnlineStatus: Story = {
  render: () => (
    <Section
      title="在线状态"
      description="头像配合小红点显示用户状态"
    >
      <div class="flex items-center gap-10">
        <Badge
          dot
          color="green"
          placement="bottom-right"
        >
          <Avatar size="lg" />
        </Badge>

        <Badge
          dot
          color="orange"
          placement="bottom-right"
        >
          <Avatar size="lg" />
        </Badge>

        <Badge
          dot
          color="default"
          placement="bottom-right"
        >
          <Avatar size="lg" />
        </Badge>
      </div>
    </Section>
  ),
}

/** 按钮上的徽标 */
export const WithButton: Story = {
  render: () => (
    <Section
      title="按钮徽标"
      description="在按钮上显示通知数"
    >
      <div class="flex items-center gap-6">
        <Badge count={5}>
          <Button
            variant="outline"
            size="icon"
          >
            <Bell class="size-4" />
          </Button>
        </Badge>

        <Badge dot>
          <Button
            variant="outline"
            size="icon"
          >
            <Settings class="size-4" />
          </Button>
        </Badge>

        <Badge count={99}>
          <Button variant="outline">
            消息 <Mail class="size-4 ml-2" />
          </Button>
        </Badge>
      </div>
    </Section>
  ),
}

/** 综合示例 - 导航栏 */
export const NavbarExample: Story = {
  render: () => (
    <Section
      title="导航栏示例"
      description="实际应用场景"
    >
      <div class="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
        >
          <Badge dot>
            <Bell class="size-5" />
          </Badge>
        </Button>

        <Button
          variant="ghost"
          size="icon"
        >
          <Badge count={3}>
            <Mail class="size-5" />
          </Badge>
        </Button>

        <Button
          variant="ghost"
          size="icon"
        >
          <Badge count={12}>
            <MessageSquare class="size-5" />
          </Badge>
        </Button>

        <Button
          variant="ghost"
          size="icon"
        >
          <Heart class="size-5" />
        </Button>
      </div>
    </Section>
  ),
}
