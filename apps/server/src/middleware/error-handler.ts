import {Errors, isAPIError} from '@/lib/errors'
import type {ErrorHandler} from 'elysia'

/**
 * 统一错误处理中间件
 *
 * 使用 better-auth 的错误格式: { message: string, code?: string }
 *
 * 支持的 error 类型:
 * 1. APIError (better-auth) - 直接使用
 * 2. Elysia 验证错误 - 转换为 APIError
 * 3. 其他未知错误 - 转换为 INTERNAL_SERVER_ERROR
 */
export const errorHandler: ErrorHandler = ({error, set}) => {
  // 处理 APIError (better-auth 格式)
  if (isAPIError(error)) {
    const statusCode =
      typeof error.statusCode === 'number' ? error.statusCode : 500
    set.status = statusCode
    console.error(`[APIError] ${error.status}: ${error.body?.message}`)
    return error.body
  }

  // 处理 Elysia 内置的验证错误 (ValidationError)
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message)

    // 处理验证错误
    if (message.includes('validation') || message.includes('Validation')) {
      set.status = 400
      console.error(`[ValidationError] ${message}`)
      const apiError = Errors.validation(message)
      return apiError.body
    }
  }

  // 处理未知错误
  const errorMessage = error instanceof Error ? error.message : '未知错误'
  set.status = 500
  console.error(`[UnknownError] ${errorMessage}`, error)
  const internalError = Errors.internal(errorMessage)
  return internalError.body
}

/**
 * 处理 404 未找到的路由
 */
export function handleNotFound(path: string) {
  const error = Errors.notFound(`路径 ${path}`)
  return error.body
}
