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
} from 'lucide-solid'
import {authClient} from '../../lib/auth-client'

// ==================== 类型定义 ====================

type AdminUser = {
  id: string
  name: string
  email: string
  role: string | null
  banned: boolean | null
  banReason: string | null
  banExpires: string | null
  createdAt: string
  image: string | null
  emailVerified: boolean
}

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

  // ===== 单行操作 =====
  const handleEdit = (user: AdminUser) => {
    toast.info(`编辑用户: ${user.name}（功能开发中）`)
  }

  const handleSetRole = async (user: AdminUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    try {
      await authClient.admin.setRole({userId: user.id, role: newRole})
      toast.success(
        `已将 ${user.name} 的角色设为 ${newRole === 'admin' ? '管理员' : '用户'}`,
      )
      fetchUsers()
    } catch {
      toast.error('设置角色失败')
    }
  }

  const handleToggleBan = async (user: AdminUser) => {
    try {
      if (user.banned) {
        await authClient.admin.unbanUser({userId: user.id})
        toast.success(`已解封用户 ${user.name}`)
      } else {
        await authClient.admin.banUser({
          userId: user.id,
          banReason: '管理员操作',
        })
        toast.success(`已封禁用户 ${user.name}`)
      }
      fetchUsers()
    } catch {
      toast.error(user.banned ? '解封失败' : '封禁失败')
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

  const handleDelete = async (user: AdminUser) => {
    try {
      await authClient.admin.removeUser({userId: user.id})
      toast.success(`已删除用户 ${user.name}`)
      fetchUsers()
    } catch {
      toast.error('删除用户失败')
    }
  }

  // ===== 批量操作 =====
  const handleBatchBan = async () => {
    const ids = selectedRows()
    try {
      await Promise.all(
        ids.map((id) =>
          authClient.admin.banUser({userId: id, banReason: '批量封禁'}),
        ),
      )
      toast.success(`已批量封禁 ${ids.length} 个用户`)
      resetSelection()
      fetchUsers()
    } catch {
      toast.error('批量封禁失败')
    }
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

  const handleBatchDelete = async () => {
    const ids = selectedRows()
    try {
      await Promise.all(
        ids.map((id) => authClient.admin.removeUser({userId: id})),
      )
      toast.success(`已批量删除 ${ids.length} 个用户`)
      resetSelection()
      fetchUsers()
    } catch {
      toast.error('批量删除失败')
    }
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
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-foreground">用户管理</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          管理系统中的所有用户账号
        </p>
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
    </div>
  )
}

// ==================== 路由导出 ====================

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})
