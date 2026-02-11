---
type: always_apply
---

# Beeve Project Guidelines

## Response Language

**Always respond in Chinese (中文).** All explanations, code comments, commit messages, and PR descriptions must be in Chinese.

## Tech Stack

- **Framework:** SolidJS (not React — do NOT use React APIs like useState, useEffect, useRef)
- **Monorepo:** pnpm workspaces + Turborepo
- **UI Library:** `packages/ui` (`@beeve/ui`) — built with tsup
- **Styling:** Tailwind CSS v4 + tailwind-variants (`tv()`)
- **State Machines:** Zag.js (`@zag-js/*`) for complex interactive components
- **Testing:** Vitest + @solidjs/testing-library
- **Formatting/Linting:** Biome (not ESLint/Prettier)
- **Icons:** lucide-solid (not lucide-react)
- **Theming:** CSS custom properties (oklch color space), ThemeProvider context

## Code Style (Biome Enforced)

- 2-space indent, single quotes, no semicolons, trailing commas
- No bracket spacing: `{foo}` not `{ foo }`
- Always use `import type` for type-only imports
- No unused imports or variables
- Use `const` over `let`, never use `var`
- Use block statements (braces) for control flow

## TypeScript Code Style

- Use `type` instead of `interface` for all type definitions
- No `any` — use `unknown` + type guards when the type is truly unknown
- Minimize `as` assertions — prefer type inference, generics, or type guards
- No ignore annotations (`@ts-ignore`, `@ts-expect-error`, `// biome-ignore`, etc.) — fix the root cause
- Use types from dependency type libraries instead of redefining them
- No duplicate type definitions — define once, import everywhere

## SolidJS-Specific Rules

- **NEVER** destructure props — it breaks reactivity. Use `splitProps()` or access `props.xxx` directly
- Use `Component<Props>` type from `solid-js` for component definitions
- Use `JSX.Element` for children and render return types
- Use `createSignal()`, `createMemo()`, `createEffect()` for reactivity
- Use `Show`, `For`, `Switch/Match` for conditional/list rendering
- Use `Portal` from `solid-js/web` for overlay elements

## Import Conventions

- Use `import type` for type-only imports: `import type {Component, JSX} from 'solid-js'`
- Mixed imports: `import {splitProps, Show, type Component, type JSX} from 'solid-js'`
- Internal imports use relative paths within `packages/ui/src/`
- Cross-package imports use package name: `import {Button} from '@beeve/ui'`

## Package Manager

- Always use `pnpm` (not npm or yarn)
- Filter commands: `pnpm --filter @beeve/ui <command>`
- Never manually edit `pnpm-lock.yaml`

