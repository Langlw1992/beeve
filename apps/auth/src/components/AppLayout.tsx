import {type JSX, type ParentComponent, Show, createMemo} from 'solid-js'
import {Link} from '@tanstack/solid-router'
import {Badge, Button} from '@beeve/ui'
import {Shield, LogOut, User} from 'lucide-solid'
import {isAdminUser} from '@/lib/auth/policy'
import type {AppUserDto} from '@/lib/services/contracts'
import {signOutUser} from '@/lib/services/client/auth'

const navItems = [
  {
    to: '/settings',
    label: '个人中心',
    icon: User,
    search: {tab: 'profile'},
  },
  {to: '/admin', label: '管理后台', icon: Shield},
] as const

type AppLayoutProps = {
  user: AppUserDto
  currentPath: '/settings' | '/admin'
  pageTitle?: string
  pageDescription?: string
  pageActions?: JSX.Element
}

export const AppLayout: ParentComponent<AppLayoutProps> = (props) => {
  const isAdmin = createMemo(() => isAdminUser(props.user))
  const visibleNavItems = createMemo(() =>
    navItems.filter((item) => item.to !== '/admin' || isAdmin()),
  )
  const isSettings = props.currentPath === '/settings'

  const handleSignOut = async () => {
    await signOutUser()
    window.location.assign('/login')
  }

  if (isSettings) {
    return (
      <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent)] text-foreground">
        <header class="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link to="/settings" search={{tab: 'profile'}} class="flex items-center gap-3">
              <div class="flex size-8 items-center justify-center rounded-full border border-border/60 bg-muted text-xs font-semibold">
                B
              </div>
              <div class="leading-tight">
                <p class="text-sm font-semibold tracking-tight">
                  Beeve 认证中心
                </p>
                <p class="text-xs text-muted-foreground">个人中心</p>
              </div>
            </Link>

            <div class="flex items-center gap-2">
              <Show when={isAdmin()}>
                <Link to="/admin" class="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    管理后台
                  </Button>
                </Link>
              </Show>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                title="退出登录"
              >
                退出登录
                <LogOut class="size-4" />
              </Button>
            </div>
          </div>
        </header>

        <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {props.children}
        </main>
      </div>
    )
  }

  return (
    <div class="min-h-screen bg-background text-foreground">
      <div class="flex min-h-screen">
        <aside class="hidden w-64 shrink-0 border-r border-border/60 bg-background/95 md:block">
          <div class="sticky top-0 flex h-screen flex-col">
            <div class="flex h-14 items-center border-b border-border/60 px-4">
              <Link
                to="/settings"
                search={{tab: 'profile'}}
                class="flex items-center gap-2"
              >
                <div class="flex size-7 items-center justify-center rounded-md border border-border/60 bg-muted font-semibold text-xs">
                  B
                </div>
                <span class="font-medium tracking-tight">Beeve 认证中心</span>
              </Link>
            </div>

            <div class="border-b border-border/60 px-4 py-4">
              <div class="flex items-center gap-3">
                <Show
                  when={props.user.image}
                  fallback={
                    <div class="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {props.user.name.charAt(0).toUpperCase()}
                    </div>
                  }
                >
                  <img
                    src={props.user.image ?? ''}
                    alt={props.user.name}
                    class="size-10 rounded-full object-cover"
                  />
                </Show>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">{props.user.name}</p>
                  <p class="truncate text-xs text-muted-foreground">
                    {props.user.email}
                  </p>
                </div>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={props.user.emailVerified ? 'default' : 'secondary'}>
                  {props.user.emailVerified ? '已验证' : '待验证'}
                </Badge>
                <Show when={isAdmin()}>
                  <Badge variant="outline">管理员</Badge>
                </Show>
              </div>
            </div>

            <nav class="flex-1 px-2 py-3">
              {visibleNavItems().map((item) => (
                <Link
                  to={item.to}
                  search={item.to === '/settings' ? {tab: 'profile'} : undefined}
                  class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  classList={{
                    'bg-muted text-foreground': props.currentPath === item.to,
                  }}
                  aria-current={props.currentPath === item.to ? 'page' : undefined}
                >
                  <item.icon class="size-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div class="border-t border-border/60 p-4">
              <Button
                variant="ghost"
                class="w-full justify-between"
                onClick={handleSignOut}
                title="退出登录"
              >
                退出登录
                <LogOut class="size-4" />
              </Button>
            </div>
          </div>
        </aside>

        <div class="flex flex-1 flex-col">
          <header class="flex h-14 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur md:hidden">
            <Link
              to="/settings"
              search={{tab: 'profile'}}
              class="flex items-center gap-2.5"
            >
              <div class="flex size-7 items-center justify-center rounded-md border border-border/60 bg-muted font-semibold text-[11px]">
                B
              </div>
              <span class="font-medium tracking-tight">Beeve 认证中心</span>
            </Link>
            <div class="flex items-center gap-1">
              {visibleNavItems().map((item) => (
                <Link
                  to={item.to}
                  search={item.to === '/settings' ? {tab: 'profile'} : undefined}
                  class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  classList={{
                    'bg-accent text-accent-foreground': props.currentPath === item.to,
                  }}
                  aria-label={item.label}
                >
                  <item.icon class="size-4" />
                </Link>
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="退出登录"
              >
                <LogOut class="size-4" />
              </Button>
            </div>
          </header>

          <div class="border-b border-border/60 bg-background/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div class="mx-auto flex max-w-5xl flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div class="space-y-1">
                <Show when={props.pageTitle}>
                  <div>
                    <h1 class="text-xl font-semibold tracking-tight sm:text-2xl">
                      {props.pageTitle}
                    </h1>
                    <Show when={props.pageDescription}>
                      <p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {props.pageDescription}
                      </p>
                    </Show>
                  </div>
                </Show>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <div class="hidden text-xs text-muted-foreground sm:block">
                  会话已由服务端校验
                </div>
                {props.pageActions}
              </div>
            </div>
          </div>

          <main class="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div class="mx-auto max-w-5xl">{props.children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
