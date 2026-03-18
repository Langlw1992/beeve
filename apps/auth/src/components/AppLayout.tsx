import {type JSX, type ParentComponent, Show, createMemo} from 'solid-js'
import {Badge, Button} from '@beeve/ui'
import {
  LayoutDashboard,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-solid'
import {isAdminUser} from '@/lib/auth/policy'
import type {AppUserDto} from '@/lib/services/contracts'
import {signOutUser} from '@/lib/services/client/auth'

const navItems = [
  {to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard},
  {to: '/settings', label: 'Settings', icon: Settings},
  {to: '/admin', label: 'Admin', icon: Shield},
] as const

type AppLayoutProps = {
  user: AppUserDto
  currentPath: '/dashboard' | '/settings' | '/admin'
  pageTitle?: string
  pageDescription?: string
  pageActions?: JSX.Element
}

const pageLabels: Record<AppLayoutProps['currentPath'], string> = {
  '/dashboard': 'Dashboard',
  '/settings': 'Settings',
  '/admin': 'Admin',
}

export const AppLayout: ParentComponent<AppLayoutProps> = (props) => {
  const isAdmin = createMemo(() => isAdminUser(props.user))
  const currentPage = createMemo(() => pageLabels[props.currentPath] ?? 'Dashboard')
  const visibleNavItems = createMemo(() =>
    navItems.filter((item) => item.to !== '/admin' || isAdmin()),
  )

  const handleSignOut = async () => {
    await signOutUser()
    window.location.assign('/login')
  }

  const isActive = (to: (typeof navItems)[number]['to']) =>
    props.currentPath === to || props.currentPath.startsWith(`${to}/`)

  return (
    <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent)]">
      <div class="flex min-h-screen">
        <aside class="hidden w-72 shrink-0 border-r border-border/70 bg-card/80 backdrop-blur md:block">
          <div class="sticky top-0 flex h-screen flex-col">
            <div class="flex h-16 items-center border-b border-border/70 px-5">
              <a href="/dashboard" class="flex items-center gap-2">
                <div class="flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">
                  B
                </div>
                <span class="font-semibold text-lg">Beeve Auth</span>
              </a>
            </div>

            <div class="border-b border-border/70 px-4 py-4">
              <div class="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div class="flex items-center gap-3">
                  <Show
                    when={props.user.image}
                    fallback={
                      <div class="flex size-11 items-center justify-center rounded-2xl bg-muted text-sm font-semibold">
                        {props.user.name.charAt(0).toUpperCase()}
                      </div>
                    }
                  >
                    <img
                      src={props.user.image ?? ''}
                      alt={props.user.name}
                      class="size-11 rounded-2xl object-cover"
                    />
                  </Show>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold">{props.user.name}</p>
                    <p class="truncate text-xs text-muted-foreground">
                      {props.user.email}
                    </p>
                  </div>
                </div>
                <div class="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant={props.user.emailVerified ? 'default' : 'secondary'}>
                    {props.user.emailVerified ? 'Verified' : 'Pending'}
                  </Badge>
                  <Show when={isAdmin()}>
                    <Badge variant="outline">Admin</Badge>
                  </Show>
                </div>
              </div>
            </div>

            <nav class="flex-1 space-y-1 p-4">
              {visibleNavItems().map((item) => (
                <a
                  href={item.to}
                  class="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  classList={{
                    'bg-accent text-accent-foreground shadow-sm': isActive(item.to),
                  }}
                  aria-current={isActive(item.to) ? 'page' : undefined}
                >
                  <item.icon class="size-4" />
                  {item.label}
                </a>
              ))}
            </nav>

            <div class="border-t border-border/70 p-4">
              <Button
                variant="outline"
                class="w-full justify-between"
                onClick={handleSignOut}
                title="Sign out"
              >
                Sign out
                <LogOut class="size-4" />
              </Button>
            </div>
          </div>
        </aside>

        <div class="flex flex-1 flex-col">
          <header class="flex h-16 items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur md:hidden">
            <a href="/dashboard" class="flex items-center gap-2.5">
              <div class="flex size-8 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground text-xs">
                B
              </div>
              <span class="font-semibold">Beeve Auth</span>
            </a>
            <div class="flex items-center gap-1">
              {visibleNavItems().map((item) => (
                <a
                  href={item.to}
                  class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  classList={{
                    'bg-accent text-accent-foreground': isActive(item.to),
                  }}
                  aria-label={item.label}
                >
                  <item.icon class="size-4" />
                </a>
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOut class="size-4" />
              </Button>
            </div>
          </header>

          <div class="border-b border-border/70 bg-background/60 px-6 py-4 backdrop-blur">
            <div class="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div class="space-y-3">
                <div class="flex items-center gap-1 text-sm text-muted-foreground">
                  <a href="/dashboard" class="transition-colors hover:text-foreground">
                    Home
                  </a>
                  <ChevronRight class="size-3" />
                  <span class="font-medium text-foreground">{currentPage()}</span>
                </div>

                <Show when={props.pageTitle}>
                  <div>
                    <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {props.pageTitle}
                    </h1>
                    <Show when={props.pageDescription}>
                      <p class="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
                        {props.pageDescription}
                      </p>
                    </Show>
                  </div>
                </Show>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <div class="hidden text-xs text-muted-foreground sm:block">
                  Server-verified session
                </div>
                {props.pageActions}
              </div>
            </div>
          </div>

          <main class="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div class="mx-auto max-w-6xl">{props.children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
