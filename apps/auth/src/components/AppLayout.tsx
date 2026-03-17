import {type ParentComponent, Show, createMemo} from 'solid-js'
import {Link, useRouter} from '@tanstack/solid-router'
import {Button} from '@beeve/ui'
import {
  LayoutDashboard,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-solid'
import {authClient} from '@/lib/auth/client'

const navItems = [
  {to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard},
  {to: '/settings', label: 'Settings', icon: Settings},
  {to: '/admin', label: 'Admin', icon: Shield},
] as const

export const AppLayout: ParentComponent = (props) => {
  const session = authClient.useSession()
  const router = useRouter()

  const user = createMemo(() => session().data?.user)
  const isAdmin = createMemo(() => user()?.role === 'admin')

  const handleSignOut = async () => {
    await authClient.signOut()
    router.navigate({to: '/login'})
  }

  return (
    <div class="flex min-h-screen">
      {/* Sidebar */}
      <aside class="hidden w-64 shrink-0 border-r border-border bg-card md:block">
        <div class="flex h-full flex-col">
          {/* Logo */}
          <div class="flex h-14 items-center border-b border-border px-4">
            <Link to="/dashboard" class="flex items-center gap-2">
              <div class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                B
              </div>
              <span class="font-semibold text-lg">Beeve Auth</span>
            </Link>
          </div>

          {/* Nav */}
          <nav class="flex-1 space-y-1 p-3">
            {navItems
              .filter((item) => item.to !== '/admin' || isAdmin())
              .map((item) => (
                <Link
                  to={item.to}
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  activeProps={{class: 'bg-accent text-accent-foreground'}}
                >
                  <item.icon class="size-4" />
                  {item.label}
                </Link>
              ))}
          </nav>

          {/* User */}
          <div class="border-t border-border p-3">
            <Show when={user()}>
              {(u) => (
                <div class="flex items-center gap-3">
                  <Show
                    when={u().image}
                    fallback={
                      <div class="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {u().name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                    }
                  >
                    <img
                      src={u().image ?? ''}
                      alt={u().name ?? ''}
                      class="size-8 rounded-full object-cover"
                    />
                  </Show>
                  <div class="flex-1 min-w-0">
                    <p class="truncate text-sm font-medium">{u().name}</p>
                    <p class="truncate text-xs text-muted-foreground">
                      {u().email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    title="Sign out"
                  >
                    <LogOut class="size-4" />
                  </Button>
                </div>
              )}
            </Show>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div class="flex flex-1 flex-col">
        <header class="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
          <Link to="/dashboard" class="flex items-center gap-2">
            <div class="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
              B
            </div>
            <span class="font-semibold">Beeve Auth</span>
          </Link>
          <div class="flex items-center gap-1">
            {navItems
              .filter((item) => item.to !== '/admin' || isAdmin())
              .map((item) => (
                <Link
                  to={item.to}
                  class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  activeProps={{class: 'bg-accent text-accent-foreground'}}
                >
                  <item.icon class="size-4" />
                </Link>
              ))}
          </div>
        </header>

        {/* Breadcrumb */}
        <div class="border-b border-border px-6 py-3">
          <div class="flex items-center gap-1 text-sm text-muted-foreground">
            <Link
              to="/dashboard"
              class="hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <ChevronRight class="size-3" />
            <span class="text-foreground font-medium">
              {router.state.location.pathname.split('/').pop() || 'Dashboard'}
            </span>
          </div>
        </div>

        {/* Content */}
        <main class="flex-1 p-6">{props.children}</main>
      </div>
    </div>
  )
}
