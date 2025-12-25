# 数据库约定

## 技术选型

- **数据库**: PostgreSQL 15+
- **ORM**: Drizzle ORM
- **迁移**: Drizzle Kit

## 目录结构

```
packages/db/
├── src/
│   ├── schema/              # 表定义
│   │   ├── users.ts         # 用户表
│   │   ├── projects.ts      # 项目表
│   │   ├── pages.ts         # 页面表
│   │   ├── roles.ts         # 角色表
│   │   ├── relations.ts     # 关联定义
│   │   └── index.ts         # 统一导出
│   ├── migrations/          # 迁移文件（自动生成）
│   ├── seed/                # 种子数据
│   │   ├── index.ts
│   │   ├── users.ts
│   │   └── roles.ts
│   └── client.ts            # 数据库客户端
├── drizzle.config.ts        # Drizzle 配置
└── package.json
```

## Schema 定义规范

### 命名约定

| 类型 | 规范 | 示例 |
|------|------|------|
| 表名 | 复数 snake_case | `users`, `oauth_accounts` |
| 列名 | snake_case | `created_at`, `password_hash` |
| 外键 | `{表名单数}_id` | `user_id`, `project_id` |
| 索引 | `{表名}_{列名}_idx` | `users_email_idx` |
| 唯一约束 | `{表名}_{列名}_unique` | `users_email_unique` |

### 基础模板

```typescript
// schema/users.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const users = pgTable(
  'users',
  {
    // 主键：使用 UUID
    id: uuid('id').primaryKey().defaultRandom(),

    // 必填字段
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),

    // 可选字段
    passwordHash: varchar('password_hash', { length: 255 }),
    avatar: text('avatar'),
    bio: text('bio'),

    // 布尔字段
    emailVerified: boolean('email_verified').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),

    // 时间戳（所有表必须有）
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    // 唯一索引
    uniqueIndex('users_email_unique').on(table.email),
    // 普通索引
    index('users_created_at_idx').on(table.createdAt),
  ]
)

// 导出推断类型
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

### 关联表

```typescript
// schema/oauth-accounts.ts
import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core'
import { users } from './users'

export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // 外键
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // OAuth 信息
    provider: varchar('provider', { length: 50 }).notNull(), // google, github
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('oauth_accounts_user_id_idx').on(table.userId),
    index('oauth_accounts_provider_account_id_idx').on(
      table.provider,
      table.providerAccountId
    ),
  ]
)

export type OauthAccount = typeof oauthAccounts.$inferSelect
export type NewOauthAccount = typeof oauthAccounts.$inferInsert
```

### 中间表（多对多）

```typescript
// schema/user-roles.ts
import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core'
import { users } from './users'
import { roles } from './roles'

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.roleId] }),
  ]
)

export type UserRole = typeof userRoles.$inferSelect
export type NewUserRole = typeof userRoles.$inferInsert
```

### JSON 字段

```typescript
// schema/pages.ts
import { pgTable, uuid, varchar, text, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core'
import { projects } from './projects'

// 定义 JSON 结构类型
export interface PageSchema {
  version: string
  components: ComponentNode[]
  dataSource?: DataSource[]
}

interface ComponentNode {
  id: string
  type: string
  props: Record<string, unknown>
  children?: ComponentNode[]
}

interface DataSource {
  id: string
  type: 'api' | 'static'
  config: Record<string, unknown>
}

export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  path: varchar('path', { length: 255 }),
  description: text('description'),

  // JSON 字段使用 jsonb 类型 + 类型断言
  schema: jsonb('schema').$type<PageSchema>().notNull(),

  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert
```

## 关联定义

```typescript
// schema/relations.ts
import { relations } from 'drizzle-orm'
import { users } from './users'
import { oauthAccounts } from './oauth-accounts'
import { projects } from './projects'
import { pages } from './pages'
import { roles } from './roles'
import { userRoles } from './user-roles'

// 用户关联
export const usersRelations = relations(users, ({ many }) => ({
  oauthAccounts: many(oauthAccounts),
  projects: many(projects),
  userRoles: many(userRoles),
}))

// OAuth 账号关联
export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, {
    fields: [oauthAccounts.userId],
    references: [users.id],
  }),
}))

// 项目关联
export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  pages: many(pages),
}))

// 页面关联
export const pagesRelations = relations(pages, ({ one }) => ({
  project: one(projects, {
    fields: [pages.projectId],
    references: [projects.id],
  }),
}))

// 角色关联
export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}))

// 用户角色关联
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}))
```

## 客户端配置

```typescript
// client.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// 创建 postgres 客户端
const client = postgres(connectionString, {
  max: 10, // 最大连接数
  idle_timeout: 20,
  connect_timeout: 10,
})

// 创建 drizzle 实例
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
})

export type Database = typeof db
```

## Drizzle 配置

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
```

## 常用查询模式

### 基础查询

```typescript
import { db } from '@beeve/db'
import { users } from '@beeve/db/schema'
import { eq, and, or, like, gt, lt, desc, asc, count, sql } from 'drizzle-orm'

// 查询单条
const user = await db.query.users.findFirst({
  where: eq(users.email, email),
})

// 查询多条
const allUsers = await db.query.users.findMany({
  where: eq(users.isActive, true),
  orderBy: desc(users.createdAt),
  limit: 10,
})

// 带关联查询
const userWithProjects = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    projects: {
      limit: 5,
      orderBy: desc(projects.createdAt),
    },
  },
})
```

### 选择特定字段

```typescript
// 使用 columns
const userEmails = await db.query.users.findMany({
  columns: {
    id: true,
    email: true,
    name: true,
    // passwordHash: false, // 排除
  },
})

// 使用 select
const result = await db
  .select({
    id: users.id,
    email: users.email,
  })
  .from(users)
```

### 复杂条件

```typescript
// AND 条件
const result = await db.query.users.findMany({
  where: and(
    eq(users.isActive, true),
    eq(users.emailVerified, true)
  ),
})

// OR 条件
const result = await db.query.users.findMany({
  where: or(
    like(users.name, `%${search}%`),
    like(users.email, `%${search}%`)
  ),
})

// 复合条件
const result = await db.query.users.findMany({
  where: and(
    eq(users.isActive, true),
    or(
      like(users.name, `%${search}%`),
      like(users.email, `%${search}%`)
    )
  ),
})
```

### 分页

```typescript
const page = 1
const pageSize = 20

const [data, [{ total }]] = await Promise.all([
  db.query.users.findMany({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: desc(users.createdAt),
  }),
  db.select({ total: count() }).from(users),
])
```

### 插入

```typescript
// 单条插入
const [user] = await db
  .insert(users)
  .values({
    email: 'user@example.com',
    name: 'User',
    passwordHash: hash,
  })
  .returning()

// 批量插入
const newUsers = await db
  .insert(users)
  .values([
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
  ])
  .returning()

// 冲突处理（upsert）
const result = await db
  .insert(users)
  .values({ email, name })
  .onConflictDoUpdate({
    target: users.email,
    set: { name, updatedAt: new Date() },
  })
  .returning()
```

### 更新

```typescript
// 单条更新
const [updated] = await db
  .update(users)
  .set({ name: 'New Name', updatedAt: new Date() })
  .where(eq(users.id, userId))
  .returning()

// 条件更新
await db
  .update(users)
  .set({ isActive: false })
  .where(lt(users.createdAt, thirtyDaysAgo))
```

### 删除

```typescript
// 单条删除
await db.delete(users).where(eq(users.id, userId))

// 条件删除
await db.delete(users).where(eq(users.isActive, false))

// 删除并返回
const [deleted] = await db
  .delete(users)
  .where(eq(users.id, userId))
  .returning()
```

### 事务

```typescript
const result = await db.transaction(async (tx) => {
  // 创建用户
  const [user] = await tx
    .insert(users)
    .values({ email, name, passwordHash })
    .returning()

  // 分配默认角色
  await tx.insert(userRoles).values({
    userId: user.id,
    roleId: defaultRoleId,
  })

  return user
})
```

### 原生 SQL

```typescript
import { sql } from 'drizzle-orm'

// 使用 sql 模板
const result = await db.execute(sql`
  SELECT * FROM users
  WHERE created_at > ${thirtyDaysAgo}
  ORDER BY created_at DESC
`)

// 在查询中使用
const usersWithCount = await db
  .select({
    ...users,
    projectCount: sql<number>`(
      SELECT COUNT(*) FROM projects
      WHERE projects.owner_id = ${users.id}
    )`,
  })
  .from(users)
```

## 迁移管理

### 生成迁移

```bash
# 根据 schema 变更生成迁移
pnpm db:generate

# 生成指定名称的迁移
pnpm drizzle-kit generate --name add_user_bio
```

### 执行迁移

```bash
# 执行所有待执行的迁移
pnpm db:migrate

# 回滚（手动执行生成的 down 迁移）
```

### 迁移文件示例

```sql
-- 0001_add_user_bio.sql
ALTER TABLE "users" ADD COLUMN "bio" text;

-- 0002_add_projects_description.sql
ALTER TABLE "projects" ADD COLUMN "description" text;
```

## 种子数据

```typescript
// seed/index.ts
import { db } from '../client'
import { seedUsers } from './users'
import { seedRoles } from './roles'

async function main() {
  console.log('🌱 Seeding database...')

  await seedRoles()
  await seedUsers()

  console.log('✅ Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => process.exit())
```

```typescript
// seed/roles.ts
import { db } from '../client'
import { roles } from '../schema'

export async function seedRoles() {
  const defaultRoles = [
    {
      name: 'admin',
      permissions: ['*'],
    },
    {
      name: 'user',
      permissions: ['project:read', 'project:write', 'page:read', 'page:write'],
    },
    {
      name: 'viewer',
      permissions: ['project:read', 'page:read'],
    },
  ]

  await db.insert(roles).values(defaultRoles).onConflictDoNothing()

  console.log('Roles seeded')
}
```

## 数据库 Schema 完整定义

### 用户系统

```typescript
// users - 用户表
id: UUID PK
email: VARCHAR(255) UNIQUE NOT NULL
password_hash: VARCHAR(255)
name: VARCHAR(100) NOT NULL
avatar: TEXT
email_verified: BOOLEAN DEFAULT false
is_active: BOOLEAN DEFAULT true
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()

// oauth_accounts - OAuth 账号
id: UUID PK
user_id: UUID FK -> users.id ON DELETE CASCADE
provider: VARCHAR(50) NOT NULL
provider_account_id: VARCHAR(255) NOT NULL
access_token: TEXT
refresh_token: TEXT
expires_at: TIMESTAMP
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()

// roles - 角色
id: UUID PK
name: VARCHAR(50) UNIQUE NOT NULL
permissions: JSONB DEFAULT []
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()

// user_roles - 用户角色关联
user_id: UUID FK -> users.id ON DELETE CASCADE
role_id: UUID FK -> roles.id ON DELETE CASCADE
PRIMARY KEY (user_id, role_id)
```

### 项目系统

```typescript
// projects - 项目
id: UUID PK
name: VARCHAR(100) NOT NULL
description: TEXT
owner_id: UUID FK -> users.id ON DELETE CASCADE
is_public: BOOLEAN DEFAULT false
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()

// pages - 页面
id: UUID PK
project_id: UUID FK -> projects.id ON DELETE CASCADE
name: VARCHAR(100) NOT NULL
path: VARCHAR(255)
description: TEXT
schema: JSONB NOT NULL
is_published: BOOLEAN DEFAULT false
published_at: TIMESTAMP
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()

// assets - 资源文件
id: UUID PK
project_id: UUID FK -> projects.id ON DELETE CASCADE
name: VARCHAR(255) NOT NULL
type: VARCHAR(50) NOT NULL
url: TEXT NOT NULL
size: INTEGER
created_at: TIMESTAMP DEFAULT NOW()
```
