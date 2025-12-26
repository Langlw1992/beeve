# 编码约定

## 通用约定

### 文件命名

| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 组件文件 | PascalCase | `Button.tsx`, `DatePicker.tsx` |
| 组件目录 | PascalCase | `Button/`, `DatePicker/` |
| 工具函数 | kebab-case | `format-date.ts`, `use-auth.ts` |
| 类型文件 | kebab-case | `user.ts`, `api-response.ts` |
| 常量文件 | kebab-case | `error-codes.ts` |
| 配置文件 | kebab-case | `tailwind.config.ts` |

### 导出约定

```typescript
// ✅ 组件使用命名导出
export const Button: Component<ButtonProps> = (props) => { ... }

// ✅ 类型使用命名导出（优先 type）
export type ButtonProps = { ... }
export type ButtonVariant = 'primary' | 'secondary'

// ✅ 工具函数使用命名导出
export function formatDate(date: Date): string { ... }

// ✅ 目录 index.ts 统一导出
// components/Button/index.ts
export { Button } from './Button'
export type { ButtonProps } from './Button'
```

### 导入约定

```typescript
// 1. 外部依赖（按字母排序）
import { createSignal, onMount } from 'solid-js'
import { useNavigate } from '@tanstack/solid-router'

// 2. 内部包（@beeve/*）
import { Button, Input } from '@beeve/ui'
import { formatDate } from '@beeve/shared/utils'

// 3. 相对路径（先远后近）
import { useAuth } from '../../hooks/use-auth'
import { Header } from '../Header'
import { Logo } from './Logo'

// 4. 类型导入（单独分组）
import type { User } from '@beeve/shared/types'
import type { FormState } from './types'

// 5. 样式（如果有）
import './styles.css'
```

## TypeScript 约定

### 类型定义

**优先使用 `type` 而非 `interface`**，原因：
- 语法一致性，减少心智负担
- 配合 Zod `z.infer<>` 更自然
- 避免 interface 的声明合并问题
- 支持联合类型、条件类型等高级特性

```typescript
// ✅ 使用 type 定义对象类型
type User = {
  id: string
  email: string
  name: string
}

// ✅ 使用 type 定义联合类型、交叉类型
type Status = 'idle' | 'loading' | 'success' | 'error'
type UserWithRole = User & { role: Role }

// ✅ 组件 Props 使用 type 并加 Props 后缀
type ButtonProps = {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: JSX.Element
}

// ✅ 使用 readonly 保护不可变数据
type Config = {
  readonly apiUrl: string
  readonly version: string
}

// ✅ 使用泛型提高复用性
type ApiResponse<T> = {
  data: T
  meta?: PaginationMeta
}

// ✅ 从 Zod schema 推断类型
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
})
type User = z.infer<typeof userSchema>

// ⚠️ 仅当需要类实现（implements）时使用 interface
interface Disposable {
  dispose(): void
}
class Resource implements Disposable {
  dispose() { /* ... */ }
}

// ✅ 使用 satisfies 进行类型检查同时保留字面量类型
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} satisfies Config
```

### 类型断言

```typescript
// ✅ 优先使用类型守卫
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  )
}

// ✅ 必要时使用 as，但要谨慎
const element = document.getElementById('root') as HTMLDivElement

// ❌ 避免使用 any
function process(data: any) { ... }

// ✅ 使用 unknown 代替 any
function process(data: unknown) {
  if (isUser(data)) {
    // data 现在是 User 类型
  }
}
```

### 函数类型

```typescript
// ✅ 使用箭头函数和明确的返回类型
const formatDate = (date: Date): string => {
  return date.toISOString()
}

// ✅ 使用函数重载处理多种情况
function parse(input: string): number
function parse(input: number): string
function parse(input: string | number): number | string {
  return typeof input === 'string' ? parseInt(input) : input.toString()
}

// ✅ 使用 Zod 进行运行时验证
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
})

type User = z.infer<typeof UserSchema>
```

## SolidJS 约定

### 组件定义

```typescript
import { splitProps, type Component, type JSX } from 'solid-js'

// ✅ 使用 Component 类型
export const Button: Component<ButtonProps> = (props) => {
  // ✅ 使用 splitProps 分离 props
  const [local, rest] = splitProps(props, ['class', 'children', 'onClick'])

  return (
    <button class={local.class} onClick={local.onClick} {...rest}>
      {local.children}
    </button>
  )
}

// ✅ 需要 children 时使用 ParentComponent
import { type ParentComponent } from 'solid-js'

export const Card: ParentComponent<CardProps> = (props) => {
  return <div class="card">{props.children}</div>
}
```

### 响应式

```typescript
import { createSignal, createEffect, createMemo, batch } from 'solid-js'

// ✅ Signal 命名：[value, setValue]
const [count, setCount] = createSignal(0)
const [user, setUser] = createSignal<User | null>(null)

// ✅ 使用 createMemo 缓存计算值
const doubledCount = createMemo(() => count() * 2)

// ✅ 使用 createEffect 处理副作用
createEffect(() => {
  console.log('Count changed:', count())
})

// ✅ 使用 batch 批量更新
batch(() => {
  setCount(1)
  setUser(newUser)
})

// ❌ 避免在 JSX 外部解构响应式 props
const MyComponent: Component<{ value: number }> = (props) => {
  // ❌ 错误：解构会丢失响应性
  const { value } = props

  // ✅ 正确：直接使用 props.value
  return <div>{props.value}</div>
}
```

### Store

```typescript
import { createStore, produce } from 'solid-js/store'

// ✅ 复杂状态使用 Store
const [state, setState] = createStore({
  users: [] as User[],
  loading: false,
  error: null as string | null,
})

// ✅ 使用 produce 进行不可变更新
setState(
  produce((draft) => {
    draft.users.push(newUser)
  })
)

// ✅ 也可以使用路径更新
setState('loading', true)
setState('users', users.length, newUser)
```

### Context

```typescript
import { createContext, useContext, type ParentComponent } from 'solid-js'

// ✅ 创建带类型的 Context
type AuthContextValue = {
  user: () => User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>()

// ✅ 提供 Provider
export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>(null)

  const value: AuthContextValue = {
    user,
    login: async (email, password) => { ... },
    logout: () => setUser(null),
  }

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  )
}

// ✅ 提供类型安全的 hook
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

## TailwindCSS 约定

### 类名组织

```tsx
// ✅ 使用一致的顺序：布局 → 尺寸 → 间距 → 样式 → 状态
<div class="flex items-center justify-between w-full h-12 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">

// ✅ 使用 tailwind-variants 管理变体
import { tv } from 'tailwind-variants'

const button = tv({
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-background hover:bg-accent',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})
```

### 颜色约定

```typescript
// tailwind.config.ts
// ✅ 使用语义化颜色命名
export default {
  theme: {
    extend: {
      colors: {
        // 使用 CSS 变量支持主题切换
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
    },
  },
}
```

### 响应式设计

```tsx
// ✅ Mobile-first 设计
<div class="flex flex-col md:flex-row">
  <aside class="w-full md:w-64 lg:w-80">...</aside>
  <main class="flex-1">...</main>
</div>

// ✅ 断点使用
// sm: 640px   - 手机横屏
// md: 768px   - 平板
// lg: 1024px  - 小桌面
// xl: 1280px  - 桌面
// 2xl: 1536px - 大桌面
```

## Hono API 约定

### 路由结构

```typescript
// ✅ 每个资源一个文件夹
// routes/users/index.ts
import { Hono } from 'hono'
import { list } from './list'
import { get } from './get'
import { create } from './create'
import { update } from './update'
import { remove } from './remove'

const app = new Hono()

app.get('/', ...list)
app.get('/:id', ...get)
app.post('/', ...create)
app.patch('/:id', ...update)
app.delete('/:id', ...remove)

export default app
```

### 请求验证

```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

// ✅ 定义验证 schema
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
})

// ✅ 使用 zValidator 中间件
app.post(
  '/',
  zValidator('json', createUserSchema),
  async (c) => {
    const body = c.req.valid('json') // 类型安全
    // ...
  }
)

// ✅ 查询参数验证
const listQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  pageSize: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
})

app.get(
  '/',
  zValidator('query', listQuerySchema),
  async (c) => {
    const { page, pageSize, search } = c.req.valid('query')
    // ...
  }
)
```

### 错误处理

```typescript
import { HTTPException } from 'hono/http-exception'

// ✅ 使用自定义错误类
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
  }
}

// ✅ 全局错误处理
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json(
      { error: { code: err.code, message: err.message } },
      err.statusCode
    )
  }

  if (err instanceof HTTPException) {
    return c.json(
      { error: { code: 'HTTP_ERROR', message: err.message } },
      err.status
    )
  }

  console.error(err)
  return c.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    500
  )
})
```

### 中间件

```typescript
import { createMiddleware } from 'hono/factory'
import { verify } from './lib/jwt'

// ✅ 使用 createMiddleware 获得类型支持
export const authMiddleware = createMiddleware<{
  Variables: {
    userId: string
    user: User
  }
}>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  try {
    const payload = await verify(token)
    c.set('userId', payload.sub)
    await next()
  } catch {
    throw new HTTPException(401, { message: 'Invalid token' })
  }
})

// 使用
app.use('/api/*', authMiddleware)

// 在路由中获取
app.get('/api/me', (c) => {
  const userId = c.get('userId') // 类型安全
})
```

## 数据库约定 (Drizzle)

### Schema 定义

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core'

// ✅ 表名使用复数 snake_case
export const users = pgTable('users', {
  // ✅ 使用 UUID 作为主键
  id: uuid('id').primaryKey().defaultRandom(),
  // ✅ 字段名使用 snake_case
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  // ✅ 统一使用 created_at / updated_at
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ✅ 导出推断类型
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

### 关联关系

```typescript
import { relations } from 'drizzle-orm'

// ✅ 单独定义关联
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  oauthAccounts: many(oauthAccounts),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  pages: many(pages),
}))
```

### 查询

```typescript
import { eq, and, or, like, desc } from 'drizzle-orm'

// ✅ 简单查询
const user = await db.query.users.findFirst({
  where: eq(users.email, email),
})

// ✅ 带关联查询
const projectsWithPages = await db.query.projects.findMany({
  where: eq(projects.ownerId, userId),
  with: {
    pages: true,
    owner: {
      columns: { id: true, name: true },
    },
  },
  orderBy: desc(projects.createdAt),
})

// ✅ 复杂条件
const results = await db
  .select()
  .from(users)
  .where(
    and(
      eq(users.active, true),
      or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      )
    )
  )
  .limit(pageSize)
  .offset((page - 1) * pageSize)
```

## 测试约定

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@solidjs/testing-library'

describe('Button', () => {
  // ✅ 使用 describe 分组
  describe('rendering', () => {
    it('should render children', () => {
      render(() => <Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn()
      render(() => <Button onClick={handleClick}>Click</Button>)

      await fireEvent.click(screen.getByText('Click'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})
```

## Git 约定

### Commit 消息

使用 [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档
- `style`: 格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具

**Scope**: 影响的包或模块
- `ui`, `lowcode`, `auth`, `db`, `server`, `web`, `docs`

**示例**:
```
feat(ui): add Button component

- Add primary, secondary, outline variants
- Add sm, md, lg sizes
- Add loading state

Closes #123
```

### 分支命名

```
main              # 主分支
develop           # 开发分支
feat/xxx          # 功能分支
fix/xxx           # 修复分支
docs/xxx          # 文档分支
refactor/xxx      # 重构分支
```
