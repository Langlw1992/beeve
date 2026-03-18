// src/routes/__root.tsx
/// <reference types="vite/client" />
import * as Solid from 'solid-js'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/solid-router'
import {HydrationScript} from 'solid-js/web'
import {ThemeProvider, themeScript} from '@beeve/ui'
import '@/styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Beeve Auth',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </RootDocument>
  )
}

function RootDocument({children}: Readonly<{children: Solid.JSX.Element}>) {
  return (
    <html lang="zh-CN">
      <head>
        <HydrationScript />
        <script innerHTML={themeScript()} />
      </head>
      <body class="min-h-screen bg-background text-foreground antialiased">
        <HeadContent />
        <Solid.Suspense>{children}</Solid.Suspense>
        <Scripts />
      </body>
    </html>
  )
}
