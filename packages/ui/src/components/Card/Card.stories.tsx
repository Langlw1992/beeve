/**
 * @beeve/ui - Card Stories
 */

import type {JSX} from 'solid-js'
import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {Card} from './Card'
import {Button} from '../Button'
import {MoreHorizontal, Heart, MessageCircle, Share2} from 'lucide-solid'
import {toast, Toaster} from '../Toast'

/**
 * # Card 卡片
 *
 * 通用卡片容器，用于承载内容和操作。
 *
 * ## 何时使用
 *
 * - 需要一个容器来承载内容
 * - 内容需要有明确的边界
 * - 需要展示图片、标题、描述等结构化内容
 */
const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

// ==================== 辅助组件 ====================

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

/** 基础卡片 */
export const Basic: Story = {
  render: () => (
    <Section
      title="基础用法"
      description="带标题的简单卡片"
    >
      <Card
        title="卡片标题"
        class="w-[320px]"
      >
        <p class="text-muted-foreground text-sm">
          这是卡片的内容区域，可以放置任何内容。卡片提供了一个清晰的容器边界。
        </p>
      </Card>
    </Section>
  ),
}

/** 带描述的卡片 */
export const WithDescription: Story = {
  render: () => (
    <Section
      title="带描述"
      description="标题下方显示描述信息"
    >
      <Card
        title="卡片标题"
        description="这是卡片的描述信息，用于补充说明"
        class="w-[320px]"
      >
        <p class="text-muted-foreground text-sm">卡片内容区域。</p>
      </Card>
    </Section>
  ),
}

/** 带操作的卡片 */
export const WithExtra: Story = {
  render: () => (
    <Section
      title="带操作"
      description="标题栏右侧可放置操作按钮"
    >
      <Card
        title="卡片标题"
        extra={
          <Button
            variant="ghost"
            size="icon"
          >
            <MoreHorizontal class="size-4" />
          </Button>
        }
        class="w-[320px]"
      >
        <p class="text-muted-foreground text-sm">
          标题栏右侧可以放置操作按钮或其他内容。
        </p>
      </Card>
    </Section>
  ),
}

/** 变体 */
export const Variants: Story = {
  render: () => (
    <Section
      title="变体样式"
      description="outlined / elevated / filled"
    >
      <div class="flex gap-5">
        <Card
          variant="outlined"
          title="Outlined"
          class="w-[200px]"
        >
          <p class="text-sm text-muted-foreground">带边框的卡片</p>
        </Card>

        <Card
          variant="elevated"
          title="Elevated"
          class="w-[200px]"
        >
          <p class="text-sm text-muted-foreground">带阴影的卡片</p>
        </Card>

        <Card
          variant="filled"
          title="Filled"
          class="w-[200px]"
        >
          <p class="text-sm text-muted-foreground">填充背景的卡片</p>
        </Card>
      </div>
    </Section>
  ),
}

/** 尺寸 */
export const Sizes: Story = {
  render: () => (
    <Section
      title="尺寸"
      description="sm / md / lg 不同内边距"
    >
      <div class="flex items-start gap-5">
        <Card
          size="sm"
          title="Small"
          class="w-[180px]"
        >
          <p class="text-sm text-muted-foreground">小尺寸</p>
        </Card>

        <Card
          size="md"
          title="Medium"
          class="w-[200px]"
        >
          <p class="text-sm text-muted-foreground">中尺寸</p>
        </Card>

        <Card
          size="lg"
          title="Large"
          class="w-[220px]"
        >
          <p class="text-sm text-muted-foreground">大尺寸</p>
        </Card>
      </div>
    </Section>
  ),
}

/** 带封面的卡片 */
export const WithCover: Story = {
  render: () => (
    <Section
      title="封面图片"
      description="顶部或底部封面"
    >
      <div class="flex gap-5">
        <Card
          cover="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
          coverAlt="山景"
          title="顶部封面"
          class="w-[280px]"
        >
          <p class="text-muted-foreground text-sm">封面图片在标题上方显示。</p>
        </Card>

        <Card
          cover="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
          coverAlt="山景"
          coverPosition="bottom"
          title="底部封面"
          class="w-[280px]"
        >
          <p class="text-muted-foreground text-sm">封面图片在内容下方显示。</p>
        </Card>
      </div>
    </Section>
  ),
}

/** 带底部的卡片 */
export const WithFooter: Story = {
  render: () => (
    <Section
      title="底部区域"
      description="footer 和 actions"
    >
      <Card
        title="卡片标题"
        footer={
          <span class="text-sm text-muted-foreground">更新于 2 小时前</span>
        }
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
            >
              取消
            </Button>
            <Button size="sm">确定</Button>
          </>
        }
        class="w-[320px]"
      >
        <p class="text-muted-foreground text-sm">
          底部可以放置时间戳、操作按钮等内容。
        </p>
      </Card>
    </Section>
  ),
}

/** 加载状态 */
export const Loading: Story = {
  render: () => (
    <Section
      title="加载状态"
      description="集成 Skeleton 骨架屏"
    >
      <div class="flex gap-5">
        <Card
          loading
          class="w-[280px]"
        />

        <Card
          loading
          loadingConfig={{avatar: true, rows: 2}}
          class="w-[280px]"
        />
      </div>
    </Section>
  ),
}

/** 可点击卡片 */
export const Hoverable: Story = {
  render: () => (
    <>
      <Toaster />
      <Section
        title="可点击"
        description="鼠标悬停显示阴影效果"
      >
        <Card
          hoverable
          title="可点击卡片"
          onClick={() => toast.info('卡片被点击了')}
          class="w-[320px]"
        >
          <p class="text-muted-foreground text-sm">
            鼠标悬停时会有阴影效果，点击可触发事件。
          </p>
        </Card>
      </Section>
    </>
  ),
}

/** 社交卡片示例 */
export const SocialCard: Story = {
  render: () => (
    <Section
      title="社交卡片"
      description="实际应用场景"
    >
      <Card
        cover="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=250&fit=crop"
        coverAlt="风景"
        class="w-[320px]"
      >
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
            <div>
              <p class="font-medium text-sm">用户名</p>
              <p class="text-xs text-muted-foreground">2 小时前</p>
            </div>
          </div>
          <p class="text-sm text-muted-foreground leading-relaxed">
            这是一张美丽的风景照片，记录了大自然的壮丽景色。
          </p>
          <div class="flex items-center gap-5 pt-1">
            <button
              type="button"
              class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Heart class="size-[18px]" /> <span>128</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle class="size-[18px]" /> <span>24</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 class="size-[18px]" />
            </button>
          </div>
        </div>
      </Card>
    </Section>
  ),
}

/** 产品卡片示例 */
export const ProductCard: Story = {
  render: () => (
    <Section
      title="产品卡片"
      description="电商场景"
    >
      <Card
        cover="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
        coverAlt="产品图片"
        hoverable
        class="w-[280px]"
      >
        <div class="space-y-3">
          <p class="text-xs text-muted-foreground">电子产品</p>
          <h3 class="font-semibold">智能手表 Pro</h3>
          <p class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            全新一代智能手表，支持心率监测、GPS 定位、防水等多种功能。
          </p>
          <div class="flex items-center justify-between pt-2">
            <span class="text-lg font-bold text-primary">¥1,299</span>
            <Button size="sm">加入购物车</Button>
          </div>
        </div>
      </Card>
    </Section>
  ),
}

/** 卡片列表 */
export const CardList: Story = {
  render: () => (
    <Section
      title="卡片列表"
      description="网格布局"
    >
      <div class="grid grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            hoverable
            title={`卡片 ${i}`}
            description="卡片描述信息"
            class="w-[200px]"
          >
            <p class="text-sm text-muted-foreground">卡片内容</p>
          </Card>
        ))}
      </div>
    </Section>
  ),
}
