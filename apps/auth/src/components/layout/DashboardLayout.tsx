import { Link, useLocation } from '@tanstack/solid-router'
import { Show, createSignal } from 'solid-js'
import { authClient } from '@/lib/auth/client'

interface DashboardLayoutProps {
  children: import('solid-js').JSX.Element
}

// 简单的图标组件
const HomeIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const UserIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const ShieldIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const AdminIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const LogoutIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
  </svg>
)

// 导航链接组件
function NavLink(props: { href: string; children: import('solid-js').JSX.Element; icon?: import('solid-js').JSX.Element }) {
  const location = useLocation()
  const isActive = () => location().pathname === props.href

  return (
    <Link
      to={props.href}
      class={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive()
          ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
      }`}
    >
      {props.icon}
      {props.children}
    </Link>
  )
}

// 用户菜单下拉
function UserMenu(props: {
  user: {
    name?: string | null
    email: string
    image?: string | null
  }
}) {
  const [isOpen, setIsOpen] = createSignal(false)

  const handleSignOut = () => {
    void authClient.signOut()
  }

  return (
    <div class="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen())}
        class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <Show
          when={props.user.image}
          fallback={
            <div class="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
              <span class="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {props.user.name?.charAt(0).toUpperCase() || props.user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          }
        >
          {(image) => <img src={image() ?? ''} alt="" class="h-6 w-6 rounded-full" />}
        </Show>
        <span class="hidden sm:block">{props.user.name || props.user.email}</span>
        <ChevronDownIcon />
      </button>

      <Show when={isOpen()}>
        <div class="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
        <div class="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 z-20">
          <div class="border-b border-neutral-200 px-4 py-2 dark:border-neutral-700">
            <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{props.user.name || props.user.email}</p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">{props.user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      </Show>
    </div>
  )
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  const session = authClient.useSession()
  const user = () => session().data?.user
  const isAdmin = () => (user() as { role?: string })?.role === 'admin'

  return (
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* 顶部导航栏 */}
      <header class="sticky top-0 z-30 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/dashboard" class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center">
              <span class="text-white dark:text-neutral-900 text-lg font-bold">B</span>
            </div>
            <span class="text-lg font-semibold text-neutral-900 dark:text-white">Beeve</span>
          </Link>

          {/* 用户信息 */}
          <Show when={user()}>
            {(u) => <UserMenu user={u()} />}
          </Show>
        </div>
      </header>

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col gap-8 lg:flex-row">
          {/* 侧边栏 */}
          <aside class="lg:w-64 lg:flex-shrink-0">
            <nav class="flex flex-col gap-1">
              <NavLink href="/dashboard" icon={<HomeIcon />}>
                Dashboard
              </NavLink>
              <NavLink href="/settings/accounts" icon={<UserIcon />}>
                Accounts
              </NavLink>
              <NavLink href="/settings/sessions" icon={<ShieldIcon />}>
                Sessions
              </NavLink>
              <Show when={isAdmin()}>
                <NavLink href="/admin/users" icon={<AdminIcon />}>
                  Admin
                </NavLink>
              </Show>
            </nav>
          </aside>

          {/* 主内容区域 */}
          <main class="flex-1 min-w-0">
            {props.children}
          </main>
        </div>
      </div>
    </div>
  )
}
