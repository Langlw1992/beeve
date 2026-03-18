import {isAdminRole, normalizeUserRole} from '@/lib/auth/policy'
import type {
  AppUserDto,
  ThemeMode,
  UserPreferencesDto,
  UserSessionDto,
} from './contracts'

type SessionLike = {
  id: string
  token: string
  createdAt: Date | string
  expiresAt: Date | string
  ipAddress?: string | null
  userAgent?: string | null
}

type UserLike = {
  id: string
  name?: string | null
  email: string
  emailVerified: boolean
  image?: string | null
  role?: string | null
  banned?: boolean | null
  banReason?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export function normalizeThemeMode(value?: string | null): ThemeMode {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value
  }

  return 'system'
}

export function serializePreferences(themeMode?: string | null): UserPreferencesDto {
  return {
    themeMode: normalizeThemeMode(themeMode),
  }
}

export function serializeUser(user: UserLike): AppUserDto {
  return {
    id: user.id,
    name: user.name?.trim() || 'Unnamed user',
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ?? null,
    role: normalizeUserRole(user.role),
    banned: Boolean(user.banned),
    banReason: user.banReason ?? null,
    createdAt: new Date(user.createdAt).toISOString(),
    updatedAt: new Date(user.updatedAt).toISOString(),
  }
}

export function serializeSession(
  session: SessionLike,
  currentToken?: string | null,
): UserSessionDto {
  return {
    id: session.id,
    token: session.token,
    createdAt: new Date(session.createdAt).toISOString(),
    expiresAt: new Date(session.expiresAt).toISOString(),
    ipAddress: session.ipAddress ?? null,
    userAgent: session.userAgent ?? null,
    current: session.token === currentToken,
  }
}

export function countAdminUsers(users: Array<{role?: string | null}>): number {
  return users.filter((user) => isAdminRole(user.role)).length
}
