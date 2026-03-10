/**
 * OAuth 回调处理页面
 */
import {createFileRoute, useNavigate, useSearch} from '@tanstack/solid-router'
import {createEffect} from 'solid-js'

// 定义搜索参数类型
interface CallbackSearch {
  redirect?: string
}

export const Route = createFileRoute('/auth/callback')({
  component: CallbackPage,
})

function CallbackPage() {
  const navigate = useNavigate()
  const search = useSearch({
    from: '/auth/callback',
  }) as unknown as () => CallbackSearch

  createEffect(() => {
    // Better Auth 会自动处理回调
    // 这里只需要重定向到仪表盘
    const redirectTo = search().redirect || '/dashboard'
    navigate({to: redirectTo})
  })

  return (
    <div class="min-h-screen flex items-center justify-center">
      <p>正在处理登录...</p>
    </div>
  )
}
