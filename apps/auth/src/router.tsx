import {createRouter as createTanStackRouter} from '@tanstack/solid-router'
import {routeTree} from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    // 默认 404 回退，防止 SSR 因缺少 notFoundComponent 而卡死
    defaultNotFoundComponent: () => (
      <div class="flex min-h-[60vh] items-center justify-center">
        <p class="text-[var(--sea-ink-soft)]">页面未找到</p>
      </div>
    ),
  })

  return router
}

declare module '@tanstack/solid-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
