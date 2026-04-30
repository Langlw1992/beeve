import type {
  PreferencesUpdateInput,
  ProfileUpdateInput,
  CurrentUserDto,
  UserSessionsDto,
} from '@/lib/services/contracts'
import {serializeSession, serializeUser} from '@/lib/services/serializers'
import {
  getUserPreferences,
  requireSession,
  ServiceError,
  upsertUserPreferences,
} from './context'
import {auth} from '@/lib/auth/server'

export async function getCurrentUser(
  headers: Headers,
  disableCookieCache = false,
): Promise<CurrentUserDto> {
  const session = await requireSession(headers, disableCookieCache)
  const preferences = await getUserPreferences(session.user.id)

  return {
    user: serializeUser(session.user),
    preferences,
  }
}

export async function updateCurrentUserProfile(
  headers: Headers,
  input: ProfileUpdateInput,
): Promise<CurrentUserDto> {
  if (!input.name) {
    throw new ServiceError(400, 'INVALID_PROFILE', '请填写姓名。')
  }

  await requireSession(headers)
  await auth.api.updateUser({
    headers,
    body: {
      name: input.name,
      image: input.image,
    },
  })

  return getCurrentUser(headers, true)
}

export async function updateCurrentUserPreferences(
  headers: Headers,
  input: PreferencesUpdateInput,
) {
  const session = await requireSession(headers)
  const preferences = await upsertUserPreferences(session.user.id, input.themeMode)

  return {preferences}
}

export async function listCurrentUserSessions(headers: Headers): Promise<UserSessionsDto> {
  const session = await requireSession(headers)
  const sessions = await auth.api.listSessions({headers})

  return {
    sessions: sessions.map((item) =>
      serializeSession(item, session.session.token),
    ),
  }
}

export async function revokeUserSession(headers: Headers, sessionId: string) {
  const session = await requireSession(headers)

  if (!sessionId) {
    throw new ServiceError(400, 'INVALID_SESSION', '请提供会话 ID。')
  }

  const sessions = await auth.api.listSessions({headers})
  const targetSession = sessions.find((item) => item.id === sessionId)

  if (!targetSession) {
    throw new ServiceError(404, 'SESSION_NOT_FOUND', '未找到该会话。')
  }

  if (targetSession.token === session.session.token) {
    throw new ServiceError(
      400,
      'INVALID_SESSION',
      '当前会话请通过退出登录结束。',
    )
  }

  await auth.api.revokeSession({
    headers,
    body: {token: targetSession.token},
  })

  return {success: true}
}

export async function revokeOtherUserSessions(headers: Headers) {
  await requireSession(headers)
  await auth.api.revokeSessions({headers})

  return {success: true}
}
