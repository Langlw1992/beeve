import { authClient } from '@/lib/auth'
import { Button } from '@beeve/ui'
import { Link } from '@tanstack/solid-router'
import { LogOut, User } from 'lucide-solid'
import { Show } from 'solid-js'

export default function Header() {
  const session = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.href = '/'
  }

  return (
    <header class="site-header px-4">
      <nav class="page-wrap nav-shell">
        <h2 class="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            class="brand-pill"
          >
            <span class="brand-dot" />
            Beeve
          </Link>
        </h2>

        <div class="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/"
            class="nav-link"
            activeProps={{ class: 'nav-link is-active' }}
          >
            首页
          </Link>
          <Link
            to="/about"
            class="nav-link"
            activeProps={{ class: 'nav-link is-active' }}
          >
            关于
          </Link>
          <Show when={session().data}>
            <Link
              to="/dashboard"
              class="nav-link"
              activeProps={{ class: 'nav-link is-active' }}
            >
              仪表板
            </Link>
          </Show>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <Show
            when={!session().isPending}
            fallback={
              <div class="h-8 w-16 animate-pulse rounded-md bg-muted" />
            }
          >
            <Show
              when={session().data}
              fallback={
                <div class="flex items-center gap-2">
                  <Link
                    to="/login"
                    class="nav-link"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    class="rounded-full bg-[var(--lagoon)] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--lagoon-deep)]"
                  >
                    注册
                  </Link>
                </div>
              }
            >
              <div class="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  class="flex items-center gap-2 text-sm font-medium text-[var(--sea-ink)]"
                >
                  <div class="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--lagoon)]/10">
                    <User class="size-4 text-[var(--lagoon-deep)]" />
                  </div>
                  <span class="hidden sm:inline">{session().data?.user?.name}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  title="退出登录"
                >
                  <LogOut class="size-4" />
                </Button>
              </div>
            </Show>
          </Show>
        </div>
      </nav>
    </header>
  )
}
