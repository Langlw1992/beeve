/**
 * 测试环境配置
 * 设置测试环境变量和全局 mock
 */

// 设置测试环境变量
process.env.NODE_ENV = 'test'
process.env.PORT = '3001'
process.env.CORS_ORIGIN = '*'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-testing-only-32chars'
process.env.BETTER_AUTH_URL = 'http://localhost:3001'

// Mock Better Auth
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.png',
  },
  session: {
    id: 'test-session-id',
    userId: 'test-user-id',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
}

// 创建 mock auth 对象
const mockAuth = {
  api: {
    getSession: async ({headers}: {headers: Headers}) => {
      const authHeader = headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        if (token === 'valid-token') {
          return mockSession
        }
      }
      return null
    },
  },
  handler: {
    fetch: async (request: Request) => {
      const url = new URL(request.url)

      // 模拟 /api/auth/session 端点
      if (url.pathname === '/api/auth/session') {
        const authHeader = request.headers.get('authorization')
        if (authHeader?.startsWith('Bearer ')) {
          return new Response(JSON.stringify(mockSession), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          })
        }
        return new Response(JSON.stringify({error: 'Unauthorized'}), {
          status: 401,
          headers: {'Content-Type': 'application/json'},
        })
      }

      return new Response(JSON.stringify({error: 'Not Found'}), {
        status: 404,
        headers: {'Content-Type': 'application/json'},
      })
    },
  },
}

// 导出 mock 供测试使用
export {mockAuth, mockSession}
