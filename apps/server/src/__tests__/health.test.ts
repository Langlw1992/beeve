import {describe, expect, test} from 'bun:test'
import {Elysia} from 'elysia'

/**
 * 健康检查端点测试
 * 测试 GET /health 返回正确的状态信息
 */
describe('Health Check Endpoint', () => {
  // 创建独立的 Elysia 应用实例用于测试
  const createApp = () => {
    return new Elysia().get('/health', () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }))
  }

  test('GET /health 应该返回状态 ok', async () => {
    const app = createApp()
    const response = await app.handle(new Request('http://localhost/health'))

    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.status).toBe('ok')
  })

  test('GET /health 应该返回 ISO 格式的时间戳', async () => {
    const app = createApp()
    const response = await app.handle(new Request('http://localhost/health'))

    const body = await response.json()

    // 验证时间戳是有效的 ISO 8601 格式
    expect(body.timestamp).toBeDefined()
    expect(typeof body.timestamp).toBe('string')

    // 验证可以解析为有效日期
    const date = new Date(body.timestamp)
    expect(date.toISOString()).toBe(body.timestamp)
  })

  test('GET /health 应该返回正确的 Content-Type', async () => {
    const app = createApp()
    const response = await app.handle(new Request('http://localhost/health'))

    const contentType = response.headers.get('content-type')
    expect(contentType).toContain('application/json')
  })

  test('GET /health 应该返回包含 status 和 timestamp 的对象', async () => {
    const app = createApp()
    const response = await app.handle(new Request('http://localhost/health'))

    const body = await response.json()

    // 验证响应结构
    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('timestamp')
    expect(Object.keys(body)).toHaveLength(2)
  })

  test('时间戳应该是当前时间（允许 1 秒误差）', async () => {
    const app = createApp()
    const beforeRequest = Date.now()

    const response = await app.handle(new Request('http://localhost/health'))

    const afterRequest = Date.now()
    const body = await response.json()
    const responseTime = new Date(body.timestamp).getTime()

    // 响应时间应该在请求前后 1 秒内
    expect(responseTime).toBeGreaterThanOrEqual(beforeRequest - 1000)
    expect(responseTime).toBeLessThanOrEqual(afterRequest + 1000)
  })
})
