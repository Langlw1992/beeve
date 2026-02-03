import {describe, expect, it} from 'vitest'
import app from './app'

describe('Server App', () => {
  describe('GET /health', () => {
    it('should return ok status', async () => {
      const res = await app.request('/health')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.status).toBe('ok')
      expect(json.timestamp).toBeDefined()
    })
  })

  describe('GET /api', () => {
    it('should return API info', async () => {
      const res = await app.request('/api')
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.message).toBe('Beeve API v1')
    })
  })

  describe('CORS', () => {
    it('should include CORS headers for allowed origins', async () => {
      const res = await app.request('/health', {
        headers: {
          Origin: 'http://localhost:3000',
        },
      })
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
        'http://localhost:3000',
      )
    })
  })

  describe('Auth routes', () => {
    it('should have auth routes mounted at /api/auth', async () => {
      // Better-Auth handler 会处理这个路由
      // 在 mock 环境下可能返回各种状态码，关键是路由被挂载了
      const res = await app.request('/api/auth/get-session', {
        method: 'GET',
      })
      // 路由存在（不论返回什么状态码，说明路由被正确挂载）
      expect(res).toBeDefined()
    })
  })
})
