# API 开发指南

## 目录结构

```
apps/server/src/
├── routes/              # API 路由
│   ├── auth/            # 认证相关
│   │   ├── index.ts     # 路由汇总
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── logout.ts
│   │   ├── refresh.ts
│   │   └── oauth/
│   │       ├── google.ts
│   │       └── github.ts
│   ├── users/
│   │   ├── index.ts
│   │   ├── list.ts
│   │   ├── get.ts
│   │   ├── create.ts
│   │   ├── update.ts
│   │   └── delete.ts
│   ├── projects/
│   └── pages/
├── middleware/          # 中间件
│   ├── auth.ts          # JWT 验证
│   ├── cors.ts          # CORS
│   ├── logger.ts        # 日志
│   └── error.ts         # 错误处理
├── services/            # 业务逻辑
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── project.service.ts
│   └── page.service.ts
├── lib/                 # 工具库
│   ├── jwt.ts           # JWT 工具
│   ├── hash.ts          # 密码哈希
│   ├── email.ts         # 邮件服务
│   └── storage.ts       # 文件存储
├── types/               # 类型定义
│   └── hono.ts          # Hono 扩展类型
└── index.ts             # 入口
```

## 路由模板

### 基础 CRUD 路由

```typescript
// routes/users/index.ts
import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import list from './list'
import get from './get'
import create from './create'
import update from './update'
import remove from './delete'

const app = new Hono()

// 所有用户路由需要认证
app.use('/*', authMiddleware)

// RESTful 路由
app.route('/', list)      // GET    /users
app.route('/', get)       // GET    /users/:id
app.route('/', create)    // POST   /users
app.route('/', update)    // PATCH  /users/:id
app.route('/', remove)    // DELETE /users/:id

export default app
```

### 列表接口

```typescript
// routes/users/list.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@beeve/db'
import { users } from '@beeve/db/schema'
import { count, like, or, desc } from 'drizzle-orm'
import type { HonoEnv } from '../../types/hono'

const app = new Hono<HonoEnv>()

// 查询参数验证
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

app.get('/', zValidator('query', querySchema), async (c) => {
  const { page, pageSize, search, sortBy, sortOrder } = c.req.valid('query')

  // 构建查询条件
  const where = search
    ? or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      )
    : undefined

  // 并行查询数据和总数
  const [data, [{ total }]] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(sortOrder === 'desc' ? desc(users[sortBy]) : users[sortBy])
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ total: count() })
      .from(users)
      .where(where),
  ])

  return c.json({
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  })
})

export default app
```

### 详情接口

```typescript
// routes/users/get.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@beeve/db'
import { users } from '@beeve/db/schema'
import { eq } from 'drizzle-orm'
import { AppError } from '../../lib/errors'
import type { HonoEnv } from '../../types/hono'

const app = new Hono<HonoEnv>()

const paramsSchema = z.object({
  id: z.string().uuid(),
})

app.get('/:id', zValidator('param', paramsSchema), async (c) => {
  const { id } = c.req.valid('param')

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: {
      passwordHash: false, // 排除敏感字段
    },
  })

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404)
  }

  return c.json({ data: user })
})

export default app
```

### 创建接口

```typescript
// routes/users/create.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@beeve/db'
import { users } from '@beeve/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../../lib/hash'
import { AppError } from '../../lib/errors'
import type { HonoEnv } from '../../types/hono'

const app = new Hono<HonoEnv>()

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
})

app.post('/', zValidator('json', bodySchema), async (c) => {
  const body = c.req.valid('json')

  // 检查邮箱是否已存在
  const existing = await db.query.users.findFirst({
    where: eq(users.email, body.email),
  })

  if (existing) {
    throw new AppError('EMAIL_EXISTS', 'Email already exists', 409)
  }

  // 创建用户
  const passwordHash = await hashPassword(body.password)

  const [user] = await db
    .insert(users)
    .values({
      email: body.email,
      passwordHash,
      name: body.name,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    })

  return c.json({ data: user }, 201)
})

export default app
```

### 更新接口

```typescript
// routes/users/update.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@beeve/db'
import { users } from '@beeve/db/schema'
import { eq } from 'drizzle-orm'
import { AppError } from '../../lib/errors'
import type { HonoEnv } from '../../types/hono'

const app = new Hono<HonoEnv>()

const paramsSchema = z.object({
  id: z.string().uuid(),
})

const bodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
}).partial()

app.patch(
  '/:id',
  zValidator('param', paramsSchema),
  zValidator('json', bodySchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    // 检查用户是否存在
    const existing = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!existing) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404)
    }

    // 更新用户
    const [user] = await db
      .update(users)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        updatedAt: users.updatedAt,
      })

    return c.json({ data: user })
  }
)

export default app
```

### 删除接口

```typescript
// routes/users/delete.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@beeve/db'
import { users } from '@beeve/db/schema'
import { eq } from 'drizzle-orm'
import { AppError } from '../../lib/errors'
import type { HonoEnv } from '../../types/hono'

const app = new Hono<HonoEnv>()

const paramsSchema = z.object({
  id: z.string().uuid(),
})

app.delete('/:id', zValidator('param', paramsSchema), async (c) => {
  const { id } = c.req.valid('param')
  const currentUserId = c.get('userId')

  // 不能删除自己
  if (id === currentUserId) {
    throw new AppError('CANNOT_DELETE_SELF', 'Cannot delete yourself', 400)
  }

  // 检查用户是否存在
  const existing = await db.query.users.findFirst({
    where: eq(users.id, id),
  })

  if (!existing) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404)
  }

  // 删除用户
  await db.delete(users).where(eq(users.id, id))

  return c.json({ data: { success: true } })
})

export default app
```

## 中间件

### JWT 认证中间件

```typescript
// middleware/auth.ts
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { verifyToken } from '../lib/jwt'
import { db } from '@beeve/db'
import { users } from '@beeve/db/schema'
import { eq } from 'drizzle-orm'
import type { User } from '@beeve/db/schema'

// 定义 Hono 环境类型
export interface AuthEnv {
  Variables: {
    userId: string
    user: User
  }
}

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing authorization header' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = await verifyToken(token)

    // 验证用户是否存在
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    })

    if (!user) {
      throw new HTTPException(401, { message: 'User not found' })
    }

    // 设置上下文
    c.set('userId', user.id)
    c.set('user', user)

    await next()
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    throw new HTTPException(401, { message: 'Invalid token' })
  }
})

// 可选认证中间件（允许未登录访问）
export const optionalAuthMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const payload = await verifyToken(token)
      const user = await db.query.users.findFirst({
        where: eq(users.id, payload.sub),
      })
      if (user) {
        c.set('userId', user.id)
        c.set('user', user)
      }
    } catch {
      // 忽略无效 token
    }
  }

  await next()
})
```

### 错误处理中间件

```typescript
// middleware/error.ts
import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'

export const errorHandler: ErrorHandler = (err, c) => {
  // 自定义应用错误
  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
        },
      },
      err.statusCode
    )
  }

  // HTTP 异常
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: {
          code: 'HTTP_ERROR',
          message: err.message,
        },
      },
      err.status
    )
  }

  // Zod 验证错误
  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: err.flatten().fieldErrors,
        },
      },
      400
    )
  }

  // 未知错误
  console.error('Unhandled error:', err)
  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    },
    500
  )
}
```

### 日志中间件

```typescript
// middleware/logger.ts
import { createMiddleware } from 'hono/factory'

export const loggerMiddleware = createMiddleware(async (c, next) => {
  const start = Date.now()
  const { method, path } = c.req

  await next()

  const duration = Date.now() - start
  const status = c.res.status

  const color =
    status >= 500 ? '\x1b[31m' :  // 红色
    status >= 400 ? '\x1b[33m' :  // 黄色
    status >= 300 ? '\x1b[36m' :  // 青色
    '\x1b[32m'                    // 绿色

  console.log(
    `${color}${method}\x1b[0m ${path} - ${status} - ${duration}ms`
  )
})
```

## 工具函数

### JWT 工具

```typescript
// lib/jwt.ts
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const JWT_ISSUER = 'beeve'

interface TokenPayload extends JWTPayload {
  sub: string  // userId
  type: 'access' | 'refresh'
}

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({ type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET)
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
  })
  return payload as TokenPayload
}
```

### 密码哈希

```typescript
// lib/hash.ts
import { hash, verify } from '@node-rs/argon2'

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  })
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return verify(hash, password)
}
```

### 自定义错误

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// 常用错误工厂
export const Errors = {
  notFound: (resource: string) =>
    new AppError(`${resource.toUpperCase()}_NOT_FOUND`, `${resource} not found`, 404),

  unauthorized: () =>
    new AppError('UNAUTHORIZED', 'Unauthorized', 401),

  forbidden: () =>
    new AppError('FORBIDDEN', 'Forbidden', 403),

  conflict: (message: string) =>
    new AppError('CONFLICT', message, 409),

  badRequest: (message: string) =>
    new AppError('BAD_REQUEST', message, 400),
}
```

## 服务器入口

```typescript
// index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { loggerMiddleware } from './middleware/logger'
import { errorHandler } from './middleware/error'

import auth from './routes/auth'
import users from './routes/users'
import projects from './routes/projects'
import pages from './routes/pages'

const app = new Hono()

// 全局中间件
app.use('*', secureHeaders())
app.use('*', cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}))
app.use('*', loggerMiddleware)

// 健康检查
app.get('/health', (c) => c.json({ status: 'ok' }))

// API 路由
app.route('/api/auth', auth)
app.route('/api/users', users)
app.route('/api/projects', projects)
app.route('/api/pages', pages)

// 错误处理
app.onError(errorHandler)

// 404
app.notFound((c) => {
  return c.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, 404)
})

export default {
  port: process.env.PORT || 8000,
  fetch: app.fetch,
}
```

## API 响应规范

### 成功响应

```typescript
// 单个资源
{
  "data": {
    "id": "uuid",
    "name": "...",
    ...
  }
}

// 列表
{
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}

// 操作成功（无返回数据）
{
  "data": {
    "success": true
  }
}
```

### 错误响应

```typescript
// 通用错误
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}

// 验证错误
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

## 错误码规范

| 错误码 | HTTP 状态码 | 说明 |
|--------|-------------|------|
| VALIDATION_ERROR | 400 | 参数验证失败 |
| BAD_REQUEST | 400 | 请求格式错误 |
| UNAUTHORIZED | 401 | 未认证 |
| INVALID_CREDENTIALS | 401 | 认证信息错误 |
| TOKEN_EXPIRED | 401 | Token 过期 |
| FORBIDDEN | 403 | 无权限 |
| NOT_FOUND | 404 | 资源不存在 |
| USER_NOT_FOUND | 404 | 用户不存在 |
| PROJECT_NOT_FOUND | 404 | 项目不存在 |
| CONFLICT | 409 | 资源冲突 |
| EMAIL_EXISTS | 409 | 邮箱已存在 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
