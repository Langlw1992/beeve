import { NavMenu } from '@beeve/ui'
import { Home, LayoutDashboard, Settings, FileText, Users, Bell, } from 'lucide-solid'
import { createSignal } from 'solid-js'
import { DemoBox } from '../DemoBox'

const basicItems = [
  { key: 'home', label: '首页', icon: <Home class="size-4" /> },
  { key: 'dashboard', label: '仪表盘', icon: <LayoutDashboard class="size-4" /> },
  { key: 'settings', label: '设置', icon: <Settings class="size-4" /> },
]

export function NavMenuBasic() {
  const [active, setActive] = createSignal('home')

  return (
    <DemoBox title="基础导航菜单" class="flex-col items-stretch">
      <div class="w-64 rounded-lg border border-border bg-card p-2">
        <NavMenu
          items={basicItems}
          value={active()}
          onValueChange={setActive}
        />
      </div>
      <p class="mt-2 text-sm text-muted-foreground">当前: {active()}</p>
    </DemoBox>
  )
}

export function NavMenuWithGroups() {
  const [active, setActive] = createSignal('home')

  const groupedItems = [
    { key: 'home', label: '首页', icon: <Home class="size-4" /> },
    { type: 'divider' as const },
    {
      type: 'group' as const,
      key: 'content',
      label: '内容管理',
      children: [
        { key: 'pages', label: '页面', icon: <FileText class="size-4" /> },
        { key: 'users', label: '用户', icon: <Users class="size-4" /> },
      ],
    },
  ]

  return (
    <DemoBox title="分组导航" class="flex-col items-stretch">
      <div class="w-64 rounded-lg border border-border bg-card p-2">
        <NavMenu
          items={groupedItems}
          value={active()}
          onValueChange={setActive}
        />
      </div>
    </DemoBox>
  )
}

export function NavMenuNested() {
  const [active, setActive] = createSignal('home')

  const nestedItems = [
    { key: 'home', label: '首页', icon: <Home class="size-4" /> },
    {
      key: 'settings',
      label: '设置',
      icon: <Settings class="size-4" />,
      children: [
        { key: 'profile', label: '个人资料' },
        { key: 'security', label: '安全设置' },
        {
          key: 'notifications',
          label: '通知设置',
          children: [
            { key: 'email', label: '邮件通知' },
            { key: 'push', label: '推送通知' },
          ],
        },
      ],
    },
  ]

  return (
    <DemoBox title="嵌套菜单" class="flex-col items-stretch">
      <div class="w-64 rounded-lg border border-border bg-card p-2">
        <NavMenu
          items={nestedItems}
          value={active()}
          onValueChange={setActive}
          defaultExpandedKeys={['settings']}
        />
      </div>
    </DemoBox>
  )
}

export function NavMenuWithBadge() {
  const [active, setActive] = createSignal('home')

  const badgeItems = [
    { key: 'home', label: '首页', icon: <Home class="size-4" /> },
    { key: 'notifications', label: '通知', icon: <Bell class="size-4" />, badge: 12 },
    { key: 'messages', label: '消息', icon: <FileText class="size-4" />, badge: '99+' },
  ]

  return (
    <DemoBox title="带徽标" class="flex-col items-stretch">
      <div class="w-64 rounded-lg border border-border bg-card p-2">
        <NavMenu
          items={badgeItems}
          value={active()}
          onValueChange={setActive}
        />
      </div>
    </DemoBox>
  )
}

export function NavMenuCollapsed() {
  const [active, setActive] = createSignal('home')
  const [collapsed, setCollapsed] = createSignal(false)

  return (
    <DemoBox title="折叠模式" class="flex-col items-start gap-4">
      <button
        class="text-sm text-primary hover:underline"
        onClick={() => setCollapsed(!collapsed())}
      >
        {collapsed() ? '展开菜单' : '折叠菜单'}
      </button>
      <div class={`rounded-lg border border-border bg-card p-2 transition-all ${collapsed() ? 'w-16' : 'w-64'}`}>
        <NavMenu
          items={basicItems}
          value={active()}
          onValueChange={setActive}
          collapsed={collapsed()}
        />
      </div>
    </DemoBox>
  )
}

export function NavMenuHorizontal() {
  const [active, setActive] = createSignal('home')

  return (
    <DemoBox title="水平导航" class="flex-col items-stretch">
      <div class="rounded-lg border border-border bg-card p-2">
        <NavMenu
          items={basicItems}
          value={active()}
          onValueChange={setActive}
          direction="horizontal"
        />
      </div>
    </DemoBox>
  )
}
