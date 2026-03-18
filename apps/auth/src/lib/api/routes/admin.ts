import {Elysia} from 'elysia'
import {parseBatchUserActionInput} from '@/lib/services/contracts'
import {handleService} from '@/lib/api/handle-service'
import {
  applyBatchUserAction,
  listAdminUsers,
} from '@/lib/services/server/admin'

export const adminRoutes = new Elysia().group('/admin', (group) =>
  group.group('/users', (users) =>
    users
      .get('/', ({request, set}) =>
        handleService(set, () => listAdminUsers(request.headers)),
      )
      .post('/batch', ({request, body, set}) =>
        handleService(set, () =>
          applyBatchUserAction(
            request.headers,
            parseBatchUserActionInput(body),
          ),
        ),
      ),
  ),
)
