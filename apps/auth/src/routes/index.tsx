import { createFileRoute, Link, redirect } from '@tanstack/solid-router'
import { Show } from 'solid-js'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/')({
  component: HomePage,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()

    // 已登录用户重定向到 dashboard
    if (session?.user) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

function HomePage() {
  const session = authClient.useSession()

  return (
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* 顶部导航 */}
      <header class="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center">
              <span class="text-white dark:text-neutral-900 text-lg font-bold">B</span>
            </div>
            <span class="text-lg font-semibold text-neutral-900 dark:text-white">Beeve</span>
          </div>

          <Show
            when={session().data?.user}
            fallback={
              <Link
                to="/login"
                class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                Sign in
              </Link>
            }
          >
            <Link
              to="/dashboard"
              class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              Go to Dashboard
            </Link>
          </Show>
        </div>
      </header>

      {/* 主页内容 - 仅对未登录用户显示 */}
      <main>
        <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div class="text-center">
            <h1 class="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl">
              Beeve Auth Center
            </h1>
            <p class="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              Unified authentication for the Beeve ecosystem.
              <br />
              Secure, seamless sign-in across all your devices.
            </p>
            <div class="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/login"
                class="rounded-lg bg-neutral-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                Get started
              </Link>
              <a
                href="#"
                class="text-base font-semibold leading-6 text-neutral-900 dark:text-white"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* 特性展示 */}
          <div class="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
              <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <svg class="h-6 w-6 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">Secure</h3>
              <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Enterprise-grade security with OAuth 2.0 and modern authentication standards.
              </p>
            </div>

            <div class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
              <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <svg class="h-6 w-6 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">Fast</h3>
              <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                One-click social login. No passwords to remember or reset.
              </p>
            </div>

            <div class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
              <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <svg class="h-6 w-6 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">Connected</h3>
              <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Link multiple social accounts for flexible sign-in options.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
