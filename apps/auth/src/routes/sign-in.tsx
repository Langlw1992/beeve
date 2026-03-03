/**
 * 登录页 - 占位
 */
import {createFileRoute} from '@tanstack/solid-router'

function SignInPage() {
  return (
    <div class="flex items-center justify-center min-h-screen">
      <h1 class="text-2xl font-bold">登录</h1>
    </div>
  )
}

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})
