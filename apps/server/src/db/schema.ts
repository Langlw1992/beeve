import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import {relations} from 'drizzle-orm'

/**
 * Better Auth 所需的 Schema 定义
 * 这些表由 Better Auth 自动创建和管理
 * 这里导出供 drizzle-kit 使用
 */

export const userTypeEnum = ['regular', 'admin'] as const
export type UserType = (typeof userTypeEnum)[number]

export const userStatusEnum = ['active', 'disabled'] as const
export type UserStatus = (typeof userStatusEnum)[number]

export const taskStatusEnum = [
  'inbox',
  'todo',
  'doing',
  'done',
  'archived',
] as const
export type TaskStatus = (typeof taskStatusEnum)[number]

export const taskPriorityEnum = ['high', 'medium', 'low'] as const
export type TaskPriority = (typeof taskPriorityEnum)[number]

export const taskSourceTypeEnum = [
  'manual',
  'ai_extract',
  'ai_rewrite',
  'imported',
] as const
export type TaskSourceType = (typeof taskSourceTypeEnum)[number]

export const reminderStatusEnum = [
  'scheduled',
  'completed',
  'skipped',
  'canceled',
] as const
export type ReminderStatus = (typeof reminderStatusEnum)[number]

export const reminderRepeatRuleEnum = ['none', 'daily', 'weekly'] as const
export type ReminderRepeatRule = (typeof reminderRepeatRuleEnum)[number]

export const aiContextTypeEnum = [
  'global',
  'today',
  'task',
  'reminders',
  'note_input',
] as const
export type AIContextType = (typeof aiContextTypeEnum)[number]

export const aiActionTypeEnum = [
  'ask',
  'summarize',
  'rewrite',
  'extract_tasks',
  'extract_reminders',
] as const
export type AIActionType = (typeof aiActionTypeEnum)[number]

export const aiMessageRoleEnum = ['user', 'assistant', 'system'] as const
export type AIMessageRole = (typeof aiMessageRoleEnum)[number]

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  userType: text('user_type', {enum: userTypeEnum})
    .notNull()
    .default('regular'),
  status: text('status', {enum: userStatusEnum}).notNull().default('active'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, {onDelete: 'cascade'}),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, {onDelete: 'cascade'}),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

export const userPermissions = pgTable(
  'user_permissions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, {onDelete: 'cascade'}),
    permission: text('permission').notNull(),
    grantedBy: text('granted_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    grantedAt: timestamp('granted_at').notNull().defaultNow(),
  },
  (table) => [
    unique('user_permission_unique').on(table.userId, table.permission),
  ],
)

export const roleTemplates = pgTable('role_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  permissions: jsonb('permissions').$type<string[]>().notNull().default([]),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const userRoleTemplates = pgTable(
  'user_role_templates',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, {onDelete: 'cascade'}),
    roleTemplateId: text('role_template_id')
      .notNull()
      .references(() => roleTemplates.id, {onDelete: 'cascade'}),
    assignedBy: text('assigned_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  },
  (table) => [unique('user_role_template_unique').on(table.userId)],
)

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, {onDelete: 'cascade'}),
  title: text('title').notNull(),
  note: text('note'),
  status: text('status', {enum: taskStatusEnum}).notNull().default('inbox'),
  priority: text('priority', {enum: taskPriorityEnum})
    .notNull()
    .default('medium'),
  dueAt: timestamp('due_at'),
  plannedAt: timestamp('planned_at'),
  completedAt: timestamp('completed_at'),
  sourceType: text('source_type', {enum: taskSourceTypeEnum})
    .notNull()
    .default('manual'),
  sourceText: text('source_text'),
  aiGenerated: boolean('ai_generated').notNull().default(false),
  archivedAt: timestamp('archived_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const reminders = pgTable('reminders', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, {onDelete: 'cascade'}),
  relatedTaskId: text('related_task_id').references(() => tasks.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  note: text('note'),
  scheduledAt: timestamp('scheduled_at').notNull(),
  repeatRule: text('repeat_rule', {enum: reminderRepeatRuleEnum})
    .notNull()
    .default('none'),
  status: text('status', {enum: reminderStatusEnum})
    .notNull()
    .default('scheduled'),
  notificationIdentifier: text('notification_identifier'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const aiConversations = pgTable('ai_conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, {onDelete: 'cascade'}),
  title: text('title'),
  contextType: text('context_type', {enum: aiContextTypeEnum})
    .notNull()
    .default('global'),
  contextRefId: text('context_ref_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const aiMessages = pgTable('ai_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => aiConversations.id, {onDelete: 'cascade'}),
  role: text('role', {enum: aiMessageRoleEnum}).notNull(),
  content: text('content').notNull(),
  actionType: text('action_type', {enum: aiActionTypeEnum}).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type User = typeof user.$inferSelect
export type Session = typeof session.$inferSelect
export type Account = typeof account.$inferSelect
export type Verification = typeof verification.$inferSelect
export type UserPermissions = typeof userPermissions.$inferSelect
export type RoleTemplates = typeof roleTemplates.$inferSelect
export type UserRoleTemplates = typeof userRoleTemplates.$inferSelect
export type Task = typeof tasks.$inferSelect
export type Reminder = typeof reminders.$inferSelect
export type AIConversation = typeof aiConversations.$inferSelect
export type AIMessage = typeof aiMessages.$inferSelect

// Relations
export const userRoleTemplatesRelations = relations(
  userRoleTemplates,
  ({one}) => ({
    roleTemplate: one(roleTemplates, {
      fields: [userRoleTemplates.roleTemplateId],
      references: [roleTemplates.id],
    }),
  }),
)
