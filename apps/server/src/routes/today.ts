import {db} from '@/config/db'
import {reminders, tasks} from '@/db/schema'
import {requireUserId} from '@/lib/session'
import {and, asc, desc, eq, gte, lt, ne, or} from 'drizzle-orm'
import {Elysia} from 'elysia'

function startOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function addDays(date: Date, days: number) {
  const value = new Date(date)
  value.setDate(value.getDate() + days)
  return value
}

export const todayRoutes = new Elysia({prefix: '/api/v1'}).get(
  '/today',
  async ({request}) => {
    const userId = await requireUserId(request.headers)
    const today = startOfDay(new Date())
    const tomorrow = addDays(today, 1)
    const nextWeek = addDays(today, 7)

    const openTaskFilter = and(
      eq(tasks.userId, userId),
      ne(tasks.status, 'done'),
      ne(tasks.status, 'archived'),
    )

    const [
      topTasks,
      dueToday,
      upcoming,
      remindersToday,
      openTasks,
      completedTasksToday,
      completedRemindersToday,
    ] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(openTaskFilter)
        .orderBy(desc(tasks.priority), asc(tasks.dueAt), asc(tasks.createdAt))
        .limit(3),
      db
        .select()
        .from(tasks)
        .where(
          and(
            openTaskFilter,
            gte(tasks.dueAt, today),
            lt(tasks.dueAt, tomorrow),
          ),
        )
        .orderBy(asc(tasks.dueAt), asc(tasks.createdAt)),
      db
        .select()
        .from(tasks)
        .where(
          and(
            openTaskFilter,
            gte(tasks.dueAt, tomorrow),
            lt(tasks.dueAt, nextWeek),
          ),
        )
        .orderBy(asc(tasks.dueAt), asc(tasks.createdAt))
        .limit(5),
      db
        .select()
        .from(reminders)
        .where(
          and(
            eq(reminders.userId, userId),
            eq(reminders.status, 'scheduled'),
            gte(reminders.scheduledAt, today),
            lt(reminders.scheduledAt, tomorrow),
          ),
        )
        .orderBy(asc(reminders.scheduledAt)),
      db.select().from(tasks).where(openTaskFilter),
      db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.status, 'done'),
            gte(tasks.completedAt, today),
            lt(tasks.completedAt, tomorrow),
          ),
        ),
      db
        .select()
        .from(reminders)
        .where(
          and(
            eq(reminders.userId, userId),
            eq(reminders.status, 'completed'),
            gte(reminders.completedAt, today),
            lt(reminders.completedAt, tomorrow),
          ),
        ),
    ])

    return {
      topTasks,
      dueToday,
      upcoming,
      remindersToday,
      stats: {
        totalOpenTasks: openTasks.length,
        totalDueToday: dueToday.length,
        totalUpcomingTasks: upcoming.length,
        totalRemindersToday: remindersToday.length,
        totalCompletedToday:
          completedTasksToday.length + completedRemindersToday.length,
      },
    }
  },
)
