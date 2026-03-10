/**
 * Better Auth 客户端配置
 */
import {createAuthClient} from 'better-auth/solid'

export const authClient = createAuthClient({
  // 空字符串让请求使用相对路径，走 Vite proxy 转发到 localhost:3000
  baseURL: import.meta.env.VITE_API_URL || '',
  fetchOptions: {
    credentials: 'include', // 确保携带 cookie
  },
})

export type AuthClient = typeof authClient
