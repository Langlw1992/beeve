import {createServerFn} from '@tanstack/solid-start'

export const loadCurrentUserData = createServerFn({
  method: 'GET',
}).handler(async () => {
  const [{getRequestHeaders}, {getCurrentUser}] = await Promise.all([
    import('@tanstack/solid-start/server'),
    import('@/lib/services/server/me'),
  ])

  return getCurrentUser(getRequestHeaders(), true)
})

export const loadUserSessionsData = createServerFn({
  method: 'GET',
}).handler(async () => {
  const [{getRequestHeaders}, {listCurrentUserSessions}] = await Promise.all([
    import('@tanstack/solid-start/server'),
    import('@/lib/services/server/me'),
  ])

  return listCurrentUserSessions(getRequestHeaders())
})

export const loadAdminUsersData = createServerFn({
  method: 'GET',
}).handler(async () => {
  const [{getRequestHeaders}, {listAdminUsers}] = await Promise.all([
    import('@tanstack/solid-start/server'),
    import('@/lib/services/server/admin'),
  ])

  return listAdminUsers(getRequestHeaders())
})
