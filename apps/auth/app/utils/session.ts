import {createSignal, createResource} from 'solid-js'

export interface User {
  id: string
  email: string
  name: string
  image?: string
  permissions: string[]
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * 客户端获取当前用户session
 */
async function fetchSession(): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/session`, {
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (!data?.user) {
      return null
    }

    // 获取用户权限 - 调用 /api/v1/me 获取完整用户信息
    const meResponse = await fetch(`${API_URL}/api/v1/me`, {
      credentials: 'include',
    })

    let permissions = ['profile:read', 'profile:write']
    if (meResponse.ok) {
      const meData = await meResponse.json()
      if (meData.success && meData.data?.permissions) {
        permissions = meData.data.permissions
      }
    }

    return {
      ...data.user,
      permissions,
    }
  } catch (error) {
    console.error('Failed to fetch user session:', error)
    return null
  }
}

// 创建全局的用户信号
const [user, setUser] = createSignal<User | null>(null)
const [isLoading, setIsLoading] = createSignal(true)

/**
 * 初始化用户session
 */
export async function initUser() {
  setIsLoading(true)
  const userData = await fetchSession()
  setUser(userData)
  setIsLoading(false)
  return userData
}

/**
 * 获取当前用户
 */
export function getUser() {
  return user()
}

/**
 * 获取加载状态
 */
export function getIsLoading() {
  return isLoading()
}

/**
 * 设置用户
 */
export function setCurrentUser(userData: User | null) {
  setUser(userData)
}

/**
 * 清除用户（登出）
 */
export function clearUser() {
  setUser(null)
}

/**
 * 检查用户是否有指定权限
 */
export function hasPermission(permission: string): boolean {
  const u = user()
  if (!u) return false
  return (
    u.permissions.includes(permission) || u.permissions.includes('admin:all')
  )
}

/**
 * 检查用户是否有任意指定权限
 */
export function hasAnyPermission(permissions: string[]): boolean {
  const u = user()
  if (!u) return false
  return (
    permissions.some((p) => u.permissions.includes(p)) ||
    u.permissions.includes('admin:all')
  )
}

/**
 * 检查用户是否已登录
 */
export function isAuthenticated(): boolean {
  return user() !== null
}

// 用于路由 beforeLoad 的函数
export async function fetchUser() {
  return fetchSession()
}
