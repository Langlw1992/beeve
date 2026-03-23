# @beeve/ui

Solid UI component library for Beeve.

`@beeve/ui` is a source-first package:

- components are published as ESM source in `dist/source`
- types are published in `dist/types`
- styles are published through a single official entry: `@beeve/ui/styles`

The package is designed for:

- Solid projects
- SSR + client rendering
- ESM tree-shaking
- Tailwind CSS v4

## Package Shape

Published package contents:

- `dist/source`
- `dist/types`
- `dist/styles.css`

Package exports:

- `@beeve/ui`
- `@beeve/ui/themes`
- `@beeve/ui/providers`
- `@beeve/ui/components/*`
- `@beeve/ui/styles`

Monorepo consumers can opt into the `solid` export condition to consume `src/*` directly during local development.

## Quick Start

Install peer/runtime dependencies in the consuming app:

```bash
pnpm add solid-js @beeve/ui
```

Import the library styles once in your app stylesheet:

```css
@import "tailwindcss";
@import "@beeve/ui/styles";

/* Scan your app source as usual */
@source "../src";
```

Then use components normally:

```tsx
import {Button, Card, CardContent, CardHeader, CardTitle} from '@beeve/ui'

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Beeve UI</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Continue</Button>
      </CardContent>
    </Card>
  )
}
```

## Tailwind

The official style entry is:

```css
@import "@beeve/ui/styles";
```

That file already contains the package source scan directive for Beeve UI classes, so the consuming app does not need to add an extra `@source` entry for `@beeve/ui`.

What the app still needs to do:

- import `tailwindcss`
- keep its own app source scanning
- import `@beeve/ui/styles` once

## SSR

The package is intended to work in both SSR and client-rendered Solid apps.

For apps that externalize dependency source during SSR, you may need to force transform:

```ts
import {defineConfig} from 'vite'

export default defineConfig({
  ssr: {
    noExternal: ['@beeve/ui'],
  },
})
```

This is a host build requirement, not a component API requirement.

## Theme System

Theme utilities are exported from `@beeve/ui` and `@beeve/ui/themes`.

Core exports:

- `ThemeProvider`
- `useTheme`
- `themeScript`
- `defaultThemeConfig`
- `generateThemeStyleString`

Current theme model:

- `mode`: `light | dark | system`
- `baseColor`
- `themeColor`
- `radius`

Basic setup:

```tsx
import {
  ThemeProvider,
  defaultThemeConfig,
  generateThemeStyleString,
  themeScript,
  type ThemeConfig,
} from '@beeve/ui'

function RootDocument(props: {children: unknown; themeConfig?: ThemeConfig}) {
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
    <html class={htmlClass} style={htmlStyle}>
      <head>
        <script innerHTML={themeScript()} />
      </head>
      <body>
        <ThemeProvider defaultConfig={themeConfig}>
          {props.children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Theme persistence:

- stored in cookie for SSR bootstrap
- mirrored to `localStorage`
- default storage key: `beeve-theme`

## Monorepo Source-First Development

If a workspace app should consume `packages/ui/src` directly during development, enable the `solid` export condition.

TypeScript:

```json
{
  "compilerOptions": {
    "customConditions": ["solid"]
  }
}
```

Vite:

```ts
import {defineConfig} from 'vite'

export default defineConfig({
  resolve: {
    conditions: ['solid'],
  },
})
```

This gives local apps immediate feedback when editing `packages/ui` without rebuilding the package first.

Published consumers do not need this setup and will use `dist/source` through the default export path.

## Tree-Shaking

The package is published as ESM and supports tree-shaking through:

- named exports
- subpath exports like `@beeve/ui/components/Button`
- source-first module output

The package avoids `lucide-solid` as a runtime dependency. Internal icons are shipped as local SVG components, while `lucide-solid` remains dev-only for stories/examples.

## Development

Useful commands:

```bash
pnpm -C packages/ui typecheck
pnpm -C packages/ui build
pnpm -C packages/ui lint
```

Build output:

- `build:source`: emits `dist/source`
- `build:types`: emits `dist/types`
- `build:styles`: emits `dist/styles.css`

## Notes

- `@beeve/ui/styles` is the only supported public style entry.
- Do not import files from `packages/ui/src` via relative paths.
- If a component has SSR constraints in the future, document them at the component entry level instead of leaking implementation details to app code.
