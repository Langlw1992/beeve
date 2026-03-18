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
    throw new ServiceError(400, 'INVALID_PROFILE', 'Name is required.')
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

export async function revokeUserSession(headers: Headers, token: string) {
  await requireSession(headers)

  if (!token) {
    throw new ServiceError(400, 'INVALID_SESSION', 'Session token is required.')
  }

  await auth.api.revokeSession({
    headers,
    body: {token},
  })

  return {success: true}
}

export async function revokeOtherUserSessions(headers: Headers) {
  await requireSession(headers)
  await auth.api.revokeSessions({headers})

  return {success: true}
}
