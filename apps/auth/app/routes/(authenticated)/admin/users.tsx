import {createFileRoute} from '@tanstack/solid-router'
import {createResource, Suspense, createSignal} from 'solid-js'
import {Button, Input, Badge, Card, CardContent, CardHeader} from '@beeve/ui'
import {PermissionGuard} from '~/components/layout/PermissionGuard'
import {Search, Plus} from 'lucide-solid'

// 模拟用户数据
const MOCK_USERS = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    userType: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    userType: 'regular',
    status: 'active',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    userType: 'regular',
    status: 'disabled',
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    userType: 'regular',
    status: 'active',
  },
]

async function fetchUsers(): Promise<typeof MOCK_USERS> {
  // TODO: 从API获取真实数据
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_USERS), 500)
  })
}

export const Route = createFileRoute('/(authenticated)/admin/users')({
  component: UsersPage,
  loader: async () => {
    // 服务端预取数据
    return {users: await fetchUsers()}
  },
})

function UsersPage() {
  const loaderData = Route.useLoaderData()
  const initialUsers = () => loaderData()?.users ?? []
  const [users] = createResource(initialUsers)
  const [searchQuery, setSearchQuery] = createSignal('')

  const filteredUsers = () => {
    const query = searchQuery().toLowerCase()
    const userList = users() ?? []
    if (!query) {
      return userList
    }
    return userList.filter(
      (u: (typeof MOCK_USERS)[0]) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query),
    )
  }

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">用户管理</h1>
          <p class="text-muted-foreground">管理系统用户和权限</p>
        </div>

        <PermissionGuard permission="user:write">
          <Button>
            <Plus class="mr-2 h-4 w-4" />
            新增用户
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <div class="flex items-center gap-4">
            <div class="relative flex-1 max-w-sm">
              <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户..."
                class="pl-8"
                value={searchQuery()}
                onInput={(value) => setSearchQuery(value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>加载中...</div>}>
            <div class="rounded-md border">
              <table class="w-full">
                <thead class="bg-muted/50">
                  <tr>
                    <th class="py-3 px-4 text-left font-medium">姓名</th>
                    <th class="py-3 px-4 text-left font-medium">邮箱</th>
                    <th class="py-3 px-4 text-left font-medium">类型</th>
                    <th class="py-3 px-4 text-left font-medium">状态</th>
                    <th class="py-3 px-4 text-left font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers().map((user: (typeof MOCK_USERS)[0]) => (
                    <tr class="border-t">
                      <td class="py-3 px-4">{user.name}</td>
                      <td class="py-3 px-4">{user.email}</td>
                      <td class="py-3 px-4">
                        <Badge
                          variant={
                            user.userType === 'admin' ? 'default' : 'secondary'
                          }
                        >
                          {user.userType === 'admin' ? '管理员' : '普通用户'}
                        </Badge>
                      </td>
                      <td class="py-3 px-4">
                        <Badge
                          variant={
                            user.status === 'active' ? 'default' : 'destructive'
                          }
                          class={
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : ''
                          }
                        >
                          {user.status === 'active' ? '启用' : '禁用'}
                        </Badge>
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex gap-2">
                          <PermissionGuard permission="user:read:detail">
                            <Button
                              size="sm"
                              variant="ghost"
                            >
                              查看
                            </Button>
                          </PermissionGuard>

                          <PermissionGuard permission="user:write">
                            <Button
                              size="sm"
                              variant="ghost"
                            >
                              编辑
                            </Button>
                          </PermissionGuard>

                          <PermissionGuard permission="user:write:status">
                            <Button
                              size="sm"
                              variant={
                                user.status === 'active'
                                  ? 'destructive'
                                  : 'primary'
                              }
                            >
                              {user.status === 'active' ? '禁用' : '启用'}
                            </Button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
