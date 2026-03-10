import type {AuditLog} from '@beeve/contracts'
import {
  Badge,
  Button,
  Card,
  Pagination,
  Select,
  Table,
  type ColumnDef,
} from '@beeve/ui'
import {createQuery} from '@tanstack/solid-query'
import {createFileRoute} from '@tanstack/solid-router'
import {Search, User} from 'lucide-solid'
import {Show, createMemo, createSignal} from 'solid-js'
import {fetchAllUsers, fetchAuditLogs} from '../../lib/admin-api'

export const Route = createFileRoute('/admin/audit-logs')({
  component: AuditLogsPage,
})

// 操作类型映射
const ACTION_LABELS: Record<string, string> = {
  'user:created': '创建用户',
  'user:updated': '更新用户',
  'user:deleted': '删除用户',
  'user:status_changed': '更改用户状态',
  'role:assigned': '分配角色',
  'role:created': '创建角色',
  'role:updated': '更新角色',
  'role:deleted': '删除角色',
  login: '登录',
  logout: '登出',
}

function AuditLogsPage() {
  const [userId, setUserId] = createSignal('')
  const [action, setAction] = createSignal('')
  const [page, setPage] = createSignal(1)
  const limit = 20

  // 查询审计日志
  const logsQuery = createQuery(() => ({
    queryKey: ['admin', 'audit-logs', userId(), action(), page()],
    queryFn: () =>
      fetchAuditLogs({
        userId: userId() || undefined,
        action: action() || undefined,
        page: page(),
        limit,
      }),
  }))

  // 查询用户列表（用于筛选）
  const usersQuery = createQuery(() => ({
    queryKey: ['admin', 'users', 'all'],
    queryFn: fetchAllUsers,
  }))

  const userOptions = createMemo(() => [
    {label: '全部用户', value: ''},
    ...(usersQuery.data?.data.map((u) => ({
      label: `${u.name} (${u.email})`,
      value: u.id,
    })) || []),
  ])

  const actionOptions = [
    {label: '全部操作', value: ''},
    {label: '创建用户', value: 'user:created'},
    {label: '更新用户', value: 'user:updated'},
    {label: '删除用户', value: 'user:deleted'},
    {label: '更改用户状态', value: 'user:status_changed'},
    {label: '分配角色', value: 'role:assigned'},
    {label: '创建角色', value: 'role:created'},
    {label: '更新角色', value: 'role:updated'},
    {label: '删除角色', value: 'role:deleted'},
    {label: '登录', value: 'login'},
    {label: '登出', value: 'logout'},
  ]

  const handleSearch = () => {
    setPage(1)
    logsQuery.refetch()
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-500'
    if (action.includes('updated')) return 'bg-blue-500'
    if (action.includes('deleted')) return 'bg-red-500'
    if (action.includes('login')) return 'bg-purple-500'
    return 'bg-gray-500'
  }

  const columns: ColumnDef<AuditLog, unknown>[] = [
    {
      accessorKey: 'createdAt',
      header: '时间',
      cell: (info) => {
        const date = new Date(info.getValue() as string)
        return (
          <div class="text-sm text-[var(--sea-ink-soft)]">
            {date.toLocaleDateString('zh-CN')}
          </div>
        )
      },
    },
    {
      accessorKey: 'action',
      header: '操作',
      cell: (info) => {
        const action = info.getValue() as string
        return (
          <Badge class={getActionBadgeColor(action)}>
            {ACTION_LABELS[action] || action}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'userId',
      header: '用户',
      cell: (info) => {
        const log = info.row.original
        const userId = info.getValue() as string | null
        if (!userId) return <span class="text-[var(--sea-ink-soft)]">-</span>

        const details = log.details as {email?: string; name?: string} | null
        return (
          <div class="flex items-center gap-2">
            <User class="size-4 text-[var(--sea-ink-soft)]" />
            <div>
              <p class="text-sm text-[var(--sea-ink)]">
                {details?.name || userId.slice(0, 8)}
              </p>
              {details?.email && (
                <p class="text-xs text-[var(--sea-ink-soft)]">
                  {details.email}
                </p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'resource',
      header: '资源',
      cell: (info) => {
        const resource = info.getValue() as string
        return (
          <span class="text-sm text-[var(--sea-ink-soft)]">{resource}</span>
        )
      },
    },
    {
      accessorKey: 'details',
      header: '详情',
      cell: (info) => {
        const details = info.getValue() as Record<string, unknown> | null
        if (!details) return <span class="text-[var(--sea-ink-soft)]">-</span>

        return (
          <div class="max-w-xs truncate text-sm text-[var(--sea-ink-soft)]">
            {JSON.stringify(details)}
          </div>
        )
      },
    },
  ]

  const total = createMemo(() => logsQuery.data?.pagination.total || 0)

  return (
    <div class="space-y-4">
      {/* 筛选栏 */}
      <Card class="p-4">
        <div class="flex flex-wrap gap-3">
          <Select
            options={userOptions()}
            value={userId()}
            onChange={(val) => setUserId(val || '')}
            placeholder="选择用户"
            class="w-64"
            searchable
          />
          <Select
            options={actionOptions}
            value={action()}
            onChange={(val) => setAction(val || '')}
            placeholder="选择操作类型"
            class="w-48"
          />
          <Button onClick={handleSearch}>
            <Search class="size-4" />
            筛选
          </Button>
        </div>
      </Card>

      {/* 日志表格 */}
      <Card class="p-4">
        <Show
          when={!logsQuery.isLoading}
          fallback={
            <div class="py-8 text-center text-[var(--sea-ink-soft)]">
              加载中...
            </div>
          }
        >
          <Table
            data={logsQuery.data?.data || []}
            columns={columns}
            emptyText="暂无审计日志"
          />

          {/* 分页 */}
          <Show when={total() > limit}>
            <div class="mt-4 flex justify-end">
              <Pagination
                current={page()}
                total={total()}
                pageSize={limit}
                onChange={setPage}
                showTotal
                size="sm"
              />
            </div>
          </Show>
        </Show>
      </Card>
    </div>
  )
}
