/**
 * NavMenu component showcase
 */

import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import {
  Home,
  FileText,
  Edit,
  Settings,
  Users,
  BarChart3,
  HelpCircle,
  LogOut,
} from 'lucide-solid'
import { NavMenu, Sidebar, type NavMenuItemType } from '@beeve/ui'

export const Route = createFileRoute('/navmenu')({
  component: NavMenuPage,
})

const menuItems: NavMenuItemType[] = [
  { key: 'home', label: '首页', icon: <Home class="size-4" /> },
  { type: 'divider' },
  {
    type: 'group',
    key: 'content',
    label: '内容管理',
    children: [
      { key: 'pages', label: '页面', icon: <FileText class="size-4" /> },
      { key: 'posts', label: '文章', icon: <Edit class="size-4" />, badge: 12 },
    ],
  },
  {
    type: 'group',
    key: 'system',
    label: '系统管理',
    children: [
      { key: 'users', label: '用户', icon: <Users class="size-4" /> },
      { key: 'analytics', label: '统计', icon: <BarChart3 class="size-4" /> },
    ],
  },
  {
    key: 'settings',
    label: '设置',
    icon: <Settings class="size-4" />,
    children: [
      { key: 'profile', label: '个人资料' },
      { key: 'security', label: '安全设置' },
    ],
  },
]

function NavMenuPage() {
  const [collapsed, setCollapsed] = createSignal(false)
  const [activeKey, setActiveKey] = createSignal('profile')

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold">NavMenu & Sidebar</h1>
        <p class="text-muted-foreground mt-2">
          导航菜单和侧边栏组件示例
        </p>
      </div>

      {/* Sidebar with NavMenu Demo */}
      <div class="border rounded-lg overflow-hidden">
        <h2 class="text-xl font-semibold p-4 border-b bg-muted/50">Sidebar + NavMenu</h2>
        <div class="flex h-[600px]">
          <Sidebar collapsed={collapsed()} onCollapsedChange={setCollapsed}>
            <Sidebar.Header>
              <Show when={!collapsed()} fallback={<span class="text-xl font-bold">B</span>}>
                <span class="text-xl font-bold text-primary">Beeve</span>
              </Show>
            </Sidebar.Header>
            <Sidebar.Content>
              <NavMenu
                items={menuItems}
                value={activeKey()}
                onValueChange={setActiveKey}
                collapsed={collapsed()}
                defaultExpandedKeys={['settings']}
              />
            </Sidebar.Content>
            <Sidebar.Footer class="flex-col gap-2">
              <Show when={!collapsed()}>
                <div class="flex items-center gap-2 w-full px-2 py-1">
                  <div class="size-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                    U
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">用户名</div>
                    <div class="text-xs text-muted-foreground truncate">user@example.com</div>
                  </div>
                </div>
              </Show>
              <div class="flex items-center gap-1 w-full">
                <Sidebar.Trigger />
                <Show when={!collapsed()}>
                  <button
                    type="button"
                    class="flex items-center justify-center size-8 rounded-[var(--radius)] text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    title="帮助"
                  >
                    <HelpCircle class="size-4" />
                  </button>
                  <button
                    type="button"
                    class="flex items-center justify-center size-8 rounded-[var(--radius)] text-muted-foreground hover:bg-accent hover:text-accent-foreground ml-auto"
                    title="退出"
                  >
                    <LogOut class="size-4" />
                  </button>
                </Show>
              </div>
            </Sidebar.Footer>
          </Sidebar>
          <main class="flex-1 p-6 bg-background">
            <h3 class="text-lg font-medium">主内容区域</h3>
            <p class="text-muted-foreground mt-2">当前选中: {activeKey()}</p>
            <p class="text-muted-foreground">侧边栏状态: {collapsed() ? '折叠' : '展开'}</p>
          </main>
        </div>
      </div>
    </div>
  )
}

