import {useRouteContext} from '@tanstack/solid-router'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '~/lib/permissions'

/**
 * 权限检查Hook
 * 从RouteContext获取权限列表
 */
export function usePermissions() {
  const context = useRouteContext({from: '__root__'})
  const permissions = () => context().permissions ?? []

  return {
    permissions,
    has: (permission: string) => hasPermission(permissions(), permission),
    hasAny: (required: string[]) => hasAnyPermission(permissions(), required),
    hasAll: (required: string[]) => hasAllPermissions(permissions(), required),
    isAdmin: () => hasPermission(permissions(), '*'),
  }
}
