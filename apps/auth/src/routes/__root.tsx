/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/solid-router'
import {TanStackRouterDevtools} from '@tanstack/solid-router-devtools'

import type * as Solid from 'solid-js'
import {HydrationScript} from 'solid-js/web'

import Header from '../components/Header'

// 直接导入 CSS，Vite 会自动处理
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {charSet: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
    ],
  }),
  // HTML 文档外壳 — SSR 时始终渲染
  shellComponent: RootDocument,
  // 应用根布局
  component: RootComponent,
  // 路由未匹配时的回退组件，防止 SSR 卡死
  notFoundComponent: NotFound,
})

function RootComponent() {
  return (
    <>
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}

function RootDocument(props: {children: Solid.JSX.Element}) {
  return (
    <html>
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        {props.children}
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <main class="page-wrap flex min-h-[60vh] items-center justify-center px-4">
      <div class="text-center">
        <h1 class="mb-2 text-6xl font-bold text-[var(--sea-ink-soft)]">404</h1>
        <p class="mb-4 text-lg text-[var(--sea-ink-soft)]">页面未找到</p>
        <a
          href="/"
          class="text-[var(--lagoon-deep)] hover:underline"
        >
          返回首页
        </a>
      </div>
    </main>
  )
}
