import {createRouter as createTanStackRouter} from '@tanstack/solid-router'
import {routeTree} from './routeTree.gen'

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
  })

  return router
}

export function getRouter() {
  return createRouter()
}

declare module '@tanstack/solid-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
