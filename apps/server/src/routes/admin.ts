import {Elysia, t} from 'elysia'
import {db} from '~/config/db'
import {
  user,
  userPermissions,
  roleTemplates,
  userRoleTemplates,
} from '~/db/schema'
import {
  getUserEffectivePermissions,
  hasPermission,
} from '~/lib/user-permissions'
import {ApiError} from '~/lib/errors'
import {eq, desc, like, and, sql} from 'drizzle-orm'

// 管理员权限列表
const ADMIN_PERMISSIONS = [
  'user:read',
  'user:write',
  'role:read',
  'role:write',
  'audit:read',
  'settings:read',
]

/**
 * 验证管理员权限中间件
 */
async function requireAdmin(userId: string) {
  const permissions = await getUserEffectivePermissions(userId)
  const hasAdminAccess = ADMIN_PERMISSIONS.some((p) =>
    hasPermission(permissions, p),
  )

  if (!hasAdminAccess) {
    throw new ApiError(403, 'Forbidden', '需要管理员权限')
  }

  return permissions
}

export const adminRoutes = new Elysia({prefix: '/admin'})
  // 获取用户列表
  .get(
    '/users',
    async ({query, request}) => {
      // TODO: 从session获取当前用户ID并验证权限
      // await requireAdmin(currentUserId);

      const {search = '', page = '1', limit = '20'} = query
      const offset = (Number(page) - 1) * Number(limit)

      const whereClause = search
        ? sql`${user.name} ILIKE ${`%${search}%`} OR ${user.email} ILIKE ${`%${search}%`}`
        : undefined

      const [users, countResult] = await Promise.all([
        db.query.user.findMany({
          where: whereClause,
          limit: Number(limit),
          offset,
          orderBy: desc(user.createdAt),
        }),
        db
          .select({count: sql<number>`count(*)::int`})
          .from(user)
          .where(whereClause),
      ])

      return {
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: countResult[0]?.count ?? 0,
        },
      }
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )

  // 获取单个用户详情
  .get(
    '/users/:id',
    async ({params}) => {
      const userData = await db.query.user.findFirst({
        where: eq(user.id, params.id),
        with: {
          roleTemplate: {
            with: {
              roleTemplate: true,
            },
          },
        },
      })

      if (!userData) {
        throw new ApiError(404, 'Not Found', '用户不存在')
      }

      const permissions = await getUserEffectivePermissions(params.id)

      return {
        ...userData,
        permissions,
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )

  // 更新用户状态
  .patch(
    '/users/:id/status',
    async ({params, body}) => {
      const userData = await db.query.user.findFirst({
        where: eq(user.id, params.id),
      })

      if (!userData) {
        throw new ApiError(404, 'Not Found', '用户不存在')
      }

      const updated = await db
        .update(user)
        .set({
          status: body.status,
          updatedAt: new Date(),
        })
        .where(eq(user.id, params.id))
        .returning()

      return updated[0]
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        status: t.Union([t.Literal('active'), t.Literal('disabled')]),
      }),
    },
  )

  // 获取权限模板列表
  .get('/roles', async () => {
    const roles = await db.query.roleTemplates.findMany({
      orderBy: desc(roleTemplates.createdAt),
    })

    return {
      data: roles,
    }
  })

  // 创建权限模板
  .post(
    '/roles',
    async ({body}) => {
      const id = crypto.randomUUID()
      const role = await db
        .insert(roleTemplates)
        .values({
          id,
          name: body.name,
          description: body.description,
          permissions: body.permissions,
          isSystem: false,
        })
        .returning()

      return role[0]
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        permissions: t.Array(t.String()),
      }),
    },
  )

  // 分配用户角色
  .post(
    '/users/:id/role',
    async ({params, body}) => {
      // 检查用户是否存在
      const userData = await db.query.user.findFirst({
        where: eq(user.id, params.id),
      })

      if (!userData) {
        throw new ApiError(404, 'Not Found', '用户不存在')
      }

      // 检查角色是否存在
      const role = await db.query.roleTemplates.findFirst({
        where: eq(roleTemplates.id, body.roleTemplateId),
      })

      if (!role) {
        throw new ApiError(404, 'Not Found', '角色模板不存在')
      }

      // 删除旧的角色分配
      await db
        .delete(userRoleTemplates)
        .where(eq(userRoleTemplates.userId, params.id))

      // 创建新的角色分配
      const assignment = await db
        .insert(userRoleTemplates)
        .values({
          id: crypto.randomUUID(),
          userId: params.id,
          roleTemplateId: body.roleTemplateId,
          // TODO: assignedBy 从session获取
        })
        .returning()

      return assignment[0]
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        roleTemplateId: t.String(),
      }),
    },
  )
