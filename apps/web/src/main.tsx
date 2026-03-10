/**
 * 应用入口文件
 */
import {render} from 'solid-js/web'
import {RouterProvider, createRouter} from '@tanstack/solid-router'
import {QueryClientProvider} from '@tanstack/solid-query'
import {queryClient} from './lib/query-client'
import {routeTree} from './routeTree.gen'
import './index.css'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// 注册 router 类型
declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router
  }
}

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  ),
  document.getElementById('root') as HTMLElement,
)
