import {Elysia} from 'elysia'
import {handleService} from '@/lib/api/handle-service'
import {
  listCurrentUserSessions,
  revokeOtherUserSessions,
  revokeUserSession,
} from '@/lib/services/server/me'

function parseSessionToken(body: unknown): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'token' in body &&
    typeof body.token === 'string'
  ) {
    return body.token
  }

  return ''
}

export const sessionRoutes = new Elysia().group('/sessions', (group) =>
  group
    .get('/', ({request, set}) =>
      handleService(set, () => listCurrentUserSessions(request.headers)),
    )
    .post('/revoke', ({request, body, set}) =>
      handleService(set, () =>
        revokeUserSession(request.headers, parseSessionToken(body)),
      ),
    )
    .post('/revoke-others', ({request, set}) =>
      handleService(set, () => revokeOtherUserSessions(request.headers)),
    ),
)
