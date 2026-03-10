/**
 * Header - 顶部导航栏组件
 */
import {Button} from '@beeve/ui'
import {UserMenu} from '../auth/UserMenu'

interface HeaderProps {
  user?: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export function Header(props: HeaderProps) {
  return (
    <header class="h-14 border-b bg-background flex items-center justify-between px-4">
      <div class="flex items-center gap-4">
        <a
          href="/"
          class="font-bold text-lg"
        >
          Beeve
        </a>
      </div>

      <div class="flex items-center gap-4">
        {props.user ? (
          <UserMenu user={props.user} />
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/login'
            }}
          >
            登录
          </Button>
        )}
      </div>
    </header>
  )
}
