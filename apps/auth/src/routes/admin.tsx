import {useSession} from '@beeve/auth-client'
import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
} from '@tanstack/solid-router'
import {ChevronRight, FileText, Shield, Users} from 'lucide-solid'
import {Show, createEffect} from 'solid-js'

// 管理员路由根组件 - 客户端检查管理员权限
export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

const menuItems = [
  {
    path: '/admin/users',
    label: '用户管理',
    icon: Users,
  },
  {
    path: '/admin/permissions',
    label: '权限管理',
    icon: Shield,
  },
  {
    path: '/admin/audit-logs',
    label: '审计日志',
    icon: FileText,
  },
]

function AdminLayout() {
  const {user, isLoading, isAuthenticated} = useSession()
  const navigate = useNavigate()

  // 客户端权限检查：未登录重定向到登录页，非管理员重定向到仪表板
  createEffect(() => {
    if (isLoading()) return
    if (!isAuthenticated()) {
      navigate({to: '/login'})
    } else if (user()?.userType !== 'admin') {
      navigate({to: '/dashboard'})
    }
  })

  return (
    <Show
      when={!isLoading() && user()?.userType === 'admin'}
      fallback={
        <div class="flex min-h-[60vh] items-center justify-center">
          <div class="text-[var(--sea-ink-soft)]">验证权限中...</div>
        </div>
      }
    >
      <main class="page-wrap px-4 py-8">
        <div class="mb-6">
          <div class="flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
            <Link
              to="/dashboard"
              class="hover:text-[var(--sea-ink)]"
            >
              仪表盘
            </Link>
            <ChevronRight class="size-4" />
            <span class="text-[var(--sea-ink)]">管理后台</span>
          </div>
          <h1 class="mt-2 display-title text-3xl font-bold text-[var(--sea-ink)]">
            管理后台
          </h1>
          <p class="mt-1 text-[var(--sea-ink-soft)]">
            管理系统用户、权限和审计日志
          </p>
        </div>

        <div class="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* 侧边导航 */}
          <nav class="space-y-1">
            {menuItems.map((item) => (
              <Link
                to={item.path}
                class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[var(--sea-ink-soft)] transition-colors hover:bg-[var(--foam)] hover:text-[var(--sea-ink)]"
                activeProps={{
                  class:
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]',
                }}
              >
                <item.icon class="size-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 内容区域 */}
          <div class="min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </Show>
  )
}
