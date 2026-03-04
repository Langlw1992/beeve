/**
 * @beeve/server - Elysia 认证服务入口
 *
 * 基于 Elysia.js 和 Bun 运行时的纯 API + OAuth 2.1 Provider 服务。
 */

import {oauthProviderAuthServerMetadata, oauthProviderOpenIdConfigMetadata,} from '@better-auth/oauth-provider'
import {cors} from '@elysiajs/cors'
import {Elysia} from 'elysia'
import {auth} from './auth'
import {env} from './env'
import {authRoutes} from './routes/auth'

// ==================== Well-Known 元数据处理器 ====================

const openIdConfigHandler = oauthProviderOpenIdConfigMetadata(auth)
const authServerHandler = oauthProviderAuthServerMetadata(auth)

// ==================== 应用实例 ====================

const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  )
  .use(authRoutes)
  // ==================== Well-Known 端点 ====================
  .get('/.well-known/openid-configuration', async ({request}) => {
    return await openIdConfigHandler(request)
  })
  .get('/.well-known/oauth-authorization-server', async ({request}) => {
    return await authServerHandler(request)
  })
  // ==================== 健康检查端点 ====================
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  .listen(env.PORT)

console.log(
  `🦊 Elysia 服务已启动：http://${app.server?.hostname}:${app.server?.port}`,
)
