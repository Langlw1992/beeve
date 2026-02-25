/**
 * @beeve/server - Better Auth 认证实例
 *
 * 使用 Better Auth + Drizzle ORM 适配器配置认证服务。
 * 当前启用邮箱密码认证，后续可通过插件扩展社交登录等功能。
 */

import {betterAuth} from 'better-auth'
import {drizzleAdapter} from 'better-auth/adapters/drizzle'
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
})
