import type {RoleTemplate} from '@beeve/contracts'
import {
  Badge,
  Button,
  Card,
  Dialog,
  Input,
  Table,
  type ColumnDef,
} from '@beeve/ui'
import {
  createMutation as createTanstackMutation,
  createQuery,
  useQueryClient,
} from '@tanstack/solid-query'
import {createFileRoute} from '@tanstack/solid-router'
import {Check, Pencil, Plus, Trash2} from 'lucide-solid'
import {For, Show, createSignal} from 'solid-js'
import {
  createRole,
  deleteRole,
  fetchRoles,
  updateRole,
} from '../../lib/admin-api'

export const Route = createFileRoute('/admin/permissions')({
  component: PermissionsPage,
})

// 权限列表（用于创建角色时选择）
const AVAILABLE_PERMISSIONS = [
  {key: 'user:read', label: '用户查看', description: '查看用户列表和详情'},
  {key: 'user:write', label: '用户管理', description: '创建、编辑、禁用用户'},
  {key: 'role:read', label: '角色查看', description: '查看角色模板'},
  {
    key: 'role:write',
    label: '角色管理',
    description: '创建、编辑、删除角色模板',
  },
  {key: 'audit:read', label: '审计查看', description: '查看审计日志'},
  {key: 'settings:read', label: '设置查看', description: '查看系统设置'},
]

function PermissionsPage() {
  const queryClient = useQueryClient()
  const [showCreateDialog, setShowCreateDialog] = createSignal(false)
  const [showEditDialog, setShowEditDialog] = createSignal(false)
  const [showDeleteDialog, setShowDeleteDialog] = createSignal(false)
  const [selectedRole, setSelectedRole] = createSignal<RoleTemplate | null>(
    null,
  )
  const [roleName, setRoleName] = createSignal('')
  const [roleDescription, setRoleDescription] = createSignal('')
  const [selectedPermissions, setSelectedPermissions] = createSignal<string[]>(
    [],
  )

  // 查询角色列表
  const rolesQuery = createQuery(() => ({
    queryKey: ['admin', 'roles'],
    queryFn: fetchRoles,
  }))

  // 创建角色 mutation
  const createRoleMutation = createTanstackMutation(() => ({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin', 'roles']})
      setShowCreateDialog(false)
      resetForm()
    },
  }))

  // 更新角色 mutation
  const updateMutation = createTanstackMutation(() => ({
    mutationFn: ({
      roleId,
      data,
    }: {roleId: string; data: Parameters<typeof updateRole>[1]}) =>
      updateRole(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin', 'roles']})
      setShowEditDialog(false)
      setSelectedRole(null)
      resetForm()
    },
  }))

  // 删除角色 mutation
  const deleteMutation = createTanstackMutation(() => ({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin', 'roles']})
      setShowDeleteDialog(false)
      setSelectedRole(null)
    },
  }))

  const resetForm = () => {
    setRoleName('')
    setRoleDescription('')
    setSelectedPermissions([])
  }

  const handleCreate = () => {
    setShowCreateDialog(true)
    resetForm()
  }

  const handleEdit = (role: RoleTemplate) => {
    setSelectedRole(role)
    setRoleName(role.name)
    setRoleDescription(role.description || '')
    setSelectedPermissions(role.permissions)
    setShowEditDialog(true)
  }

  const handleDelete = (role: RoleTemplate) => {
    setSelectedRole(role)
    setShowDeleteDialog(true)
  }

  const confirmCreate = () => {
    createRoleMutation.mutate({
      name: roleName(),
      description: roleDescription(),
      permissions: selectedPermissions(),
    })
  }

  const confirmUpdate = () => {
    const role = selectedRole()
    if (!role) return
    updateMutation.mutate({
      roleId: role.id,
      data: {
        name: roleName(),
        description: roleDescription(),
        permissions: selectedPermissions(),
      },
    })
  }

  const confirmDelete = () => {
    const role = selectedRole()
    if (!role) return
    deleteMutation.mutate(role.id)
  }

  const columns: ColumnDef<RoleTemplate, unknown>[] = [
    {
      accessorKey: 'name',
      header: '角色名称',
      cell: (info) => {
        const role = info.row.original
        return (
          <div>
            <p class="font-medium text-[var(--sea-ink)]">{role.name}</p>
            {role.description && (
              <p class="text-sm text-[var(--sea-ink-soft)]">
                {role.description}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'permissions',
      header: '权限',
      cell: (info) => {
        const permissions = info.getValue() as string[]
        return (
          <div class="flex flex-wrap gap-1">
            <For each={permissions.slice(0, 3)}>
              {(perm) => {
                const permInfo = AVAILABLE_PERMISSIONS.find(
                  (p) => p.key === perm,
                )
                return (
                  <Badge
                    variant="secondary"
                    size="sm"
                  >
                    {permInfo?.label || perm}
                  </Badge>
                )
              }}
            </For>
            {permissions.length > 3 && (
              <Badge
                variant="outline"
                size="sm"
              >
                +{permissions.length - 3}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'isSystem',
      header: '类型',
      cell: (info) => {
        const isSystem = info.getValue() as boolean
        return isSystem ? (
          <Badge variant="default">系统</Badge>
        ) : (
          <Badge variant="secondary">自定义</Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: (info) => {
        const role = info.row.original
        return (
          <div class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(role)}
              disabled={role.isSystem}
              title={role.isSystem ? '系统角色不可编辑' : '编辑'}
            >
              <Pencil class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(role)}
              disabled={role.isSystem}
              title={role.isSystem ? '系统角色不可删除' : '删除'}
            >
              <Trash2 class="size-4 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]

  const PermissionSelector = (props: {
    value: string[]
    onChange: (permissions: string[]) => void
  }) => {
    return (
      <div class="space-y-2">
        <p class="text-sm font-medium text-[var(--sea-ink)]">选择权限</p>
        <div class="grid gap-2">
          <For each={AVAILABLE_PERMISSIONS}>
            {(perm) => {
              const isSelected = () => props.value.includes(perm.key)
              return (
                <button
                  type="button"
                  onClick={() => {
                    const newValue = isSelected()
                      ? props.value.filter((p) => p !== perm.key)
                      : [...props.value, perm.key]
                    props.onChange(newValue)
                  }}
                  class={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    isSelected()
                      ? 'border-[var(--lagoon)] bg-[var(--lagoon)]/5'
                      : 'border-[var(--line)] hover:bg-[var(--foam)]'
                  }`}
                >
                  <div
                    class={`flex size-5 shrink-0 items-center justify-center rounded border ${
                      isSelected()
                        ? 'border-[var(--lagoon)] bg-[var(--lagoon)] text-white'
                        : 'border-[var(--line)]'
                    }`}
                  >
                    {isSelected() && <Check class="size-3.5" />}
                  </div>
                  <div>
                    <p class="font-medium text-[var(--sea-ink)]">
                      {perm.label}
                    </p>
                    <p class="text-xs text-[var(--sea-ink-soft)]">
                      {perm.description}
                    </p>
                  </div>
                </button>
              )
            }}
          </For>
        </div>
      </div>
    )
  }

  return (
    <div class="space-y-4">
      {/* 头部 */}
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-[var(--sea-ink)]">角色模板</h2>
          <p class="text-sm text-[var(--sea-ink-soft)]">
            管理用户角色和权限配置
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus class="size-4" />
          创建角色
        </Button>
      </div>

      {/* 角色表格 */}
      <Card class="p-4">
        <Show
          when={!rolesQuery.isLoading}
          fallback={
            <div class="py-8 text-center text-[var(--sea-ink-soft)]">
              加载中...
            </div>
          }
        >
          <Table
            data={rolesQuery.data?.data || []}
            columns={columns}
            emptyText="暂无角色数据"
          />
        </Show>
      </Card>

      {/* 创建角色对话框 */}
      <Dialog
        open={showCreateDialog()}
        onOpenChange={setShowCreateDialog}
        title="创建角色"
        onOk={confirmCreate}
        confirmLoading={createRoleMutation.isPending}
        okText="创建"
        cancelText="取消"
      >
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
              角色名称
            </label>
            <Input
              placeholder="输入角色名称"
              value={roleName()}
              onInput={(val) => setRoleName(val)}
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
              描述
            </label>
            <Input
              inputType="textarea"
              placeholder="输入角色描述（可选）"
              value={roleDescription()}
              onInput={(val) => setRoleDescription(val)}
              rows={2}
            />
          </div>
          <PermissionSelector
            value={selectedPermissions()}
            onChange={setSelectedPermissions}
          />
          {createRoleMutation.error && (
            <p class="text-sm text-destructive">
              {createRoleMutation.error.message}
            </p>
          )}
        </div>
      </Dialog>

      {/* 编辑角色对话框 */}
      <Dialog
        open={showEditDialog()}
        onOpenChange={setShowEditDialog}
        title="编辑角色"
        onOk={confirmUpdate}
        confirmLoading={updateMutation.isPending}
        okText="保存"
        cancelText="取消"
      >
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
              角色名称
            </label>
            <Input
              placeholder="输入角色名称"
              value={roleName()}
              onInput={(val) => setRoleName(val)}
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
              描述
            </label>
            <Input
              inputType="textarea"
              placeholder="输入角色描述（可选）"
              value={roleDescription()}
              onInput={(val) => setRoleDescription(val)}
              rows={2}
            />
          </div>
          <PermissionSelector
            value={selectedPermissions()}
            onChange={setSelectedPermissions}
          />
          {updateMutation.error && (
            <p class="text-sm text-destructive">
              {updateMutation.error.message}
            </p>
          )}
        </div>
      </Dialog>

      {/* 删除角色对话框 */}
      <Dialog
        open={showDeleteDialog()}
        onOpenChange={setShowDeleteDialog}
        title="删除角色"
        description={`确定要删除角色 "${selectedRole()?.name}" 吗？此操作不可恢复。`}
        onOk={confirmDelete}
        confirmLoading={deleteMutation.isPending}
        okType="destructive"
        okText="删除"
        cancelText="取消"
      />
    </div>
  )
}
