import {Badge, Button, Card} from '@beeve/ui'
/**
 * 仪表盘页面
 */
import {createFileRoute, useNavigate} from '@tanstack/solid-router'
import {Mail, Shield, User} from 'lucide-solid'

// 定义路由上下文类型
interface DashboardContext {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const context = Route.useRouteContext() as unknown as () => DashboardContext
  const user = () => context().user
  const navigate = useNavigate()

  const stats = [
    {
      title: '用户名',
      value: user()?.name || '未设置',
      icon: User,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: '邮箱',
      value: user()?.email || '未设置',
      icon: Mail,
      color: 'bg-green-500/10 text-green-600',
    },
    {
      title: '状态',
      value: '已登录',
      icon: Shield,
      color: 'bg-purple-500/10 text-purple-600',
    },
  ]

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">仪表盘</h1>
        <Badge
          status="success"
          text="在线"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            class="p-6"
          >
            <div class="flex items-start gap-4">
              <div class={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon class="size-5" />
              </div>
              <div>
                <p class="text-sm text-gray-500">{stat.title}</p>
                <p class="text-lg font-semibold mt-1">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card class="p-6">
        <h2 class="text-lg font-semibold mb-4">快速操作</h2>
        <div class="flex flex-wrap gap-2">
          <Button onClick={() => navigate({to: '/profile'})}>编辑资料</Button>
          <Button
            variant="outline"
            onClick={() => navigate({to: '/settings'})}
          >
            应用设置
          </Button>
        </div>
      </Card>
    </div>
  )
}
