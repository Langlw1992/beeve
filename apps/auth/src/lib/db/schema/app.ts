import {pgTable, text, timestamp} from 'drizzle-orm/pg-core'
import {user} from '@/lib/auth/schema'

export const userPreferences = pgTable('user_preferences', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, {onDelete: 'cascade'}),
  themeMode: text('theme_mode').notNull().default('system'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export type SelectUserPreferences = typeof userPreferences.$inferSelect
export type InsertUserPreferences = typeof userPreferences.$inferInsert
