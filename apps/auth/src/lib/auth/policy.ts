export const APP_ROLES = ['user', 'admin'] as const

export type AppRole = (typeof APP_ROLES)[number]

export function normalizeUserRole(role?: string | null): AppRole {
  return role === 'admin' ? 'admin' : 'user'
}

export function formatUserRoleLabel(role?: string | null): string {
  return normalizeUserRole(role) === 'admin' ? '管理员' : '普通成员'
}

export function isAdminRole(role?: string | null): boolean {
  return normalizeUserRole(role) === 'admin'
}

export function isAdminUser(user?: {role?: string | null} | null): boolean {
  return isAdminRole(user?.role)
}
