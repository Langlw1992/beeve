/**
 * 认证布局路由 - 需要登录才能访问的页面共享布局
 * 包含侧边栏导航，未登录时重定向到登录页
 */
import {createSignal, createEffect, Show} from 'solid-js'
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useLocation,
} from '@tanstack/solid-router'
import {Sidebar, NavMenu, Skeleton, type NavMenuItemType} from '@beeve/ui'
import {User, Shield, LogOut} from 'lucide-solid'
import {authClient} from '../lib/auth-client'

// ==================== 导航菜单配置 ====================

/** 根据角色动态生成菜单项 */
const getMenuItems = (isAdmin: boolean): NavMenuItemType[] => {
  const items: NavMenuItemType[] = [
    {key: 'profile', label: '用户中心', icon: <User class="size-4" />},
  ]
  if (isAdmin) {
    items.push({
      key: 'admin',
      label: '用户管理',
      icon: <Shield class="size-4" />,
    })
  }
  return items
}

/** 菜单 key 与路由路径的映射 */
const keyToPath: Record<string, string> = {
  profile: '/profile',
  admin: '/admin',
}

/** 路由路径与菜单 key 的映射 */
const pathToKey: Record<string, string> = {
  '/profile': 'profile',
  '/admin': 'admin',
}

// ==================== 布局组件 ====================

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = authClient.useSession()
  const [signOutLoading, setSignOutLoading] = createSignal(false)

  // 未登录时重定向到登录页，保留原始目标 URL
  createEffect(() => {
    if (!session().isPending && !session().data) {
      const currentPath = location().pathname
      const searchParams = new URLSearchParams()
      if (currentPath && currentPath !== '/') {
        searchParams.set('redirect', currentPath)
      }
      const queryString = searchParams.toString()
      const targetUrl = queryString
        ? `/sign-in?${queryString}`
        : '/sign-in'
      window.location.href = targetUrl
    }
  })

  // 根据当前路径计算激活的菜单项
  const activeKey = () => pathToKey[location().pathname] ?? 'profile'

  /** 菜单项点击处理 */
  const handleMenuChange = (key: string) => {
    const path = keyToPath[key]
    if (path) {
      navigate({to: path})
    }
  }

  /** 退出登录 */
  const handleSignOut = async () => {
    setSignOutLoading(true)
    try {
      await authClient.signOut()
      navigate({to: '/sign-in'})
    } catch {
      setSignOutLoading(false)
    }
  }

  const user = () => session().data?.user
  const isPending = () => session().isPending
  const isAdmin = () => user()?.role === 'admin'

  return (
    <Show
      when={!isPending() && session().data}
      fallback={
        <div class="flex min-h-screen items-center justify-center">
          <Skeleton
            width={200}
            height={20}
          />
        </div>
      }
    >
      <Sidebar.Provider
        defaultOpen
        collapsible="icon"
      >
        <Sidebar class="bg-sidebar">
          <Sidebar.Header>
            <div class="flex items-center gap-2 px-2">
              <div class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                B
              </div>
              <span class="text-lg font-semibold">Beeve</span>
            </div>
          </Sidebar.Header>

          <Sidebar.Content>
            <NavMenu
              items={getMenuItems(isAdmin())}
              value={activeKey()}
              onChange={handleMenuChange}
            />
          </Sidebar.Content>

          <Sidebar.Footer>
            {/* 用户信息和退出登录 */}
            <div class="flex items-center gap-2 px-2 py-1">
              <Show
                when={user()?.image}
                fallback={
                  <div class="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    {user()?.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                }
              >
                <img
                  src={user()?.image ?? ''}
                  alt={user()?.name ?? '用户头像'}
                  class="size-8 rounded-full object-cover"
                />
              </Show>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">
                  {user()?.name ?? '未设置名称'}
                </div>
                <div class="text-xs text-muted-foreground truncate">
                  {user()?.email}
                </div>
              </div>
            </div>
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-(--radius) px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={handleSignOut}
              disabled={signOutLoading()}
            >
              <LogOut class="size-4" />
              <span>{signOutLoading() ? '退出中...' : '退出登录'}</span>
            </button>
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>

        <main class="flex-1 overflow-auto">
          <Outlet />
        </main>
      </Sidebar.Provider>
    </Show>
  )
}

// ==================== 路由导出 ====================

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})
