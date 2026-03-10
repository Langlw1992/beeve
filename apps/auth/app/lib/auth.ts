import {createAuthClient} from 'better-auth/client'

/**
 * Better Auth 客户端
 * 用于浏览器端的认证操作
 */
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000',
})

// 导出常用方法
export const {signIn, signOut, signUp, useSession, getSession} = authClient

// 导出类型
export type Session = Awaited<ReturnType<typeof authClient.getSession>>['data']
export type User = NonNullable<Session>['user']
