import { redirect } from '@tanstack/solid-router'
import { getSession } from './auth/functions'

/**
 * 路由守卫 - 要求已登录
 * 未登录用户将被重定向到 /login
 */
export async function requireAuth() {
  const session = await getSession()

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
  const session = await getSession()

  if (session?.user) {
    throw redirect({ to: '/dashboard' })
  }
}

/**
 * 路由守卫 - 要求管理员权限
 * 非管理员用户将被重定向到 /dashboard
 */
export async function requireAdmin() {
  const session = await getSession()

  if (!session?.user) {
    throw redirect({ to: '/login' })
  }

  if (session.user.role !== 'admin') {
    throw redirect({ to: '/dashboard' })
  }

  return { user: session.user }
}
