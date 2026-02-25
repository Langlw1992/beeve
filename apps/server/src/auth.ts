/**
 * @beeve/server - Better Auth 认证实例
 *
 * 使用 Better Auth + Drizzle ORM 适配器配置认证服务。
 * 启用邮箱密码认证 + OIDC Provider 插件，使认证服务成为 OIDC 身份提供者。
 */

import {betterAuth} from 'better-auth'
import {drizzleAdapter} from 'better-auth/adapters/drizzle'
import {oidcProvider} from 'better-auth/plugins'
import {getDb} from '@beeve/db'
import * as schema from '@beeve/db/schema'
import {env} from './env'

// ==================== Better Auth 实例 ====================

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
    schema,
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    oidcProvider({
      loginPage: '/sign-in',
    }),
  ],
})
