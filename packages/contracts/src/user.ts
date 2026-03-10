/**
 * 用户相关类型定义
 * 与 apps/server/src/db/schema.ts 保持同步
 */

// 用户类型
export type UserType = 'regular' | 'admin'

// 用户状态
export type UserStatus = 'active' | 'disabled'

// 基础用户类型
export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  userType: UserType
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

// 会话类型
export interface Session {
  id: string
  expiresAt: Date
  token: string
  createdAt: Date
  updatedAt: Date
  ipAddress: string | null
  userAgent: string | null
  userId: string
}

// 账号类型（OAuth 关联）
export interface Account {
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
  scope: string | null
  password: string | null
  createdAt: Date
  updatedAt: Date
}

// 用户权限类型
export interface UserPermission {
  id: string
  userId: string
  permission: string
  grantedBy: string | null
  grantedAt: Date
}

// 角色模板类型
export interface RoleTemplate {
  id: string
  name: string
  description: string | null
  permissions: string[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

// 用户角色模板关联类型
export interface UserRoleTemplate {
  id: string
  userId: string
  roleTemplateId: string
  assignedBy: string | null
  assignedAt: Date
}

// 用户详情（包含权限）
export interface UserDetail extends User {
  permissions: string[]
  roleTemplate?: {
    roleTemplate: RoleTemplate
  }
}

// 用户列表项（简化版）
export interface UserListItem {
  id: string
  name: string
  email: string
  image: string | null
  userType: UserType
  status: UserStatus
  createdAt: Date
}
