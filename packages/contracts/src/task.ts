/**
 * 任务、提醒与今日聚合相关契约
 */

export const TASK_STATUS = [
  'inbox',
  'todo',
  'doing',
  'done',
  'archived',
] as const
export type TaskStatus = (typeof TASK_STATUS)[number]

export const TASK_PRIORITY = ['high', 'medium', 'low'] as const
export type TaskPriority = (typeof TASK_PRIORITY)[number]

export const TASK_SOURCE_TYPE = [
  'manual',
  'ai_extract',
  'ai_rewrite',
  'imported',
] as const
export type TaskSourceType = (typeof TASK_SOURCE_TYPE)[number]

export type Task = {
  id: string
  userId: string
  title: string
  note: string | null
  status: TaskStatus
  priority: TaskPriority
  dueAt: Date | null
  plannedAt: Date | null
  completedAt: Date | null
  sourceType: TaskSourceType
  sourceText: string | null
  aiGenerated: boolean
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type ListTasksRequest = {
  status?: TaskStatus
  priority?: TaskPriority
  q?: string
  limit?: number
}

export type ListTasksResponse = {
  data: Task[]
}

export type GetTaskResponse = Task

export type CreateTaskRequest = {
  title: string
  note?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueAt?: string | null
  plannedAt?: string | null
  sourceType?: TaskSourceType
  sourceText?: string | null
  aiGenerated?: boolean
}

export type UpdateTaskRequest = {
  title?: string
  note?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  dueAt?: string | null
  plannedAt?: string | null
  completedAt?: string | null
  archivedAt?: string | null
  sourceType?: TaskSourceType
  sourceText?: string | null
  aiGenerated?: boolean
}

export const REMINDER_STATUS = [
  'scheduled',
  'completed',
  'skipped',
  'canceled',
] as const
export type ReminderStatus = (typeof REMINDER_STATUS)[number]

export const REMINDER_REPEAT_RULE = ['none', 'daily', 'weekly'] as const
export type ReminderRepeatRule = (typeof REMINDER_REPEAT_RULE)[number]

export type Reminder = {
  id: string
  userId: string
  relatedTaskId: string | null
  title: string
  note: string | null
  scheduledAt: Date
  repeatRule: ReminderRepeatRule
  status: ReminderStatus
  notificationIdentifier: string | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type ListRemindersRequest = {
  status?: ReminderStatus
  limit?: number
}

export type ListRemindersResponse = {
  data: Reminder[]
}

export type GetReminderResponse = Reminder

export type CreateReminderRequest = {
  title: string
  note?: string
  relatedTaskId?: string | null
  scheduledAt: string
  repeatRule?: ReminderRepeatRule
  notificationIdentifier?: string | null
}

export type UpdateReminderRequest = {
  title?: string
  note?: string | null
  relatedTaskId?: string | null
  scheduledAt?: string
  repeatRule?: ReminderRepeatRule
  status?: ReminderStatus
  notificationIdentifier?: string | null
  completedAt?: string | null
}

export type TodayStats = {
  totalOpenTasks: number
  totalDueToday: number
  totalUpcomingTasks: number
  totalRemindersToday: number
  totalCompletedToday: number
}

export type TodayResponse = {
  topTasks: Task[]
  dueToday: Task[]
  upcoming: Task[]
  remindersToday: Reminder[]
  stats: TodayStats
}
