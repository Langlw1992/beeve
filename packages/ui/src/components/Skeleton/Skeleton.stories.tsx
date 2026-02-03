/**
 * @beeve/ui - Skeleton Stories
 */

import type {JSX} from 'solid-js'
import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {Skeleton} from './Skeleton'

/**
 * # Skeleton 骨架屏
 *
 * 在数据加载完成前显示占位内容，提升用户体验。
 *
 * ## 何时使用
 *
 * - 网络较慢时，需要长时间等待数据加载
 * - 图片、列表、卡片等内容尚未加载完成时的占位
 * - 避免页面布局跳动
 */
const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Skeleton>

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

/** 基础骨架屏 */
export const Basic: Story = {
  render: () => (
    <Section
      title="基础用法"
      description="通过 width 和 height 自定义尺寸"
    >
      <div class="w-[320px] space-y-3">
        <Skeleton
          width="100%"
          height={16}
        />
        <Skeleton
          width="85%"
          height={16}
        />
        <Skeleton
          width="70%"
          height={16}
        />
      </div>
    </Section>
  ),
}

/** 动画效果 */
export const Animations: Story = {
  render: () => (
    <div class="w-[320px] space-y-8">
      <Section
        title="Pulse 动画"
        description="默认脉冲动画效果"
      >
        <Skeleton
          width="100%"
          height={16}
          animation="pulse"
        />
      </Section>

      <Section
        title="Wave 动画"
        description="流光效果"
      >
        <Skeleton
          width="100%"
          height={16}
          animation="wave"
        />
      </Section>

      <Section
        title="无动画"
        description="静态占位"
      >
        <Skeleton
          width="100%"
          height={16}
          animation="none"
        />
      </Section>
    </div>
  ),
}

/** 文本骨架 */
export const TextSkeleton: Story = {
  name: 'Skeleton.Text',
  render: () => (
    <div class="w-[320px] space-y-8">
      <Section
        title="默认样式"
        description="3 行文本，最后一行 60% 宽度"
      >
        <Skeleton.Text />
      </Section>

      <Section
        title="自定义行数"
        description="5 行文本"
      >
        <Skeleton.Text rows={5} />
      </Section>

      <Section
        title="自定义末行宽度"
        description="最后一行 40% 宽度"
      >
        <Skeleton.Text
          rows={3}
          lastRowWidth="40%"
        />
      </Section>
    </div>
  ),
}

/** 头像骨架 */
export const AvatarSkeleton: Story = {
  name: 'Skeleton.Avatar',
  render: () => (
    <div class="space-y-8">
      <Section
        title="尺寸"
        description="sm / md / lg / 自定义"
      >
        <div class="flex items-end gap-6">
          <div class="text-center space-y-2">
            <Skeleton.Avatar size="sm" />
            <p class="text-xs text-muted-foreground">sm</p>
          </div>
          <div class="text-center space-y-2">
            <Skeleton.Avatar size="md" />
            <p class="text-xs text-muted-foreground">md</p>
          </div>
          <div class="text-center space-y-2">
            <Skeleton.Avatar size="lg" />
            <p class="text-xs text-muted-foreground">lg</p>
          </div>
          <div class="text-center space-y-2">
            <Skeleton.Avatar size={72} />
            <p class="text-xs text-muted-foreground">72px</p>
          </div>
        </div>
      </Section>

      <Section
        title="形状"
        description="圆形 / 方形"
      >
        <div class="flex items-center gap-6">
          <div class="text-center space-y-2">
            <Skeleton.Avatar
              shape="circle"
              size="lg"
            />
            <p class="text-xs text-muted-foreground">circle</p>
          </div>
          <div class="text-center space-y-2">
            <Skeleton.Avatar
              shape="square"
              size="lg"
            />
            <p class="text-xs text-muted-foreground">square</p>
          </div>
        </div>
      </Section>
    </div>
  ),
}

/** 按钮骨架 */
export const ButtonSkeleton: Story = {
  name: 'Skeleton.Button',
  render: () => (
    <Section
      title="按钮尺寸"
      description="sm / md / lg"
    >
      <div class="flex items-center gap-4">
        <div class="text-center space-y-2">
          <Skeleton.Button size="sm" />
          <p class="text-xs text-muted-foreground">sm</p>
        </div>
        <div class="text-center space-y-2">
          <Skeleton.Button size="md" />
          <p class="text-xs text-muted-foreground">md</p>
        </div>
        <div class="text-center space-y-2">
          <Skeleton.Button size="lg" />
          <p class="text-xs text-muted-foreground">lg</p>
        </div>
      </div>
    </Section>
  ),
}

/** 图片骨架 */
export const ImageSkeleton: Story = {
  name: 'Skeleton.Image',
  render: () => (
    <Section
      title="宽高比"
      description="常见图片比例"
    >
      <div class="grid grid-cols-3 gap-4 w-[480px]">
        <div class="space-y-2">
          <Skeleton.Image aspectRatio="16:9" />
          <p class="text-xs text-muted-foreground text-center">16:9</p>
        </div>
        <div class="space-y-2">
          <Skeleton.Image aspectRatio="4:3" />
          <p class="text-xs text-muted-foreground text-center">4:3</p>
        </div>
        <div class="space-y-2">
          <Skeleton.Image aspectRatio="1:1" />
          <p class="text-xs text-muted-foreground text-center">1:1</p>
        </div>
      </div>
    </Section>
  ),
}

/** 段落骨架 */
export const ParagraphSkeleton: Story = {
  name: 'Skeleton.Paragraph',
  render: () => (
    <div class="w-[320px] space-y-8">
      <Section
        title="带标题"
        description="标题 + 段落"
      >
        <Skeleton.Paragraph
          title
          rows={3}
        />
      </Section>

      <Section
        title="仅段落"
        description="无标题"
      >
        <Skeleton.Paragraph
          title={false}
          rows={4}
        />
      </Section>
    </div>
  ),
}

/** 卡片组合示例 */
export const CardExample: Story = {
  render: () => (
    <Section
      title="卡片加载"
      description="社交卡片骨架屏"
    >
      <div class="w-[320px] rounded-xl border border-border p-5 space-y-4 bg-card">
        <div class="flex items-center gap-3">
          <Skeleton.Avatar size="md" />
          <div class="flex-1 space-y-2">
            <Skeleton
              width="50%"
              height={14}
            />
            <Skeleton
              width="30%"
              height={12}
            />
          </div>
        </div>
        <Skeleton.Image aspectRatio="16:9" />
        <Skeleton.Text rows={2} />
        <div class="flex gap-3 pt-2">
          <Skeleton.Button size="sm" />
          <Skeleton.Button size="sm" />
        </div>
      </div>
    </Section>
  ),
}

/** 列表组合示例 */
export const ListExample: Story = {
  render: () => (
    <Section
      title="列表加载"
      description="列表项骨架屏"
    >
      <div class="w-[400px] space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            class="flex items-start gap-4 p-4 rounded-xl border border-border bg-card"
          >
            <Skeleton.Avatar size="lg" />
            <div class="flex-1 space-y-2 pt-1">
              <Skeleton
                width="60%"
                height={16}
              />
              <Skeleton
                width="100%"
                height={14}
              />
              <Skeleton
                width="75%"
                height={14}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  ),
}

/** Wave 动画组合 */
export const WaveAnimation: Story = {
  render: () => (
    <Section
      title="Wave 动画"
      description="流光效果组合"
    >
      <div class="w-[320px] rounded-xl border border-border p-5 space-y-4 bg-card">
        <div class="flex items-center gap-3">
          <Skeleton.Avatar
            size="md"
            animation="wave"
          />
          <div class="flex-1 space-y-2">
            <Skeleton
              width="50%"
              height={14}
              animation="wave"
            />
            <Skeleton
              width="30%"
              height={12}
              animation="wave"
            />
          </div>
        </div>
        <Skeleton.Paragraph
          title
          rows={3}
          animation="wave"
        />
      </div>
    </Section>
  ),
}
