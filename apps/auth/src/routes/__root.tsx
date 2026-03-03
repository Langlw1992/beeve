/**
 * 根布局 - Auth 应用的根路由
 */
import {createRootRoute, Outlet} from '@tanstack/solid-router'
import {Toaster} from '@beeve/ui'

function RootComponent() {
  return (
    <div class="min-h-screen bg-background text-foreground">
      <Outlet />
      <Toaster placement="top-end" />
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
