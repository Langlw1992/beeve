import {describe, expect, test} from 'bun:test'
import {mockAuth, mockSession} from './setup'

/**
 * Better Auth 路由测试
 * 测试认证相关端点是否可访问
 */
describe('Auth Routes', () => {
  describe('Session Endpoint', () => {
    test('/api/auth/session 端点应该存在', async () => {
      const request = new Request('http://localhost/api/auth/session')
      const response = await mockAuth.handler.fetch(request)

      // 端点存在，即使没有认证也应该返回响应（可能是 401）
      expect(response).toBeDefined()
      expect(response.status).toBeDefined()
    })

    test('未认证时访问 session 端点应该返回 401', async () => {
      const request = new Request('http://localhost/api/auth/session')
      const response = await mockAuth.handler.fetch(request)

      expect(response.status).toBe(401)

      const body = await response.json()
      expect(body.error).toBeDefined()
    })

    test('使用有效 token 访问 session 端点应该返回用户信息', async () => {
      const request = new Request('http://localhost/api/auth/session', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      })
      const response = await mockAuth.handler.fetch(request)

      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body.user).toBeDefined()
      expect(body.session).toBeDefined()
    })

    test('返回的 session 应该包含用户和会话信息', async () => {
      const request = new Request('http://localhost/api/auth/session', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      })
      const response = await mockAuth.handler.fetch(request)

      const body = await response.json()

      // 验证用户字段
      expect(body.user.id).toBe(mockSession.user.id)
      expect(body.user.email).toBe(mockSession.user.email)
      expect(body.user.name).toBe(mockSession.user.name)

      // 验证会话字段
      expect(body.session.id).toBe(mockSession.session.id)
      expect(body.session.userId).toBe(mockSession.session.userId)
      expect(body.session.expiresAt).toBeDefined()
    })

    test('返回的 Content-Type 应该是 application/json', async () => {
      const request = new Request('http://localhost/api/auth/session', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      })
      const response = await mockAuth.handler.fetch(request)

      const contentType = response.headers.get('content-type')
      expect(contentType).toContain('application/json')
    })
  })

  describe('Auth Handler', () => {
    test('auth.handler 应该定义了 fetch 方法', () => {
      expect(mockAuth.handler).toBeDefined()
      expect(typeof mockAuth.handler.fetch).toBe('function')
    })

    test('auth.api.getSession 应该定义', () => {
      expect(mockAuth.api).toBeDefined()
      expect(typeof mockAuth.api.getSession).toBe('function')
    })

    test('getSession 在没有认证头时应该返回 null', async () => {
      const headers = new Headers()
      const session = await mockAuth.api.getSession({headers})

      expect(session).toBeNull()
    })

    test('getSession 在有效 token 时应该返回 session', async () => {
      const headers = new Headers({
        Authorization: 'Bearer valid-token',
      })
      const session = await mockAuth.api.getSession({headers})

      expect(session).toEqual(mockSession)
    })

    test('getSession 在无效 token 时应该返回 null', async () => {
      const headers = new Headers({
        Authorization: 'Bearer invalid-token',
      })
      const session = await mockAuth.api.getSession({headers})

      expect(session).toBeNull()
    })
  })

  describe('错误处理', () => {
    test('访问不存在的 auth 端点应该返回 404', async () => {
      const request = new Request('http://localhost/api/auth/nonexistent')
      const response = await mockAuth.handler.fetch(request)

      expect(response.status).toBe(404)
    })

    test('使用错误的 HTTP 方法应该返回适当的错误', async () => {
      const request = new Request('http://localhost/api/auth/session', {
        method: 'POST',
      })
      const response = await mockAuth.handler.fetch(request)

      // mock 可能返回 404 或其他状态码
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })
})
