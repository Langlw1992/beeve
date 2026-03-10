import {auth} from '@/auth'
import {db} from '@/config/db'
import {user} from '@/db/schema'
import {Errors, isAPIError} from '@/lib/errors'
import type {Session, User} from 'better-auth'
import {eq} from 'drizzle-orm'
import {Elysia, t} from 'elysia'

/**
 * 获取当前会话信息
 */
async function getCurrentSession(headers: Headers) {
  const session = await auth.api.getSession({headers})
  return session
}

/**
 * 当前用户相关路由
 * GET /api/me - 获取当前用户信息
 * PATCH /api/me - 更新当前用户资料
 */
export const meRoutes = new Elysia({prefix: '/api'})
  // 获取当前用户信息
  .get('/me', async ({request, set}) => {
    try {
      const session = await getCurrentSession(request.headers)

      if (!session) {
        set.status = 401
        throw Errors.unauthorized('请先登录')
      }

      const {user} = session

      return {
        user,
        session,
      }
    } catch (error) {
      if (isAPIError(error)) {
        if (
          error.body?.code?.includes('SESSION') ||
          error.body?.code?.includes('TOKEN')
        ) {
          set.status = 401
          throw Errors.unauthorized('认证失败，请重新登录')
        }
        throw error
      }

      console.error('[MeRoute] Error:', error)
      throw Errors.invalidToken('无效的认证令牌')
    }
  })

  // 更新当前用户资料
  .patch(
    '/me',
    async ({request, set, body}) => {
      try {
        const session = await getCurrentSession(request.headers)

        if (!session) {
          set.status = 401
          throw Errors.unauthorized('请先登录')
        }

        const userId = session.user.id

        // 构建更新数据
        const updateData: Partial<typeof user.$inferInsert> = {
          updatedAt: new Date(),
        }

        if (body.name !== undefined) {
          updateData.name = body.name
        }

        if (body.image !== undefined) {
          updateData.image = body.image
        }

        // 更新用户信息
        const updated = await db
          .update(user)
          .set(updateData)
          .where(eq(user.id, userId))
          .returning()

        if (!updated.length) {
          throw Errors.notFound('用户')
        }

        return {
          user: updated[0],
        }
      } catch (error) {
        if (isAPIError(error)) {
          throw error
        }

        console.error('[MeRoute] Update error:', error)
        throw Errors.internal('更新用户资料失败')
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String({minLength: 1, maxLength: 100})),
        image: t.Optional(t.String()),
      }),
    },
  )

  // 获取当前用户权限
  .get('/me/permissions', async ({request, set}) => {
    try {
      const session = await getCurrentSession(request.headers)

      if (!session) {
        set.status = 401
        throw Errors.unauthorized('请先登录')
      }

      const userId = session.user.id

      // 动态导入避免循环依赖
      const {getUserEffectivePermissions} = await import(
        '@/lib/user-permissions'
      )
      const permissions = await getUserEffectivePermissions(userId)

      return {
        permissions,
      }
    } catch (error) {
      if (isAPIError(error)) {
        throw error
      }

      console.error('[MeRoute] Permissions error:', error)
      throw Errors.internal('获取权限失败')
    }
  })

// 导出类型（从 better-auth 复用）
export type {Session, User}
export type MeRoutes = typeof meRoutes
