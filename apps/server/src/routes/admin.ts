import {db} from '@/config/db'
import {
  account,
  roleTemplates,
  user,
  userPermissions,
  userRoleTemplates,
} from '@/db/schema'
import {APIError, Errors} from '@/lib/errors'
import {generateId} from '@/lib/id'
import {requireUserId} from '@/lib/session'
import {
  getUserEffectivePermissions,
  hasPermission,
} from '@/lib/user-permissions'
import {and, desc, eq, sql} from 'drizzle-orm'
import {Elysia, t} from 'elysia'

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
 * 验证管理员权限
 */
async function requireAdmin(userId: string): Promise<string[]> {
  const permissions = await getUserEffectivePermissions(userId)
  const hasAdminAccess = ADMIN_PERMISSIONS.some((p) =>
    hasPermission(permissions, p),
  )

  if (!hasAdminAccess) {
    throw new APIError('FORBIDDEN', {message: '需要管理员权限'})
  }

  return permissions
}

/**
 * 检查是否有指定权限
 */
async function checkPermission(
  userId: string,
  permission: string,
): Promise<boolean> {
  const permissions = await getUserEffectivePermissions(userId)
  return hasPermission(permissions, permission)
}

export const adminRoutes = new Elysia({prefix: '/api/admin'})
  // 获取用户列表
  .get(
    '/users',
    async ({query, request}) => {
      const userId = await requireUserId(request.headers)
      await requireAdmin(userId)

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
    async ({params, request}) => {
      const userId = await requireUserId(request.headers)
      await requireAdmin(userId)

      const userData = await db.query.user.findFirst({
        where: eq(user.id, params.id),
      })

      if (!userData) {
        throw new APIError('NOT_FOUND', {message: '用户不存在'})
      }

      // 获取用户权限
      const permissions = await getUserEffectivePermissions(params.id)

      // 获取用户角色
      const roleAssignment = await db.query.userRoleTemplates.findFirst({
        where: eq(userRoleTemplates.userId, params.id),
        with: {
          roleTemplate: true,
        },
      })

      // 获取用户账号关联
      const accounts = await db.query.account.findMany({
        where: eq(account.userId, params.id),
      })

      return {
        ...userData,
        permissions,
        role: roleAssignment?.roleTemplate ?? null,
        accounts: accounts.map((a) => ({
          id: a.id,
          providerId: a.providerId,
          accountId: a.accountId,
          createdAt: a.createdAt,
        })),
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )

  // 更新用户状态（禁用/启用）
  .patch(
    '/users/:id/status',
    async ({params, body, request}) => {
      const userId = await requireUserId(request.headers)
      // 检查是否有写入权限
      if (!(await checkPermission(userId, 'user:write'))) {
        throw new APIError('FORBIDDEN', {message: '需要用户管理权限'})
      }

      const userData = await db.query.user.findFirst({
        where: eq(user.id, params.id),
      })

      if (!userData) {
        throw new APIError('NOT_FOUND', {message: '用户不存在'})
      }

      // 不能禁用自己
      if (params.id === userId && body.status === 'disabled') {
        throw new APIError('BAD_REQUEST', {message: '不能禁用自己的账号'})
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

  // 更新用户类型（设为管理员等）
  .patch(
    '/users/:id/type',
    async ({params, body, request}) => {
      const userId = await requireUserId(request.headers)
      // 检查是否有写入权限
      if (!(await checkPermission(userId, 'user:write'))) {
        throw new APIError('FORBIDDEN', {message: '需要用户管理权限'})
      }

      const userData = await db.query.user.findFirst({
        where: eq(user.id, params.id),
      })

      if (!userData) {
        throw new APIError('NOT_FOUND', {message: '用户不存在'})
      }

      // 不能修改自己的类型
      if (params.id === userId) {
        throw new APIError('BAD_REQUEST', {message: '不能修改自己的用户类型'})
      }

      const updated = await db
        .update(user)
        .set({
          userType: body.userType,
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
        userType: t.Union([t.Literal('regular'), t.Literal('admin')]),
      }),
    },
  )

  // 获取权限模板列表
  .get('/roles', async ({request}) => {
    const userId = await requireUserId(request.headers)
    await requireAdmin(userId)

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
    async ({body, request}) => {
      const userId = await requireUserId(request.headers)
      if (!(await checkPermission(userId, 'role:write'))) {
        throw new APIError('FORBIDDEN', {message: '需要角色管理权限'})
      }

      const id = generateId()
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

  // 更新权限模板
  .patch(
    '/roles/:id',
    async ({params, body, request}) => {
      const userId = await requireUserId(request.headers)
      if (!(await checkPermission(userId, 'role:write'))) {
        throw new APIError('FORBIDDEN', {message: '需要角色管理权限'})
      }

      const roleData = await db.query.roleTemplates.findFirst({
        where: eq(roleTemplates.id, params.id),
      })

      if (!roleData) {
        throw new APIError('NOT_FOUND', {message: '角色模板不存在'})
      }

      // 系统角色不能修改
      if (roleData.isSystem) {
        throw new APIError('FORBIDDEN', {message: '不能修改系统角色'})
      }

      const updateData: Partial<typeof roleTemplates.$inferInsert> = {
        updatedAt: new Date(),
      }

      if (body.name !== undefined) {
        updateData.name = body.name
      }
      if (body.description !== undefined) {
        updateData.description = body.description
      }
      if (body.permissions !== undefined) {
        updateData.permissions = body.permissions
      }

      const updated = await db
        .update(roleTemplates)
        .set(updateData)
        .where(eq(roleTemplates.id, params.id))
        .returning()

      return updated[0]
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        permissions: t.Optional(t.Array(t.String())),
      }),
    },
  )

  // 删除权限模板
  .delete(
    '/roles/:id',
    async ({params, request}) => {
      const userId = await requireUserId(request.headers)
      if (!(await checkPermission(userId, 'role:write'))) {
        throw new APIError('FORBIDDEN', {message: '需要角色管理权限'})
      }

      const roleData = await db.query.roleTemplates.findFirst({
        where: eq(roleTemplates.id, params.id),
      })

      if (!roleData) {
        throw new APIError('NOT_FOUND', {message: '角色模板不存在'})
      }

      if (roleData.isSystem) {
        throw new APIError('FORBIDDEN', {message: '不能删除系统角色'})
      }

      // 检查是否有用户使用此角色
      const usersWithRole = await db.query.userRoleTemplates.findMany({
        where: eq(userRoleTemplates.roleTemplateId, params.id),
      })

      if (usersWithRole.length > 0) {
        throw new APIError('CONFLICT', {
          message: `该角色正在被 ${usersWithRole.length} 个用户使用，无法删除`,
        })
      }

      await db.delete(roleTemplates).where(eq(roleTemplates.id, params.id))

      return {success: true}
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )

  // 分配用户角色
  .post(
    '/users/:id/role',
    async ({params, body, request}) => {
      const userId = await requireUserId(request.headers)
      if (!(await checkPermission(userId, 'role:write'))) {
        throw new APIError('FORBIDDEN', {message: '需要角色管理权限'})
      }

      // 检查用户是否存在
      const userData = await db.query.user.findFirst({
        where: eq(user.id, params.id),
      })

      if (!userData) {
        throw new APIError('NOT_FOUND', {message: '用户不存在'})
      }

      // 检查角色是否存在
      const role = await db.query.roleTemplates.findFirst({
        where: eq(roleTemplates.id, body.roleTemplateId),
      })

      if (!role) {
        throw new APIError('NOT_FOUND', {message: '角色模板不存在'})
      }

      // 删除旧的角色分配
      await db
        .delete(userRoleTemplates)
        .where(eq(userRoleTemplates.userId, params.id))

      // 创建新的角色分配
      const assignment = await db
        .insert(userRoleTemplates)
        .values({
          id: generateId(),
          userId: params.id,
          roleTemplateId: body.roleTemplateId,
          assignedBy: userId,
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

  // 移除用户角色
  .delete(
    '/users/:id/role',
    async ({params, request}) => {
      const userId = await requireUserId(request.headers)
      if (!(await checkPermission(userId, 'role:write'))) {
        throw new APIError('FORBIDDEN', {message: '需要角色管理权限'})
      }

      // 检查用户是否存在
      const userData = await db.query.user.findFirst({
        where: eq(user.id, params.id),
      })

      if (!userData) {
        throw new APIError('NOT_FOUND', {message: '用户不存在'})
      }

      // 删除角色分配
      await db
        .delete(userRoleTemplates)
        .where(eq(userRoleTemplates.userId, params.id))

      return {success: true}
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )

  // 获取用户直接权限列表
  .get(
    '/users/:id/permissions',
    async ({params, request}) => {
      const userId = await requireUserId(request.headers)
      await requireAdmin(userId)

      const userData = await db.query.user.findFirst({
        where: eq(user.id, params.id),
      })

      if (!userData) {
        throw new APIError('NOT_FOUND', {message: '用户不存在'})
      }

      const permissions = await db.query.userPermissions.findMany({
        where: eq(userPermissions.userId, params.id),
        orderBy: desc(userPermissions.grantedAt),
      })

      return {
        data: permissions,
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )

  // 添加用户直接权限
  .post(
    '/users/:id/permissions',
    async ({params, body, request}) => {
      const userId = await requireUserId(request.headers)
      if (!(await checkPermission(userId, 'role:write'))) {
        throw new APIError('FORBIDDEN', {message: '需要权限管理权限'})
      }

      // 检查用户是否存在
      const userData = await db.query.user.findFirst({
        where: eq(user.id, params.id),
      })

      if (!userData) {
        throw new APIError('NOT_FOUND', {message: '用户不存在'})
      }

      // 检查权限是否已存在
      const existing = await db.query.userPermissions.findFirst({
        where: and(
          eq(userPermissions.userId, params.id),
          eq(userPermissions.permission, body.permission),
        ),
      })

      if (existing) {
        throw new APIError('CONFLICT', {message: '该权限已存在'})
      }

      // 创建权限记录
      const permission = await db
        .insert(userPermissions)
        .values({
          id: generateId(),
          userId: params.id,
          permission: body.permission,
          grantedBy: userId,
        })
        .returning()

      return permission[0]
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        permission: t.String(),
      }),
    },
  )

  // 移除用户直接权限
  .delete(
    '/users/:id/permissions/:permissionId',
    async ({params, request}) => {
      const userId = await requireUserId(request.headers)
      if (!(await checkPermission(userId, 'role:write'))) {
        throw new APIError('FORBIDDEN', {message: '需要权限管理权限'})
      }

      // 检查权限记录是否存在
      const permissionData = await db.query.userPermissions.findFirst({
        where: eq(userPermissions.id, params.permissionId),
      })

      if (!permissionData) {
        throw new APIError('NOT_FOUND', {message: '权限记录不存在'})
      }

      if (permissionData.userId !== params.id) {
        throw new APIError('BAD_REQUEST', {message: '权限记录与用户不匹配'})
      }

      await db
        .delete(userPermissions)
        .where(eq(userPermissions.id, params.permissionId))

      return {success: true}
    },
    {
      params: t.Object({
        id: t.String(),
        permissionId: t.String(),
      }),
    },
  )

  // 获取审计日志（基于用户创建时间和其他活动记录）
  .get(
    '/audit-logs',
    async ({query, request}) => {
      const userId = await requireUserId(request.headers)
      if (!(await checkPermission(userId, 'audit:read'))) {
        throw new APIError('FORBIDDEN', {message: '需要审计日志查看权限'})
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        userId: filterUserId,
        action: _action,
        page = '1',
        limit = '20',
      } = query
      const offset = (Number(page) - 1) * Number(limit)

      // 构建查询条件
      const conditions = []

      if (filterUserId) {
        conditions.push(eq(user.id, filterUserId))
      }

      // 由于目前没有独立的审计日志表，我们返回用户创建记录作为基础审计信息
      // 实际项目中应该使用独立的 audit_logs 表
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

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

      // 转换为审计日志格式
      const auditLogs = users.map((u) => ({
        id: `user_created_${u.id}`,
        userId: u.id,
        action: 'user:created',
        details: {
          email: u.email,
          name: u.name,
          userType: u.userType,
        },
        createdAt: u.createdAt,
      }))

      return {
        data: auditLogs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: countResult[0]?.count ?? 0,
        },
      }
    },
    {
      query: t.Object({
        userId: t.Optional(t.String()),
        action: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )

// 导出类型
export type AdminRoutes = typeof adminRoutes
