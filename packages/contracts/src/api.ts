/**
 * API 请求/响应类型定义
 * 与 apps/server/src/routes 保持同步
 */

import type {RoleTemplate, User, UserDetail, UserListItem} from './user.js'

// ==================== 通用响应类型 ====================

export interface ApiResponse<T> {
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

export interface ApiError {
  code: number
  status: string
  message: string
}

// ==================== 认证相关 ====================

export interface SignInRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  name: string
  email: string
  password: string
}

export interface SocialSignInRequest {
  provider: 'google' | 'github'
  callbackURL?: string
}

export interface AuthSession {
  user: User
  session: {
    id: string
    token: string
    expiresAt: Date
  }
}

// ==================== 用户管理 ====================

export interface ListUsersRequest {
  search?: string
  page?: number
  limit?: number
}

export type ListUsersResponse = PaginatedResponse<UserListItem>

export interface GetUserResponse extends UserDetail {}

export interface UpdateUserStatusRequest {
  status: 'active' | 'disabled'
}

export type UpdateUserStatusResponse = User

// ==================== 角色/权限管理 ====================

export interface ListRolesResponse {
  data: RoleTemplate[]
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions: string[]
}

export type CreateRoleResponse = RoleTemplate

export interface AssignRoleRequest {
  roleTemplateId: string
}

export interface AssignRoleResponse {
  id: string
  userId: string
  roleTemplateId: string
  assignedBy: string | null
  assignedAt: Date
}

// ==================== 审计日志 ====================

export interface AuditLog {
  id: string
  userId: string | null
  action: string
  resource: string
  resourceId: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

export interface ListAuditLogsRequest {
  userId?: string
  action?: string
  page?: number
  limit?: number
}

export type ListAuditLogsResponse = PaginatedResponse<AuditLog>
