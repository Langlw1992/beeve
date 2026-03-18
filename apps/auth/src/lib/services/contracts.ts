import type {AppRole} from '@/lib/auth/policy'

export const THEME_MODES = ['light', 'dark', 'system'] as const

export type ThemeMode = (typeof THEME_MODES)[number]

export interface UserPreferencesDto {
  themeMode: ThemeMode
}

export interface AppUserDto {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: AppRole
  banned: boolean
  banReason: string | null
  createdAt: string
  updatedAt: string
}

export interface CurrentUserDto {
  user: AppUserDto
  preferences: UserPreferencesDto
}

export interface UserSessionDto {
  id: string
  token: string
  createdAt: string
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
  current: boolean
}

export interface UserSessionsDto {
  sessions: UserSessionDto[]
}

export interface AdminUsersDto {
  users: AppUserDto[]
  total: number
}

export interface ProfileUpdateInput {
  name: string
  image: string | null
}

export interface PreferencesUpdateInput {
  themeMode: ThemeMode
}

export type BatchUserAction =
  | {type: 'set-role'; role: AppRole}
  | {type: 'ban'; banReason?: string}
  | {type: 'unban'}
  | {type: 'revoke-sessions'}

export interface BatchUserActionInput {
  userIds: string[]
  action: BatchUserAction
}

export interface BatchUserActionResult {
  action: BatchUserAction['type']
  processedUserIds: string[]
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeNullableString(value: unknown): string | null {
  if (value === null) {
    return null
  }

  const normalized = normalizeString(value)
  return normalized.length > 0 ? normalized : null
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return THEME_MODES.includes(value as ThemeMode)
}

export function parseProfileUpdateInput(value: unknown): ProfileUpdateInput {
  if (!isObject(value)) {
    return {name: '', image: null}
  }

  return {
    name: normalizeString(value.name),
    image: normalizeNullableString(value.image),
  }
}

export function parsePreferencesUpdateInput(
  value: unknown,
): PreferencesUpdateInput {
  if (!isObject(value) || !isThemeMode(value.themeMode)) {
    return {themeMode: 'system'}
  }

  return {
    themeMode: value.themeMode,
  }
}

export function parseBatchUserActionInput(value: unknown): BatchUserActionInput {
  if (!isObject(value) || !Array.isArray(value.userIds) || !isObject(value.action)) {
    return {
      userIds: [],
      action: {type: 'unban'},
    }
  }

  const userIds = value.userIds
    .map((userId) => normalizeString(userId))
    .filter(Boolean)

  const actionType = normalizeString(value.action.type)

  if (actionType === 'set-role') {
    const role = value.action.role
    return {
      userIds,
      action: {
        type: 'set-role',
        role: role === 'admin' ? 'admin' : 'user',
      },
    }
  }

  if (actionType === 'ban') {
    return {
      userIds,
      action: {
        type: 'ban',
        banReason: normalizeString(value.action.banReason) || undefined,
      },
    }
  }

  if (actionType === 'revoke-sessions') {
    return {
      userIds,
      action: {type: 'revoke-sessions'},
    }
  }

  return {
    userIds,
    action: {type: 'unban'},
  }
}
