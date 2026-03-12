# Beeve Copilot Instructions

## Build, test, and lint commands

Use `pnpm install` at the repo root.

There is no reliable root-level `lint` or `test` script yet. Run commands per workspace package with `pnpm --filter ...`.

### `packages/ui`

```bash
pnpm --filter @beeve/ui build
pnpm --filter @beeve/ui lint
pnpm --filter @beeve/ui lint:fix
pnpm --filter @beeve/ui typecheck
pnpm --filter @beeve/ui test:run
pnpm --filter @beeve/ui test:run src/components/Button/Button.test.tsx
```

`packages/ui` is the only workspace package with checked-in test files today.

### `apps/auth-web`

```bash
pnpm --filter auth-web dev
pnpm --filter auth-web build
pnpm --filter auth-web lint
pnpm --filter auth-web format
pnpm --filter auth-web check
pnpm --filter auth-web test
```

`auth-web` has a Vitest script, but there are currently no checked-in `*.test` or `*.spec` files, so there is no concrete single-test example yet.

### `apps/auth-server`

```bash
pnpm --filter auth-server test
```

`auth-server` currently has no build/lint/typecheck scripts in `package.json`, and no checked-in test files.

## High-level architecture

This repo is a pnpm workspace/Turbo monorepo centered on auth and UI building blocks rather than a large shared-domain package layer.

- `packages/ui` is the reusable SolidJS component library. It combines Zag.js state machines for interactive primitives, Tailwind CSS v4 for styling, and CSS custom properties for theming. The public surface is `packages/ui/src/index.ts`, and `ThemeProvider` owns theme persistence plus document-level CSS variable application.
- `apps/auth-web` is a TanStack Start SSR app. Routing is file-based under `src/routes`, the generated route tree is wired in `src/router.tsx`, and TanStack Query is injected through router context from `src/integrations/tanstack-query/provider.tsx`.
- `apps/auth-web` handles Better Auth in-process today. `src/lib/auth.ts` creates the server auth instance, and `src/routes/api/auth/$.ts` forwards `/api/auth/*` requests directly to `auth.handler(request)`.
- `apps/auth-server` is a separate Bun/Elysia authentication service prototype. Its current source contains Better Auth configuration in `src/auth.ts` and SQLite/Drizzle setup in `src/db/index.ts`, with Drizzle targeting `data/auth.db`.

The important big-picture detail is that `auth-web` and `auth-server` currently represent two parallel auth implementations. Before changing auth behavior, confirm which one is actually meant to own the flow you are editing.

## Key conventions

- Instruction layering is intentional. Read the root `CLAUDE.md` first, then the nearest package-level `CLAUDE.md` (`packages/ui/CLAUDE.md`, `apps/auth-web/CLAUDE.md`, `apps/auth-server/CLAUDE.md`) before making changes in that area.
- In `packages/ui`, each component lives in its own directory and normally exposes `Component.tsx` plus `index.ts`. Variants are defined with `tv()`, prop types follow the `ComponentProps` / `ComponentVariants` pattern, and components commonly use `splitProps` to separate variant props from DOM props.
- `packages/ui/src/index.ts` is the canonical export surface. Keep it in sync when adding or removing public components. `Cascader` is intentionally not exported there because of an SSR issue.
- In `auth-web`, keep routing changes inside TanStack Router’s file-based conventions under `src/routes`. `__root.tsx` is the top-level HTML shell; API handlers live under `src/routes/api`.
- `auth-web` query state is created via router context, not a shared singleton. If a route or integration needs the query client, follow the `getContext()` pattern from `src/integrations/tanstack-query/provider.tsx`.
- Theme-aware UI should use the CSS variable system and `ThemeProvider` instead of hard-coded palette values. The provider persists config in `localStorage` and applies tokens to `document.documentElement`.
- `Dialog` in `packages/ui` has repo-specific async behavior: if `onOk` returns a `Promise`, the component manages confirm loading internally, closes on resolve, and stays open on rejection.
