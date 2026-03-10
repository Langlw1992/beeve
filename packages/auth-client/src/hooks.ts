import type {Session, User} from '@beeve/contracts'
/**
 * 认证相关 Hooks
 * 用于 SolidJS 组件中获取认证状态
 */
import {createSignal} from 'solid-js'
import {authClient} from './client.js'

/**
 * 会话状态 store
 * 全局共享的认证状态
 */
interface SessionStore {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: Error | null
}

const [sessionStore, setSessionStore] = createSignal<SessionStore>({
  user: null,
  session: null,
  isLoading: true,
  error: null,
})

/**
 * 初始化会话
 * 在应用启动时调用
 */
export async function initSession() {
  setSessionStore((prev: SessionStore) => ({
    ...prev,
    isLoading: true,
    error: null,
  }))

  try {
    const result = await authClient.getSession()

    if (result.data) {
      setSessionStore({
        user: result.data.user as User,
        session: result.data.session as unknown as Session,
        isLoading: false,
        error: null,
      })
    } else {
      setSessionStore({
        user: null,
        session: null,
        isLoading: false,
        error: null,
      })
    }
  } catch (error) {
    setSessionStore({
      user: null,
      session: null,
      isLoading: false,
      error:
        error instanceof Error ? error : new Error('Failed to get session'),
    })
  }
}

/**
 * 刷新会话
 */
export async function refreshSession() {
  return initSession()
}

/**
 * useSession Hook
 * 获取当前会话状态
 *
 * 使用示例:
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoading } = useSession()
 *   return <div>{isLoading() ? 'Loading...' : user()?.name}</div>
 * }
 * ```
 */
export function useSession() {
  return {
    user: () => sessionStore().user,
    session: () => sessionStore().session,
    isLoading: () => sessionStore().isLoading,
    error: () => sessionStore().error,
    isAuthenticated: () => !!sessionStore().user,
  }
}

/**
 * useUser Hook
 * 获取当前用户信息（简化版）
 *
 * 使用示例:
 * ```tsx
 * function UserName() {
 *   const user = useUser()
 *   return <span>{user()?.name ?? 'Guest'}</span>
 * }
 * ```
 */
export function useUser() {
  return () => sessionStore().user
}

/**
 * useSignIn Hook
 * 登录功能封装
 */
export function useSignIn() {
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal<Error | null>(null)

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.signIn.email({email, password})

      if (result.error) {
        throw new Error(result.error.message || 'Login failed')
      }

      await refreshSession()
      return result.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Login failed')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {signIn, isLoading, error}
}

/**
 * useSignUp Hook
 * 注册功能封装
 */
export function useSignUp() {
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal<Error | null>(null)

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.signUp.email({name, email, password})

      if (result.error) {
        throw new Error(result.error.message || 'Signup failed')
      }

      await refreshSession()
      return result.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Signup failed')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {signUp, isLoading, error}
}

/**
 * useSignOut Hook
 * 登出功能封装
 */
export function useSignOut() {
  const [isLoading, setIsLoading] = createSignal(false)

  const signOut = async (options?: {redirectTo?: string}) => {
    setIsLoading(true)

    try {
      await authClient.signOut()
      setSessionStore({
        user: null,
        session: null,
        isLoading: false,
        error: null,
      })

      if (options?.redirectTo) {
        window.location.href = options.redirectTo
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {signOut, isLoading}
}

/**
 * useSocialSignIn Hook
 * 社交登录功能封装
 */
export function useSocialSignIn() {
  const [isLoading, setIsLoading] = createSignal(false)

  const signInWithGoogle = async (callbackURL?: string) => {
    setIsLoading(true)
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: callbackURL ?? `${window.location.origin}/dashboard`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGithub = async (callbackURL?: string) => {
    setIsLoading(true)
    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: callbackURL ?? `${window.location.origin}/dashboard`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    signInWithGoogle,
    signInWithGithub,
    isLoading,
  }
}

// 导出 store 供高级使用
export {sessionStore, setSessionStore}
