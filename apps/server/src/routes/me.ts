import {auth} from '@/auth'
import {Errors, isAPIError} from '@/lib/errors'
import type {Session, User} from 'better-auth'
import {Elysia} from 'elysia'

/**
 * 当前用户相关路由
 * GET /api/v1/me - 获取当前用户信息
 *
 * 返回格式: { user: User, session: Session }
 * 错误格式: { message: string, code?: string }
 */
export const meRoutes = new Elysia({prefix: '/api'}).get(
  '/me',
  async ({request, set}) => {
    try {
      // 使用 Better Auth 验证会话
      const session = await auth.api.getSession({
        headers: request.headers,
      })

      // 未登录返回 401
      if (!session) {
        set.status = 401
        throw Errors.unauthorized('请先登录')
      }

      const {user} = session

      // 返回用户基本信息（与 better-auth 格式保持一致）
      return {
        user,
        session,
      }
    } catch (error) {
      // 如果是 APIError，检查是否是认证错误
      if (isAPIError(error)) {
        // better-auth 在 token 无效时返回的 code 可能是 FAILED_TO_GET_SESSION 等
        // 统一转换为 401 Unauthorized
        if (
          error.body?.code?.includes('SESSION') ||
          error.body?.code?.includes('TOKEN')
        ) {
          set.status = 401
          throw Errors.unauthorized('认证失败，请重新登录')
        }
        throw error
      }

      // 处理其他错误（如 token 解析错误）
      console.error('[MeRoute] Error:', error)
      throw Errors.invalidToken('无效的认证令牌')
    }
  },
)

// 导出类型（从 better-auth 复用）
export type {Session, User}
export type MeRoutes = typeof meRoutes
