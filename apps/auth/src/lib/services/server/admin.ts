import type {
  AdminUsersDto,
  BatchUserActionInput,
  BatchUserActionResult,
} from '@/lib/services/contracts'
import {serializeUser} from '@/lib/services/serializers'
import {requireAdminSession, ServiceError} from './context'
import {auth} from '@/lib/auth/server'

export async function listAdminUsers(
  headers: Headers,
  limit = 100,
): Promise<AdminUsersDto> {
  await requireAdminSession(headers)

  const result = await auth.api.listUsers({
    headers,
    query: {
      limit,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    },
  })

  return {
    users: result.users.map((user) => serializeUser(user)),
    total: result.total,
  }
}

function assertBatchActionAllowed(
  currentUserId: string,
  userIds: string[],
  action: BatchUserActionInput['action'],
) {
  const includesCurrentUser = userIds.includes(currentUserId)

  if (!includesCurrentUser) {
    return
  }

  if (
    action.type === 'ban' ||
    action.type === 'revoke-sessions' ||
    (action.type === 'set-role' && action.role === 'user')
  ) {
    throw new ServiceError(
      400,
      'INVALID_BATCH_ACTION',
      '不能对当前管理员账号执行这类批量操作。',
    )
  }
}

export async function applyBatchUserAction(
  headers: Headers,
  input: BatchUserActionInput,
): Promise<BatchUserActionResult> {
  const session = await requireAdminSession(headers)
  const userIds = Array.from(new Set(input.userIds.filter(Boolean)))

  if (userIds.length === 0) {
    throw new ServiceError(400, 'EMPTY_SELECTION', '请至少选择一名用户。')
  }

  assertBatchActionAllowed(session.user.id, userIds, input.action)

  for (const userId of userIds) {
    if (input.action.type === 'set-role') {
      await auth.api.setRole({
        headers,
        body: {
          userId,
          role: input.action.role,
        },
      })
      continue
    }

    if (input.action.type === 'ban') {
      await auth.api.banUser({
        headers,
        body: {
          userId,
          banReason:
            input.action.banReason || '通过管理员批量操作更新。',
        },
      })
      continue
    }

    if (input.action.type === 'revoke-sessions') {
      await auth.api.revokeUserSessions({
        headers,
        body: {userId},
      })
      continue
    }

    await auth.api.unbanUser({
      headers,
      body: {userId},
    })
  }

  return {
    action: input.action.type,
    processedUserIds: userIds,
  }
}
