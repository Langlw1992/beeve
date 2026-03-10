import {For, Show, createSignal, createEffect} from 'solid-js'
import {Link, useLocation} from '@tanstack/solid-router'
import {hasPermission} from '~/lib/permissions'
import {
  LayoutDashboard,
  User,
  Users,
  Shield,
  ClipboardList,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-solid'

interface SidebarProps {
  user?: {name: string; email: string; image?: string; role?: string} | null
  permissions: string[]
}

interface MenuItem {
  icon: LucideIcon
  label: string
  href: string
  permission: string | null
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: '仪表盘',
    href: '/dashboard',
    permission: null,
  },
  {icon: User, label: '个人资料', href: '/profile', permission: null},
]

const adminMenuItems: MenuItem[] = [
  {
    icon: Users,
    label: '用户管理',
    href: '/admin/users',
    permission: 'user:read',
  },
  {
    icon: Shield,
    label: '权限管理',
    href: '/admin/permissions',
    permission: 'role:read',
  },
  {
    icon: ClipboardList,
    label: '审计日志',
    href: '/admin/audit-logs',
    permission: 'audit:read',
  },
]

export function Sidebar(props: SidebarProps) {
  const location = useLocation()
  const [isAdmin, setIsAdmin] = createSignal(false)

  createEffect(() => {
    setIsAdmin(
      props.permissions.includes('*') ||
        props.permissions.includes('admin:all'),
    )
  })

  // 过滤出有权限的管理菜单
  const visibleAdminItems = () =>
    adminMenuItems.filter(
      (item) =>
        !item.permission || hasPermission(props.permissions, item.permission),
    )

  return (
    <aside class="w-64 bg-white border-r border-slate-200 h-full flex flex-col shadow-sm">
      {/* Logo */}
      <div class="h-16 flex items-center px-6 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <ShieldCheck class="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 class="text-base font-semibold text-slate-900 leading-tight">
              Beeve Auth
            </h1>
            <p class="text-[10px] text-slate-500 uppercase tracking-wider">
              企业管理系统
            </p>
          </div>
        </div>
      </div>

      <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {/* 普通菜单 */}
        <div class="space-y-0.5">
          <For each={menuItems}>
            {(item) => (
              <NavItem
                {...item}
                active={location().pathname === item.href}
              />
            )}
          </For>
        </div>

        {/* 管理菜单（需要权限） */}
        <Show when={visibleAdminItems().length > 0}>
          <div class="mt-6">
            <p class="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              系统管理
            </p>
            <div class="space-y-0.5">
              <For each={visibleAdminItems()}>
                {(item) => (
                  <NavItem
                    {...item}
                    active={location().pathname.startsWith(item.href)}
                  />
                )}
              </For>
            </div>
          </div>
        </Show>
      </nav>

      {/* 用户信息 */}
      <div class="p-4 border-t border-slate-200">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-sm font-semibold border border-slate-200">
            {props.user?.name?.[0] || 'U'}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">
              {props.user?.name}
            </p>
            <p class="text-xs text-slate-500 truncate">
              {props.user?.role === 'admin'
                ? '系统管理员'
                : props.user?.role === 'auditor'
                  ? '审计员'
                  : '普通用户'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavItem(props: MenuItem & {active?: boolean}) {
  return (
    <Link
      to={props.href}
      class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200"
      classList={{
        'bg-slate-900 text-white shadow-sm': props.active,
        'text-slate-600 hover:bg-slate-100 hover:text-slate-900': !props.active,
      }}
    >
      <props.icon class="h-4 w-4" />
      {props.label}
    </Link>
  )
}
