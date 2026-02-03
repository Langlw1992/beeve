/**
 * Badge Component Showcase Page
 */

import {For} from 'solid-js'
import {createFileRoute} from '@tanstack/solid-router'
import {Badge, type BadgeVariants} from '@beeve/ui'
import {ShowcaseGrid, ShowcaseSection} from '../components/ShowcaseGrid'

const variants: {
  value: NonNullable<BadgeVariants['variant']>
  label: string
}[] = [
  {value: 'default', label: 'Default'},
  {value: 'secondary', label: 'Secondary'},
  {value: 'outline', label: 'Outline'},
  {value: 'success', label: 'Success'},
  {value: 'warning', label: 'Warning'},
  {value: 'error', label: 'Error'},
]

const sizes: {value: NonNullable<BadgeVariants['size']>; label: string}[] = [
  {value: 'sm', label: 'Small (20px)'},
  {value: 'md', label: 'Medium (24px)'},
  {value: 'lg', label: 'Large (28px)'},
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

      {/* Cartesian Product Grid: Variant x Size */}
      <ShowcaseGrid
        title="Variant × Size"
        description="所有样式变体与尺寸的笛卡尔积组合"
        variant1={{name: 'Variant', values: variants}}
        variant2={{name: 'Size', values: sizes}}
        renderCell={(variant, size) => (
          <Badge
            variant={variant}
            size={size}
          >
            {variant}
          </Badge>
        )}
      />

      {/* Usage Examples */}
      <ShowcaseSection
        title="使用场景"
        description="常见的徽标使用场景"
      >
        <div class="flex flex-wrap items-center gap-4">
          <Badge>新功能</Badge>
          <Badge variant="success">已完成</Badge>
          <Badge variant="warning">待审核</Badge>
          <Badge variant="error">已过期</Badge>
          <Badge variant="outline">草稿</Badge>
        </div>
      </ShowcaseSection>

      {/* With Icons */}
      <ShowcaseSection
        title="带图标"
        description="徽标可以包含图标"
      >
        <div class="flex flex-wrap items-center gap-4">
          <Badge variant="success">
            <span>✓</span> 成功
          </Badge>
          <Badge variant="error">
            <span>✕</span> 失败
          </Badge>
          <Badge variant="warning">
            <span>⚠</span> 警告
          </Badge>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/badge')({
  component: BadgePage,
})
