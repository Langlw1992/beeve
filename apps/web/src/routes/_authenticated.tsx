/**
 * 认证路由守卫布局
 */
import {createFileRoute, Outlet, redirect} from '@tanstack/solid-router'
import {authClient} from '@/lib/auth-client'
import {Sidebar} from '@/components/layout/Sidebar'
import {Header} from '@/components/layout/Header'

// 定义路由上下文类型
interface AuthenticatedContext {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({location}) => {
    const {data: session} = await authClient.getSession()

    if (!session) {
      throw redirect({
        to: '/login',
        search: {redirect: location.href},
      })
    }

    return {user: session.user} as AuthenticatedContext
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const context =
    Route.useRouteContext() as unknown as () => AuthenticatedContext

  return (
    <div class="flex h-screen">
      <Sidebar user={context().user} />
      <div class="flex-1 flex flex-col overflow-hidden">
        <Header user={context().user} />
        <main class="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
