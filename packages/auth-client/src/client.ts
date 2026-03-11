/**
 * Better Auth 客户端封装
 * 基于 better-auth/client 创建
 */
import {createAuthClient} from 'better-auth/client'
import {inferAdditionalFields} from 'better-auth/client/plugins'

// 从环境变量获取 API 基础 URL
// SSR 服务端：优先使用 BEEVE_API_URL；Vite 客户端：使用 VITE_API_URL
// 注意：Vite proxy 只对客户端请求生效，SSR 服务端必须有明确的后端地址
function resolveApiBaseUrl(): string {
  // Node.js / SSR 环境
  if (typeof process !== 'undefined' && process.env?.BEEVE_API_URL) {
    return process.env.BEEVE_API_URL
  }
  // Vite 客户端环境（import.meta.env 由打包工具注入，类型由 env.d.ts 声明）
  try {
    const env = import.meta.env
    if (env?.VITE_API_URL) {
      return env.VITE_API_URL
    }
  } catch {
    // import.meta 不可用时忽略
  }
  return 'http://localhost:3000'
}

const API_BASE_URL = resolveApiBaseUrl()

/**
 * Better Auth 客户端实例
 * 支持 bearer token（用于 iOS 等移动端）
 * 通过 inferAdditionalFields 声明服务端自定义字段，保证类型安全
 */
export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  fetchOptions: {
    credentials: 'include', // 确保跨域请求携带 cookie
  },
  plugins: [
    inferAdditionalFields({
      user: {
        userType: {
          type: ['regular', 'admin'],
          required: true,
          defaultValue: 'regular',
        },
        status: {
          type: ['active', 'disabled'],
          required: true,
          defaultValue: 'active',
        },
      },
    }),
  ],
})

/**
 * 从 authClient 推导出的会话数据类型
 * 包含 user（含自定义字段 userType/status）和 session
 */
type SessionData = typeof authClient.$Infer.Session
type AuthUser = SessionData['user']
type AuthSessionObj = SessionData['session']

/**
 * 获取当前会话（用于服务端/服务端组件）
 */
export async function getSession(_token?: string) {
  return authClient.getSession()
}

/**
 * 社交登录
 */
export async function signInWithSocial(
  provider: 'google' | 'github',
  options?: {callbackURL?: string},
) {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : API_BASE_URL
  return authClient.signIn.social({
    provider,
    callbackURL: options?.callbackURL ?? `${origin}/dashboard`,
  })
}

/**
 * 邮箱密码登录
 */
export async function signInWithEmail(email: string, password: string) {
  return authClient.signIn.email({
    email,
    password,
  })
}

/**
 * 注册
 */
export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
) {
  return authClient.signUp.email({
    name,
    email,
    password,
  })
}

/**
 * 登出
 */
export async function signOut() {
  return authClient.signOut()
}

// 导出类型
type AuthClient = typeof authClient

export interface AuthState {
  user: AuthUser | null
  session: AuthSessionObj | null
}

export {API_BASE_URL}
export type {AuthClient, AuthSessionObj, AuthUser, SessionData}
