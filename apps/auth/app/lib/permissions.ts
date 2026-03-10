/**
 * 权限检查函数
 * 支持通配符匹配，如 'user:*' 匹配所有user:开头的权限
 */

export function hasPermission(
  userPermissions: string[],
  required: string,
): boolean {
  // 直接匹配
  if (userPermissions.includes(required)) {
    return true
  }

  // 通配符匹配
  for (const perm of userPermissions) {
    if (perm === '*') {
      return true
    } // 超级权限
    if (perm.endsWith(':*')) {
      const prefix = perm.slice(0, -1)
      if (required.startsWith(prefix)) {
        return true
      }
    }
  }

  return false
}

export function hasAnyPermission(
  userPermissions: string[],
  required: string[],
): boolean {
  return required.some((r) => hasPermission(userPermissions, r))
}

export function hasAllPermissions(
  userPermissions: string[],
  required: string[],
): boolean {
  return required.every((r) => hasPermission(userPermissions, r))
}

/**
 * 展开权限（将通配符展开为具体权限）
 */
export function expandPermissions(
  permissions: string[],
  allPermissions: string[],
): string[] {
  const result = new Set<string>()

  for (const perm of permissions) {
    if (perm.endsWith(':*')) {
      const prefix = perm.slice(0, -1)
      for (const p of allPermissions) {
        if (p.startsWith(prefix)) {
          result.add(p)
        }
      }
    } else {
      result.add(perm)
    }
  }

  return Array.from(result)
}

// 管理员权限列表
export const ADMIN_PERMISSIONS = [
  'user:read',
  'user:write',
  'user:write:status',
  'user:read:detail',
  'role:read',
  'role:write',
  'audit:read',
  'settings:read',
  'settings:write',
]

// 所有可用的权限
export const ALL_PERMISSIONS = [
  // 用户管理
  'user:read',
  'user:write',
  'user:write:status',
  'user:read:detail',
  'user:delete',
  // 角色/权限管理
  'role:read',
  'role:write',
  'role:delete',
  // 审计日志
  'audit:read',
  // 系统设置
  'settings:read',
  'settings:write',
  // 个人资料
  'profile:read',
  'profile:write',
]
