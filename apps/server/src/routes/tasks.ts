import {db} from '@/config/db'
import {
  taskPriorityEnum,
  taskSourceTypeEnum,
  taskStatusEnum,
  tasks,
} from '@/db/schema'
import {Errors} from '@/lib/errors'
import {generateIdWithPrefix} from '@/lib/id'
import {requireUserId} from '@/lib/session'
import {and, asc, eq, ilike, or} from 'drizzle-orm'
import {Elysia, t} from 'elysia'

const taskStatusSet = new Set(taskStatusEnum)
const taskPrioritySet = new Set(taskPriorityEnum)
const taskSourceTypeSet = new Set(taskSourceTypeEnum)

function parseDateInput(value?: string | null) {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw Errors.validation(`无效的日期时间：${value}`)
  }

  return parsed
}

function parseTaskStatus(value: string): (typeof taskStatusEnum)[number] {
  if (!taskStatusSet.has(value as (typeof taskStatusEnum)[number])) {
    throw Errors.validation(`不支持的任务状态：${value}`)
  }

  return value as (typeof taskStatusEnum)[number]
}

function parseTaskPriority(value: string): (typeof taskPriorityEnum)[number] {
  if (!taskPrioritySet.has(value as (typeof taskPriorityEnum)[number])) {
    throw Errors.validation(`不支持的优先级：${value}`)
  }

  return value as (typeof taskPriorityEnum)[number]
}

function parseTaskSourceType(
  value: string,
): (typeof taskSourceTypeEnum)[number] {
  if (!taskSourceTypeSet.has(value as (typeof taskSourceTypeEnum)[number])) {
    throw Errors.validation(`不支持的任务来源：${value}`)
  }

  return value as (typeof taskSourceTypeEnum)[number]
}

export const taskRoutes = new Elysia({prefix: '/api/v1'})
  .get(
    '/tasks',
    async ({query, request}) => {
      const userId = await requireUserId(request.headers)
      const filters = [eq(tasks.userId, userId)]

      if (query.status) {
        filters.push(eq(tasks.status, parseTaskStatus(query.status)))
      }

      if (query.priority) {
        filters.push(eq(tasks.priority, parseTaskPriority(query.priority)))
      }

      if (query.q) {
        filters.push(
          or(
            ilike(tasks.title, `%${query.q}%`),
            ilike(tasks.note, `%${query.q}%`),
          )!,
        )
      }

      const limit = query.limit ? Number(query.limit) : 50
      if (!Number.isFinite(limit) || limit <= 0 || limit > 200) {
        throw Errors.validation('limit 必须在 1 到 200 之间')
      }

      const data = await db
        .select()
        .from(tasks)
        .where(and(...filters))
        .orderBy(asc(tasks.createdAt))
        .limit(limit)

      return {data}
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        priority: t.Optional(t.String()),
        q: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )
  .get('/tasks/:id', async ({params, request}) => {
    const userId = await requireUserId(request.headers)
    const record = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, params.id), eq(tasks.userId, userId)),
    })

    if (!record) {
      throw Errors.notFound('任务')
    }

    return record
  })
  .post(
    '/tasks',
    async ({body, request}) => {
      const userId = await requireUserId(request.headers)

      const status = body.status ? parseTaskStatus(body.status) : 'inbox'
      const priority = body.priority
        ? parseTaskPriority(body.priority)
        : 'medium'
      const sourceType = body.sourceType
        ? parseTaskSourceType(body.sourceType)
        : 'manual'
      const dueAt = parseDateInput(body.dueAt)
      const plannedAt = parseDateInput(body.plannedAt)
      const now = new Date()

      const [record] = await db
        .insert(tasks)
        .values({
          id: generateIdWithPrefix('task'),
          userId,
          title: body.title.trim(),
          note: body.note?.trim() || null,
          status,
          priority,
          dueAt: dueAt ?? null,
          plannedAt: plannedAt ?? null,
          sourceType,
          sourceText: body.sourceText?.trim() || null,
          aiGenerated: body.aiGenerated ?? false,
          completedAt: status == 'done' ? now : null,
          archivedAt: status == 'archived' ? now : null,
          updatedAt: now,
        })
        .returning()

      return record
    },
    {
      body: t.Object({
        title: t.String({minLength: 1, maxLength: 200}),
        note: t.Optional(t.String()),
        status: t.Optional(t.String()),
        priority: t.Optional(t.String()),
        dueAt: t.Optional(t.Nullable(t.String())),
        plannedAt: t.Optional(t.Nullable(t.String())),
        sourceType: t.Optional(t.String()),
        sourceText: t.Optional(t.Nullable(t.String())),
        aiGenerated: t.Optional(t.Boolean()),
      }),
    },
  )
  .patch(
    '/tasks/:id',
    async ({params, body, request}) => {
      const userId = await requireUserId(request.headers)
      const existing = await db.query.tasks.findFirst({
        where: and(eq(tasks.id, params.id), eq(tasks.userId, userId)),
      })

      if (!existing) {
        throw Errors.notFound('任务')
      }

      const status = body.status
        ? parseTaskStatus(body.status)
        : existing.status
      const priority = body.priority
        ? parseTaskPriority(body.priority)
        : existing.priority
      const sourceType = body.sourceType
        ? parseTaskSourceType(body.sourceType)
        : existing.sourceType
      const now = new Date()
      const completedAt =
        body.completedAt !== undefined
          ? parseDateInput(body.completedAt)
          : status === 'done'
            ? (existing.completedAt ?? now)
            : null
      const archivedAt =
        body.archivedAt !== undefined
          ? parseDateInput(body.archivedAt)
          : status === 'archived'
            ? (existing.archivedAt ?? now)
            : null

      const [updated] = await db
        .update(tasks)
        .set({
          title: body.title?.trim() ?? existing.title,
          note:
            body.note !== undefined ? body.note?.trim() || null : existing.note,
          status,
          priority,
          dueAt:
            body.dueAt !== undefined
              ? parseDateInput(body.dueAt)
              : existing.dueAt,
          plannedAt:
            body.plannedAt !== undefined
              ? parseDateInput(body.plannedAt)
              : existing.plannedAt,
          completedAt,
          archivedAt,
          sourceType,
          sourceText:
            body.sourceText !== undefined
              ? body.sourceText?.trim() || null
              : existing.sourceText,
          aiGenerated: body.aiGenerated ?? existing.aiGenerated,
          updatedAt: now,
        })
        .where(and(eq(tasks.id, params.id), eq(tasks.userId, userId)))
        .returning()

      return updated
    },
    {
      body: t.Object({
        title: t.Optional(t.String({minLength: 1, maxLength: 200})),
        note: t.Optional(t.Nullable(t.String())),
        status: t.Optional(t.String()),
        priority: t.Optional(t.String()),
        dueAt: t.Optional(t.Nullable(t.String())),
        plannedAt: t.Optional(t.Nullable(t.String())),
        completedAt: t.Optional(t.Nullable(t.String())),
        archivedAt: t.Optional(t.Nullable(t.String())),
        sourceType: t.Optional(t.String()),
        sourceText: t.Optional(t.Nullable(t.String())),
        aiGenerated: t.Optional(t.Boolean()),
      }),
    },
  )
  .delete('/tasks/:id', async ({params, request}) => {
    const userId = await requireUserId(request.headers)
    const [deleted] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, params.id), eq(tasks.userId, userId)))
      .returning({id: tasks.id})

    if (!deleted) {
      throw Errors.notFound('任务')
    }

    return {success: true, id: deleted.id}
  })
