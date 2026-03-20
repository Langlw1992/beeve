import {api} from '@/lib/eden'
import type {
  AdminUsersDto,
  BatchUserActionInput,
  BatchUserActionResult,
  CurrentUserDto,
  PreferencesUpdateInput,
  ProfileUpdateInput,
  UserSessionsDto,
} from '@/lib/services/contracts'

type ApiErrorPayload = {
  error: string
  code: string
}

function unwrapResponse<T>(
  data: T | ApiErrorPayload | null | undefined,
  message: string,
): T {
  if (!data) {
    throw new Error(message)
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof data.error === 'string'
  ) {
    throw new Error(data.error)
  }

  return data as T
}

export async function fetchCurrentUser(): Promise<CurrentUserDto> {
  const result = await api().me.get()
  return unwrapResponse(result.data, '无法加载当前用户。')
}

export async function updateCurrentUserProfile(
  input: ProfileUpdateInput,
): Promise<CurrentUserDto> {
  const result = await api().me.post(input)
  return unwrapResponse(result.data, '无法更新个人资料。')
}

export async function updateCurrentUserPreferences(
  input: PreferencesUpdateInput,
) {
  const result = await api().me.preferences.post(input)
  return unwrapResponse(result.data, '无法更新偏好设置。')
}

export async function fetchUserSessions(): Promise<UserSessionsDto> {
  const result = await api().sessions.get()
  return unwrapResponse(result.data, '无法加载会话列表。')
}

export async function revokeUserSession(token: string) {
  const result = await api().sessions.revoke.post({token})
  return unwrapResponse(result.data, '无法撤销会话。')
}

export async function revokeOtherUserSessions() {
  const result = await api().sessions['revoke-others'].post({})
  return unwrapResponse(result.data, '无法撤销其他会话。')
}

export async function fetchAdminUsers(): Promise<AdminUsersDto> {
  const result = await api().admin.users.get()
  return unwrapResponse(result.data, '无法加载管理员用户列表。')
}

export async function applyAdminBatchAction(
  input: BatchUserActionInput,
): Promise<BatchUserActionResult> {
  const result = await api().admin.users.batch.post(input)
  return unwrapResponse(result.data, '无法更新用户。')
}
