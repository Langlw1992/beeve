/**
 * Admin 用户管理页 - 用户列表、搜索、批量操作
 */
import {createSignal, createEffect, Show} from 'solid-js'
import {createFileRoute} from '@tanstack/solid-router'
import {
  DataTable,
  useDataTable,
  columns,
  actionColumn,
  Input,
  Select,
  Button,
  Badge,
  Dropdown,
  toast,
} from '@beeve/ui'
import type {ColumnDef, MenuItemType} from '@beeve/ui'
import {
  Search,
  Ban,
  ShieldCheck,
  Trash2,
  MoreHorizontal,
  UserCog,
  LogOut,
  SquarePen,
  UserPlus,
} from 'lucide-solid'
import {authClient} from '../../../lib/auth-client'
import {
  EditUserDialog,
  SetRoleDialog,
  BanUserDialog,
  CreateUserDialog,
  DeleteUserConfirm,
  BatchBanDialog,
  BatchDeleteDialog,
} from '../../../components/admin'
import type {AdminUser} from '../../../components/admin'

// ==================== 类型定义 ====================

type ListUsersResponse = {
  users: AdminUser[]
  total: number
  limit: number | undefined
  offset: number | undefined
}

// ==================== 常量 ====================

const roleOptions = [
  {label: '全部角色', value: ''},
  {label: '管理员', value: 'admin'},
  {label: '普通用户', value: 'user'},
]

// ==================== 工具函数 ====================

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// ==================== 列定义 ====================

function createColumns(handlers: {
  onEdit: (user: AdminUser) => void
  onSetRole: (user: AdminUser) => void
  onToggleBan: (user: AdminUser) => void
  onRevokeSessions: (user: AdminUser) => void
  onDelete: (user: AdminUser) => void
}): ColumnDef<AdminUser, unknown>[] {
  return [
    ...columns<AdminUser>([
      {key: 'name', title: '姓名', width: 150, sort: true},
      {key: 'email', title: '邮箱', width: 220, sort: true},
      {
        key: 'role',
        title: '角色',
        width: 100,
        render: (value) => (
          <Badge
            status={value === 'admin' ? 'processing' : 'default'}
            text={value === 'admin' ? '管理员' : '用户'}
          />
        ),
      },
      {
        key: 'banned',
        title: '状态',
        width: 100,
        render: (value) => (
          <Badge
            status={value ? 'error' : 'success'}
            text={value ? '已封禁' : '正常'}
          />
        ),
      },
      {
        key: 'createdAt',
        title: '注册时间',
        width: 120,
        sort: true,
        render: (value) => formatDate(value as string),
      },
    ]),
    actionColumn<AdminUser>({
      title: '操作',
      width: 80,
      pin: 'right',
      render: (row) => {
        const menuItems: MenuItemType[] = [
          {key: 'edit', label: '编辑', icon: <SquarePen size={16} />},
          {key: 'role', label: '角色管理', icon: <UserCog size={16} />},
          {type: 'divider' as const},
          {
            key: 'ban',
            label: row.banned ? '解封' : '封禁',
            icon: row.banned ? <ShieldCheck size={16} /> : <Ban size={16} />,
          },
          {key: 'revoke', label: '撤销会话', icon: <LogOut size={16} />},
          {type: 'divider' as const},
          {
            key: 'delete',
            label: '删除',
            icon: <Trash2 size={16} />,
            danger: true,
          },
        ]

        const handleClick = (key: string) => {
          switch (key) {
            case 'edit':
              return handlers.onEdit(row)
            case 'role':
              return handlers.onSetRole(row)
            case 'ban':
              return handlers.onToggleBan(row)
            case 'revoke':
              return handlers.onRevokeSessions(row)
            case 'delete':
              return handlers.onDelete(row)
          }
        }

        return (
          <Dropdown
            items={menuItems}
            onClick={handleClick}
          >
            <Button
              variant="ghost"
              size="icon"
            >
              <MoreHorizontal size={16} />
            </Button>
          </Dropdown>
        )
      },
    }),
  ]
}

// ==================== 页面组件 ====================

function AdminPage() {
  const [searchValue, setSearchValue] = createSignal('')
  const [roleFilter, setRoleFilter] = createSignal<string | undefined>('')
  const [users, setUsers] = createSignal<AdminUser[]>([])
  const [total, setTotal] = createSignal(0)
  const [loading, setLoading] = createSignal(true)

  // ===== 弹窗状态 =====
  const [currentUser, setCurrentUser] = createSignal<AdminUser | null>(null)
  const [editOpen, setEditOpen] = createSignal(false)
  const [roleOpen, setRoleOpen] = createSignal(false)
  const [banOpen, setBanOpen] = createSignal(false)
  const [deleteOpen, setDeleteOpen] = createSignal(false)
  const [createOpen, setCreateOpen] = createSignal(false)
  const [batchBanOpen, setBatchBanOpen] = createSignal(false)
  const [batchDeleteOpen, setBatchDeleteOpen] = createSignal(false)

  const {tableProps, state, selectedRows, resetSelection} = useDataTable({
    pageSize: 10,
    deps: () => [searchValue(), roleFilter()],
  })

  // ===== 加载数据 =====
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const {pagination, sorting} = state()
      const query: Record<string, unknown> = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        searchOperator: 'contains' as const,
      }

      const search = searchValue().trim()
      if (search) {
        query.searchValue = search
        query.searchField = 'email'
      }

      if (sorting.length > 0) {
        query.sortBy = sorting[0].id
        query.sortDirection = sorting[0].desc ? 'desc' : 'asc'
      }

      const role = roleFilter()
      if (role) {
        query.filterField = 'role'
        query.filterValue = role
        query.filterOperator = 'eq'
      }

      const result = await authClient.admin.listUsers({
        query: query as Parameters<
          typeof authClient.admin.listUsers
        >[0]['query'],
      })

      if (result.data) {
        const data = result.data as unknown as ListUsersResponse
        setUsers(data.users)
        setTotal(data.total)
      }
    } catch {
      toast.error('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  createEffect(() => {
    state()
    searchValue()
    roleFilter()
    fetchUsers()
  })

  // ===== 单行操作（打开弹窗） =====
  const handleEdit = (user: AdminUser) => {
    setCurrentUser(user)
    setEditOpen(true)
  }

  const handleSetRole = (user: AdminUser) => {
    setCurrentUser(user)
    setRoleOpen(true)
  }

  const handleToggleBan = async (user: AdminUser) => {
    if (user.banned) {
      // 已封禁则直接解封
      try {
        await authClient.admin.unbanUser({userId: user.id})
        toast.success(`已解封用户 ${user.name}`)
        fetchUsers()
      } catch {
        toast.error('解封失败')
      }
    } else {
      // 未封禁则打开封禁弹窗
      setCurrentUser(user)
      setBanOpen(true)
    }
  }

  const handleRevokeSessions = async (user: AdminUser) => {
    try {
      await authClient.admin.revokeUserSessions({userId: user.id})
      toast.success(`已撤销 ${user.name} 的所有会话`)
    } catch {
      toast.error('撤销会话失败')
    }
  }

  const handleDelete = (user: AdminUser) => {
    setCurrentUser(user)
    setDeleteOpen(true)
  }

  // ===== 弹窗操作成功回调 =====
  const handleDialogSuccess = () => {
    resetSelection()
    fetchUsers()
  }

  // ===== 批量操作（打开弹窗） =====
  const handleBatchBan = () => {
    setBatchBanOpen(true)
  }

  const handleBatchUnban = async () => {
    const ids = selectedRows()
    try {
      await Promise.all(
        ids.map((id) => authClient.admin.unbanUser({userId: id})),
      )
      toast.success(`已批量解封 ${ids.length} 个用户`)
      resetSelection()
      fetchUsers()
    } catch {
      toast.error('批量解封失败')
    }
  }

  const handleBatchDelete = () => {
    setBatchDeleteOpen(true)
  }

  const cols = createColumns({
    onEdit: handleEdit,
    onSetRole: handleSetRole,
    onToggleBan: handleToggleBan,
    onRevokeSessions: handleRevokeSessions,
    onDelete: handleDelete,
  })

  return (
    <div class="mx-auto max-w-7xl p-6">
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">用户管理</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            管理系统中的所有用户账号
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus size={16} />
          新建用户
        </Button>
      </div>

      {/* 搜索和筛选栏 */}
      <div class="mb-4 flex items-center gap-3">
        <div class="w-80">
          <Input
            placeholder="搜索邮箱..."
            value={searchValue()}
            onInput={(v) => setSearchValue(v)}
            prefix={
              <Search
                size={16}
                class="text-muted-foreground"
              />
            }
            allowClear
            onClear={() => setSearchValue('')}
          />
        </div>
        <div class="w-40">
          <Select
            options={roleOptions}
            value={roleFilter()}
            onChange={(v) => setRoleFilter(v as string | undefined)}
            placeholder="角色筛选"
            size="md"
          />
        </div>
      </div>

      {/* 批量操作栏 */}
      <Show when={selectedRows().length > 0}>
        <div class="mb-4 flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2.5">
          <span class="text-sm text-muted-foreground">
            已选中{' '}
            <span class="font-medium text-foreground">
              {selectedRows().length}
            </span>{' '}
            个用户
          </span>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchBan}
            >
              <Ban size={14} />
              批量封禁
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchUnban}
            >
              <ShieldCheck size={14} />
              批量解封
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
            >
              <Trash2 size={14} />
              批量删除
            </Button>
          </div>
        </div>
      </Show>

      {/* 数据表格 */}
      <DataTable
        data={users()}
        columns={cols}
        rowCount={total()}
        loading={loading()}
        selectable
        hoverable
        getRowId={(row) => row.id}
        emptyText="暂无用户数据"
        {...tableProps}
      />

      {/* 弹窗组件 */}
      <Show when={currentUser()}>
        {(user) => (
          <>
            <EditUserDialog
              open={editOpen()}
              onOpenChange={setEditOpen}
              user={user()}
              onSuccess={handleDialogSuccess}
            />
            <SetRoleDialog
              open={roleOpen()}
              onOpenChange={setRoleOpen}
              user={user()}
              onSuccess={handleDialogSuccess}
            />
            <BanUserDialog
              open={banOpen()}
              onOpenChange={setBanOpen}
              user={user()}
              onSuccess={handleDialogSuccess}
            />
            <DeleteUserConfirm
              open={deleteOpen()}
              onOpenChange={setDeleteOpen}
              user={user()}
              onSuccess={handleDialogSuccess}
            />
          </>
        )}
      </Show>

      <CreateUserDialog
        open={createOpen()}
        onOpenChange={setCreateOpen}
        onSuccess={handleDialogSuccess}
      />

      <BatchBanDialog
        open={batchBanOpen()}
        onOpenChange={setBatchBanOpen}
        userIds={selectedRows()}
        onSuccess={handleDialogSuccess}
      />

      <BatchDeleteDialog
        open={batchDeleteOpen()}
        onOpenChange={setBatchDeleteOpen}
        userIds={selectedRows()}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

// ==================== 路由导出 ====================

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminPage,
})
