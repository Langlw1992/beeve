import {Button} from '@beeve/ui'
import {LogOut, Bell, Search} from 'lucide-solid'
import {useNavigate} from '@tanstack/solid-router'

interface HeaderProps {
  user?: {name: string; email: string; image?: string} | null
}

export function Header(_props: HeaderProps) {
  const navigate = useNavigate()

  const handleSignOut = () => {
    localStorage.removeItem('dev-user')
    navigate({to: '/login'})
  }

  return (
    <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* 左侧搜索 */}
      <div class="flex items-center flex-1 max-w-xl">
        <div class="relative w-full max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索..."
            class="w-full h-9 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300 transition-all"
          />
        </div>
      </div>

      {/* 右侧操作 */}
      <div class="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          class="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <Bell class="h-5 w-5" />
          <span class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </Button>

        <div class="h-6 w-px bg-slate-200 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          class="text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2"
        >
          <LogOut class="h-4 w-4" />
          <span class="font-medium">退出</span>
        </Button>
      </div>
    </header>
  )
}
