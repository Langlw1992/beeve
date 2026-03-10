import {createFileRoute} from '@tanstack/solid-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@beeve/ui'
import {PermissionGuard} from '~/components/layout/PermissionGuard'
import {Plus, Edit, Trash2} from 'lucide-solid'

const MOCK_ROLES = [
  {
    id: '1',
    name: '超级管理员',
    description: '拥有所有权限',
    permissions: ['*'],
    isSystem: true,
    userCount: 2,
  },
  {
    id: '2',
    name: '用户管理员',
    description: '管理用户和权限',
    permissions: ['user:read', 'user:write', 'user:write:status', 'role:read'],
    isSystem: true,
    userCount: 5,
  },
  {
    id: '3',
    name: '审计员',
    description: '查看审计日志',
    permissions: ['audit:read', 'user:read'],
    isSystem: false,
    userCount: 3,
  },
]

export const Route = createFileRoute('/(authenticated)/admin/permissions')({
  component: PermissionsPage,
})

function PermissionsPage() {
  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">权限管理</h1>
          <p class="text-muted-foreground">管理权限模板和角色</p>
        </div>

        <PermissionGuard permission="role:write">
          <Button>
            <Plus class="mr-2 h-4 w-4" />
            新建模板
          </Button>
        </PermissionGuard>
      </div>

      <div class="grid gap-4">
        {MOCK_ROLES.map((role) => (
          <Card>
            <CardHeader>
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <CardTitle>{role.name}</CardTitle>
                    {role.isSystem && <Badge variant="secondary">系统</Badge>}
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </div>
                <div class="flex items-center gap-2">
                  <PermissionGuard permission="role:write">
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <Edit class="h-4 w-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        class="text-destructive"
                      >
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    )}
                  </PermissionGuard>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <p class="text-sm font-medium mb-2">权限列表</p>
                <div class="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <Badge variant="outline">{perm}</Badge>
                  ))}
                </div>
              </div>
              <p class="text-sm text-muted-foreground">
                {role.userCount} 个用户在使用此模板
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
