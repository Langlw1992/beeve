import {db} from '@/config/db'
import {aiConversations, aiMessages, reminders, tasks} from '@/db/schema'
import {generateJSON, generateText} from '@/lib/ai-provider'
import {generateIdWithPrefix} from '@/lib/id'
import {requireUserId} from '@/lib/session'
import {and, asc, desc, eq, ne} from 'drizzle-orm'
import {Elysia, t} from 'elysia'

type ContextPayload = {
  taskCount: number
  reminderCount: number
  openTasks: Array<{
    title: string
    status: string
    priority: string
    dueAt: Date | null
  }>
  scheduledReminders: Array<{
    title: string
    scheduledAt: Date
    repeatRule: string
  }>
}

async function getContext(userId: string): Promise<ContextPayload> {
  const [openTasks, scheduledReminders] = await Promise.all([
    db
      .select({
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        dueAt: tasks.dueAt,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          ne(tasks.status, 'done'),
          ne(tasks.status, 'archived'),
        ),
      )
      .orderBy(desc(tasks.priority), asc(tasks.dueAt), asc(tasks.createdAt))
      .limit(12),
    db
      .select({
        title: reminders.title,
        scheduledAt: reminders.scheduledAt,
        repeatRule: reminders.repeatRule,
      })
      .from(reminders)
      .where(
        and(eq(reminders.userId, userId), eq(reminders.status, 'scheduled')),
      )
      .orderBy(asc(reminders.scheduledAt))
      .limit(12),
  ])

  return {
    taskCount: openTasks.length,
    reminderCount: scheduledReminders.length,
    openTasks,
    scheduledReminders,
  }
}

async function persistConversation(params: {
  userId: string
  title: string
  actionType:
    | 'ask'
    | 'summarize'
    | 'rewrite'
    | 'extract_tasks'
    | 'extract_reminders'
  userContent: string
  assistantContent: string
  contextType?: 'global' | 'today' | 'task' | 'reminders' | 'note_input'
}) {
  const conversationId = generateIdWithPrefix('ai_conv')
  const createdAt = new Date()

  await db.insert(aiConversations).values({
    id: conversationId,
    userId: params.userId,
    title: params.title,
    contextType: params.contextType ?? 'global',
    createdAt,
    updatedAt: createdAt,
  })

  await db.insert(aiMessages).values([
    {
      id: generateIdWithPrefix('ai_msg'),
      conversationId,
      role: 'user',
      content: params.userContent,
      actionType: params.actionType,
      createdAt,
    },
    {
      id: generateIdWithPrefix('ai_msg'),
      conversationId,
      role: 'assistant',
      content: params.assistantContent,
      actionType: params.actionType,
      createdAt,
    },
  ])
}

function formatContext(context: ContextPayload) {
  return JSON.stringify(
    {
      openTasks: context.openTasks,
      scheduledReminders: context.scheduledReminders,
    },
    null,
    2,
  )
}

export const aiRoutes = new Elysia({prefix: '/api/v1'})
  .post(
    '/ai/ask',
    async ({body, request}) => {
      const userId = await requireUserId(request.headers)
      const context = await getContext(userId)
      const answer = await generateText({
        systemPrompt:
          '你是 Beeve 的轻量 AI 助手。你只能基于用户当前的任务与提醒上下文，输出中文、简洁、可执行的建议。不要虚构不存在的数据。',
        userPrompt: `用户问题：${body.question}\n\n当前上下文：\n${formatContext(context)}`,
      })

      await persistConversation({
        userId,
        title: body.question.slice(0, 40),
        actionType: 'ask',
        userContent: body.question,
        assistantContent: answer,
      })

      return {
        answer,
        context: {
          taskCount: context.taskCount,
          reminderCount: context.reminderCount,
        },
      }
    },
    {
      body: t.Object({
        question: t.String({minLength: 1, maxLength: 4000}),
      }),
    },
  )
  .post(
    '/ai/summarize',
    async ({body, request}) => {
      const userId = await requireUserId(request.headers)
      const context = await getContext(userId)
      const inputText = body.text?.trim()
      const scope = body.scope ?? 'today'
      const summary = await generateText({
        systemPrompt:
          '你是 Beeve 的效率总结助手。请输出中文总结，重点关注今日重点、风险、下一步建议。',
        userPrompt: inputText
          ? `请总结以下内容：\n${inputText}`
          : `请基于这个范围做总结：${scope}\n\n上下文：\n${formatContext(context)}`,
      })

      await persistConversation({
        userId,
        title: `总结-${scope}`,
        actionType: 'summarize',
        userContent: inputText || scope,
        assistantContent: summary,
        contextType: scope === 'reminders' ? 'reminders' : 'today',
      })

      return {
        summary,
        context: {
          taskCount: context.taskCount,
          reminderCount: context.reminderCount,
        },
      }
    },
    {
      body: t.Object({
        text: t.Optional(t.String({maxLength: 12000})),
        scope: t.Optional(
          t.Union([
            t.Literal('today'),
            t.Literal('tasks'),
            t.Literal('reminders'),
          ]),
        ),
      }),
    },
  )
  .post(
    '/ai/rewrite',
    async ({body, request}) => {
      const userId = await requireUserId(request.headers)
      const rewrittenText = await generateText({
        systemPrompt:
          '你是 Beeve 的文本整理助手。请把输入重写成更清晰、可执行、适合任务系统保存的中文文本。',
        userPrompt: `语气要求：${body.tone ?? 'actionable'}\n\n原始文本：\n${body.text}`,
      })

      await persistConversation({
        userId,
        title: '重写输入',
        actionType: 'rewrite',
        userContent: body.text,
        assistantContent: rewrittenText,
        contextType: 'note_input',
      })

      return {rewrittenText}
    },
    {
      body: t.Object({
        text: t.String({minLength: 1, maxLength: 12000}),
        tone: t.Optional(
          t.Union([
            t.Literal('clear'),
            t.Literal('concise'),
            t.Literal('actionable'),
          ]),
        ),
      }),
    },
  )
  .post(
    '/ai/extract',
    async ({body, request}) => {
      const userId = await requireUserId(request.headers)
      const result = await generateJSON<{
        summary: string
        tasks: Array<{
          title: string
          note?: string
          priority?: 'high' | 'medium' | 'low'
          dueAt?: string | null
        }>
        reminders: Array<{
          title: string
          note?: string
          scheduledAt?: string | null
          repeatRule?: 'none' | 'daily' | 'weekly'
        }>
      }>({
        systemPrompt:
          '你是 Beeve 的任务提取助手。请从输入文本中提取任务和提醒候选项。必须返回 JSON 对象，字段为 summary、tasks、reminders。时间无法确定时使用 null。',
        userPrompt: body.text,
      })

      await persistConversation({
        userId,
        title: '提取任务与提醒',
        actionType:
          result.reminders.length > 0 ? 'extract_reminders' : 'extract_tasks',
        userContent: body.text,
        assistantContent: JSON.stringify(result),
        contextType: 'note_input',
      })

      return {
        summary: result.summary,
        tasks: result.tasks,
        reminders: result.reminders,
      }
    },
    {
      body: t.Object({
        text: t.String({minLength: 1, maxLength: 12000}),
      }),
    },
  )
