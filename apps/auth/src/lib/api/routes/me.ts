import {Elysia} from 'elysia'
import {
  parsePreferencesUpdateInput,
  parseProfileUpdateInput,
} from '@/lib/services/contracts'
import {handleService} from '@/lib/api/handle-service'
import {
  getCurrentUser,
  updateCurrentUserPreferences,
  updateCurrentUserProfile,
} from '@/lib/services/server/me'
import {assertTrustedWriteRequest} from '@/lib/api/request-guards'

export const meRoutes = new Elysia().group('/me', (group) =>
  group
    .get('/', ({request, set}) =>
      handleService(set, () => getCurrentUser(request.headers)),
    )
    .post('/', ({request, body, set}) =>
      handleService(set, () => {
        assertTrustedWriteRequest(request.headers)
        return updateCurrentUserProfile(
          request.headers,
          parseProfileUpdateInput(body),
        )
      }),
    )
    .post('/preferences', ({request, body, set}) =>
      handleService(set, () => {
        assertTrustedWriteRequest(request.headers)
        return updateCurrentUserPreferences(
          request.headers,
          parsePreferencesUpdateInput(body),
        )
      }),
    ),
)
