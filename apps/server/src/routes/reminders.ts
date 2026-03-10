import {db} from '@/config/db'
import {
  reminderRepeatRuleEnum,
  reminderStatusEnum,
  reminders,
} from '@/db/schema'
import {Errors} from '@/lib/errors'
import {generateIdWithPrefix} from '@/lib/id'
import {requireUserId} from '@/lib/session'
import {and, asc, eq} from 'drizzle-orm'
import {Elysia, t} from 'elysia'

const reminderStatusSet = new Set(reminderStatusEnum)
const reminderRepeatRuleSet = new Set(reminderRepeatRuleEnum)

function parseRequiredDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw Errors.validation(`无效的日期时间：${value}`)
  }
  return parsed
}

function parseOptionalDate(value?: string | null) {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  return parseRequiredDate(value)
}

function parseReminderStatus(
  value: string,
): (typeof reminderStatusEnum)[number] {
  if (!reminderStatusSet.has(value as (typeof reminderStatusEnum)[number])) {
    throw Errors.validation(`不支持的提醒状态：${value}`)
  }

  return value as (typeof reminderStatusEnum)[number]
}

function parseReminderRepeatRule(
  value: string,
): (typeof reminderRepeatRuleEnum)[number] {
  if (
    !reminderRepeatRuleSet.has(value as (typeof reminderRepeatRuleEnum)[number])
  ) {
    throw Errors.validation(`不支持的提醒频率：${value}`)
  }

  return value as (typeof reminderRepeatRuleEnum)[number]
}

export const reminderRoutes = new Elysia({prefix: '/api/v1'})
  .get(
    '/reminders',
    async ({query, request}) => {
      const userId = await requireUserId(request.headers)
      const filters = [eq(reminders.userId, userId)]

      if (query.status) {
        filters.push(eq(reminders.status, parseReminderStatus(query.status)))
      }

      const limit = query.limit ? Number(query.limit) : 50
      if (!Number.isFinite(limit) || limit <= 0 || limit > 200) {
        throw Errors.validation('limit 必须在 1 到 200 之间')
      }

      const data = await db
        .select()
        .from(reminders)
        .where(and(...filters))
        .orderBy(asc(reminders.scheduledAt))
        .limit(limit)

      return {data}
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )
  .get('/reminders/:id', async ({params, request}) => {
    const userId = await requireUserId(request.headers)
    const record = await db.query.reminders.findFirst({
      where: and(eq(reminders.id, params.id), eq(reminders.userId, userId)),
    })

    if (!record) {
      throw Errors.notFound('提醒')
    }

    return record
  })
  .post(
    '/reminders',
    async ({body, request}) => {
      const userId = await requireUserId(request.headers)

      const repeatRule = body.repeatRule
        ? parseReminderRepeatRule(body.repeatRule)
        : 'none'
      const scheduledAt = parseRequiredDate(body.scheduledAt)
      const [record] = await db
        .insert(reminders)
        .values({
          id: generateIdWithPrefix('reminder'),
          userId,
          relatedTaskId: body.relatedTaskId ?? null,
          title: body.title.trim(),
          note: body.note?.trim() || null,
          scheduledAt,
          repeatRule,
          notificationIdentifier: body.notificationIdentifier ?? null,
          status: 'scheduled',
          updatedAt: new Date(),
        })
        .returning()

      return record
    },
    {
      body: t.Object({
        title: t.String({minLength: 1, maxLength: 200}),
        note: t.Optional(t.String()),
        relatedTaskId: t.Optional(t.Nullable(t.String())),
        scheduledAt: t.String(),
        repeatRule: t.Optional(t.String()),
        notificationIdentifier: t.Optional(t.Nullable(t.String())),
      }),
    },
  )
  .patch(
    '/reminders/:id',
    async ({params, body, request}) => {
      const userId = await requireUserId(request.headers)
      const existing = await db.query.reminders.findFirst({
        where: and(eq(reminders.id, params.id), eq(reminders.userId, userId)),
      })

      if (!existing) {
        throw Errors.notFound('提醒')
      }

      const status = body.status
        ? parseReminderStatus(body.status)
        : existing.status
      const repeatRule = body.repeatRule
        ? parseReminderRepeatRule(body.repeatRule)
        : existing.repeatRule
      const completedAt =
        body.completedAt !== undefined
          ? parseOptionalDate(body.completedAt)
          : status === 'completed'
            ? (existing.completedAt ?? new Date())
            : null

      const [updated] = await db
        .update(reminders)
        .set({
          relatedTaskId:
            body.relatedTaskId !== undefined
              ? body.relatedTaskId
              : existing.relatedTaskId,
          title: body.title?.trim() ?? existing.title,
          note:
            body.note !== undefined ? body.note?.trim() || null : existing.note,
          scheduledAt:
            body.scheduledAt !== undefined
              ? parseRequiredDate(body.scheduledAt)
              : existing.scheduledAt,
          repeatRule,
          status,
          notificationIdentifier:
            body.notificationIdentifier !== undefined
              ? body.notificationIdentifier
              : existing.notificationIdentifier,
          completedAt,
          updatedAt: new Date(),
        })
        .where(and(eq(reminders.id, params.id), eq(reminders.userId, userId)))
        .returning()

      return updated
    },
    {
      body: t.Object({
        title: t.Optional(t.String({minLength: 1, maxLength: 200})),
        note: t.Optional(t.Nullable(t.String())),
        relatedTaskId: t.Optional(t.Nullable(t.String())),
        scheduledAt: t.Optional(t.String()),
        repeatRule: t.Optional(t.String()),
        status: t.Optional(t.String()),
        notificationIdentifier: t.Optional(t.Nullable(t.String())),
        completedAt: t.Optional(t.Nullable(t.String())),
      }),
    },
  )
  .delete('/reminders/:id', async ({params, request}) => {
    const userId = await requireUserId(request.headers)
    const [deleted] = await db
      .delete(reminders)
      .where(and(eq(reminders.id, params.id), eq(reminders.userId, userId)))
      .returning({id: reminders.id})

    if (!deleted) {
      throw Errors.notFound('提醒')
    }

    return {success: true, id: deleted.id}
  })
