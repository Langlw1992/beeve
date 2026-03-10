import {Outlet, createRootRoute} from '@tanstack/solid-router'
import type * as Solid from 'solid-js'

/**
 * 根路由 - 纯客户端渲染
 */
export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div class="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
