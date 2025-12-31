import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import authRoutes from './routes/auth'

const app = new Hono()

// 中间件
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
)

// 健康检查
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 认证路由
app.route('/api/auth', authRoutes)

// API 路由占位
app.get('/api', (c) => {
  return c.json({ message: 'Beeve API v1' })
})

export default app
export type AppType = typeof app
