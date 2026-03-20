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
import {formatUserRoleLabel, isAdminRole} from '@/lib/auth/policy'
import {applyAdminBatchAction} from '@/lib/services/client/account'
import type {AppUserDto, BatchUserAction} from '@/lib/services/contracts'
import {countAdminUsers} from '@/lib/services/serializers'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => requireAdmin(),
  loader: async () => loadCurrentUserData(),
  component: AdminPage,
})

const batchActionLabels: Record<BatchUserAction['type'], string> = {
  'set-role': '调整角色',
  ban: '封禁',
  unban: '解除封禁',
  'revoke-sessions': '回收会话',
}

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
        `已处理 ${result.processedUserIds.length} 位用户，执行“${batchActionLabels[result.action]}”。`,
      )
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : '无法更新用户。',
      )
    } finally {
      setPendingAction(null)
    }
  }

  const userColumns = [
    ...columns<AppUserDto>([
      {
        key: 'name',
        title: '用户',
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
        title: '角色',
        render: (_value, user) => (
          <Badge variant={isAdminRole(user.role) ? 'default' : 'secondary'}>
            {formatUserRoleLabel(user.role)}
          </Badge>
        ),
      },
      {
        key: 'banned',
        title: '状态',
        render: (_value, user) => (
          <Show
            when={!user.banned}
            fallback={<Badge variant="destructive">已封禁</Badge>}
          >
            <Badge variant="outline">正常</Badge>
          </Show>
        ),
      },
      {
        key: 'createdAt',
        title: '加入时间',
        render: (_value, user) => (
          <span class="text-muted-foreground">
            {new Date(user.createdAt).toLocaleDateString('zh-CN')}
          </span>
        ),
      },
    ]),
    actionColumn<AppUserDto>({
      title: '操作',
      render: (user) => (
        <div class="flex items-center justify-end gap-1">
          <Show when={!isAdminRole(user.role)}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                runBatchAction({type: 'set-role', role: 'admin'}, [user.id])
              }
              title="设为管理员"
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
              title="降为普通成员"
            >
              <CheckCircle class="size-3.5" />
            </Button>
          </Show>
          <Show when={!user.banned}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runBatchAction({type: 'ban'}, [user.id])}
              title="封禁用户"
            >
              <Ban class="size-3.5 text-destructive" />
            </Button>
          </Show>
          <Show when={user.banned}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runBatchAction({type: 'unban'}, [user.id])}
              title="解除封禁"
            >
              <CheckCircle class="size-3.5 text-green-500" />
            </Button>
          </Show>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => runBatchAction({type: 'revoke-sessions'}, [user.id])}
            title="回收用户会话"
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
      pageTitle="管理后台"
      pageDescription="管理员路由仍由服务端校验，用户列表会在壳层下方按需加载。"
      pageActions={
        <Button
          variant="outline"
          onClick={() => void refetchUsers()}
          loading={users.loading}
        >
          <RefreshCw class="size-4" />
          刷新数据
        </Button>
      }
    >
      <div class="space-y-6">
        <Card variant="outlined" size="lg">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold tracking-tight">用户管理</h2>
              <p class="mt-1 max-w-2xl text-sm text-muted-foreground">
                先搜索、再选择，然后对批量用户执行一个明确操作。
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <Badge variant="outline">已选 {selectedUserIds().length} 人</Badge>
              <Badge variant="outline">服务端已校验管理员权限</Badge>
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
          label="用户总数"
          value={String(props.rawUsers()?.total ?? 0)}
        />
        <StatCard
          icon={<Shield class="size-5 text-primary" />}
          label="管理员"
          value={String(countAdminUsers(allUsers()))}
        />
        <StatCard
          icon={<Ban class="size-5 text-destructive" />}
          label="已封禁"
          value={String(allUsers().filter((user) => user.banned).length)}
        />
      </div>

      <Card variant="outlined" size="md">
        <div class="mb-4 flex flex-col gap-3">
          <Input
            type="search"
            placeholder="按姓名或邮箱搜索用户..."
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
              设为管理员
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
              降为普通成员
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={props.selectedUserIds().length === 0}
              loading={props.pendingAction() === 'ban'}
              onClick={() => void props.onRunBatchAction({type: 'ban'})}
            >
              封禁
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={props.selectedUserIds().length === 0}
              loading={props.pendingAction() === 'unban'}
              onClick={() => void props.onRunBatchAction({type: 'unban'})}
            >
              解除封禁
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
              回收会话
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
          emptyText="暂无符合条件的用户"
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
