/**
 * Better Auth Solid 客户端配置
 * 使用 better-auth/solid 获取官方提供的响应式 hooks
 */
import { createAuthClient } from 'better-auth/solid'
import { inferAdditionalFields } from 'better-auth/client/plugins'

/**
 * Better Auth 客户端实例
 * 使用 better-auth/solid 导出，自带 useSession() 等响应式 hooks
 * baseURL 留空使用相对路径，通过 Vite proxy 转发到后端
 */
export const authClient = createAuthClient({
  baseURL: '', // 使用相对路径，Vite proxy 处理 /api 请求
  fetchOptions: {
    credentials: 'include', // 跨域请求携带 cookie
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

// 导出类型
type AuthClient = typeof authClient
type SessionData = typeof authClient.$Infer.Session
type AuthUser = SessionData['user']
type AuthSession = SessionData['session']

export type { AuthClient, AuthSession, AuthUser, SessionData }
