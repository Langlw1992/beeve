import {cors} from '@elysiajs/cors'
import {Elysia} from 'elysia'
import {auth} from './auth'
import {env} from './config/env'
import {errorHandler} from './middleware/error-handler'
import {adminRoutes} from './routes/admin'
import {aiRoutes} from './routes/ai'
import {meRoutes} from './routes/me'
import {reminderRoutes} from './routes/reminders'
import {taskRoutes} from './routes/tasks'
import {todayRoutes} from './routes/today'

// 允许的 CORS 源列表
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim())

/**
 * Better Auth 请求处理器
 * 将请求转发到 auth.handler，并添加 CORS 头
 */
const betterAuthView = async ({request}: {request: Request}) => {
  const response = await auth.handler(request)

  // 添加 CORS 头到响应
  const origin = request.headers.get('origin')
  const corsHeaders = new Headers(response.headers)

  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders.set('Access-Control-Allow-Origin', origin)
  } else {
    corsHeaders.set('Access-Control-Allow-Origin', allowedOrigins[0])
  }
  corsHeaders.set('Access-Control-Allow-Credentials', 'true')
  corsHeaders.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  )
  corsHeaders.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With',
  )

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: corsHeaders,
  })
}

/**
 * Elysia 应用入口
 */
const app = new Elysia()
  .use(
    cors({
      origin: (request) => {
        const origin = request.headers.get('origin')
        if (origin && allowedOrigins.includes(origin)) {
          return origin
        }
        return allowedOrigins[0]
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  )
  .onError(errorHandler)
  // Better Auth 端点 - 使用 .all() 配合自定义 handler 以正确处理 CORS
  .all('/api/auth/*', betterAuthView)
  // 自定义 API 路由
  .use(meRoutes)
  .use(adminRoutes)
  .use(taskRoutes)
  .use(reminderRoutes)
  .use(todayRoutes)
  .use(aiRoutes)
  // API 根路径信息
  .get('/api', () => ({
    name: 'Beeve API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      me: '/api/me',
      admin: '/api/admin/*',
      tasks: '/api/v1/tasks',
      reminders: '/api/v1/reminders',
      today: '/api/v1/today',
      ai: '/api/v1/ai/*',
      health: '/health',
    },
  }))
  // 根路径返回 API 信息
  .get('/', () => ({
    name: 'Beeve API',
    version: '1.0.0',
    docs: '/api',
  }))
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  .listen(env.PORT || 3000)

console.log(`🦊 Server running at ${app.server?.hostname}:${app.server?.port}`)

export type App = typeof app
