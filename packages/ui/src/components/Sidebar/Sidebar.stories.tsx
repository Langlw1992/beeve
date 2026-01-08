/**
 * Sidebar Stories
 */

import type { Meta, StoryObj } from 'storybook-solidjs'
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

// 内部组件，用于访问 useSidebar
const SidebarDemo = () => {
  const { state, open } = useSidebar()
  const [activeKey, setActiveKey] = createSignal('home')

  return (
    <>
      <Sidebar>
        <Sidebar.Header>
          <Show when={open()} fallback={<span class="text-xl font-bold">B</span>}>
            <span class="text-xl font-bold text-primary">Beeve</span>
          </Show>
        </Sidebar.Header>
        <Sidebar.Content>
          <NavMenu
            items={menuItems}
            value={activeKey()}
            onValueChange={setActiveKey}
            collapsed={!open()}
            defaultExpandedKeys={['settings']}
          />
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Trigger />
        </Sidebar.Footer>
      </Sidebar>
      <main class="flex-1 p-6">
        <h1 class="text-2xl font-bold mb-4">主内容区域</h1>
        <p class="text-muted-foreground">当前选中: {activeKey()}</p>
        <p class="text-muted-foreground">侧边栏状态: {state()}</p>
        <p class="text-muted-foreground mt-2 text-sm">
          提示：使用 <kbd class="px-1 py-0.5 bg-muted rounded text-xs">⌘/Ctrl + B</kbd> 快捷键切换侧边栏
        </p>
      </main>
    </>
  )
}

/** 基础用法 */
export const Basic: Story = {
  render: () => {
    return (
      <Sidebar.Provider defaultOpen class="h-screen bg-background">
        <SidebarDemo />
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
          <Show when={open()} fallback={<span class="text-xl font-bold">B</span>}>
            <span class="text-xl font-bold text-primary">Beeve</span>
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
        <Sidebar.Footer class="gap-2">
          <Show when={open()}>
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
      <main class="flex-1 p-6">
        <h1 class="text-2xl font-bold mb-4">主内容区域</h1>
        <p class="text-muted-foreground">当前选中: {activeKey()}</p>
      </main>
    </>
  )
}

/** 带用户信息的 Footer */
export const WithUserFooter: Story = {
  render: () => {
    return (
      <Sidebar.Provider defaultOpen class="h-screen bg-background">
        <SidebarWithUserDemo />
      </Sidebar.Provider>
    )
  },
}

