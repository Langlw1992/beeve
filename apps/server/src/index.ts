import {cors} from '@elysiajs/cors'
import {Elysia} from 'elysia'
import {auth} from './auth'
import {env} from './config/env'
import {errorHandler} from './middleware/error-handler'
import {meRoutes} from './routes/me'
import {adminRoutes} from './routes/admin'

/**
 * Better Auth 请求处理器
 * 验证请求方法并转发到 auth.handler
 */
const betterAuthView = ({request}: {request: Request}) => {
  const BETTER_AUTH_ACCEPT_METHODS = ['POST', 'GET']
  if (BETTER_AUTH_ACCEPT_METHODS.includes(request.method)) {
    return auth.handler(request)
  }
  return new Response('Method Not Allowed', {status: 405})
}

/**
 * Elysia 应用入口
 */
const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      // 明确指定允许的请求头，避免返回 "undefined"
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  )
  .onError(errorHandler)
  // Better Auth 挂载到 /api/auth/* 路径
  .all('/api/auth/*', betterAuthView)
  // 自定义 API 路由
  .use(meRoutes)
  .use(adminRoutes)
  // API 根路径信息
  .get('/api', () => ({
    name: 'Beeve API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      me: '/api/me',
      admin: '/api/admin/*',
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

// 注意：Elysia 的 mount() 会拦截所有请求，404 处理需要在 mount 之前
// 但由于 better-auth 需要挂载到 /api/auth，我们在 errorHandler 中处理 404

console.log(`🦊 Server running at ${app.server?.hostname}:${app.server?.port}`)

export type App = typeof app
