/**
 * Checkbox Component Showcase Page
 */

import { For } from 'solid-js'
import { createFileRoute } from '@tanstack/solid-router'
import { Checkbox } from '@beeve/ui'
import { ShowcaseGrid, ShowcaseSection } from '../components/ShowcaseGrid'

const sizes = [
  { value: 'sm' as const, label: 'Small' },
  { value: 'md' as const, label: 'Medium' },
  { value: 'lg' as const, label: 'Large' },
]

const states = [
  { value: 'unchecked', label: 'Unchecked' },
  { value: 'checked', label: 'Checked' },
  { value: 'indeterminate', label: 'Indeterminate' },
]

function CheckboxPage() {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Checkbox</h1>
        <p class="text-muted-foreground mt-2">
          复选框组件，支持选中、未选中和不确定状态。
        </p>
      </div>

      {/* Size x State */}
      <ShowcaseGrid
        title="Size × State"
        description="尺寸与状态的笛卡尔积组合"
        variant1={{ name: 'Size', values: sizes }}
        variant2={{ name: 'State', values: states }}
        renderCell={(size, state) => (
          <Checkbox
            size={size}
            checked={state === 'checked'}
            indeterminate={state === 'indeterminate'}
          >
            {state}
          </Checkbox>
        )}
      />

      {/* With Labels */}
      <ShowcaseSection title="With Labels" description="带标签的复选框">
        <div class="flex flex-col gap-4">
          <For each={sizes}>
            {(s) => (
              <Checkbox size={s.value}>
                {s.label} checkbox with label
              </Checkbox>
            )}
          </For>
        </div>
      </ShowcaseSection>

      {/* Without Labels */}
      <ShowcaseSection title="Without Labels" description="不带标签的复选框">
        <div class="flex items-center gap-4">
          <For each={sizes}>
            {(s) => <Checkbox size={s.value} />}
          </For>
        </div>
      </ShowcaseSection>

      {/* Disabled State */}
      <ShowcaseSection title="Disabled State" description="禁用状态">
        <div class="flex flex-col gap-4">
          <Checkbox disabled>Disabled unchecked</Checkbox>
          <Checkbox disabled checked>
            Disabled checked
          </Checkbox>
          <Checkbox disabled indeterminate>
            Disabled indeterminate
          </Checkbox>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/checkbox')({
  component: CheckboxPage,
})

