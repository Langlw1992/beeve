import { Sidebar, NavMenu, Button } from '@beeve/ui'
import { Home, LayoutDashboard, Settings, FileText, Users, PanelLeftClose, PanelLeft } from 'lucide-solid'
import { createSignal } from 'solid-js'
import { DemoBox } from '../DemoBox'

const menuItems = [
  { key: 'home', label: '首页', icon: <Home class="size-4" /> },
  { key: 'dashboard', label: '仪表盘', icon: <LayoutDashboard class="size-4" /> },
  { key: 'pages', label: '页面', icon: <FileText class="size-4" /> },
  { key: 'users', label: '用户', icon: <Users class="size-4" /> },
  { key: 'settings', label: '设置', icon: <Settings class="size-4" /> },
]

export function SidebarBasic() {
  const [active, setActive] = createSignal('home')

  return (
    <DemoBox title="基础侧边栏" class="h-80 p-0">
      <Sidebar.Provider defaultOpen collapsible="icon">
        <Sidebar>
          <Sidebar.Header class="border-b border-border p-4">
            <span class="text-lg font-semibold">Logo</span>
          </Sidebar.Header>
          <Sidebar.Content class="p-2">
            <NavMenu
              items={menuItems}
              value={active()}
              onValueChange={setActive}
            />
          </Sidebar.Content>
          <Sidebar.Footer class="border-t border-border p-2">
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <main class="flex-1 p-4">
          <h2 class="text-lg font-medium">主内容区域</h2>
          <p class="text-muted-foreground">当前页面: {active()}</p>
        </main>
      </Sidebar.Provider>
    </DemoBox>
  )
}

export function SidebarCollapsibleIcon() {
  const [active, setActive] = createSignal('home')

  return (
    <DemoBox title="图标折叠模式" class="h-80 p-0">
      <Sidebar.Provider defaultOpen={false} collapsible="icon">
        <Sidebar>
          <Sidebar.Header class="flex items-center justify-center border-b border-border p-4">
            <span class="text-lg font-semibold">B</span>
          </Sidebar.Header>
          <Sidebar.Content class="p-2">
            <NavMenu
              items={menuItems}
              value={active()}
              onValueChange={setActive}
            />
          </Sidebar.Content>
          <Sidebar.Footer class="border-t border-border p-2">
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <main class="flex-1 p-4">
          <p class="text-sm text-muted-foreground">
            点击底部按钮展开侧边栏
          </p>
        </main>
      </Sidebar.Provider>
    </DemoBox>
  )
}

export function SidebarOffcanvas() {
  const [active, setActive] = createSignal('home')

  return (
    <DemoBox title="抽屉模式" class="h-80 p-0">
      <Sidebar.Provider defaultOpen={false} collapsible="offcanvas">
        <Sidebar>
          <Sidebar.Header class="border-b border-border p-4">
            <span class="text-lg font-semibold">Logo</span>
          </Sidebar.Header>
          <Sidebar.Content class="p-2">
            <NavMenu
              items={menuItems}
              value={active()}
              onValueChange={setActive}
            />
          </Sidebar.Content>
          <Sidebar.Footer class="border-t border-border p-2">
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <main class="flex-1 p-4">
          <Sidebar.Trigger class="mb-4">
            <Button variant="outline" size="sm">
              <PanelLeft class="mr-2 size-4" />
              打开侧边栏
            </Button>
          </Sidebar.Trigger>
          <p class="text-muted-foreground">
            offcanvas 模式下侧边栏完全隐藏
          </p>
        </main>
      </Sidebar.Provider>
    </DemoBox>
  )
}

export function SidebarControlled() {
  const [open, setOpen] = createSignal(true)
  const [active, setActive] = createSignal('home')

  return (
    <DemoBox title="受控模式" class="h-80 p-0">
      <Sidebar.Provider open={open()} onOpenChange={setOpen} collapsible="icon">
        <Sidebar>
          <Sidebar.Header class="border-b border-border p-4">
            <span class="text-lg font-semibold">Logo</span>
          </Sidebar.Header>
          <Sidebar.Content class="p-2">
            <NavMenu
              items={menuItems}
              value={active()}
              onValueChange={setActive}
            />
          </Sidebar.Content>
        </Sidebar>
        <main class="flex-1 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(!open())}
          >
            {open() ? (
              <>
                <PanelLeftClose class="mr-2 size-4" />
                折叠
              </>
            ) : (
              <>
                <PanelLeft class="mr-2 size-4" />
                展开
              </>
            )}
          </Button>
          <p class="mt-4 text-sm text-muted-foreground">
            状态: {open() ? '展开' : '折叠'}
          </p>
          <p class="text-sm text-muted-foreground">
            快捷键: Cmd/Ctrl + B
          </p>
        </main>
      </Sidebar.Provider>
    </DemoBox>
  )
}

export function SidebarNone() {
  const [active, setActive] = createSignal('home')

  return (
    <DemoBox title="不可折叠" class="h-80 p-0">
      <Sidebar.Provider collapsible="none">
        <Sidebar>
          <Sidebar.Header class="border-b border-border p-4">
            <span class="text-lg font-semibold">固定侧边栏</span>
          </Sidebar.Header>
          <Sidebar.Content class="p-2">
            <NavMenu
              items={menuItems}
              value={active()}
              onValueChange={setActive}
            />
          </Sidebar.Content>
        </Sidebar>
        <main class="flex-1 p-4">
          <p class="text-muted-foreground">
            collapsible="none" 时侧边栏始终展开
          </p>
        </main>
      </Sidebar.Provider>
    </DemoBox>
  )
}
