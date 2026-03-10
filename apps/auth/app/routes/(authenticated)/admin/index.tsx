import {createFileRoute, Link} from '@tanstack/solid-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@beeve/ui'
import {Users, Shield, ClipboardList, ArrowRight} from 'lucide-solid'
import {PermissionGuard} from '~/components/layout/PermissionGuard'

export const Route = createFileRoute('/(authenticated)/admin/')({
  component: AdminIndexPage,
})

function AdminIndexPage() {
  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold">管理后台</h1>
        <p class="text-muted-foreground">选择下方的管理模块开始工作</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PermissionGuard permission="user:read">
          <Link to="/admin/users">
            <Card class="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Users class="h-5 w-5 text-primary" />
                    <CardTitle>用户管理</CardTitle>
                  </div>
                  <ArrowRight class="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>管理系统用户、状态和权限</CardDescription>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">
                  查看、编辑、禁用/启用用户账号
                </p>
              </CardContent>
            </Card>
          </Link>
        </PermissionGuard>

        <PermissionGuard permission="role:read">
          <Link to="/admin/permissions">
            <Card class="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Shield class="h-5 w-5 text-primary" />
                    <CardTitle>权限管理</CardTitle>
                  </div>
                  <ArrowRight class="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>管理权限模板和角色</CardDescription>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">创建和编辑权限模板</p>
              </CardContent>
            </Card>
          </Link>
        </PermissionGuard>

        <PermissionGuard permission="audit:read">
          <Link to="/admin/audit-logs">
            <Card class="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <ClipboardList class="h-5 w-5 text-primary" />
                    <CardTitle>审计日志</CardTitle>
                  </div>
                  <ArrowRight class="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>查看系统操作记录</CardDescription>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">
                  追踪用户操作和系统事件
                </p>
              </CardContent>
            </Card>
          </Link>
        </PermissionGuard>
      </div>
    </div>
  )
}
