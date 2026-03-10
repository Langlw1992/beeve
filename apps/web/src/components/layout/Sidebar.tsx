/**
 * Sidebar - 侧边栏导航组件
 */
import {Sidebar as SidebarUI} from '@beeve/ui'
import {LayoutDashboard, User, Settings} from 'lucide-solid'
import {Link} from '@tanstack/solid-router'

interface SidebarProps {
  user?: {
    name: string
    email: string
  }
}

const menuItems = [
  {icon: LayoutDashboard, label: '仪表盘', href: '/dashboard'},
  {icon: User, label: '个人资料', href: '/profile'},
  {icon: Settings, label: '设置', href: '/settings'},
]

export function Sidebar(_props: SidebarProps) {
  return (
    <SidebarUI.Provider
      defaultOpen
      collapsible="icon"
    >
      <SidebarUI>
        <SidebarUI.Header>
          <div class="font-bold text-lg px-2">Beeve</div>
        </SidebarUI.Header>

        <SidebarUI.Content>
          <nav class="flex flex-col gap-1 px-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <item.icon class="size-5" />
                <span class="flex-1">{item.label}</span>
              </Link>
            ))}
          </nav>
        </SidebarUI.Content>

        <SidebarUI.Footer>
          <SidebarUI.Trigger />
        </SidebarUI.Footer>
      </SidebarUI>
    </SidebarUI.Provider>
  )
}
