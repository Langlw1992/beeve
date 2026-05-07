import {Elysia} from 'elysia'
import {handleService} from '@/lib/api/handle-service'
import {parseAssistantRequestInput} from '@/lib/services/contracts'
import {createAssistantReply} from '@/lib/services/server/assistant'

export const assistantRoutes = new Elysia().group('/assistant', (group) =>
  group.post('/', ({request, body, set}) =>
    handleService(set, () =>
      createAssistantReply(request.headers, parseAssistantRequestInput(body)),
    ),
  ),
)
