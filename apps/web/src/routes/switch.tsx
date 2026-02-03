/**
 * Switch Component Showcase Page
 */

import {For} from 'solid-js'
import {createFileRoute} from '@tanstack/solid-router'
import {Switch} from '@beeve/ui'
import {ShowcaseGrid, ShowcaseSection} from '../components/ShowcaseGrid'

const sizes = [
  {value: 'sm' as const, label: 'Small'},
  {value: 'md' as const, label: 'Medium'},
  {value: 'lg' as const, label: 'Large'},
]

const states = [
  {value: 'off', label: 'Off'},
  {value: 'on', label: 'On'},
]

function SwitchPage() {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Switch</h1>
        <p class="text-muted-foreground mt-2">
          开关组件，用于切换某个功能的开启/关闭状态。
        </p>
      </div>

      {/* Size x State */}
      <ShowcaseGrid
        title="Size × State"
        description="尺寸与状态的笛卡尔积组合"
        variant1={{name: 'Size', values: sizes}}
        variant2={{name: 'State', values: states}}
        renderCell={(size, state) => (
          <Switch
            size={size}
            checked={state === 'on'}
          >
            {state}
          </Switch>
        )}
      />

      {/* With Labels */}
      <ShowcaseSection
        title="With Labels"
        description="带标签的开关"
      >
        <div class="flex flex-col gap-4">
          <For each={sizes}>
            {(s) => (
              <Switch
                size={s.value}
                defaultChecked
              >
                {s.label} switch with label
              </Switch>
            )}
          </For>
        </div>
      </ShowcaseSection>

      {/* Without Labels */}
      <ShowcaseSection
        title="Without Labels"
        description="不带标签的开关"
      >
        <div class="flex items-center gap-4">
          <For each={sizes}>
            {(s) => (
              <Switch
                size={s.value}
                defaultChecked
              />
            )}
          </For>
        </div>
      </ShowcaseSection>

      {/* Disabled State */}
      <ShowcaseSection
        title="Disabled State"
        description="禁用状态"
      >
        <div class="flex flex-col gap-4">
          <Switch disabled>Disabled off</Switch>
          <Switch
            disabled
            checked
          >
            Disabled on
          </Switch>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/switch')({
  component: SwitchPage,
})
