/**
 * Button 组件演示
 * 使用真实的 @beeve/ui 组件
 */

import { Button } from '@beeve/ui'
import type { Component } from 'solid-js'

export const ButtonVariants: Component = () => {
  return (
    <div class="flex flex-wrap gap-3 items-center">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}

export const ButtonSizes: Component = () => {
  return (
    <div class="flex flex-wrap gap-3 items-center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔔</Button>
    </div>
  )
}

export const ButtonStates: Component = () => {
  return (
    <div class="flex flex-wrap gap-3 items-center">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
    </div>
  )
}

export const ButtonWithIcons: Component = () => {
  return (
    <div class="flex flex-wrap gap-3 items-center">
      <Button>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </Button>
      <Button variant="outline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Upload
      </Button>
      <Button variant="secondary">
        Settings
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  )
}
