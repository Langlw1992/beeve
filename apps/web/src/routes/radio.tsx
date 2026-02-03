/**
 * Radio Component Showcase Page
 */

import {For} from 'solid-js'
import {createFileRoute} from '@tanstack/solid-router'
import {Radio, RadioGroup} from '@beeve/ui'
import {ShowcaseGrid, ShowcaseSection} from '../components/ShowcaseGrid'

const sizes = [
  {value: 'sm' as const, label: 'Small'},
  {value: 'md' as const, label: 'Medium'},
  {value: 'lg' as const, label: 'Large'},
]

const states = [
  {value: 'unchecked', label: 'Unchecked'},
  {value: 'checked', label: 'Checked'},
]

function RadioPage() {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Radio</h1>
        <p class="text-muted-foreground mt-2">
          单选框组件，用于在一组选项中选择一个。
        </p>
      </div>

      {/* Size x State */}
      <ShowcaseGrid
        title="Size × State"
        description="尺寸与状态的笛卡尔积组合"
        variant1={{name: 'Size', values: sizes}}
        variant2={{name: 'State', values: states}}
        renderCell={(size, state) => (
          <Radio
            size={size}
            value={state}
            checked={state === 'checked'}
          >
            {state}
          </Radio>
        )}
      />

      {/* Radio Group */}
      <ShowcaseSection
        title="Radio Group"
        description="使用 RadioGroup 组织一组单选框"
      >
        <div class="flex flex-col gap-6">
          <For each={sizes}>
            {(s) => (
              <div class="flex flex-col gap-2">
                <span class="text-xs text-muted-foreground">
                  {s.label} Size
                </span>
                <RadioGroup
                  size={s.value}
                  defaultValue="option1"
                  class="flex gap-4"
                >
                  <Radio value="option1">Option 1</Radio>
                  <Radio value="option2">Option 2</Radio>
                  <Radio value="option3">Option 3</Radio>
                </RadioGroup>
              </div>
            )}
          </For>
        </div>
      </ShowcaseSection>

      {/* Vertical Layout */}
      <ShowcaseSection
        title="Vertical Layout"
        description="垂直排列的单选框组"
      >
        <RadioGroup
          defaultValue="apple"
          class="flex flex-col gap-3"
        >
          <Radio value="apple">🍎 Apple</Radio>
          <Radio value="banana">🍌 Banana</Radio>
          <Radio value="cherry">🍒 Cherry</Radio>
          <Radio value="grape">🍇 Grape</Radio>
        </RadioGroup>
      </ShowcaseSection>

      {/* Disabled State */}
      <ShowcaseSection
        title="Disabled State"
        description="禁用状态"
      >
        <div class="flex flex-col gap-4">
          <RadioGroup
            disabled
            defaultValue="option2"
            class="flex gap-4"
          >
            <Radio value="option1">Disabled option 1</Radio>
            <Radio value="option2">Disabled option 2</Radio>
          </RadioGroup>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/radio')({
  component: RadioPage,
})
