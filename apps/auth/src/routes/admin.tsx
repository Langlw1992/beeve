import {createFileRoute} from '@tanstack/solid-router'
import type {JSX} from 'solid-js'
import {createSignal, Show, createMemo} from 'solid-js'
import {createQuery, useQueryClient} from '@tanstack/solid-query'
import {Card, Button, Badge, Input, Table, columns, actionColumn} from '@beeve/ui'
import {Users, Search, RefreshCw, Shield, Ban, CheckCircle} from 'lucide-solid'
import {requireAdmin} from '@/lib/guards'
import {authClient} from '@/lib/auth/client'
import type {SelectUser} from '@/lib/auth/schema'
import {AppLayout} from '@/components/AppLayout'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => requireAdmin(),
  component: AdminPage,
})

function AdminPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = createSignal('')

  const users = createQuery(() => ({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const result = await authClient.admin.listUsers({
        query: {limit: 100},
      })
      return result.data?.users ?? []
    },
  }))

  const filteredUsers = createMemo(() => {
    const query = searchQuery().toLowerCase()
    const list = users.data ?? []
    if (!query) {
      return list
    }
    return list.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query),
    )
  })

  const invalidateUsers = () =>
    queryClient.invalidateQueries({queryKey: ['admin', 'users']})

  const handleBanUser = async (userId: string, banned: boolean) => {
    try {
      if (banned) {
        await authClient.admin.banUser({userId})
      } else {
        await authClient.admin.unbanUser({userId})
      }
      await invalidateUsers()
    } catch {
      // silently fail
    }
  }

  const handleSetRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      await authClient.admin.setRole({userId, role})
      await invalidateUsers()
    } catch {
      // silently fail
    }
  }

  const userColumns = [
    ...columns<SelectUser>([
      {
        key: 'name',
        title: 'User',
        render: (_v, u) => (
          <div class="flex items-center gap-3">
            <Show
              when={u.image}
              fallback={
                <div class="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
              }
            >
              <img
                src={u.image ?? ''}
                alt={u.name ?? ''}
                class="size-8 rounded-full object-cover"
              />
            </Show>
            <div>
              <p class="font-medium">{u.name ?? 'Unnamed'}</p>
              <p class="text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        title: 'Role',
        render: (_v, u) => (
          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
            {u.role ?? 'user'}
          </Badge>
        ),
      },
      {
        key: 'banned',
        title: 'Status',
        render: (_v, u) => (
          <Show
            when={!u.banned}
            fallback={<Badge variant="destructive">Banned</Badge>}
          >
            <Badge variant="outline">Active</Badge>
          </Show>
        ),
      },
      {
        key: 'createdAt',
        title: 'Joined',
        render: (_v, u) => (
          <span class="text-muted-foreground">
            {new Date(u.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ]),
    actionColumn<SelectUser>({
      title: 'Actions',
      render: (u) => (
        <div class="flex items-center justify-end gap-1">
          <Show when={u.role !== 'admin'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSetRole(u.id, 'admin')}
              title="Promote to admin"
            >
              <Shield class="size-3.5" />
            </Button>
          </Show>
          <Show when={u.role === 'admin'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSetRole(u.id, 'user')}
              title="Demote to user"
            >
              <CheckCircle class="size-3.5" />
            </Button>
          </Show>
          <Show when={!u.banned}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBanUser(u.id, true)}
              title="Ban user"
            >
              <Ban class="size-3.5 text-destructive" />
            </Button>
          </Show>
          <Show when={u.banned}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBanUser(u.id, false)}
              title="Unban user"
            >
              <CheckCircle class="size-3.5 text-green-500" />
            </Button>
          </Show>
        </div>
      ),
    }),
  ]

  return (
    <AppLayout>
      <div class="mx-auto max-w-5xl space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <p class="text-muted-foreground">Manage users and permissions</p>
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={invalidateUsers}
            loading={users.isPending}
          >
            <RefreshCw class="size-4" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div class="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Users class="size-5 text-primary" />}
            label="Total Users"
            value={String(users.data?.length ?? 0)}
          />
          <StatCard
            icon={<Shield class="size-5 text-primary" />}
            label="Admins"
            value={String(
              users.data?.filter((u) => u.role === 'admin').length ?? 0,
            )}
          />
          <StatCard
            icon={<Ban class="size-5 text-destructive" />}
            label="Banned"
            value={String(users.data?.filter((u) => u.banned).length ?? 0)}
          />
        </div>

        {/* User list */}
        <Card variant="outlined" size="md">
          {/* Search */}
          <div class="mb-4">
            <Input
              type="search"
              placeholder="Search users by name or email..."
              prefix={<Search class="size-4" />}
              value={searchQuery()}
              onInput={(value) => setSearchQuery(value)}
              allowClear
            />
          </div>

          {/* Table */}
          <Table
            data={filteredUsers()}
            columns={userColumns}
            loading={users.isPending}
            hoverable
            emptyText="No users found"
            pageSize={20}
          />
        </Card>
      </div>
    </AppLayout>
  )
}

function StatCard(props: {icon: JSX.Element; label: string; value: string}) {
  return (
    <div class="rounded-xl border border-border bg-card p-4">
      <div class="mb-2 flex items-center gap-2">
        {props.icon}
        <span class="text-sm text-muted-foreground">{props.label}</span>
      </div>
      <p class="text-2xl font-bold">{props.value}</p>
    </div>
  )
}
