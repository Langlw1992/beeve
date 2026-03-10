/**
 * UserMenu - 用户下拉菜单组件
 */
import {authClient} from '@/lib/auth-client'
import {Dropdown, Button} from '@beeve/ui'
import {LogOut, User as UserIcon} from 'lucide-solid'
import {useNavigate} from '@tanstack/solid-router'
import type {MenuItemType} from '@beeve/ui'

interface UserMenuProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export function UserMenu(props: UserMenuProps) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate({to: '/login'})
  }

  const menuItems: MenuItemType[] = [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogOut class="size-4" />,
      onClick: handleSignOut,
    },
  ]

  return (
    <Dropdown items={menuItems}>
      <Button
        variant="ghost"
        class="flex items-center gap-2"
      >
        <div class="size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {props.user.image ? (
            <img
              src={props.user.image}
              alt={props.user.name}
              class="size-8 rounded-full"
            />
          ) : (
            <UserIcon class="size-4" />
          )}
        </div>
        <span class="hidden sm:inline">{props.user.name}</span>
      </Button>
    </Dropdown>
  )
}
