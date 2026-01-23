/**
 * Sidebar Stories
 */

import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { createSignal, Show } from 'solid-js'
import {
  Home,
  FileText,
  SquarePen,
  Settings,
  Users,
  BarChart3,
  HelpCircle,
  LogOut,
} from 'lucide-solid'
import { Sidebar, useSidebar } from './Sidebar'
import { NavMenu, type NavMenuItemType } from '../NavMenu'
import { Button } from '../Button'

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

const menuItems: NavMenuItemType[] = [
  { key: 'home', label: '首页', icon: <Home class="size-4" /> },
  { type: 'divider' },
  {
    type: 'group',
    key: 'content',
    label: '内容管理',
    children: [
      { key: 'pages', label: '页面', icon: <FileText class="size-4" /> },
      { key: 'posts', label: '文章', icon: <SquarePen class="size-4" />, badge: 12 },
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
      {
        key: 'security',
        label: '安全设置',
        children: [
          { key: 'password', label: '修改密码' },
          { key: '2fa', label: '两步验证' },
          {
            key: 'sessions',
            label: '登录会话',
            children: [
              { key: 'active', label: '当前会话' },
              { key: 'history', label: '历史记录' },
            ],
          },
        ],
      },
      { key: 'notifications', label: '通知设置' },
    ],
  },
]

// 内部组件，用于访问 useSidebar
const SidebarDemo = () => {
  const { state, open, collapsible } = useSidebar()
  const [activeKey, setActiveKey] = createSignal('home')

  return (
    <>
      <Sidebar>
        <Sidebar.Header>
          <Show when={open()} fallback={<span class="text-lg font-bold text-primary">B</span>}>
            <span class="text-lg font-semibold">Beeve</span>
          </Show>
        </Sidebar.Header>
        <Sidebar.Content>
          <NavMenu
            items={menuItems}
            value={activeKey()}
            onValueChange={setActiveKey}
            collapsed={!open()}
            defaultExpandedKeys={['settings', 'security', 'sessions']}
          />
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Trigger />
        </Sidebar.Footer>
      </Sidebar>
      <main class="flex-1 p-8 bg-background overflow-auto">
        <h1 class="text-2xl font-semibold mb-4">Icon 模式（默认）</h1>
        <div class="space-y-2 text-muted-foreground">
          <p>当前选中: <span class="text-foreground font-medium">{activeKey()}</span></p>
          <p>侧边栏状态: <span class="text-foreground font-medium">{state()}</span></p>
          <p>折叠模式: <span class="text-foreground font-medium">{collapsible()}</span></p>
        </div>
        <p class="text-muted-foreground mt-6 text-sm">
          提示：使用 <kbd class="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">⌘/Ctrl + B</kbd> 快捷键切换侧边栏
        </p>
      </main>
    </>
  )
}

/** Icon 模式 - 折叠时只显示图标 */
export const IconMode: Story = {
  render: () => {
    return (
      <Sidebar.Provider defaultOpen collapsible="icon" class="h-screen bg-background">
        <SidebarDemo />
      </Sidebar.Provider>
    )
  },
}

// Offcanvas 模式内部组件
const SidebarOffcanvasDemo = () => {
  const { state, collapsible } = useSidebar()
  const [activeKey, setActiveKey] = createSignal('home')

  return (
    <>
      <Sidebar>
        <Sidebar.Header>
          <span class="text-lg font-semibold">Beeve</span>
        </Sidebar.Header>
        <Sidebar.Content>
          <NavMenu
            items={menuItems}
            value={activeKey()}
            onValueChange={setActiveKey}
            collapsed={false}
            defaultExpandedKeys={['settings']}
          />
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Trigger />
        </Sidebar.Footer>
      </Sidebar>
      <main class="flex-1 p-8 bg-background overflow-auto">
        <h1 class="text-2xl font-semibold mb-4">Offcanvas 模式</h1>
        <div class="space-y-2 text-muted-foreground">
          <p>当前选中: <span class="text-foreground font-medium">{activeKey()}</span></p>
          <p>侧边栏状态: <span class="text-foreground font-medium">{state()}</span></p>
          <p>折叠模式: <span class="text-foreground font-medium">{collapsible()}</span></p>
        </div>
        <p class="text-muted-foreground mt-6 text-sm">
          Offcanvas 模式下，侧边栏会完全隐藏而不是折叠为图标。
        </p>
      </main>
    </>
  )
}

/** Offcanvas 模式 - 折叠时完全隐藏 */
export const OffcanvasMode: Story = {
  render: () => {
    return (
      <Sidebar.Provider defaultOpen collapsible="offcanvas" class="h-screen bg-background">
        <SidebarOffcanvasDemo />
      </Sidebar.Provider>
    )
  },
}

// 不可折叠模式内部组件
const SidebarNoneDemo = () => {
  const { state, collapsible } = useSidebar()
  const [activeKey, setActiveKey] = createSignal('home')

  return (
    <>
      <Sidebar>
        <Sidebar.Header>
          <span class="text-lg font-semibold">Beeve</span>
        </Sidebar.Header>
        <Sidebar.Content>
          <NavMenu
            items={menuItems}
            value={activeKey()}
            onValueChange={setActiveKey}
            collapsed={false}
          />
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Trigger />
        </Sidebar.Footer>
      </Sidebar>
      <main class="flex-1 p-8 bg-background overflow-auto">
        <h1 class="text-2xl font-semibold mb-4">不可折叠模式</h1>
        <div class="space-y-2 text-muted-foreground">
          <p>当前选中: <span class="text-foreground font-medium">{activeKey()}</span></p>
          <p>侧边栏状态: <span class="text-foreground font-medium">{state()}</span></p>
          <p>折叠模式: <span class="text-foreground font-medium">{collapsible()}</span></p>
        </div>
        <p class="text-muted-foreground mt-6 text-sm">
          不可折叠模式下，Trigger 按钮不会显示，侧边栏始终展开。
        </p>
      </main>
    </>
  )
}

/** 不可折叠模式 */
export const NonCollapsible: Story = {
  render: () => {
    return (
      <Sidebar.Provider defaultOpen collapsible="none" class="h-screen bg-background">
        <SidebarNoneDemo />
      </Sidebar.Provider>
    )
  },
}

// 带用户信息的内部组件
const SidebarWithUserDemo = () => {
  const { open } = useSidebar()
  const [activeKey, setActiveKey] = createSignal('home')

  return (
    <>
      <Sidebar>
        <Sidebar.Header>
          <Show when={open()} fallback={<span class="text-lg font-bold text-primary">B</span>}>
            <span class="text-lg font-semibold">Beeve</span>
          </Show>
        </Sidebar.Header>
        <Sidebar.Content>
          <NavMenu
            items={menuItems}
            value={activeKey()}
            onValueChange={setActiveKey}
            collapsed={!open()}
          />
        </Sidebar.Content>
        <Sidebar.Footer class="gap-3">
          <Show when={open()}>
            <div class="flex items-center gap-3 w-full px-1 py-2 rounded-md hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
              <div class="size-8 rounded-full bg-sidebar-primary/10 flex items-center justify-center text-sm font-medium text-sidebar-primary">
                U
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">用户名</div>
                <div class="text-xs text-muted-foreground truncate">user@example.com</div>
              </div>
            </div>
          </Show>
          <div class="flex items-center gap-1">
            <Sidebar.Trigger />
            <Show when={open()}>
              <Button variant="ghost" size="icon" title="帮助">
                <HelpCircle class="size-4" />
              </Button>
              <Button variant="ghost" size="icon" title="退出" class="ml-auto">
                <LogOut class="size-4" />
              </Button>
            </Show>
          </div>
        </Sidebar.Footer>
      </Sidebar>
      <main class="flex-1 p-8 bg-background overflow-auto">
        <h1 class="text-2xl font-semibold mb-4">带用户信息</h1>
        <p class="text-muted-foreground">当前选中: <span class="text-foreground font-medium">{activeKey()}</span></p>
      </main>
    </>
  )
}

/** 带用户信息的 Footer */
export const WithUserFooter: Story = {
  render: () => {
    return (
      <Sidebar.Provider defaultOpen collapsible="icon" class="h-screen bg-background">
        <SidebarWithUserDemo />
      </Sidebar.Provider>
    )
  },
}

// 默认折叠状态
const SidebarCollapsedDemo = () => {
  const { state, open } = useSidebar()
  const [activeKey, setActiveKey] = createSignal('home')

  return (
    <>
      <Sidebar>
        <Sidebar.Header>
          <Show when={open()} fallback={<span class="text-lg font-bold text-primary">B</span>}>
            <span class="text-lg font-semibold">Beeve</span>
          </Show>
        </Sidebar.Header>
        <Sidebar.Content>
          <NavMenu
            items={menuItems}
            value={activeKey()}
            onValueChange={setActiveKey}
            collapsed={!open()}
          />
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Trigger />
        </Sidebar.Footer>
      </Sidebar>
      <main class="flex-1 p-8 bg-background overflow-auto">
        <h1 class="text-2xl font-semibold mb-4">默认折叠状态</h1>
        <div class="space-y-2 text-muted-foreground">
          <p>当前选中: <span class="text-foreground font-medium">{activeKey()}</span></p>
          <p>侧边栏状态: <span class="text-foreground font-medium">{state()}</span></p>
        </div>
        <p class="text-muted-foreground mt-6 text-sm">
          这个示例默认以折叠状态启动。
        </p>
      </main>
    </>
  )
}

/** 默认折叠 */
export const DefaultCollapsed: Story = {
  render: () => {
    return (
      <Sidebar.Provider defaultOpen={false} collapsible="icon" class="h-screen bg-background">
        <SidebarCollapsedDemo />
      </Sidebar.Provider>
    )
  },
}
