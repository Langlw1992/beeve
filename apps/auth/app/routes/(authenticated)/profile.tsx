import {createFileRoute} from '@tanstack/solid-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Badge,
} from '@beeve/ui'
import {User, Shield, Clock} from 'lucide-solid'

export const Route = createFileRoute('/(authenticated)/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const context = Route.useRouteContext()
  const user = () => context().user

  return (
    <div class="space-y-6 max-w-2xl">
      <div>
        <h1 class="text-2xl font-bold">个人资料</h1>
        <p class="text-muted-foreground">管理您的个人信息和设置</p>
      </div>

      <Card>
        <CardHeader>
          <div class="flex items-center gap-4">
            <div class="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
              {user()?.name?.[0] || 'U'}
            </div>
            <div>
              <CardTitle>{user()?.name}</CardTitle>
              <CardDescription>{user()?.email}</CardDescription>
              <div class="flex gap-2 mt-2">
                <Badge
                  variant={
                    user()?.userType === 'admin' ? 'default' : 'secondary'
                  }
                >
                  {user()?.userType === 'admin' ? '管理员' : '普通用户'}
                </Badge>
                <Badge
                  variant={
                    user()?.status === 'active' ? 'default' : 'destructive'
                  }
                  class={
                    user()?.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : ''
                  }
                >
                  {user()?.status === 'active' ? '启用' : '禁用'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <User class="h-5 w-5" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <Label for="name">姓名</Label>
            <Input
              id="name"
              defaultValue={user()?.name}
            />
          </div>
          <div class="grid gap-2">
            <Label for="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user()?.email}
              disabled
            />
          </div>
          <Button>保存修改</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Shield class="h-5 w-5" />
            我的权限
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-2">
            {context().permissions?.length === 0 ? (
              <p class="text-muted-foreground">暂无特殊权限</p>
            ) : (
              context().permissions?.map((perm: string) => (
                <Badge variant="outline">{perm}</Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Clock class="h-5 w-5" />
            活跃会话
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p class="font-medium">当前会话</p>
                <p class="text-sm text-muted-foreground">
                  Chrome on macOS · IP: 192.168.1.1
                </p>
              </div>
              <Badge>当前</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
