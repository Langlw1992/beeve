/**
 * @beeve/shared - Types
 * 共享类型定义
 */

// API 响应类型
export interface ApiResponse<T> {
  data: T
  meta?: ApiMeta
}

export interface ApiMeta {
  page?: number
  pageSize?: number
  total?: number
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

// 用户相关类型
export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  userId: string
  expiresAt: Date
}

// 分页类型
export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: Required<Pick<ApiMeta, 'page' | 'pageSize' | 'total'>>
}

// 通用工具类型
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
