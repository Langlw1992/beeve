import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'

/**
 * Better Auth 所需的 Schema 定义
 * 这些表由 Better Auth 自动创建和管理
 * 这里导出供 drizzle-kit 使用
 */

// 用户类型
export const userTypeEnum = ['regular', 'admin'] as const
export type UserType = (typeof userTypeEnum)[number]

// 用户状态
export const userStatusEnum = ['active', 'disabled'] as const
export type UserStatus = (typeof userStatusEnum)[number]

// 用户表
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

// 会话表
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

// 账号表（用于 OAuth 关联）
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

// 验证表（用于邮箱验证、密码重置等）
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

// 用户直接权限表
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

// 角色模板表（权限模板）
export const roleTemplates = pgTable('role_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  permissions: jsonb('permissions').$type<string[]>().notNull().default([]),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// 用户角色模板关联表
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

// 导出类型
export type User = typeof user.$inferSelect
export type Session = typeof session.$inferSelect
export type Account = typeof account.$inferSelect
export type Verification = typeof verification.$inferSelect
export type UserPermissions = typeof userPermissions.$inferSelect
export type RoleTemplates = typeof roleTemplates.$inferSelect
export type UserRoleTemplates = typeof userRoleTemplates.$inferSelect
