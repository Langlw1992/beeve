/**
 * @beeve/server - Elysia 认证服务入口
 *
 * 基于 Elysia.js 和 Bun 运行时的认证服务骨架。
 * 当前阶段仅包含基础配置和健康检查端点。
 */

import {cors} from '@elysiajs/cors'
import {html} from '@elysiajs/html'
import {Elysia} from 'elysia'
import {env} from './env'
import {authRoutes} from './routes/auth'
import {pageRoutes} from './routes/pages'

// ==================== 应用实例 ====================

const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  )
  .use(html())
  .use(authRoutes)
  .use(pageRoutes)
  // ==================== 健康检查端点 ====================
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  .listen(env.PORT)

console.log(
  `🦊 Elysia 服务已启动：http://${app.server?.hostname}:${app.server?.port}`,
)
