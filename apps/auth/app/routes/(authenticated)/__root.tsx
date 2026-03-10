import {createFileRoute, Outlet, redirect} from '@tanstack/solid-router'
import {createSignal, onMount, Show} from 'solid-js'
import {Sidebar} from '~/components/layout/Sidebar'
import {Header} from '~/components/layout/Header'

interface DevUser {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

/**
 * 认证路由组布局
 *
 * 未登录用户重定向到登录页
 * 已登录用户显示侧边栏+顶部栏布局
 */
export const Route = createFileRoute('/(authenticated)/__root')({
  beforeLoad: async () => {
    // 客户端检查登录状态
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dev-user')
      if (!stored) {
        throw redirect({
          to: '/login',
        })
      }
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const [user, setUser] = createSignal<DevUser | null>(null)
  const [isLoading, setIsLoading] = createSignal(true)

  onMount(() => {
    const stored = localStorage.getItem('dev-user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      } catch {
        setUser(null)
      }
    }
    setIsLoading(false)
  })

  return (
    <Show
      when={!isLoading()}
      fallback={<div class="h-screen bg-slate-50" />}
    >
      <div class="flex h-screen bg-slate-50">
        <Sidebar
          user={user()}
          permissions={user()?.permissions || []}
        />
        <div class="flex-1 flex flex-col overflow-hidden">
          <Header user={user()} />
          <main class="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </Show>
  )
}
