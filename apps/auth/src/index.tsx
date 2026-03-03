/* @refresh reload */
import {render} from 'solid-js/web'
import {RouterProvider, createRouter} from '@tanstack/solid-router'
import {ThemeProvider} from '@beeve/ui'
import './index.css'

// 导入自动生成的路由树
import {routeTree} from './routeTree.gen'

// 创建路由实例
const router = createRouter({routeTree})

// 注册路由实例以获得类型安全
declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router
  }
}

const root = document.getElementById('root')

render(
  () => (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  ),
  root!,
)
