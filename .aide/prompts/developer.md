# Aider Developer Prompt for Beeve

## 🚨 CRITICAL RULES - ZERO HALLUCINATION TOLERANCE

```
1. NEVER guess APIs - query context7 for documentation first
2. NEVER assume library behavior - verify everything
3. NEVER confuse React with Solid patterns
4. ALWAYS use serena to analyze code before modifications
5. ALWAYS validate with typecheck and lint
6. ALWAYS cite documentation sources in responses
7. CHINESE RESPONSE: Reply in Simplified Chinese (except terms, code, commands)
8. VISUAL TESTING: Use chromeDevtools MCP for frontend visual inspection
```

## MCP Requirements

When MCP tools are available:
- **context7**: MUST query before using ANY library API
- **serena**: MUST analyze code before ANY modifications
- **chromeDevtools**: MUST use for frontend visual testing and debugging

Full MCP requirements: `.ai/mcp-usage.md`

## Libraries Requiring Documentation Lookup

ALWAYS verify with context7 - NO EXCEPTIONS:
- solid-js, @tanstack/solid-router, @tanstack/solid-query
- @tanstack/solid-form, @tanstack/solid-table
- tailwindcss, tailwind-variants
- hono, drizzle-orm, zod
- vite, astro, biome

---

## Context

You are working on Beeve, a SolidJS-based low-code platform monorepo.

## Tech Stack

- **Frontend**: SolidJS, TanStack (Router/Query/Form/Table), TailwindCSS v4, Vite
- **Backend**: Hono, PostgreSQL, Drizzle ORM, Zod
- **Tooling**: pnpm workspace, Turborepo, Biome (lint/format)

## Packages

| Package | Path | Description |
|---------|------|-------------|
| @beeve/ui | packages/ui | Component library |
| @beeve/lowcode-core | packages/lowcode-core | Low-code engine |
| @beeve/auth-client | packages/auth-client | Auth SDK |
| @beeve/db | packages/db | Database layer |
| @beeve/shared | packages/shared | Shared code |
| apps/web | apps/web | Frontend app |
| apps/server | apps/server | API server |
| apps/docs | apps/docs | Documentation |

## Code Style

### SolidJS Components

```typescript
import { splitProps, type Component } from 'solid-js'
import { tv, type VariantProps } from 'tailwind-variants'

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md',
  variants: {
    variant: { primary: 'bg-primary text-white', secondary: 'bg-secondary' },
    size: { sm: 'h-8 px-3', md: 'h-10 px-4', lg: 'h-12 px-6' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  onClick?: () => void
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, variants, rest] = splitProps(props, ['class', 'children'], ['variant', 'size'])
  return (
    <button class={buttonVariants({ ...variants, class: local.class })} {...rest}>
      {local.children}
    </button>
  )
}
```

### Hono Routes

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

app.post('/', zValidator('json', z.object({ email: z.string().email() })), async (c) => {
  const body = c.req.valid('json')
  return c.json({ data: result })
})
```

### Drizzle Schema

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
```

## Rules

1. TypeScript strict mode, no `any`
2. Use `splitProps` in SolidJS, never destructure props
3. Use `tailwind-variants` for component styling
4. Use Zod for all validation
5. Named exports only
6. Biome for linting (not ESLint)
7. UUID primary keys
8. NEVER guess APIs - verify with context7 first
9. NEVER modify code without serena analysis

## Anti-Hallucination Checklist

- [ ] API verified via context7?
- [ ] This is Solid, not React?
- [ ] Existing code analyzed with serena?
- [ ] All uncertainties marked?

## Response Format

```markdown
## Documentation Reference
[source]

## Implementation
[code]

## Verification
pnpm typecheck && pnpm lint

## ⚠️ Uncertainties
[if any]
```

## Naming

- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Utils: `kebab-case.ts`
- DB tables: `snake_case` plural
- DB columns: `snake_case`

## API Response

```typescript
// Success
{ data: T, meta?: { page, pageSize, total } }

// Error
{ error: { code: string, message: string } }
```

## Detailed Docs

See `.ai/` directory:
- `mcp-usage.md` - **MCP requirements (MUST READ)**
- architecture, conventions, components, api, database, lowcode
