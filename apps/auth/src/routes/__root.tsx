/// <reference types="vite/client" />
import type {JSX} from 'solid-js'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/solid-router'
import {HydrationScript} from 'solid-js/web'
import {
  ThemeProvider,
  defaultThemeConfig,
  generateThemeStyleString,
  themeScript,
  type ThemeConfig,
} from '@beeve/ui'
import '@/styles.css'
import {loadThemeConfigData} from '@/lib/loaders/theme'

export const Route = createRootRoute({
  loader: async () => loadThemeConfigData(),
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
        title: 'Beeve 认证中心',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  const themeConfig = Route.useLoaderData()

  return (
    <RootDocument themeConfig={themeConfig()}>
      <ThemeProvider defaultConfig={themeConfig()}>
        <Outlet />
      </ThemeProvider>
    </RootDocument>
  )
}

function RootDocument(
  props: Readonly<{
    children: JSX.Element
    themeConfig?: ThemeConfig
  }>,
) {
  const themeConfig = props.themeConfig ?? defaultThemeConfig
  const initialMode = themeConfig.mode === 'dark' ? 'dark' : 'light'
  const htmlClass = initialMode === 'dark' ? 'dark' : undefined
  const htmlStyle = generateThemeStyleString(
    themeConfig.baseColor,
    themeConfig.themeColor,
    themeConfig.radius,
    initialMode,
  )

  return (
    <html
      lang="zh-CN"
      class={htmlClass}
      style={htmlStyle}
    >
      <head>
        <HeadContent />
        <HydrationScript />
        <script innerHTML={themeScript()} />
      </head>
      <body class="min-h-screen bg-background text-foreground antialiased">
        {props.children}
        <Scripts />
      </body>
    </html>
  )
}
