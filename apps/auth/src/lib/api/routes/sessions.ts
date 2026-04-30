import {Elysia} from 'elysia'
import {handleService} from '@/lib/api/handle-service'
import {
  listCurrentUserSessions,
  revokeOtherUserSessions,
  revokeUserSession,
} from '@/lib/services/server/me'
import {assertTrustedWriteRequest} from '@/lib/api/request-guards'

function parseSessionId(body: unknown): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'sessionId' in body &&
    typeof body.sessionId === 'string'
  ) {
    return body.sessionId
  }

  return ''
}

export const sessionRoutes = new Elysia().group('/sessions', (group) =>
  group
    .get('/', ({request, set}) =>
      handleService(set, () => listCurrentUserSessions(request.headers)),
    )
    .post('/revoke', ({request, body, set}) =>
      handleService(set, () => {
        assertTrustedWriteRequest(request.headers)
        return revokeUserSession(request.headers, parseSessionId(body))
      }),
    )
    .post('/revoke-others', ({request, set}) =>
      handleService(set, () => {
        assertTrustedWriteRequest(request.headers)
        return revokeOtherUserSessions(request.headers)
      }),
    ),
)
