/**
 * @beeve/server - Better Auth 认证实例
 *
 * 使用 Better Auth + Drizzle ORM 适配器配置认证服务。
 * 启用 OAuth 2.1 Provider 插件 + JWT 插件 + 社交登录（Google、GitHub）。
 */

import {oauthProvider} from '@better-auth/oauth-provider'
import {getDb} from '@beeve/db'
import * as schema from '@beeve/db/schema'
import {betterAuth} from 'better-auth'
import {drizzleAdapter} from 'better-auth/adapters/drizzle'
import {admin, jwt} from 'better-auth/plugins'
import {env} from './env'

// ==================== Better Auth 实例 ====================

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
    schema,
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.CORS_ORIGIN, env.AUTH_APP_URL],
  disabledPaths: ['/token'],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [
    admin(),
    jwt(),
    oauthProvider({
      loginPage: '/sign-in',
      consentPage: '/consent',
    }),
  ],
})
