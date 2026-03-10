import type {Session, User} from '@beeve/contracts'
/**
 * Better Auth 客户端封装
 * 基于 better-auth/client 创建
 */
import {createAuthClient} from 'better-auth/client'

// 从环境变量获取 API 基础 URL
const API_BASE_URL =
  typeof process !== 'undefined' && process.env?.BEEVE_API_URL
    ? process.env.BEEVE_API_URL
    : typeof import.meta !== 'undefined'
      ? // @ts-expect-error import.meta.env is defined by bundlers
        import.meta.env?.VITE_API_URL
      : 'http://localhost:3000'

/**
 * Better Auth 客户端实例
 * 支持 bearer token（用于 iOS 等移动端）
 */
export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  fetchOptions: {
    credentials: 'include', // 确保跨域请求携带 cookie
  },
  plugins: [],
})

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
  return authClient.signIn.social({
    provider,
    callbackURL: options?.callbackURL ?? `${window.location.origin}/dashboard`,
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
  user: User | null
  session: Session | null
}

export {API_BASE_URL}
export type {AuthClient}
