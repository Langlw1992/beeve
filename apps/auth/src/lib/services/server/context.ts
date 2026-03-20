import {eq} from 'drizzle-orm'
import {auth} from '@/lib/auth/server'
import {isAdminUser} from '@/lib/auth/policy'
import {db} from '@/lib/db/client'
import {userPreferences} from '@/lib/db/schema'
import {serializePreferences} from '@/lib/services/serializers'

export class ServiceError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function getSessionOrNull(
  headers: Headers,
  disableCookieCache = false,
) {
  return auth.api.getSession({
    headers,
    query: disableCookieCache ? {disableCookieCache} : undefined,
  })
}

export async function requireSession(
  headers: Headers,
  disableCookieCache = false,
) {
  const session = await getSessionOrNull(headers, disableCookieCache)

  if (!session?.user || !session.session) {
    throw new ServiceError(401, 'UNAUTHORIZED', '需要先登录。')
  }

  return session
}

export async function requireAdminSession(headers: Headers) {
  const session = await requireSession(headers)

  if (!isAdminUser(session.user)) {
    throw new ServiceError(403, 'FORBIDDEN', '需要管理员权限。')
  }

  return session
}

export async function getUserPreferences(userId: string) {
  const preferences = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  })

  return serializePreferences(preferences?.themeMode)
}

export async function upsertUserPreferences(
  userId: string,
  themeMode: string,
) {
  await db
    .insert(userPreferences)
    .values({
      userId,
      themeMode,
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        themeMode,
        updatedAt: new Date(),
      },
    })

  return getUserPreferences(userId)
}
