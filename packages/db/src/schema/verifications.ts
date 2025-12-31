import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * 验证令牌表 (邮箱验证、密码重置等)
 */
export const verifications = pgTable(
  'verifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('verifications_identifier_idx').on(table.identifier),
  ]
)

export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert
