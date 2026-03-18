import {createFileRoute} from '@tanstack/solid-router'
import type {JSX} from 'solid-js'
import {
  Suspense,
  Show,
  For,
  createMemo,
  createResource,
  createSignal,
} from 'solid-js'
import {
  Card,
  Button,
  Badge,
  Input,
  Table,
  columns,
  actionColumn,
} from '@beeve/ui'
import {
  Users,
  Search,
  RefreshCw,
  Shield,
  Ban,
  CheckCircle,
  LogOut,
} from 'lucide-solid'
import {requireAdmin} from '@/lib/guards'
import {loadAdminUsersData, loadCurrentUserData} from '@/lib/loaders/account'
import {AppLayout} from '@/components/AppLayout'
import {applyAdminBatchAction} from '@/lib/services/client/account'
import type {AppUserDto, BatchUserAction} from '@/lib/services/contracts'
import {countAdminUsers} from '@/lib/services/serializers'
import {isAdminRole} from '@/lib/auth/policy'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => requireAdmin(),
  loader: async () => loadCurrentUserData(),
  component: AdminPage,
})

function AdminPage() {
  const me = Route.useLoaderData()
  const [searchQuery, setSearchQuery] = createSignal('')
  const [selection, setSelection] = createSignal<Record<string, boolean>>({})
  const [actionMessage, setActionMessage] = createSignal<string | null>(null)
  const [pendingAction, setPendingAction] = createSignal<string | null>(null)
  const [users, {refetch: refetchUsers}] = createResource(() =>
    loadAdminUsersData(),
  )

  const filteredUsers = createMemo(() => {
    const query = searchQuery().trim().toLowerCase()
    const list = users()?.users ?? []

    if (!query) {
      return list
    }

    return list.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    )
  })

  const selectedUserIds = createMemo(() =>
    Object.entries(selection())
      .filter(([, selected]) => selected)
      .map(([id]) => id),
  )

  const runBatchAction = async (
    action: BatchUserAction,
    userIds = selectedUserIds(),
  ) => {
    setPendingAction(action.type)
    setActionMessage(null)

    try {
      const result = await applyAdminBatchAction({
        userIds,
        action,
      })
      void refetchUsers()
      setSelection({})
      setActionMessage(
        `${result.processedUserIds.length} user(s) updated via ${result.action}.`,
      )
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : 'Failed to update users.',
      )
    } finally {
      setPendingAction(null)
    }
  }

  const userColumns = [
    ...columns<AppUserDto>([
      {
        key: 'name',
        title: 'User',
        render: (_value, user) => (
          <div class="flex items-center gap-3">
            <Show
              when={user.image}
              fallback={
                <div class="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              }
            >
              <img
                src={user.image ?? ''}
                alt={user.name}
                class="size-8 rounded-full object-cover"
              />
            </Show>
            <div>
              <p class="font-medium">{user.name}</p>
              <p class="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        title: 'Role',
        render: (_value, user) => (
          <Badge variant={isAdminRole(user.role) ? 'default' : 'secondary'}>
            {user.role}
          </Badge>
        ),
      },
      {
        key: 'banned',
        title: 'Status',
        render: (_value, user) => (
          <Show
            when={!user.banned}
            fallback={<Badge variant="destructive">Banned</Badge>}
          >
            <Badge variant="outline">Active</Badge>
          </Show>
        ),
      },
      {
        key: 'createdAt',
        title: 'Joined',
        render: (_value, user) => (
          <span class="text-muted-foreground">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ]),
    actionColumn<AppUserDto>({
      title: 'Actions',
      render: (user) => (
        <div class="flex items-center justify-end gap-1">
          <Show when={!isAdminRole(user.role)}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                runBatchAction({type: 'set-role', role: 'admin'}, [user.id])
              }
              title="Promote to admin"
            >
              <Shield class="size-3.5" />
            </Button>
          </Show>
          <Show when={isAdminRole(user.role)}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                runBatchAction({type: 'set-role', role: 'user'}, [user.id])
              }
              title="Demote to user"
            >
              <CheckCircle class="size-3.5" />
            </Button>
          </Show>
          <Show when={!user.banned}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runBatchAction({type: 'ban'}, [user.id])}
              title="Ban user"
            >
              <Ban class="size-3.5 text-destructive" />
            </Button>
          </Show>
          <Show when={user.banned}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runBatchAction({type: 'unban'}, [user.id])}
              title="Unban user"
            >
              <CheckCircle class="size-3.5 text-green-500" />
            </Button>
          </Show>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => runBatchAction({type: 'revoke-sessions'}, [user.id])}
            title="Revoke user sessions"
          >
            <LogOut class="size-3.5" />
          </Button>
        </div>
      ),
    }),
  ]

  return (
    <AppLayout
      user={me().user}
      currentPath="/admin"
      pageTitle="Admin workspace"
      pageDescription="Administrative routes are still guarded on the server, while the user roster streams in underneath this shell."
      pageActions={
        <Button variant="outline" onClick={() => void refetchUsers()} loading={users.loading}>
          <RefreshCw class="size-4" />
          Refresh
        </Button>
      }
    >
      <div class="space-y-6">
        <Card variant="outlined" size="lg">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold tracking-tight">User operations</h2>
              <p class="mt-1 max-w-2xl text-sm text-muted-foreground">
                This area is optimized for high-signal tasks: search, select, then
                apply one controlled action across a batch.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{selectedUserIds().length} selected</Badge>
              <Badge variant="outline">Server-checked admin access</Badge>
            </div>
          </div>
        </Card>

        <Suspense fallback={<AdminUsersFallback />}>
          <AdminUsersSection
            users={filteredUsers}
            rawUsers={users}
            actionMessage={actionMessage}
            pendingAction={pendingAction}
            selection={selection}
            onSelection={setSelection}
            searchQuery={searchQuery}
            onSearchQuery={setSearchQuery}
            selectedUserIds={selectedUserIds}
            onRunBatchAction={runBatchAction}
            userColumns={userColumns}
          />
        </Suspense>
      </div>
    </AppLayout>
  )
}

function AdminUsersSection(props: {
  users: () => AppUserDto[]
  rawUsers: () => {users: AppUserDto[]; total: number} | undefined
  actionMessage: () => string | null
  pendingAction: () => string | null
  selection: () => Record<string, boolean>
  onSelection: (selection: Record<string, boolean>) => void
  searchQuery: () => string
  onSearchQuery: (value: string) => void
  selectedUserIds: () => string[]
  onRunBatchAction: (
    action: BatchUserAction,
    userIds?: string[],
  ) => Promise<void>
  userColumns: Array<unknown>
}) {
  const allUsers = createMemo(() => props.rawUsers()?.users ?? [])

  return (
    <>
      <div class="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Users class="size-5 text-primary" />}
          label="Total users"
          value={String(props.rawUsers()?.total ?? 0)}
        />
        <StatCard
          icon={<Shield class="size-5 text-primary" />}
          label="Admins"
          value={String(countAdminUsers(allUsers()))}
        />
        <StatCard
          icon={<Ban class="size-5 text-destructive" />}
          label="Banned"
          value={String(allUsers().filter((user) => user.banned).length)}
        />
      </div>

      <Card variant="outlined" size="md">
        <div class="mb-4 flex flex-col gap-3">
          <Input
            type="search"
            placeholder="Search users by name or email..."
            prefix={<Search class="size-4" />}
            value={props.searchQuery()}
            onInput={props.onSearchQuery}
            allowClear
          />

          <div class="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={props.selectedUserIds().length === 0}
              loading={props.pendingAction() === 'set-role'}
              onClick={() =>
                void props.onRunBatchAction({type: 'set-role', role: 'admin'})
              }
            >
              Promote
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={props.selectedUserIds().length === 0}
              loading={props.pendingAction() === 'set-role'}
              onClick={() =>
                void props.onRunBatchAction({type: 'set-role', role: 'user'})
              }
            >
              Demote
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={props.selectedUserIds().length === 0}
              loading={props.pendingAction() === 'ban'}
              onClick={() => void props.onRunBatchAction({type: 'ban'})}
            >
              Ban
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={props.selectedUserIds().length === 0}
              loading={props.pendingAction() === 'unban'}
              onClick={() => void props.onRunBatchAction({type: 'unban'})}
            >
              Unban
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={props.selectedUserIds().length === 0}
              loading={props.pendingAction() === 'revoke-sessions'}
              onClick={() =>
                void props.onRunBatchAction({type: 'revoke-sessions'})
              }
            >
              Revoke sessions
            </Button>
          </div>

          <Show when={props.actionMessage()}>
            {(message) => <p class="text-sm text-muted-foreground">{message()}</p>}
          </Show>
        </div>

        <Table
          data={props.users()}
          columns={props.userColumns as never}
          loading={false}
          hoverable
          emptyText="No users found"
          pageSize={20}
          selectable
          getRowId={(row) => row.id}
          selection={props.selection()}
          onSelection={props.onSelection}
        />
      </Card>
    </>
  )
}

function AdminUsersFallback() {
  return (
    <>
      <div class="grid gap-4 sm:grid-cols-3">
        <For each={Array.from({length: 3})}>
          {() => <div class="h-28 animate-pulse rounded-xl border border-border bg-card" />}
        </For>
      </div>
      <Card variant="outlined" size="md" loading loadingConfig={{rows: 6}} />
    </>
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
