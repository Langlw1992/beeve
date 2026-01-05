/**
 * Home Page - Component Overview
 */

import { For } from 'solid-js'
import { createFileRoute, Link } from '@tanstack/solid-router'

const componentRoutes = [
  { path: '/button', label: 'Button' },
  { path: '/input', label: 'Input' },
  { path: '/select', label: 'Select' },
  { path: '/checkbox', label: 'Checkbox' },
  { path: '/switch', label: 'Switch' },
  { path: '/radio', label: 'Radio' },
  { path: '/slider', label: 'Slider' },
  { path: '/label', label: 'Label' },
  { path: '/dialog', label: 'Dialog' },
  { path: '/tooltip', label: 'Tooltip' },
] as const

function HomeComponent() {
  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold">Beeve UI Components</h1>
        <p class="text-muted-foreground mt-2">
          组件库示例展示，支持主题切换、圆角调整等参数配置。
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <For each={componentRoutes}>
          {(route) => (
            <Link
              to={route.path}
              class="p-6 border rounded-[var(--radius-lg)] bg-card text-left hover:border-primary/50 transition-colors group"
            >
              <h3 class="text-lg font-semibold group-hover:text-primary transition-colors">
                {route.label}
              </h3>
              <p class="text-sm text-muted-foreground mt-1">
                View all {route.label.toLowerCase()} variants
              </p>
            </Link>
          )}
        </For>
      </div>

      <div class="border-t pt-8">
        <h2 class="text-xl font-semibold mb-4">Features</h2>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <li class="flex items-center gap-2">
            <span class="text-primary">✓</span>
            笛卡尔积展示所有变体组合
          </li>
          <li class="flex items-center gap-2">
            <span class="text-primary">✓</span>
            实时主题切换 (Light / Dark / System)
          </li>
          <li class="flex items-center gap-2">
            <span class="text-primary">✓</span>
            多种主题色和基础色选择
          </li>
          <li class="flex items-center gap-2">
            <span class="text-primary">✓</span>
            可调节圆角大小
          </li>
        </ul>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

