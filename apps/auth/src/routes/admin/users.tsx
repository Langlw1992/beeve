import type {UserListItem} from '../../lib/admin-api'
import {
  Badge,
  Button,
  Card,
  Dialog,
  Input,
  Pagination,
  Select,
  Table,
  type ColumnDef,
} from '@beeve/ui'
import {
  createMutation,
  createQuery,
  useQueryClient,
} from '@tanstack/solid-query'
import {createFileRoute} from '@tanstack/solid-router'
import {Search, Shield, User, UserCheck, UserX} from 'lucide-solid'
import {Show, createMemo, createSignal} from 'solid-js'
import {
  assignUserRole,
  fetchRoles,
  fetchUsers,
  updateUserStatus,
} from '../../lib/admin-api'

export const Route = createFileRoute('/admin/users')({
  component: UsersPage,
})

function UsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = createSignal('')
  const [page, setPage] = createSignal(1)
  const [selectedUser, setSelectedUser] = createSignal<UserListItem | null>(
    null,
  )
  const [showStatusDialog, setShowStatusDialog] = createSignal(false)
  const [showRoleDialog, setShowRoleDialog] = createSignal(false)
  const [selectedRoleId, setSelectedRoleId] = createSignal('')

  const limit = 10

  // 查询用户列表
  const usersQuery = createQuery(() => ({
    queryKey: ['admin', 'users', search(), page()],
    queryFn: () => fetchUsers({search: search(), page: page(), limit}),
  }))

  // 查询角色列表
  const rolesQuery = createQuery(() => ({
    queryKey: ['admin', 'roles'],
    queryFn: fetchRoles,
  }))

  // 更新状态 mutation
  const statusMutation = createMutation(() => ({
    mutationFn: ({
      userId,
      status,
    }: {userId: string; status: 'active' | 'disabled'}) =>
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin', 'users']})
      setShowStatusDialog(false)
      setSelectedUser(null)
    },
  }))

  // 分配角色 mutation
  const roleMutation = createMutation(() => ({
    mutationFn: ({
      userId,
      roleTemplateId,
    }: {userId: string; roleTemplateId: string}) =>
      assignUserRole(userId, roleTemplateId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin', 'users']})
      setShowRoleDialog(false)
      setSelectedUser(null)
      setSelectedRoleId('')
    },
  }))

  const roleOptions = createMemo(() => {
    const roles = rolesQuery.data?.data || []
    return roles.map((role) => ({
      label: role.name,
      value: role.id,
    }))
  })

  const handleSearch = () => {
    setPage(1)
    usersQuery.refetch()
  }

  const handleStatusChange = (user: UserListItem) => {
    setSelectedUser(user)
    setShowStatusDialog(true)
  }

  const handleRoleAssign = (user: UserListItem) => {
    setSelectedUser(user)
    setShowRoleDialog(true)
  }

  const confirmStatusChange = () => {
    const user = selectedUser()
    if (!user) return
    const newStatus = user.status === 'active' ? 'disabled' : 'active'
    statusMutation.mutate({userId: user.id, status: newStatus})
  }

  const confirmRoleAssign = () => {
    const user = selectedUser()
    const roleId = selectedRoleId()
    if (!user || !roleId) return
    roleMutation.mutate({userId: user.id, roleTemplateId: roleId})
  }

  const columns: ColumnDef<UserListItem, unknown>[] = [
    {
      accessorKey: 'name',
      header: '用户',
      cell: (info) => {
        const user = info.row.original
        return (
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-full bg-[var(--lagoon)]/10">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  class="size-10 rounded-full object-cover"
                />
              ) : (
                <User class="size-5 text-[var(--lagoon-deep)]" />
              )}
            </div>
            <div>
              <p class="font-medium text-[var(--sea-ink)]">{user.name}</p>
              <p class="text-sm text-[var(--sea-ink-soft)]">{user.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'userType',
      header: '类型',
      cell: (info) => {
        const type = info.getValue() as string
        return type === 'admin' ? (
          <Badge
            variant="default"
            class="bg-purple-500"
          >
            管理员
          </Badge>
        ) : (
          <Badge variant="secondary">普通用户</Badge>
        )
      },
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: (info) => {
        const status = info.getValue() as string
        return status === 'active' ? (
          <Badge
            variant="default"
            class="bg-green-500"
          >
            正常
          </Badge>
        ) : (
          <Badge variant="destructive">已禁用</Badge>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: '创建时间',
      cell: (info) => {
        const date = new Date(info.getValue() as string)
        return date.toLocaleDateString('zh-CN')
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: (info) => {
        const user = info.row.original
        return (
          <div class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRoleAssign(user)}
              title="分配角色"
            >
              <Shield class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange(user)}
              title={user.status === 'active' ? '禁用用户' : '启用用户'}
            >
              {user.status === 'active' ? (
                <UserX class="size-4 text-destructive" />
              ) : (
                <UserCheck class="size-4 text-green-500" />
              )}
            </Button>
          </div>
        )
      },
    },
  ]

  const total = createMemo(() => usersQuery.data?.pagination.total || 0)

  return (
    <div class="space-y-4">
      {/* 搜索栏 */}
      <Card class="p-4">
        <div class="flex gap-3">
          <Input
            placeholder="搜索用户名或邮箱..."
            value={search()}
            onInput={(val) => setSearch(val)}
            onPressEnter={handleSearch}
            class="max-w-sm"
            allowClear
          />
          <Button onClick={handleSearch}>
            <Search class="size-4" />
            搜索
          </Button>
        </div>
      </Card>

      {/* 用户表格 */}
      <Card class="p-4">
        <Show
          when={!usersQuery.isLoading}
          fallback={
            <div class="py-8 text-center text-[var(--sea-ink-soft)]">
              加载中...
            </div>
          }
        >
          <Table
            data={usersQuery.data?.data || []}
            columns={columns}
            emptyText="暂无用户数据"
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

      {/* 状态变更对话框 */}
      <Dialog
        open={showStatusDialog()}
        onOpenChange={setShowStatusDialog}
        title={selectedUser()?.status === 'active' ? '禁用用户' : '启用用户'}
        description={
          selectedUser()?.status === 'active'
            ? `确定要禁用用户 "${selectedUser()?.name}" 吗？禁用后该用户将无法登录。`
            : `确定要启用用户 "${selectedUser()?.name}" 吗？`
        }
        onOk={confirmStatusChange}
        confirmLoading={statusMutation.isPending}
        okType={selectedUser()?.status === 'active' ? 'destructive' : 'primary'}
        okText="确定"
        cancelText="取消"
      />

      {/* 分配角色对话框 */}
      <Dialog
        open={showRoleDialog()}
        onOpenChange={setShowRoleDialog}
        title="分配角色"
        onOk={confirmRoleAssign}
        confirmLoading={roleMutation.isPending}
        okText="确定"
        cancelText="取消"
      >
        <div class="space-y-4">
          <p class="text-sm text-[var(--sea-ink-soft)]">
            为用户 <strong>{selectedUser()?.name}</strong> 分配角色：
          </p>
          <Select
            options={roleOptions()}
            value={selectedRoleId()}
            onChange={(val) => setSelectedRoleId(val || '')}
            placeholder="选择角色"
            searchable
          />
        </div>
      </Dialog>
    </div>
  )
}
