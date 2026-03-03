/**
 * Better Auth 客户端配置
 * 连接到后端认证服务
 */
import {createAuthClient} from 'better-auth/solid'
import {oauthProviderClient} from '@better-auth/oauth-provider/client'

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [oauthProviderClient()],
})
