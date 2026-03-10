/**
 * 权限常量定义
 * 与 apps/server/src/lib/user-permissions.ts 和 apps/server/src/routes/admin.ts 保持同步
 */

// 用户权限
export const PERMISSIONS = {
  // 用户管理
  USER: {
    READ: 'user:read',
    WRITE: 'user:write',
    DELETE: 'user:delete',
  },
  // 角色管理
  ROLE: {
    READ: 'role:read',
    WRITE: 'role:write',
    DELETE: 'role:delete',
  },
  // 审计日志
  AUDIT: {
    READ: 'audit:read',
  },
  // 系统设置
  SETTINGS: {
    READ: 'settings:read',
    WRITE: 'settings:write',
  },
} as const

// 管理员权限列表
export const ADMIN_PERMISSIONS = [
  PERMISSIONS.USER.READ,
  PERMISSIONS.USER.WRITE,
  PERMISSIONS.ROLE.READ,
  PERMISSIONS.ROLE.WRITE,
  PERMISSIONS.AUDIT.READ,
  PERMISSIONS.SETTINGS.READ,
] as const

// 系统角色模板
export const SYSTEM_ROLES = {
  ADMIN: {
    name: 'admin',
    permissions: ['*'],
  },
  USER: {
    name: 'user',
    permissions: [],
  },
} as const

// 超级权限通配符
export const SUPER_PERMISSION = '*'

// 用户类型
export const USER_TYPES = {
  REGULAR: 'regular',
  ADMIN: 'admin',
} as const

// 用户状态
export const USER_STATUS = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
} as const
