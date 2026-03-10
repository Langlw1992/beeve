import {createFileRoute} from '@tanstack/solid-router'
import {Card, CardContent, CardHeader, Badge, Input} from '@beeve/ui'
import {Search, UserPlus, UserCog, Shield, LogIn} from 'lucide-solid'
import {createSignal} from 'solid-js'

const MOCK_LOGS = [
  {
    id: '1',
    user: '张三',
    action: 'LOGIN',
    target: '系统',
    time: '2分钟前',
    type: 'success',
  },
  {
    id: '2',
    user: '李四',
    action: 'USER_UPDATE',
    target: '用户 #123',
    time: '15分钟前',
    type: 'info',
  },
  {
    id: '3',
    user: '王五',
    action: 'USER_CREATE',
    target: '用户 #456',
    time: '1小时前',
    type: 'success',
  },
  {
    id: '4',
    user: '张三',
    action: 'PERMISSION_CHANGE',
    target: '角色 管理员',
    time: '2小时前',
    type: 'warning',
  },
  {
    id: '5',
    user: '李四',
    action: 'LOGIN',
    target: '系统',
    time: '3小时前',
    type: 'success',
  },
  {
    id: '6',
    user: '系统',
    action: 'AUTO_DISABLE',
    target: '用户 #789',
    time: '5小时前',
    type: 'error',
  },
]

const actionIcons: Record<string, typeof LogIn> = {
  LOGIN: LogIn,
  USER_CREATE: UserPlus,
  USER_UPDATE: UserCog,
  PERMISSION_CHANGE: Shield,
  AUTO_DISABLE: UserCog,
}

const actionLabels: Record<string, string> = {
  LOGIN: '登录系统',
  USER_CREATE: '创建用户',
  USER_UPDATE: '更新用户',
  PERMISSION_CHANGE: '修改权限',
  AUTO_DISABLE: '自动禁用',
}

const typeColors: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  success: 'default',
  info: 'secondary',
  warning: 'outline',
  error: 'destructive',
}

export const Route = createFileRoute('/(authenticated)/admin/audit-logs')({
  component: AuditLogsPage,
})

function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = createSignal('')

  const filteredLogs = () => {
    const query = searchQuery().toLowerCase()
    if (!query) {
      return MOCK_LOGS
    }
    return MOCK_LOGS.filter(
      (log) =>
        log.user.toLowerCase().includes(query) ||
        log.target.toLowerCase().includes(query) ||
        actionLabels[log.action].toLowerCase().includes(query),
    )
  }

  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold">审计日志</h1>
        <p class="text-muted-foreground">查看系统操作记录和用户活动</p>
      </div>

      <Card>
        <CardHeader>
          <div class="flex items-center gap-4">
            <div class="relative flex-1 max-w-sm">
              <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索日志..."
                class="pl-8"
                value={searchQuery()}
                onInput={(value) => setSearchQuery(value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            {filteredLogs().map((log) => {
              const Icon = actionIcons[log.action] || Shield
              return (
                <div class="flex items-start gap-4 p-4 border rounded-lg">
                  <div class="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Icon class="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="font-medium">{actionLabels[log.action]}</p>
                      <Badge variant={typeColors[log.type]}>
                        {log.type === 'success' && '成功'}
                        {log.type === 'info' && '信息'}
                        {log.type === 'warning' && '警告'}
                        {log.type === 'error' && '错误'}
                      </Badge>
                    </div>
                    <p class="text-sm text-muted-foreground">
                      操作人: {log.user} · 对象: {log.target}
                    </p>
                  </div>
                  <span class="text-sm text-muted-foreground whitespace-nowrap">
                    {log.time}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
