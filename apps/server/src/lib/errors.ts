import {APIError} from 'better-auth'
import type {statusCodes} from 'better-call'

/**
 * HTTP 状态码类型（从 better-call 复用）
 */
export type StatusCode = keyof typeof statusCodes

/**
 * 错误响应体类型（与 better-auth 格式一致）
 */
export interface ErrorBody {
  message: string
  code?: string
  cause?: unknown
  [key: string]: unknown
}

/**
 * 复用 better-auth 的 APIError
 *
 * 错误格式: { message: string, code?: string, ... }
 *
 * 示例:
 * ```json
 * {
 *   "message": "未授权访问",
 *   "code": "UNAUTHORIZED"
 * }
 * ```
 */
export {APIError}

/**
 * 便捷的错误创建函数
 * 统一使用 better-auth 的 APIError 格式
 */
export const Errors = {
  unauthorized: (message = '未授权访问', code = 'UNAUTHORIZED') =>
    new APIError('UNAUTHORIZED', {message, code}),

  forbidden: (message = '禁止访问', code = 'FORBIDDEN') =>
    new APIError('FORBIDDEN', {message, code}),

  invalidToken: (message = '无效的令牌', code = 'INVALID_TOKEN') =>
    new APIError('UNAUTHORIZED', {message, code}),

  tokenExpired: (message = '令牌已过期', code = 'TOKEN_EXPIRED') =>
    new APIError('UNAUTHORIZED', {message, code}),

  badRequest: (message = '错误的请求', code = 'BAD_REQUEST') =>
    new APIError('BAD_REQUEST', {message, code}),

  validation: (message: string, code = 'VALIDATION_ERROR', details?: unknown) =>
    new APIError('BAD_REQUEST', {message, code, details}),

  rateLimited: (message = '请求过于频繁', code = 'RATE_LIMITED') =>
    new APIError('TOO_MANY_REQUESTS', {message, code}),

  notFound: (resource = '资源', code = 'NOT_FOUND') =>
    new APIError('NOT_FOUND', {message: `${resource}不存在`, code}),

  alreadyExists: (resource = '资源', code = 'ALREADY_EXISTS') =>
    new APIError('CONFLICT', {message: `${resource}已存在`, code}),

  conflict: (message = '资源冲突', code = 'CONFLICT') =>
    new APIError('CONFLICT', {message, code}),

  internal: (message = '服务器内部错误', code = 'INTERNAL_ERROR') =>
    new APIError('INTERNAL_SERVER_ERROR', {message, code}),

  serviceUnavailable: (
    message = '服务暂不可用',
    code = 'SERVICE_UNAVAILABLE',
  ) => new APIError('SERVICE_UNAVAILABLE', {message, code}),
} as const

/**
 * 检查错误是否为 APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return (
    error instanceof Error &&
    'status' in error &&
    'body' in error &&
    typeof (error as APIError).status === 'string'
  )
}

/**
 * 将未知错误转换为 APIError
 */
export function toAPIError(error: unknown): APIError {
  if (isAPIError(error)) {
    return error
  }

  if (error instanceof Error) {
    return Errors.internal(error.message)
  }

  return Errors.internal('未知错误')
}
