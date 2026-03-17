import { createFileRoute, Link } from '@tanstack/solid-router'
import { createResource, Show, For } from 'solid-js'
import { requireAdmin } from '@/lib/guards'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { api } from '@/lib/eden'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardPage,
  beforeLoad: requireAdmin,
})

// Icons
const UsersIcon = () => (
  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const SessionsIcon = () => (
  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const AccountsIcon = () => (
  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
  </svg>
)

interface Stats {
  totalUsers: number
  totalSessions: number
  activeSessions: number
  linkedAccounts: number
}

function AdminDashboardPage() {
  const fetchStats = async (): Promise<Stats> => {
    const result = await api().admin.stats.get()
    if (result.error) {
      throw new Error('Failed to fetch stats')
    }
    return result.data as Stats
  }

  const [stats] = createResource(fetchStats, { initialValue: { totalUsers: 0, totalSessions: 0, activeSessions: 0, linkedAccounts: 0 } })

  const statCards = [
    { title: '总用户数', value: () => stats().totalUsers, icon: UsersIcon, color: 'bg-blue-500' },
    { title: '总会话数', value: () => stats().totalSessions, icon: SessionsIcon, color: 'bg-green-500' },
    { title: '活跃会话', value: () => stats().activeSessions, icon: SessionsIcon, color: 'bg-yellow-500' },
    { title: '关联账号', value: () => stats().linkedAccounts, icon: AccountsIcon, color: 'bg-purple-500' },
  ]

  return (
    <DashboardLayout>
      <div class="space-y-8">
        {/* Header */}
        <div>
          <h1 class="text-2xl font-semibold text-neutral-900 dark:text-white">
            管理后台
          </h1>
          <p class="mt-2 text-neutral-600 dark:text-neutral-400">
            系统概览和用户管理
          </p>
        </div>

        {/* Stats Grid */}
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <For each={statCards}>
            {(card) => (
              <div class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div class="flex items-center gap-4">
                  <div class={`${card.color} rounded-lg p-3 text-white`}>
                    <card.icon />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-neutral-500 dark:text-neutral-400">{card.title}</p>
                    <Show when={!stats.loading} fallback={<p class="text-2xl font-semibold text-neutral-900 dark:text-white">-</p>}>
                      <p class="text-2xl font-semibold text-neutral-900 dark:text-white">{card.value()}</p>
                    </Show>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Quick Links */}
        <div class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 class="text-lg font-medium text-neutral-900 dark:text-white">
              快捷入口
            </h2>
          </div>
          <div class="divide-y divide-neutral-200 dark:divide-neutral-700">
            <Link
              to="/admin/users"
              class="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div class="rounded-lg bg-indigo-100 dark:bg-indigo-900 p-2 text-indigo-600 dark:text-indigo-300">
                  <UsersIcon />
                </div>
                <div>
                  <h3 class="font-medium text-neutral-900 dark:text-white">用户管理</h3>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400">查看和管理所有用户</p>
                </div>
              </div>
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
