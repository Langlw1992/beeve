/**
 * Badge Component Showcase Page
 */

import {createFileRoute} from '@tanstack/solid-router'
import {Badge, type BadgeVariants} from '@beeve/ui'
import {ShowcaseGrid, ShowcaseSection} from '../components/ShowcaseGrid'

const colors: {
  value: NonNullable<BadgeVariants['color']>
  label: string
}[] = [
  {value: 'default', label: 'Default'},
  {value: 'blue', label: 'Blue'},
  {value: 'green', label: 'Green'},
  {value: 'orange', label: 'Orange'},
  {value: 'red', label: 'Red'},
]

const sizes: {value: NonNullable<BadgeVariants['size']>; label: string}[] = [
  {value: 'sm', label: 'Small'},
  {value: 'md', label: 'Medium'},
]

function BadgePage() {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Badge</h1>
        <p class="text-muted-foreground mt-2">
          徽标组件，用于展示状态标记或标签。
        </p>
      </div>

      {/* Cartesian Product Grid: Color x Size */}
      <ShowcaseGrid
        title="Color × Size"
        description="所有颜色与尺寸的笛卡尔积组合"
        variant1={{name: 'Color', values: colors}}
        variant2={{name: 'Size', values: sizes}}
        renderCell={(color, size) => (
          <Badge
            color={color}
            size={size}
            count={5}
          >
            <div class="size-8 rounded bg-muted" />
          </Badge>
        )}
      />

      {/* Usage Examples */}
      <ShowcaseSection
        title="使用场景"
        description="常见的徽标使用场景"
      >
        <div class="flex flex-wrap items-center gap-6">
          <Badge count={5}>
            <div class="size-10 rounded bg-muted" />
          </Badge>
          <Badge dot>
            <div class="size-10 rounded bg-muted" />
          </Badge>
          <Badge count={99}>
            <div class="size-10 rounded bg-muted" />
          </Badge>
          <Badge count={100}>
            <div class="size-10 rounded bg-muted" />
          </Badge>
        </div>
      </ShowcaseSection>

      {/* Status Badges */}
      <ShowcaseSection
        title="状态徽标"
        description="独立的状态指示器"
      >
        <div class="flex flex-wrap items-center gap-6">
          <Badge
            status="default"
            text="默认"
          />
          <Badge
            status="success"
            text="成功"
          />
          <Badge
            status="processing"
            text="处理中"
          />
          <Badge
            status="error"
            text="错误"
          />
          <Badge
            status="warning"
            text="警告"
          />
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/badge')({
  component: BadgePage,
})
