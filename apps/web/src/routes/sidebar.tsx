/**
 * Sidebar Component Showcase Page
 */

import { createSignal } from 'solid-js'
import { createFileRoute } from '@tanstack/solid-router'
import { Sidebar, Button, NavMenu, type NavMenuItemType } from '@beeve/ui'
import { ShowcaseSection } from '../components/ShowcaseGrid'
import { Home, Settings, Users, FileText, Mail, Bell } from 'lucide-solid'

const menuItems: NavMenuItemType[] = [
  { key: 'home', label: '首页', icon: <Home class="size-4" /> },
  { key: 'users', label: '用户管理', icon: <Users class="size-4" /> },
  { key: 'documents', label: '文档', icon: <FileText class="size-4" /> },
  { key: 'messages', label: '消息', icon: <Mail class="size-4" />, badge: 5 },
  { key: 'notifications', label: '通知', icon: <Bell class="size-4" /> },
  { type: 'divider' },
  { key: 'settings', label: '设置', icon: <Settings class="size-4" /> },
]

function SidebarPage() {
  const [activeKey, setActiveKey] = createSignal('home')

  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Sidebar</h1>
        <p class="text-muted-foreground mt-2">
          侧边栏组件，用于应用程序的主导航区域。
        </p>
      </div>

      {/* Icon Collapsible Mode */}
      <ShowcaseSection title="图标折叠模式" description="折叠时仅显示图标">
        <div class="w-full h-80 border rounded-lg overflow-hidden">
          <Sidebar.Provider defaultOpen collapsible="icon">
            <Sidebar class="bg-sidebar">
              <Sidebar.Header>
                <div class="font-bold text-lg">Logo</div>
              </Sidebar.Header>
              <Sidebar.Content>
                <NavMenu
                  items={menuItems}
                  activeKey={activeKey()}
                  onSelect={setActiveKey}
                />
              </Sidebar.Content>
              <Sidebar.Footer>
                <Sidebar.Trigger />
              </Sidebar.Footer>
            </Sidebar>
            <main class="flex-1 p-4 bg-background">
              <p class="text-muted-foreground">
                当前选中: {activeKey()}
              </p>
              <p class="text-sm text-muted-foreground mt-2">
                点击左下角按钮或按 Ctrl+B 切换侧边栏
              </p>
            </main>
          </Sidebar.Provider>
        </div>
      </ShowcaseSection>

      {/* Offcanvas Mode */}
      <ShowcaseSection title="完全隐藏模式" description="折叠时完全隐藏侧边栏">
        <div class="w-full h-80 border rounded-lg overflow-hidden">
          <Sidebar.Provider defaultOpen collapsible="offcanvas">
            <Sidebar class="bg-sidebar">
              <Sidebar.Header>
                <div class="font-bold text-lg">Logo</div>
              </Sidebar.Header>
              <Sidebar.Content>
                <NavMenu
                  items={menuItems}
                  activeKey={activeKey()}
                  onSelect={setActiveKey}
                />
              </Sidebar.Content>
              <Sidebar.Footer>
                <Sidebar.Trigger />
              </Sidebar.Footer>
            </Sidebar>
            <main class="flex-1 p-4 bg-background">
              <p class="text-muted-foreground">
                当前选中: {activeKey()}
              </p>
              <p class="text-sm text-muted-foreground mt-2">
                折叠时侧边栏完全隐藏
              </p>
            </main>
          </Sidebar.Provider>
        </div>
      </ShowcaseSection>

      {/* Non-collapsible */}
      <ShowcaseSection title="不可折叠" description="侧边栏始终展开">
        <div class="w-full h-80 border rounded-lg overflow-hidden">
          <Sidebar.Provider collapsible="none">
            <Sidebar class="bg-sidebar">
              <Sidebar.Header>
                <div class="font-bold text-lg">Logo</div>
              </Sidebar.Header>
              <Sidebar.Content>
                <NavMenu
                  items={menuItems}
                  activeKey={activeKey()}
                  onSelect={setActiveKey}
                />
              </Sidebar.Content>
            </Sidebar>
            <main class="flex-1 p-4 bg-background">
              <p class="text-muted-foreground">
                当前选中: {activeKey()}
              </p>
              <p class="text-sm text-muted-foreground mt-2">
                此侧边栏不可折叠
              </p>
            </main>
          </Sidebar.Provider>
        </div>
      </ShowcaseSection>

      {/* Controlled */}
      <ShowcaseSection title="受控模式" description="通过外部状态控制侧边栏">
        <ControlledSidebarDemo />
      </ShowcaseSection>
    </div>
  )
}

function ControlledSidebarDemo() {
  const [open, setOpen] = createSignal(true)
  const [activeKey, setActiveKey] = createSignal('home')

  return (
    <div class="space-y-4">
      <div class="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          展开
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
          折叠
        </Button>
        <span class="ml-2 text-sm text-muted-foreground">
          状态: {open() ? '展开' : '折叠'}
        </span>
      </div>
      <div class="w-full h-64 border rounded-lg overflow-hidden">
        <Sidebar.Provider open={open()} onOpenChange={setOpen} collapsible="icon">
          <Sidebar class="bg-sidebar">
            <Sidebar.Header>
              <div class="font-bold text-lg">Logo</div>
            </Sidebar.Header>
            <Sidebar.Content>
              <NavMenu
                items={menuItems}
                activeKey={activeKey()}
                onSelect={setActiveKey}
              />
            </Sidebar.Content>
          </Sidebar>
          <main class="flex-1 p-4 bg-background">
            <p class="text-muted-foreground">主内容区域</p>
          </main>
        </Sidebar.Provider>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/sidebar')({
  component: SidebarPage,
})
