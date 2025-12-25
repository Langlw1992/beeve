---
type: auto
description: Drizzle ORM schema patterns for PostgreSQL database
---

# Drizzle 数据库模式

## Schema 模板

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

// 表名：复数 snake_case
// 列名：snake_case
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 总是导出推断类型
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

## 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 表名 | 复数 snake_case | `users`, `blog_posts` |
| 列名 | snake_case | `created_at`, `user_id` |
| 主键 | UUID | `uuid('id').primaryKey().defaultRandom()` |
| 外键 | 表名单数_id | `user_id`, `post_id` |

## 常用命令

```bash
pnpm db:generate   # 生成迁移
pnpm db:migrate    # 运行迁移
pnpm db:studio     # 打开 Drizzle Studio
```
