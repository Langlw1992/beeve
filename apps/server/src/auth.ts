import {betterAuth} from 'better-auth'
import {drizzleAdapter} from 'better-auth/adapters/drizzle'
import {bearer} from 'better-auth/plugins'
import {db} from './config/db'
import {env} from './config/env'

/**
 * 构建社交登录配置
 * 仅在环境变量存在时启用对应 provider
 */
function buildSocialProviders() {
  const providers: Record<string, {clientId: string; clientSecret: string}> = {}

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }
  }

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    providers.github = {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }
  }

  return providers
}

/**
 * Better Auth 配置
 * 支持社交登录 (Google/GitHub) 和 Bearer Token (iOS)
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {provider: 'pg'}),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  trustedOrigins: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  plugins: [bearer()], // Bearer Token 支持 iOS
  socialProviders: buildSocialProviders(),
  advanced: {
    // 开发环境允许跨域 cookie
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: false, // 开发环境不需要 https
      httpOnly: true,
    },
  },
})

// 导出类型供其他模块使用
export type Auth = typeof auth
