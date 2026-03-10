import {db} from '~/config/db'
import {
  user,
  userPermissions,
  roleTemplates,
  userRoleTemplates,
} from '~/db/schema'
import {eq} from 'drizzle-orm'

/**
 * 获取用户有效权限列表
 * admin类型返回所有权限（'*'）
 */
export async function getUserEffectivePermissions(
  userId: string,
): Promise<string[]> {
  // 获取用户信息
  const userData = await db.query.user.findFirst({
    where: eq(user.id, userId),
  })

  if (!userData) return []

  // admin类型返回超级权限
  if (userData.userType === 'admin') {
    return ['*']
  }

  const permissions = new Set<string>()

  // 加载权限模板权限
  const roleAssignment = await db.query.userRoleTemplates.findFirst({
    where: eq(userRoleTemplates.userId, userId),
    with: {
      roleTemplate: true,
    },
  })

  if (roleAssignment?.roleTemplate) {
    roleAssignment.roleTemplate.permissions.forEach((p) => permissions.add(p))
  }

  // 加载直接授予的权限
  const directPermissions = await db.query.userPermissions.findMany({
    where: eq(userPermissions.userId, userId),
  })

  directPermissions.forEach((p) => permissions.add(p.permission))

  return Array.from(permissions)
}

/**
 * 检查用户是否有指定权限
 * 支持通配符匹配
 */
export function hasPermission(
  userPermissions: string[],
  required: string,
): boolean {
  // 直接匹配
  if (userPermissions.includes(required)) return true

  // 通配符匹配
  for (const perm of userPermissions) {
    if (perm === '*') return true
    if (perm.endsWith(':*')) {
      const prefix = perm.slice(0, -1)
      if (required.startsWith(prefix)) return true
    }
  }

  return false
}

/**
 * 检查用户是否有任意一个指定权限
 */
export function hasAnyPermission(
  userPermissions: string[],
  required: string[],
): boolean {
  return required.some((r) => hasPermission(userPermissions, r))
}

/**
 * 检查用户是否有所有指定权限
 */
export function hasAllPermissions(
  userPermissions: string[],
  required: string[],
): boolean {
  return required.every((r) => hasPermission(userPermissions, r))
}
