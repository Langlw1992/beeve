import {createIsomorphicFn, createServerFn} from '@tanstack/solid-start'

type AuthSession =
  | {
      // biome-ignore lint/complexity/noBannedTypes: Guard context expects any non-nullish session fields.
      session: Record<string, {} | null | undefined> | null
      user:
        // biome-ignore lint/complexity/noBannedTypes: Guard context expects any non-nullish user fields.
        | ({role?: string | null} & Record<string, {} | null | undefined>)
        | null
    }
  | null

export async function getSession(): Promise<AuthSession> {
  const serverSession = await readServerSession()

  if (serverSession !== undefined) {
    return serverSession
  }

  const clientSession = await readClientSession()
  return clientSession ?? null
}

export const getEnabledSocialProviders = createServerFn({
	method: 'GET',
}).handler(async () => {
	const {enabledSocialProviders} = await import('./server')
	return enabledSocialProviders
})

const readServerSession = createIsomorphicFn()
  .server(async () => {
    const [{getRequestHeaders}, {auth}] = await Promise.all([
      import('@tanstack/solid-start/server'),
      import('./server'),
    ])

    return auth.api.getSession({
      headers: getRequestHeaders(),
      query: {disableCookieCache: true},
    })
  })
  .client(() => undefined as AuthSession | undefined)

const readClientSession = createIsomorphicFn()
  .server(() => undefined as AuthSession | undefined)
  .client(async () => {
    const response = await fetch('/api/auth/get-session?disableCookieCache=true', {
      credentials: 'include',
      headers: {
        accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  })
