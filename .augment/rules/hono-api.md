---
type: auto
description: Hono API development patterns for backend routes
---

# Hono API 开发模式

## 路由模板

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@beeve/db'
import { users } from '@beeve/db/schema'

const app = new Hono()

// 总是用 Zod 验证输入
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
})

app.post(
  '/',
  zValidator('json', createUserSchema),
  async (c) => {
    const body = c.req.valid('json')
    
    const [user] = await db
      .insert(users)
      .values(body)
      .returning()

    return c.json({ data: user }, 201)
  }
)

export default app
```

## 响应格式

### 成功响应

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

### 错误响应

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { "email": ["Required"] }
  }
}
```

## 关键要点

- ✅ 所有输入必须 Zod 验证
- ✅ 使用 `c.req.valid()` 获取验证后的数据
- ✅ 返回适当的 HTTP 状态码
- ✅ 统一响应格式
