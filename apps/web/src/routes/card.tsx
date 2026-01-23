/**
 * Card Component Showcase Page
 */

import { createFileRoute } from '@tanstack/solid-router'
import { Card, Button, type CardVariants } from '@beeve/ui'
import { ShowcaseGrid, ShowcaseSection } from '../components/ShowcaseGrid'

const variants: { value: NonNullable<CardVariants['variant']>; label: string }[] = [
  { value: 'elevated', label: 'Elevated' },
  { value: 'outlined', label: 'Outlined' },
  { value: 'filled', label: 'Filled' },
]

const sizes: { value: NonNullable<CardVariants['size']>; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

function CardPage() {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Card</h1>
        <p class="text-muted-foreground mt-2">
          卡片容器组件，用于展示内容块。
        </p>
      </div>

      {/* Cartesian Product Grid: Variant x Size */}
      <ShowcaseGrid
        title="Variant × Size"
        description="所有样式变体与尺寸的笛卡尔积组合"
        variant1={{ name: 'Variant', values: variants }}
        variant2={{ name: 'Size', values: sizes }}
        renderCell={(variant, size) => (
          <Card variant={variant} size={size} title="标题" class="w-48">
            <p class="text-sm text-muted-foreground">卡片内容</p>
          </Card>
        )}
      />

      {/* Basic Card */}
      <ShowcaseSection title="基础卡片" description="带标题和描述的卡片">
        <Card title="卡片标题" description="这是卡片的描述信息" class="w-80">
          <p>这是卡片的主要内容区域。</p>
        </Card>
      </ShowcaseSection>

      {/* Card with Extra */}
      <ShowcaseSection title="带操作的卡片" description="标题栏右侧可以添加额外内容">
        <Card
          title="项目设置"
          extra={<Button size="sm" variant="outline">编辑</Button>}
          class="w-80"
        >
          <p class="text-sm text-muted-foreground">管理项目的基本配置。</p>
        </Card>
      </ShowcaseSection>

      {/* Card with Footer */}
      <ShowcaseSection title="带底部的卡片" description="卡片可以有底部操作区">
        <Card
          title="确认操作"
          footer="上次更新: 2024-01-01"
          actions={
            <>
              <Button size="sm" variant="ghost">取消</Button>
              <Button size="sm">确认</Button>
            </>
          }
          class="w-80"
        >
          <p class="text-sm text-muted-foreground">请确认您的操作。</p>
        </Card>
      </ShowcaseSection>

      {/* Hoverable Card */}
      <ShowcaseSection title="可悬停卡片" description="鼠标悬停时有阴影效果">
        <Card title="可点击卡片" hoverable class="w-80" onClick={() => alert('点击了卡片')}>
          <p class="text-sm text-muted-foreground">点击此卡片查看效果。</p>
        </Card>
      </ShowcaseSection>

      {/* Loading Card */}
      <ShowcaseSection title="加载状态" description="卡片可以显示加载骨架屏">
        <Card loading class="w-80" />
      </ShowcaseSection>

      {/* Card with Cover */}
      <ShowcaseSection title="带封面的卡片" description="卡片可以有封面图片">
        <Card
          title="风景照片"
          description="美丽的自然风光"
          cover="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
          coverAlt="山脉风景"
          class="w-80"
        >
          <p class="text-sm text-muted-foreground">这是一张美丽的风景照片。</p>
        </Card>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/card')({
  component: CardPage,
})
