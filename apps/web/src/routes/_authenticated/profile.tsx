/**
 * 个人资料页面
 */
import {Button, Card, Input, Label} from '@beeve/ui'
import {createFileRoute} from '@tanstack/solid-router'
import {createSignal} from 'solid-js'

// 定义路由上下文类型
interface ProfileContext {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const context = Route.useRouteContext() as unknown as () => ProfileContext
  const user = () => context().user

  const [isEditing, setIsEditing] = createSignal(false)
  const [name, setName] = createSignal(user()?.name || '')

  const handleSave = () => {
    // TODO: 实现保存逻辑
    setIsEditing(false)
  }

  return (
    <div class="space-y-6">
      <h1 class="text-3xl font-bold">个人资料</h1>

      <div class="grid gap-6">
        <Card class="p-6">
          <h2 class="text-lg font-semibold mb-4">基本信息</h2>

          <div class="space-y-4">
            <div>
              <Label>用户 ID</Label>
              <p class="text-sm text-gray-500">{user()?.id}</p>
            </div>

            <div>
              <Label>邮箱</Label>
              <p class="text-sm">{user()?.email}</p>
            </div>

            <div>
              <Label for="name">昵称</Label>
              {isEditing() ? (
                <Input
                  id="name"
                  value={name()}
                  onInput={(value) => setName(value)}
                />
              ) : (
                <p class="text-sm">{user()?.name}</p>
              )}
            </div>

            <div class="flex gap-2">
              {isEditing() ? (
                <>
                  <Button onClick={handleSave}>保存</Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    取消
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  编辑
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <h2 class="text-lg font-semibold mb-4">账号安全</h2>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">修改密码</p>
              <p class="text-sm text-gray-500">定期修改密码可以保护账号安全</p>
            </div>
            <Button variant="outline">修改</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
