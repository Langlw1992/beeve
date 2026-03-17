import { createFileRoute, Link, useSearch } from '@tanstack/solid-router'
import { createSignal, createResource, Show, For, createMemo } from 'solid-js'
import { requireAdmin } from '@/lib/guards'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { api } from '@/lib/eden'

export const Route = createFileRoute('/admin/users/')({
  component: AdminUsersPage,
  beforeLoad: requireAdmin,
})

// Icons
const SearchIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
  </svg>
)

const ShieldIcon = () => (
  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const BanIcon = () => (
  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
)

const UserIcon = () => (
  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

interface Pagination {
  total: number
  limit: number
  offset: number
}

interface UsersResponse {
  users: User[]
  pagination: Pagination
}

function AdminUsersPage() {
  const search = useSearch({ from: '/admin/users/' })
  const [searchQuery, setSearchQuery] = createSignal((search as { q?: string }).q ?? '')
  const [currentOffset, setCurrentOffset] = createSignal(0)
  const limit = 20

  const fetchUsers = async (offset: number, query: string): Promise<UsersResponse> => {
    const result = await api().admin.users.get({
      query: {
        limit: limit.toString(),
        offset: offset.toString(),
        ...(query && { search: query }),
      },
    })
    if (result.error) {
      throw new Error('Failed to fetch users')
    }
    return result.data as UsersResponse
  }

  const [usersData, { refetch }] = createResource(
    () => ({ offset: currentOffset(), query: searchQuery() }),
    ({ offset, query }) => fetchUsers(offset, query),
    { initialValue: { users: [], pagination: { total: 0, limit: 20, offset: 0 } } }
  )

  const users = () => usersData().users
  const pagination = () => usersData().pagination

  const totalPages = createMemo(() => Math.ceil(pagination().total / limit))
  const currentPage = createMemo(() => Math.floor(currentOffset() / limit) + 1)

  const handleSearch = (e: Event) => {
    e.preventDefault()
    setCurrentOffset(0)
    refetch()
  }

  const handlePrevPage = () => {
    if (currentOffset() >= limit) {
      setCurrentOffset(currentOffset() - limit)
      refetch()
    }
  }

  const handleNextPage = () => {
    if (currentOffset() + limit < pagination().total) {
      setCurrentOffset(currentOffset() + limit)
      refetch()
    }
  }

  const handleToggleBan = async (userId: string, currentlyBanned: boolean) => {
    if (!confirm(currentlyBanned ? '确定要解封此用户吗？' : '确定要封禁此用户吗？')) {
      return
    }

    const result = await api().admin.users({ id: userId }).put({
      banned: !currentlyBanned,
    })

    if (result.error) {
      alert('操作失败')
    } else {
      refetch()
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除此用户吗？此操作不可恢复。')) {
      return
    }

    const result = await api().admin.users({ id: userId }).delete()

    if (result.error) {
      alert('删除失败')
    } else {
      refetch()
    }
  }

  return (
    <DashboardLayout>
      <div class="space-y-6">
        {/* Header */}
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-neutral-900 dark:text-white">
              用户管理
            </h1>
            <p class="mt-1 text-neutral-600 dark:text-neutral-400">
              管理系统用户、角色和权限
            </p>
          </div>
          <div class="text-sm text-neutral-500 dark:text-neutral-400">
            共 {pagination().total} 位用户
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} class="flex gap-3">
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              placeholder="搜索用户名称或邮箱..."
              class="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-white dark:placeholder-neutral-500"
            />
          </div>
          <button
            type="submit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
          >
            搜索
          </button>
        </form>

        {/* Users Table */}
        <div class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead class="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    用户
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    角色
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    状态
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    注册时间
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                <Show
                  when={!usersData.loading}
                  fallback={
                    <tr>
                      <td colSpan={5} class="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                        加载中...
                      </td>
                    </tr>
                  }
                >
                  <For
                    each={users()}
                    fallback={
                      <tr>
                        <td colSpan={5} class="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                          没有找到用户
                        </td>
                      </tr>
                    }
                  >
                    {(user) => (
                      <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                              <Show
                                when={user.image}
                                fallback={
                                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                  </span>
                                }
                              >
                                {(img) => <img src={img()} alt="" class="h-10 w-10 rounded-full" />}
                              </Show>
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-neutral-900 dark:text-white">
                                {user.name || '未设置名称'}
                              </div>
                              <div class="text-sm text-neutral-500 dark:text-neutral-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
                          }`}>
                            {user.role === 'admin' ? <ShieldIcon /> : <UserIcon />}
                            {user.role === 'admin' ? '管理员' : '用户'}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.banned
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {user.banned ? <BanIcon /> : null}
                            {user.banned ? '已封禁' : '正常'}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                          {new Date(user.created_at).toLocaleDateString('zh-CN')}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div class="flex items-center justify-end gap-2">
                            <Link
                              to="/admin/users/$userId"
                              params={{ userId: user.id }}
                              class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              查看
                            </Link>
                            <button
                              onClick={() => handleToggleBan(user.id, user.banned)}
                              class={`${
                                user.banned
                                  ? 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                  : 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300'
                              }`}
                            >
                              {user.banned ? '解封' : '封禁'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </Show>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Show when={pagination().total > 0}>
            <div class="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <div class="text-sm text-neutral-500 dark:text-neutral-400">
                第 {currentPage()} / {totalPages()} 页
              </div>
              <div class="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentOffset() === 0}
                  class="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentOffset() + limit >= pagination().total}
                  class="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </DashboardLayout>
  )
}
