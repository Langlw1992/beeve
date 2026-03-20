import {createFileRoute, Link} from '@tanstack/solid-router'
import {createMemo, For, Show} from 'solid-js'
import {Dynamic} from 'solid-js/web'
import {Badge, Button} from '@beeve/ui'
import {
  Calendar,
  ExternalLink,
  Mail,
  Shield,
  Sparkles,
  User,
  Waypoints,
} from 'lucide-solid'
import {AppLayout} from '@/components/AppLayout'
import {formatUserRoleLabel, isAdminUser} from '@/lib/auth/policy'
import {requireAuth} from '@/lib/guards'
import {loadCurrentUserData} from '@/lib/loaders/account'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => requireAuth(),
  loader: async () => loadCurrentUserData(),
  component: DashboardPage,
})

function DashboardPage() {
  const me = Route.useLoaderData()
  const user = createMemo(() => me().user)
  const isAdmin = createMemo(() => isAdminUser(user()))

  const createdAt = createMemo(() =>
    new Date(user().createdAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  )

  const updatedAt = createMemo(() =>
    new Date(user().updatedAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  )

  const overviewFacts = createMemo(() => [
    {
      label: '账号 ID',
      value: user().id.slice(0, 8),
      icon: User,
      description: '用于快速核对当前会话。',
    },
    {
      label: '邮箱状态',
      value: user().emailVerified ? '已验证' : '待验证',
      icon: Mail,
      description: '来源于关联身份提供方。',
    },
    {
      label: '加入时间',
      value: createdAt(),
      icon: Calendar,
      description: '首次成功登录的时间。',
    },
    {
      label: '权限级别',
      value: formatUserRoleLabel(user().role),
      icon: Shield,
      description: isAdmin() ? '已开放管理能力。' : '仅保留普通成员权限。',
    },
  ])

  const nextActions = createMemo(() => {
    const actions = [
      {
        href: '/settings',
        title: '查看个人资料',
        description: '更新显示名称、头像和外观偏好。',
      },
      {
        href: '/settings',
        title: '检查活跃会话',
        description: '确认哪些浏览器或设备已登录。',
      },
    ]

    if (isAdmin()) {
      actions.push({
        href: '/admin',
        title: '打开管理后台',
        description: '继续管理用户、角色和会话回收。',
      })
    }

    return actions
  })

  const readinessItems = createMemo(() => [
    {
      title: '服务端访问校验',
      description: '受保护路由会在页面渲染前验证会话。',
    },
    {
      title: '身份由提供方托管',
      description: '邮箱和基础身份仍以外部提供方为准。',
    },
    {
      title: '设置页承担账户操作',
      description: '资料、主题和会话控制都放在设置页。',
    },
  ])

  const timelineItems = createMemo(() => [
    {
      title: '创建时间',
      value: createdAt(),
      description: '记录该用户首次成功登录的时间点。',
    },
    {
      title: '最近资料更新',
      value: updatedAt(),
      description: '反映当前可见的账户信息变更。',
    },
    {
      title: '验证状态',
      value: user().emailVerified ? '已完成' : '待完成',
      description: '展示关联提供方是否已确认邮箱。',
    },
  ])

  return (
    <AppLayout
      user={user()}
      currentPath="/dashboard"
      pageTitle={`欢迎回来，${user().name}`}
      pageDescription="这页只保留最必要的账户信息和后续入口。"
      pageActions={
        <>
          <a href="/settings">
            <Button variant="outline" size="sm">
              打开设置
              <ExternalLink class="size-4" />
            </Button>
          </a>
          <Show when={isAdmin()}>
            <a href="/admin">
              <Button size="sm">
                进入管理后台
                <Shield class="size-4" />
              </Button>
            </a>
          </Show>
        </>
      }
    >
      <div class="space-y-8">
        <section class="space-y-4 border-b border-border/60 pb-6">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex items-start gap-4">
              <Show
                when={user().image}
                fallback={
                  <div class="flex size-14 items-center justify-center rounded-full border border-border/60 bg-muted text-lg font-semibold">
                    {user().name.charAt(0).toUpperCase()}
                  </div>
                }
              >
                <img
                  src={user().image ?? ''}
                  alt={user().name}
                  class="size-14 rounded-full object-cover ring-1 ring-border/60"
                />
              </Show>

              <div class="space-y-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <Sparkles class="size-3.5" />
                    账户概览
                  </div>
                  <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {user().name}
                  </h2>
                  <p class="max-w-2xl text-sm leading-6 text-muted-foreground">
                    当前登录账号为 {user().email}。这页只回答三个问题：这是谁、拥有什么权限、接下来去哪里。
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <Badge variant={user().emailVerified ? 'default' : 'secondary'}>
                    {user().emailVerified ? '邮箱已验证' : '邮箱待验证'}
                  </Badge>
                  <Badge variant="outline">更新于 {updatedAt()}</Badge>
                  <Show when={isAdmin()}>
                    <Badge variant="outline">管理员权限</Badge>
                  </Show>
                </div>
              </div>
            </div>

            <div class="min-w-0 lg:w-[22rem]">
              <div class="divide-y divide-border/60 border-y border-border/60">
                <For each={overviewFacts()}>
                  {(fact) => (
                    <CompactFactRow
                      icon={fact.icon}
                      label={fact.label}
                      value={fact.value}
                      description={fact.description}
                    />
                  )}
                </For>
              </div>
            </div>
          </div>
        </section>

        <section class="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div class="space-y-4">
            <SectionHeading
              title="身份信息"
              description="只保留当前页面真正需要的账户字段。"
            />
            <div class="divide-y divide-border/60 border-y border-border/60">
              <DetailRow
                label="显示名称"
                value={user().name}
                description="会在已登录工作区中统一展示。"
              />
              <DetailRow
                label="主邮箱"
                value={user().email}
                description="由关联的身份提供方管理。"
              />
              <DetailRow
                label="当前角色"
                value={formatUserRoleLabel(user().role)}
                description="受保护页面渲染前会先由服务端守卫校验。"
              />
            </div>
          </div>

          <div class="space-y-4">
            <SectionHeading
              title="下一步"
              description="把最常见的后续操作放在同一条路径里。"
            />
            <div class="divide-y divide-border/60 border-y border-border/60">
              <For each={nextActions()}>
                {(item) => (
                  <Link
                    to={item.href}
                    class="flex items-start justify-between gap-4 px-3 py-4 transition-colors hover:bg-accent/30"
                  >
                    <div class="space-y-1">
                      <h3 class="font-medium tracking-tight">{item.title}</h3>
                      <p class="text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ExternalLink class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </Link>
                )}
              </For>
            </div>
          </div>
        </section>

        <section class="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div class="space-y-4">
            <SectionHeading
              title="工作区准备度"
              description="减少界面噪音，让关键状态一眼可读。"
            />
            <div class="divide-y divide-border/60 border-y border-border/60">
              <For each={readinessItems()}>
                {(item) => (
                  <DetailRow
                    icon={Waypoints}
                    label={item.title}
                    value="已就绪"
                    description={item.description}
                    valueClass="text-sm font-medium text-foreground"
                  />
                )}
              </For>
            </div>
          </div>

          <div class="space-y-4">
            <SectionHeading
              title="账户时间线"
              description="只保留对判断当前状态有用的时间点。"
            />
            <div class="divide-y divide-border/60 border-y border-border/60">
              <For each={timelineItems()}>
                {(item) => (
                  <DetailRow
                    icon={Calendar}
                    label={item.title}
                    value={item.value}
                    description={item.description}
                  />
                )}
              </For>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

function SectionHeading(props: {
  title: string
  description: string
}) {
  return (
    <div class="space-y-1">
      <h3 class="text-sm font-semibold tracking-tight text-foreground">
        {props.title}
      </h3>
      <p class="text-sm leading-6 text-muted-foreground">{props.description}</p>
    </div>
  )
}

function CompactFactRow(props: {
  icon: typeof User
  label: string
  value: string
  description: string
}) {
  return (
    <div class="flex items-start gap-3 px-3 py-4">
      <div class="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40">
        <props.icon class="size-4 text-muted-foreground" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline justify-between gap-3">
          <p class="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {props.label}
          </p>
          <p class="text-sm font-medium text-foreground">{props.value}</p>
        </div>
        <p class="mt-1 text-xs leading-5 text-muted-foreground">
          {props.description}
        </p>
      </div>
    </div>
  )
}

function DetailRow(props: {
  icon?: typeof User
  label: string
  value: string
  description: string
  valueClass?: string
}) {
  return (
    <div class="flex items-start gap-3 px-3 py-4">
      {props.icon ? (
        <div class="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40">
          <Dynamic component={props.icon} class="size-4 text-muted-foreground" />
        </div>
      ) : (
        <div class="size-8 shrink-0" />
      )}
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline justify-between gap-3">
          <p class="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {props.label}
          </p>
          <p class={props.valueClass ?? 'text-sm font-medium text-foreground'}>
            {props.value}
          </p>
        </div>
        <p class="mt-1 text-xs leading-5 text-muted-foreground">
          {props.description}
        </p>
      </div>
    </div>
  )
}
