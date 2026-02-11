# Beeve — Claude Code Rules

> **Shared rules are in `AGENTS.md`.** This file contains Claude-specific additions only.

## Response Language

**Always respond in Chinese (中文).** All explanations, comments in generated code, commit messages, and PR descriptions should be in Chinese.

## Workflow Preferences

- Before making changes, read the relevant source files to understand existing patterns
- When creating new components, follow the exact patterns in existing components (e.g., Button, Badge, Switch)
- Run `pnpm lint` and `pnpm --filter @beeve/ui test:run` after making changes to verify correctness
- When fixing lint errors, prefer `pnpm lint:fix` first, then manually fix remaining issues
- Commit messages in Chinese, using conventional commit format: `feat: 新增 XX 组件`, `fix: 修复 XX 问题`

## Important Reminders

- This is **SolidJS**, not React. Do NOT use `useState`, `useEffect`, `useRef`, or any React APIs
- Do NOT destructure component props — it breaks SolidJS reactivity
- Use `lucide-solid` for icons, not `lucide-react`
- Use `pnpm` exclusively, never `npm` or `yarn`
- All `tv()` variant definitions should be placed at the top of the component file, before the component function

