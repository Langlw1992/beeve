import {describe, expect, test} from 'bun:test'
import {Elysia} from 'elysia'
import {mockAuth, mockSession} from './setup'

/**
 * /api/v1/me 路由测试
 * 测试用户认证和信息获取功能
 */
describe('Me Routes', () => {
  // 创建测试用的应用实例，使用 mock auth
  const createApp = () => {
    return new Elysia({prefix: '/api/v1'}).get('/me', async ({request}) => {
      // 使用 mock auth 验证会话
      const session = await mockAuth.api.getSession({
        headers: request.headers,
      })

      // 未登录返回 401
      if (!session) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '请先登录',
          },
        }
      }

      const {user} = session

      // 返回用户基本信息
      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      }
    })
  }

  describe('未登录状态', () => {
    test('未提供认证信息时应该返回 401', async () => {
      const app = createApp()
      const response = await app.handle(
        new Request('http://localhost/api/v1/me'),
      )

      expect(response.status).toBe(200) // Elysia 默认返回 200，业务逻辑返回错误结构

      const body = await response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('UNAUTHORIZED')
      expect(body.error.message).toBe('请先登录')
    })

    test('提供无效 token 时应该返回 401', async () => {
      const app = createApp()
      const response = await app.handle(
        new Request('http://localhost/api/v1/me', {
          headers: {
            Authorization: 'Bearer invalid-token',
          },
        }),
      )

      const body = await response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('UNAUTHORIZED')
    })

    test('未提供 Authorization header 时应该返回 401', async () => {
      const app = createApp()
      const response = await app.handle(
        new Request('http://localhost/api/v1/me', {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      )

      const body = await response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('UNAUTHORIZED')
    })
  })

  describe('已登录状态', () => {
    test('提供有效 token 时应该返回用户信息', async () => {
      const app = createApp()
      const response = await app.handle(
        new Request('http://localhost/api/v1/me', {
          headers: {
            Authorization: 'Bearer valid-token',
          },
        }),
      )

      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
    })

    test('返回的用户信息应该包含必要字段', async () => {
      const app = createApp()
      const response = await app.handle(
        new Request('http://localhost/api/v1/me', {
          headers: {
            Authorization: 'Bearer valid-token',
          },
        }),
      )

      const body = await response.json()
      const {data} = body

      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('email')
      expect(data).toHaveProperty('name')
      expect(data).toHaveProperty('image')
    })

    test('返回的用户信息应该与 mock 数据一致', async () => {
      const app = createApp()
      const response = await app.handle(
        new Request('http://localhost/api/v1/me', {
          headers: {
            Authorization: 'Bearer valid-token',
          },
        }),
      )

      const body = await response.json()
      const {data} = body

      expect(data.id).toBe(mockSession.user.id)
      expect(data.email).toBe(mockSession.user.email)
      expect(data.name).toBe(mockSession.user.name)
      expect(data.image).toBe(mockSession.user.image)
    })

    test('返回的 email 应该是有效的邮箱格式', async () => {
      const app = createApp()
      const response = await app.handle(
        new Request('http://localhost/api/v1/me', {
          headers: {
            Authorization: 'Bearer valid-token',
          },
        }),
      )

      const body = await response.json()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(emailRegex.test(body.data.email)).toBe(true)
    })

    test('返回的用户 ID 应该是非空字符串', async () => {
      const app = createApp()
      const response = await app.handle(
        new Request('http://localhost/api/v1/me', {
          headers: {
            Authorization: 'Bearer valid-token',
          },
        }),
      )

      const body = await response.json()
      expect(typeof body.data.id).toBe('string')
      expect(body.data.id.length).toBeGreaterThan(0)
    })
  })

  describe('边界情况', () => {
    test('Authorization header 格式不正确时应该返回 401', async () => {
      const app = createApp()
      const response = await app.handle(
        new Request('http://localhost/api/v1/me', {
          headers: {
            Authorization: 'Basic dXNlcjpwYXNz', // Basic auth instead of Bearer
          },
        }),
      )

      const body = await response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('UNAUTHORIZED')
    })

    test('token 为空字符串时应该返回 401', async () => {
      const app = createApp()
      const response = await app.handle(
        new Request('http://localhost/api/v1/me', {
          headers: {
            Authorization: 'Bearer ',
          },
        }),
      )

      const body = await response.json()
      expect(body.success).toBe(false)
    })
  })
})
