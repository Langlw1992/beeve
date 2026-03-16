import { redirect } from '@tanstack/solid-router'
import { authClient } from './auth-client'

/**
 * 路由守卫 - 要求已登录
 * 未登录用户将被重定向到 /login
 */
export async function requireAuth() {
  const { data: session } = await authClient.getSession()

  if (!session?.user) {
    throw redirect({ to: '/login' })
  }

  return { user: session.user }
}

/**
 * 路由守卫 - 要求未登录（游客）
 * 已登录用户将被重定向到 /dashboard
 */
export async function requireGuest() {
  const { data: session } = await authClient.getSession()

  if (session?.user) {
    throw redirect({ to: '/dashboard' })
  }
}
