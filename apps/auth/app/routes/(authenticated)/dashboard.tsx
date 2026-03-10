import {createFileRoute, useNavigate} from '@tanstack/solid-router'
import {Card, CardContent, CardHeader, CardTitle} from '@beeve/ui'
import {
  Users,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-solid'
import {PermissionGuard} from '~/components/layout/PermissionGuard'
import {createSignal, onMount} from 'solid-js'

export const Route = createFileRoute('/(authenticated)/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const [greeting, setGreeting] = createSignal('你好')

  onMount(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('早上好')
    else if (hour < 18) setGreeting('下午好')
    else setGreeting('晚上好')
  })

  return (
    <div class="space-y-6 max-w-6xl">
      {/* 欢迎区域 */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">
            {greeting()}，欢迎回来
          </h1>
          <p class="text-slate-500 mt-1 text-sm">以下是今日系统概览</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="总用户数"
          value="1,234"
          change="+56"
          icon={Users}
          trend="up"
        />

        <PermissionGuard permission="role:read">
          <StatCard
            title="权限模板"
            value="12"
            change="+2"
            icon={Shield}
            trend="up"
          />
        </PermissionGuard>

        <PermissionGuard permission="audit:read">
          <StatCard
            title="今日操作"
            value="89"
            change="+12"
            icon={Activity}
            trend="up"
          />
        </PermissionGuard>

        <StatCard
          title="在线用户"
          value="23"
          change="+5"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* 最近活动 */}
      <PermissionGuard permission="audit:read">
        <Card class="border-slate-200 shadow-sm">
          <CardHeader class="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle class="text-base font-semibold text-slate-900">
                最近活动
              </CardTitle>
              <p class="text-sm text-slate-500 mt-0.5">系统最近的操作记录</p>
            </div>
            <button class="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">
              查看全部
              <ArrowRight class="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              {[
                {
                  user: '张三',
                  action: '登录系统',
                  time: '2分钟前',
                  type: 'login',
                },
                {
                  user: '李四',
                  action: '更新用户权限',
                  time: '15分钟前',
                  type: 'update',
                },
                {
                  user: '王五',
                  action: '创建新用户',
                  time: '1小时前',
                  type: 'create',
                },
                {
                  user: '赵六',
                  action: '导出审计日志',
                  time: '2小时前',
                  type: 'export',
                },
              ].map((item) => (
                <div class="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div
                      class={`h-2 w-2 rounded-full ${
                        item.type === 'login'
                          ? 'bg-blue-500'
                          : item.type === 'update'
                            ? 'bg-amber-500'
                            : item.type === 'create'
                              ? 'bg-green-500'
                              : 'bg-slate-400'
                      }`}
                    />
                    <span class="text-sm font-medium text-slate-900">
                      {item.user}
                    </span>
                    <span class="text-sm text-slate-500">{item.action}</span>
                  </div>
                  <div class="flex items-center gap-1 text-xs text-slate-400">
                    <Clock class="h-3 w-3" />
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PermissionGuard>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: typeof Users
  trend: 'up' | 'down'
}

function StatCard(props: StatCardProps) {
  return (
    <Card class="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent class="p-5">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500">{props.title}</p>
            <p class="text-2xl font-semibold text-slate-900 mt-1">
              {props.value}
            </p>
          </div>
          <div class="p-2 bg-slate-100 rounded-lg">
            <props.icon class="h-5 w-5 text-slate-600" />
          </div>
        </div>
        <div class="flex items-center gap-1 mt-3">
          <span
            class={`text-xs font-medium ${props.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
          >
            {props.change}
          </span>
          <span class="text-xs text-slate-400">较昨日</span>
        </div>
      </CardContent>
    </Card>
  )
}
