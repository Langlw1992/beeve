import {createRouter} from '@tanstack/solid-router'
import {QueryClient} from '@tanstack/solid-query'
import {setupRouterSsrQueryIntegration} from '@tanstack/solid-router-ssr-query'
import {routeTree} from './routeTree.gen'

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
    },
  })

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  })

  setupRouterSsrQueryIntegration({router, queryClient})

  return router
}
