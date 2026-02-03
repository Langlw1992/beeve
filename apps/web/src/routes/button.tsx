/**
 * Button Component Showcase Page
 */

import {For} from 'solid-js'
import {createFileRoute} from '@tanstack/solid-router'
import {Button, type ButtonVariants} from '@beeve/ui'
import {ShowcaseGrid, ShowcaseSection} from '../components/ShowcaseGrid'

const variants: {
  value: NonNullable<ButtonVariants['variant']>
  label: string
}[] = [
  {value: 'primary', label: 'Primary'},
  {value: 'secondary', label: 'Secondary'},
  {value: 'outline', label: 'Outline'},
  {value: 'ghost', label: 'Ghost'},
  {value: 'destructive', label: 'Destructive'},
  {value: 'link', label: 'Link'},
]

const sizes: {value: NonNullable<ButtonVariants['size']>; label: string}[] = [
  {value: 'sm', label: 'Small (28px)'},
  {value: 'md', label: 'Medium (32px)'},
  {value: 'lg', label: 'Large (36px)'},
  {value: 'icon', label: 'Icon (32px)'},
]

function ButtonPage() {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Button</h1>
        <p class="text-muted-foreground mt-2">
          按钮组件，支持多种样式变体和尺寸。
        </p>
      </div>

      {/* Cartesian Product Grid: Variant x Size */}
      <ShowcaseGrid
        title="Variant × Size"
        description="所有样式变体与尺寸的笛卡尔积组合"
        variant1={{name: 'Variant', values: variants}}
        variant2={{name: 'Size', values: sizes}}
        renderCell={(variant, size) => (
          <Button
            variant={variant}
            size={size}
          >
            {size === 'icon' ? '🔔' : variant}
          </Button>
        )}
      />

      {/* Loading State */}
      <ShowcaseSection
        title="Loading State"
        description="按钮加载状态"
      >
        <div class="flex flex-wrap gap-4">
          <For each={variants}>
            {(v) => (
              <Button
                variant={v.value}
                loading
              >
                {v.label}
              </Button>
            )}
          </For>
        </div>
      </ShowcaseSection>

      {/* Disabled State */}
      <ShowcaseSection
        title="Disabled State"
        description="按钮禁用状态"
      >
        <div class="flex flex-wrap gap-4">
          <For each={variants}>
            {(v) => (
              <Button
                variant={v.value}
                disabled
              >
                {v.label}
              </Button>
            )}
          </For>
        </div>
      </ShowcaseSection>

      {/* With Icons */}
      <ShowcaseSection
        title="With Icons"
        description="带图标的按钮"
      >
        <div class="flex flex-wrap gap-4">
          <Button variant="primary">
            <span>🚀</span> Launch
          </Button>
          <Button variant="secondary">
            <span>📦</span> Package
          </Button>
          <Button variant="outline">
            <span>⚙️</span> Settings
          </Button>
          <Button variant="ghost">
            <span>🔍</span> Search
          </Button>
          <Button variant="destructive">
            <span>🗑️</span> Delete
          </Button>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/button')({
  component: ButtonPage,
})
