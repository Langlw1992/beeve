---
type: agent_requested
description: Rules for writing and running tests for @beeve/ui components, including Vitest configuration, @solidjs/testing-library patterns, coverage requirements, and Zag.js testing limitations.
---

# Testing Guide

## Stack

- **Runner:** Vitest (jsdom environment)
- **Library:** @solidjs/testing-library
- **Assertions:** vitest built-in + @testing-library/jest-dom matchers
- **Setup file:** `packages/ui/src/test/setup.ts` (auto-loaded)

## Running Tests

```bash
pnpm --filter @beeve/ui test           # Watch mode
pnpm --filter @beeve/ui test:run       # Run once
pnpm --filter @beeve/ui test:coverage  # With coverage report

# Single file
pnpm --filter @beeve/ui vitest run src/components/Button/Button.test.tsx
```

## Coverage Requirements

**80% minimum** for lines, functions, branches, and statements. Coverage includes `src/components/**/*.tsx`, excluding `*.stories.tsx`, `*.test.tsx`, and `**/index.ts`.

## Test File Template

```tsx
/**
 * ComponentName 组件测试
 */

import {describe, it, expect, vi} from 'vitest'
import {render, screen, fireEvent} from '@solidjs/testing-library'
import {ComponentName} from './ComponentName'

describe('ComponentName', () => {
  // ==================== 渲染测试 ====================
  describe('渲染', () => {
    it('应该正确渲染组件', () => {
      render(() => <ComponentName>内容</ComponentName>)
      expect(screen.getByText('内容')).toBeInTheDocument()
    })
  })

  // ==================== 变体测试 ====================
  describe('变体', () => {
    it('默认变体应正确应用样式', () => {
      render(() => <ComponentName>测试</ComponentName>)
      const el = screen.getByText('测试')
      expect(el.className).toContain('expected-class')
    })
  })

  // ==================== 交互测试 ====================
  describe('交互', () => {
    it('点击时应触发回调', async () => {
      const handleClick = vi.fn()
      render(() => <ComponentName onClick={handleClick}>点击</ComponentName>)
      await fireEvent.click(screen.getByText('点击'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  // ==================== 样式定制 ====================
  describe('样式定制', () => {
    it('应该支持自定义 class', () => {
      render(() => <ComponentName class="my-class">测试</ComponentName>)
      expect(screen.getByText('测试')).toHaveClass('my-class')
    })
  })
})
```

## Key Patterns

### SolidJS Render Wrapper

Always wrap components in an arrow function for `render()`:

```tsx
// ✅ Correct
render(() => <Button>测试</Button>)

// ❌ Wrong — will not work with SolidJS
render(<Button>测试</Button>)
```

### Querying Elements

Prefer accessible queries in this order:

1. `screen.getByRole('button')` — by ARIA role
2. `screen.getByText('文本')` — by visible text
3. `screen.getByTestId('id')` — by data-testid (last resort)

### Testing Controlled Components

```tsx
import {createSignal} from 'solid-js'

it('受控模式应正确工作', () => {
  const [value, setValue] = createSignal(false)
  render(() => (
    <Switch checked={value()} onChange={setValue}>开关</Switch>
  ))
  // ...assertions
})
```

### Async Interactions

Use `waitFor` for state changes that trigger re-renders:

```tsx
import {waitFor} from '@solidjs/testing-library'

await waitFor(() => {
  expect(screen.getByText('更新后的内容')).toBeInTheDocument()
})
```

## Zag.js Component Testing

**Important limitation:** Zag.js state machines do NOT work correctly in jsdom environment. For components using Zag.js (Dialog, Select, Popover, Menu, Slider, Tooltip, etc.):

- Mark interaction tests as `it.skip` with note: `(需要 e2e 测试)`
- You CAN test: prop forwarding, className merging, rendering of static elements
- You CANNOT test: open/close behavior, focus management, keyboard navigation

```tsx
it.skip('打开对话框后应显示内容 (需要 e2e 测试)', async () => {
  // Zag.js 状态机在 jsdom 中无法正确响应交互
})
```

## Test Organization

- Use Chinese for test descriptions
- Group by behavior: `渲染`, `变体`, `尺寸`, `交互`, `状态`, `样式定制`, `无障碍`
- Use section separators: `// ==================== 渲染测试 ====================`

