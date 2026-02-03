import {createAuthClient} from 'better-auth/client'

/**
 * 创建认证客户端
 * @param baseURL API 服务器地址
 */
export function createClient(baseURL: string) {
  return createAuthClient({
    baseURL,
  })
}

/**
 * 默认客户端实例
 * 在浏览器环境中使用，baseURL 从环境变量获取
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? (import.meta as {env?: {VITE_API_URL?: string}}).env?.VITE_API_URL ||
        'http://localhost:3001'
      : 'http://localhost:3001',
})

// 导出常用方法
export const {signIn, signUp, signOut, getSession, useSession} = authClient

// 导出类型
export type AuthClient = typeof authClient
export type Session = Awaited<ReturnType<typeof authClient.getSession>>
