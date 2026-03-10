import {authClient} from '~/lib/auth'

/**
 * 认证状态Hook
 * 封装Better Auth的useSession
 */
export function useAuth() {
  // @ts-ignore - better-auth types are complex
  const session = authClient.useSession()

  return {
    // @ts-ignore
    user: () => session()?.data?.user ?? null,
    // @ts-ignore
    isLoading: () => session()?.isPending ?? false,
    // @ts-ignore
    isAuthenticated: () => !!session()?.data?.user,
    signOut: async () => {
      await authClient.signOut()
      window.location.href = '/login'
    },
  }
}
