# GitHub Copilot Instructions

## 🚨 CRITICAL RULES

```
1. ZERO HALLUCINATION: Never guess APIs - always verify with documentation
2. DOCUMENTATION FIRST: All library usage must have documented basis
3. CODE ANALYSIS: Understand existing code before modifying
4. VALIDATION: Code must pass typecheck and lint
5. TRANSPARENCY: State your sources, mark uncertainties
6. CHINESE RESPONSE: Reply in Simplified Chinese (except terms, code, commands)
7. VISUAL TESTING: Use chromeDevtools MCP for frontend visual inspection
8. SERVER CHECK: Before starting dev server, check if one is already running to avoid port conflicts
```

## MCP Requirements

When using MCP-enabled environments:
- **context7**: MUST query docs before using ANY library API
- **serena**: MUST analyze code structure before modifications
- **chromeDevtools**: MUST use for frontend visual testing and debugging

## Project Overview

Beeve is a full-stack low-code platform built with SolidJS, featuring:
- `@beeve/ui` - Solid component library
- `@beeve/lowcode-core` - Low-code engine
- `@beeve/auth-client` - Authentication client SDK
- `@beeve/db` - Database layer (Drizzle ORM + PostgreSQL)
- `@beeve/shared` - Shared types and utilities
- `apps/web` - Low-code platform frontend
- `apps/server` - API server (Hono)
- `apps/docs` - Documentation site (Astro + Starlight)

## Tech Stack

- **Frontend**: SolidJS, TanStack Router/Query/Form/Table, TailwindCSS v4
- **Backend**: Hono, PostgreSQL, Drizzle ORM, Zod
- **Build**: Vite, Turborepo, pnpm workspace
- **Linting**: Biome (NOT ESLint/Prettier)
- **Docs**: Astro + Starlight

## Code Style

### General
- Use TypeScript strict mode
- 2 spaces indentation
- Single quotes
- No semicolons (ASI)
- Use Biome for formatting and linting

### File Naming
- Components: `PascalCase.tsx` (e.g., `Button.tsx`)
- Utilities/hooks: `kebab-case.ts` (e.g., `use-auth.ts`)
- Types: `kebab-case.ts` (e.g., `user-types.ts`)

### Imports Order
```typescript
// 1. External dependencies
import { createSignal } from 'solid-js'
import { useNavigate } from '@tanstack/solid-router'

// 2. Internal packages (@beeve/*)
import { Button } from '@beeve/ui'

// 3. Relative imports
import { useAuth } from '../hooks/use-auth'

// 4. Type imports
import type { User } from '@beeve/shared/types'
```

### SolidJS Components
```typescript
import { splitProps, type Component } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md',
  variants: {
    variant: {
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary',
    },
  },
})

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  onClick?: () => void
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, variants, rest] = splitProps(
    props,
    ['class', 'children'],
    ['variant']
  )
  
  return (
    <button class={buttonVariants({ ...variants, class: local.class })} {...rest}>
      {local.children}
    </button>
  )
}
```

### Hono API Routes
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

app.post(
  '/',
  zValidator('json', z.object({
    email: z.string().email(),
    name: z.string().min(1),
  })),
  async (c) => {
    const body = c.req.valid('json')
    // ...
    return c.json({ data: result })
  }
)
```

### Drizzle Schema
```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
})

export type User = typeof users.$inferSelect
```

## Important Conventions

1. **Use `tailwind-variants`** for component styling, not inline Tailwind classes
2. **Use `splitProps`** in Solid components to separate local props
3. **Use Zod** for all validation (API + forms)
4. **Use named exports** for components and functions
5. **Never use `any`** - use `unknown` with type guards instead
6. **Always handle errors** in API routes
7. **Use UUID** for all primary keys
8. **Use `type` over `interface`** - prefer `type` for consistency (works better with Zod infer, union types, etc.)

## 🚫 Forbidden Patterns

```typescript
// ❌ NEVER use any
function process(data: any) { }

// ❌ NEVER destructure Solid props directly
const Component = ({ value }) => { }

// ❌ NEVER guess API signatures - verify first

// ❌ NEVER use ESLint/Prettier (use Biome)

// ❌ NEVER use default exports for components

// ❌ NEVER use forEach - use for...of or array methods (map, filter, reduce)
items.forEach(item => doSomething(item))  // Bad
for (const item of items) { doSomething(item) }  // Good
items.map(item => transform(item))  // Good

// ❌ NEVER omit braces in if/else statements
if (condition) doSomething()  // Bad
if (condition) { doSomething() }  // Good

// ❌ NEVER use w-x h-x when width equals height - use size-x instead
<div class="w-4 h-4">...</div>  // Bad
<div class="size-4">...</div>   // Good
```

## Anti-Hallucination Checklist

Before writing code:
- [ ] Did I verify the API exists in current version?
- [ ] Did I check the correct parameters and return types?
- [ ] Did I confirm this is Solid version, not React?
- [ ] Did I reference existing project patterns?

## Response Format

When providing code, include:
```markdown
## Source
- [documentation reference or project file]

## Implementation
[code]

## Verification
`pnpm typecheck && pnpm lint`
```

## API Response Format

```typescript
// Success
{ "data": T, "meta"?: { "total": number, "page": number } }

// Error
{ "error": { "code": string, "message": string } }
```

## Commands

```bash
pnpm dev                    # Start all dev servers
pnpm lint                   # Run Biome lint
pnpm format                 # Format with Biome
pnpm typecheck              # Type check
pnpm db:generate            # Generate migrations
pnpm db:migrate             # Run migrations
```

## Reference Files

For detailed conventions, see:
- `.ai/mcp-usage.md` - **MCP usage requirements (MUST READ)**
- `.ai/conventions.md` - Full coding conventions
- `.ai/components.md` - Component development guide
- `.ai/api.md` - API development guide
- `.ai/database.md` - Database conventions
- `.ai/lowcode.md` - Low-code engine docs
