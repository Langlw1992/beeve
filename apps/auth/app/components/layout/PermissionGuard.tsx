import {Show, createSignal, onMount, type JSX} from 'solid-js'
import {hasPermission} from '~/lib/permissions'

interface PermissionGuardProps {
  permission: string | string[]
  children: JSX.Element
  fallback?: JSX.Element
}

/**
 * 权限守卫组件 - 客户端版本
 *
 * 从 localStorage 读取开发模式用户权限
 * 无权限时渲染fallback或null
 */
export function PermissionGuard(props: PermissionGuardProps) {
  const [permissions, setPermissions] = createSignal<string[]>([])

  onMount(() => {
    // 从 localStorage 读取开发模式用户
    const stored = localStorage.getItem('dev-user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setPermissions(user.permissions || [])
      } catch {
        setPermissions([])
      }
    }
  })

  const hasAccess = () => {
    const perms = permissions()
    if (perms.includes('*')) return true
    if (Array.isArray(props.permission)) {
      return props.permission.some((p) => hasPermission(perms, p))
    }
    return hasPermission(perms, props.permission)
  }

  return (
    <Show
      when={hasAccess()}
      fallback={props.fallback}
    >
      {props.children}
    </Show>
  )
}

/**
 * 权限反转守卫（无权限时渲染）
 */
export function NoPermissionGuard(props: {
  permission: string
  children: JSX.Element
}) {
  const context = useRouteContext({from: '__root__'})
  const permissions = () => context().permissions ?? []

  return (
    <Show when={!hasPermission(permissions(), props.permission)}>
      {props.children}
    </Show>
  )
}
