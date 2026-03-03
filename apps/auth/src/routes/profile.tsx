/**
 * 用户中心页 - 占位
 */
import {createFileRoute} from '@tanstack/solid-router'

function ProfilePage() {
  return (
    <div class="flex items-center justify-center min-h-screen">
      <h1 class="text-2xl font-bold">用户中心</h1>
    </div>
  )
}

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})
