import { createFileRoute, Link } from '@tanstack/solid-router'
import { requireAuth } from '@/lib/guards'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
  beforeLoad: requireAuth,
})

// 简单的图标组件
const AccountsIcon = () => (
  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const SessionsIcon = () => (
  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

// 快捷入口卡片组件
function QuickLinkCard(props: {
  href: string
  title: string
  description: string
  icon: import('solid-js').JSX.Element
}) {
  return (
    <Link
      to={props.href}
      class="group rounded-lg border border-neutral-200 bg-white p-6 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
    >
      <div class="flex items-start gap-4">
        <div class="rounded-lg bg-neutral-100 p-3 text-neutral-600 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700">
          {props.icon}
        </div>
        <div>
          <h3 class="font-medium text-neutral-900 dark:text-white">
            {props.title}
          </h3>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {props.description}
          </p>
        </div>
      </div>
    </Link>
  )
}

function DashboardPage() {
  const session = authClient.useSession()
  const user = () => session().data?.user

  return (
    <DashboardLayout>
      <div class="space-y-8">
        {/* 欢迎区域 */}
        <div>
          <h1 class="text-2xl font-semibold text-neutral-900 dark:text-white">
            Welcome back, {user()?.name || user()?.email}
          </h1>
          <p class="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage your account settings and security preferences
          </p>
        </div>

        {/* 快捷入口 */}
        <div class="grid gap-4 sm:grid-cols-2">
          <QuickLinkCard
            href="/settings/accounts"
            title="Account Connections"
            description="Link or unlink your social accounts"
            icon={<AccountsIcon />}
          />
          <QuickLinkCard
            href="/settings/sessions"
            title="Active Sessions"
            description="View and manage your active sessions"
            icon={<SessionsIcon />}
          />
        </div>

        {/* 账户信息摘要 */}
        <div class="rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <div class="border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
            <h2 class="text-lg font-medium text-neutral-900 dark:text-white">
              Account Information
            </h2>
          </div>
          <div class="px-6 py-4">
            <dl class="grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Email
                </dt>
                <dd class="mt-1 text-sm text-neutral-900 dark:text-white">
                  {user()?.email}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Name
                </dt>
                <dd class="mt-1 text-sm text-neutral-900 dark:text-white">
                  {user()?.name || 'Not set'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
