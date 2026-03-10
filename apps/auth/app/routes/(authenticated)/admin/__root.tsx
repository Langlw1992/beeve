import {createFileRoute, Outlet, redirect} from '@tanstack/solid-router'
import {hasAnyPermission} from '~/lib/permissions'

const ADMIN_PERMISSIONS = [
  'user:read',
  'role:read',
  'audit:read',
  'settings:read',
]

/**
 * 管理后台权限守卫
 *
 * 需要至少一个管理权限才能访问
 * 服务端重定向（前端无法绕过）
 */
export const Route = createFileRoute('/(authenticated)/admin/__root')({
  beforeLoad: async ({context}) => {
    const hasAdminAccess = hasAnyPermission(
      context.permissions ?? [],
      ADMIN_PERMISSIONS,
    )

    if (!hasAdminAccess) {
      throw redirect({to: '/dashboard'})
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return <Outlet />
}
