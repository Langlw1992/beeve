import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { Presence } from './Presence'
import { usePresence } from './use-presence'
import { Button } from '../Button'

const meta: Meta<typeof Presence> = {
  title: 'Components/Presence',
  component: Presence,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Presence>

/**
 * 使用 Presence 组件实现退出动画
 */
export const Basic: Story = {
  render: () => {
    const [present, setPresent] = createSignal(true)
    return (
      <div class="space-y-4">
        <Button onClick={() => setPresent(!present())}>
          Toggle ({present() ? 'Visible' : 'Hidden'})
        </Button>
        <Presence present={present()} unmountOnExit>
          <div
            class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200"
            data-state={present() ? 'open' : 'closed'}
          >
            <h3 class="font-semibold">Animated Content</h3>
            <p class="text-muted-foreground">This content has enter and exit animations.</p>
          </div>
        </Presence>
      </div>
    )
  },
}

/**
 * 使用 usePresence hook 实现更细粒度的控制
 */
export const WithHook: Story = {
  render: () => {
    const [present, setPresent] = createSignal(true)
    const presence = usePresence(() => ({
      present: present(),
      unmountOnExit: true,
    }))

    return (
      <div class="space-y-4">
        <Button onClick={() => setPresent(!present())}>
          Toggle ({present() ? 'Visible' : 'Hidden'})
        </Button>
        <div class="text-sm text-muted-foreground">
          isPresent: {presence().isPresent ? 'true' : 'false'} | 
          unmounted: {presence().unmounted ? 'true' : 'false'}
        </div>
        {!presence().unmounted && (
          <div
            ref={presence().setRef}
            class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200"
            {...presence().presenceProps}
          >
            <h3 class="font-semibold">Hook-based Animation</h3>
            <p class="text-muted-foreground">Using usePresence hook directly.</p>
          </div>
        )}
      </div>
    )
  },
}

