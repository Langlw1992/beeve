import {treaty} from '@elysiajs/eden'
import {createIsomorphicFn} from '@tanstack/solid-start'
import type {App} from './server'

const getApiOrigin = createIsomorphicFn()
  .server(() => process.env.BETTER_AUTH_URL ?? 'http://localhost:3000')
  .client(() =>
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  )

export function api() {
  return treaty<App>(getApiOrigin()).api
}
