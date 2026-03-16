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

### `apps/auth` (@beeve/auth)

```bash
pnpm --filter @beeve/auth dev
pnpm --filter @beeve/auth build
pnpm --filter @beeve/auth lint
pnpm --filter @beeve/auth typecheck
pnpm --filter @beeve/auth test
```

`@beeve/auth` is a unified auth service (frontend + backend in one). It uses TanStack Solid Start with Better Auth for authentication.

## High-level architecture

This repo is a pnpm workspace/Turbo monorepo centered on auth and UI building blocks rather than a large shared-domain package layer.

- `packages/ui` is the reusable SolidJS component library. It combines Zag.js state machines for interactive primitives, Tailwind CSS v4 for styling, and CSS custom properties for theming. The public surface is `packages/ui/src/index.ts`, and `ThemeProvider` owns theme persistence plus document-level CSS variable application.
- `apps/auth` (@beeve/auth) is a unified TanStack Start SSR app with integrated Better Auth. Routing is file-based under `src/routes`, the generated route tree is wired in `src/router.tsx`, and TanStack Query is injected through router context from `src/integrations/tanstack-query/provider.tsx`.
- Authentication is handled by Elysia: `src/lib/server.ts` creates the Elysia app with CORS and mounts Better Auth, then `src/routes/api/auth/api.$.ts` forwards `/api/auth/*` requests via `app.fetch(request)`.

## Key conventions

- Instruction layering is intentional. Read the root `CLAUDE.md` first, then the nearest package-level `CLAUDE.md` (`packages/ui/CLAUDE.md`, `apps/auth/CLAUDE.md`) before making changes in that area.
- In `packages/ui`, each component lives in its own directory and normally exposes `Component.tsx` plus `index.ts`. Variants are defined with `tv()`, prop types follow the `ComponentProps` / `ComponentVariants` pattern, and components commonly use `splitProps` to separate variant props from DOM props.
- `packages/ui/src/index.ts` is the canonical export surface. Keep it in sync when adding or removing public components. `Cascader` is intentionally not exported there because of an SSR issue.
- In `@beeve/auth`, keep routing changes inside TanStack Router’s file-based conventions under `src/routes`. `__root.tsx` is the top-level HTML shell; API handlers live under `src/routes/api`.
- `@beeve/auth` query state is created via router context, not a shared singleton. If a route or integration needs the query client, follow the `getContext()` pattern from `src/integrations/tanstack-query/provider.tsx`.
- Theme-aware UI should use the CSS variable system and `ThemeProvider` instead of hard-coded palette values. The provider persists config in `localStorage` and applies tokens to `document.documentElement`.
- `Dialog` in `packages/ui` has repo-specific async behavior: if `onOk` returns a `Promise`, the component manages confirm loading internally, closes on resolve, and stays open on rejection.
