/**
 * 管理后台共享 API 请求函数
 * 将散落在各 admin 页面的 fetch 调用统一到此处
 */
import {API_BASE_URL} from '@beeve/auth-client'
import type {AuditLog, RoleTemplate, UserListItem} from '@beeve/contracts'

// ==================== 通用请求封装 ====================

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      (error as {message?: string}).message || `请求失败: ${path}`,
    )
  }
  return response.json()
}

// ==================== 用户管理 ====================

export async function fetchUsers(params: {
  search: string
  page: number
  limit: number
}): Promise<{
  data: UserListItem[]
  pagination: {page: number; limit: number; total: number}
}> {
  const searchParams = new URLSearchParams()
  if (params.search) {
    searchParams.set('search', params.search)
  }
  searchParams.set('page', String(params.page))
  searchParams.set('limit', String(params.limit))

  return adminFetch(`/api/admin/users?${searchParams}`)
}

export async function updateUserStatus(
  userId: string,
  status: 'active' | 'disabled',
) {
  return adminFetch(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({status}),
  })
}

export async function assignUserRole(userId: string, roleTemplateId: string) {
  return adminFetch(`/api/admin/users/${userId}/role`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({roleTemplateId}),
  })
}

// ==================== 角色管理 ====================

export async function fetchRoles(): Promise<{data: RoleTemplate[]}> {
  return adminFetch('/api/admin/roles')
}

export async function createRole(data: {
  name: string
  description?: string
  permissions: string[]
}): Promise<RoleTemplate> {
  return adminFetch('/api/admin/roles', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  })
}

export async function updateRole(
  roleId: string,
  data: {name?: string; description?: string; permissions?: string[]},
): Promise<RoleTemplate> {
  return adminFetch(`/api/admin/roles/${roleId}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  })
}

export async function deleteRole(roleId: string): Promise<void> {
  return adminFetch(`/api/admin/roles/${roleId}`, {
    method: 'DELETE',
  })
}

// ==================== 审计日志 ====================

export async function fetchAuditLogs(params: {
  userId?: string
  action?: string
  page: number
  limit: number
}): Promise<{
  data: AuditLog[]
  pagination: {page: number; limit: number; total: number}
}> {
  const searchParams = new URLSearchParams()
  if (params.userId) {
    searchParams.set('userId', params.userId)
  }
  if (params.action) {
    searchParams.set('action', params.action)
  }
  searchParams.set('page', String(params.page))
  searchParams.set('limit', String(params.limit))

  return adminFetch(`/api/admin/audit-logs?${searchParams}`)
}

export async function fetchAllUsers(): Promise<{
  data: {id: string; name: string; email: string}[]
}> {
  const result = await adminFetch<{
    data: {id: string; name: string; email: string}[]
  }>('/api/admin/users?limit=100')
  return {
    data: result.data.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    })),
  }
}

// ==================== 用户资料 ====================

export async function updateProfile(data: {
  name: string
  image: string
}): Promise<void> {
  return adminFetch('/api/me', {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  })
}
