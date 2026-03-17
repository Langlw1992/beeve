import { createFileRoute, Link, useParams } from '@tanstack/solid-router'
import { createSignal, createResource, Show, For } from 'solid-js'
import { requireAdmin } from '@/lib/guards'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { api } from '@/lib/eden'

export const Route = createFileRoute('/admin/users/$userId')({
  component: AdminUserDetailPage,
  beforeLoad: requireAdmin,
})

// Icons
const ArrowLeftIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const ShieldIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const UserIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const CalendarIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const KeyIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
)

const BanIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
)

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  banned: boolean
  created_at: string
  updated_at: string
}

interface Account {
  provider_id: string
  created_at: string
}

interface UserDetailResponse {
  user: User
  sessions: number
  accounts: Account[]
}

function AdminUserDetailPage() {
  const params = useParams({ from: '/admin/users/$userId' }) as () => { userId: string }
  const userId = () => params().userId
  const [isEditing, setIsEditing] = createSignal(false)
  const [editName, setEditName] = createSignal('')
  const [editRole, setEditRole] = createSignal('')

  const fetchUser = async (id: string): Promise<UserDetailResponse> => {
    const result = await api().admin.users({ id }).get()
    if (result.error) {
      throw new Error('Failed to fetch user')
    }
    return result.data as UserDetailResponse
  }

  const [userData, { refetch }] = createResource(
    userId,
    fetchUser,
  )

  const currentUser = () => userData()?.user
  const stats = () => ({
    sessions: userData()?.sessions ?? 0,
    accounts: userData()?.accounts ?? [],
  })

  const startEditing = () => {
    const u = currentUser()
    if (u) {
      setEditName(u.name || '')
      setEditRole(u.role)
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    const result = await api().admin.users({ id: userId() }).put({
      name: editName(),
      role: editRole(),
    })

    if (result.error) {
      alert('保存失败')
    } else {
      setIsEditing(false)
      refetch()
    }
  }

  const handleToggleBan = async () => {
    const u = currentUser()
    if (!u) return

    if (!confirm(u.banned ? '确定要解封此用户吗？' : '确定要封禁此用户吗？')) {
      return
    }

    const result = await api().admin.users({ id: userId() }).put({
      banned: !u.banned,
    })

    if (result.error) {
      alert('操作失败')
    } else {
      refetch()
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除此用户吗？此操作不可恢复。')) {
      return
    }

    const result = await api().admin.users({ id: userId() }).delete()

    if (result.error) {
      alert('删除失败')
    } else {
      window.location.href = '/admin/users'
    }
  }

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      google: 'Google',
      github: 'GitHub',
      apple: 'Apple',
    }
    return labels[provider] || provider
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return (
          <svg class="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )
      case 'github':
        return (
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        )
      case 'apple':
        return (
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.98 1.07-3.11-1.05.05-2.31.72-3.06 1.61-.67.78-1.26 2.04-1.1 3.11 1.17.09 2.36-.79 3.09-1.61z" />
          </svg>
        )
      default:
        return <KeyIcon />
    }
  }

  return (
    <DashboardLayout>
      <div class="space-y-6">
        {/* Header */}
        <div class="flex items-center gap-4">
          <Link
            to="/admin/users"
            class="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          >
            <ArrowLeftIcon />
          </Link>
          <div>
            <h1 class="text-2xl font-semibold text-neutral-900 dark:text-white">
              用户详情
            </h1>
          </div>
        </div>

        <Show
          when={!userData.loading && currentUser()}
          fallback={
            <div class="flex items-center justify-center py-12">
              <div class="text-neutral-500 dark:text-neutral-400">加载中...</div>
            </div>
          }
        >
          <>
            {/* User Profile Card */}
            <div class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div class="p-6">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-6">
                    <div class="h-20 w-20 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                      <Show
                        when={currentUser()?.image}
                        fallback={
                          <span class="text-2xl font-medium text-neutral-600 dark:text-neutral-400">
                            {(currentUser()?.name?.charAt(0) || currentUser()?.email.charAt(0) || '').toUpperCase()}
                          </span>
                        }
                      >
                        {(img) => <img src={img()} alt="" class="h-20 w-20 rounded-full" />}
                      </Show>
                    </div>
                    <div>
                      <Show
                        when={isEditing()}
                        fallback={
                          <>
                            <h2 class="text-xl font-semibold text-neutral-900 dark:text-white">
                              {currentUser()?.name || '未设置名称'}
                            </h2>
                            <p class="text-neutral-500 dark:text-neutral-400">{currentUser()?.email}</p>
                            <div class="mt-3 flex items-center gap-2">
                              <span class={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                currentUser()?.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
                              }`}>
                                {currentUser()?.role === 'admin' ? <ShieldIcon /> : <UserIcon />}
                                {currentUser()?.role === 'admin' ? '管理员' : '用户'}
                              </span>
                              {currentUser()?.banned && (
                                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  <BanIcon />
                                  已封禁
                                </span>
                              )}
                            </div>
                          </>
                        }
                      >
                        <div class="space-y-3">
                          <div>
                            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                              名称
                            </label>
                            <input
                              type="text"
                              value={editName()}
                              onInput={(e) => setEditName(e.currentTarget.value)}
                              class="block w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 dark:bg-neutral-800 dark:border-neutral-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                              角色
                            </label>
                            <select
                              value={editRole()}
                              onChange={(e) => setEditRole(e.currentTarget.value)}
                              class="block w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 dark:bg-neutral-800 dark:border-neutral-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="user">用户</option>
                              <option value="admin">管理员</option>
                            </select>
                          </div>
                          <div class="flex gap-2">
                            <button
                              onClick={handleSave}
                              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              class="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      </Show>
                    </div>
                  </div>
                  <Show when={!isEditing()}>
                    <div class="flex gap-2">
                      <button
                        onClick={startEditing}
                        class="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        编辑
                      </button>
                      <button
                        onClick={handleToggleBan}
                        class={`px-4 py-2 rounded-lg text-sm font-medium ${
                          currentUser()?.banned
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                      >
                        {currentUser()?.banned ? '解封' : '封禁'}
                      </button>
                      <button
                        onClick={handleDelete}
                        class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                      >
                        删除
                      </button>
                    </div>
                  </Show>
                </div>
              </div>

              {/* Info Grid */}
              <div class="border-t border-neutral-200 dark:border-neutral-700 px-6 py-4">
                <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                      <CalendarIcon />
                      注册时间
                    </dt>
                    <dd class="mt-1 text-sm text-neutral-900 dark:text-white">
                      {currentUser() ? new Date(currentUser()!.created_at).toLocaleString('zh-CN') : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                      <CalendarIcon />
                      最后更新
                    </dt>
                    <dd class="mt-1 text-sm text-neutral-900 dark:text-white">
                      {currentUser() ? new Date(currentUser()!.updated_at).toLocaleString('zh-CN') : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                      <KeyIcon />
                      活跃会话
                    </dt>
                    <dd class="mt-1 text-sm text-neutral-900 dark:text-white">
                      {stats().sessions} 个
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                      <UserIcon />
                      用户 ID
                    </dt>
                    <dd class="mt-1 text-sm text-neutral-900 dark:text-white font-mono">
                      {currentUser()?.id}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Linked Accounts */}
            <div class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 class="text-lg font-medium text-neutral-900 dark:text-white">
                  关联账号
                </h3>
              </div>
              <div class="divide-y divide-neutral-200 dark:divide-neutral-700">
                <Show
                  when={stats().accounts.length > 0}
                  fallback={
                    <div class="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      没有关联的社交账号
                    </div>
                  }
                >
                  <For each={stats().accounts}>
                    {(account) => (
                      <div class="px-6 py-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          {getProviderIcon(account.provider_id)}
                          <div>
                            <div class="text-sm font-medium text-neutral-900 dark:text-white">
                              {getProviderLabel(account.provider_id)}
                            </div>
                            <div class="text-xs text-neutral-500 dark:text-neutral-400">
                              绑定于 {new Date(account.created_at).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>
          </>
        </Show>
      </div>
    </DashboardLayout>
  )
}
