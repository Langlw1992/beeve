/**
 * Slider Component Showcase Page
 */

import {For, type Component} from 'solid-js'
import {Slider} from '@beeve/ui'
import {ShowcaseGrid, ShowcaseSection} from '../components/ShowcaseGrid'

const sizes = [
  {value: 'sm' as const, label: 'Small'},
  {value: 'md' as const, label: 'Medium'},
  {value: 'lg' as const, label: 'Large'},
]

const orientations = [{value: 'horizontal' as const, label: 'Horizontal'}]

export const SliderPage: Component = () => {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Slider</h1>
        <p class="text-muted-foreground mt-2">
          滑块组件，支持单值和范围模式，可配置刻度标记和输入框。
        </p>
      </div>

      {/* Size x Orientation */}
      <ShowcaseGrid
        title="Size × Orientation"
        description="尺寸与方向的笛卡尔积组合"
        variant1={{name: 'Size', values: sizes}}
        variant2={{name: 'Orientation', values: orientations}}
        renderCell={(size) => (
          <div class="w-48">
            <Slider
              size={size}
              defaultValue={[50]}
            />
          </div>
        )}
      />

      {/* Single Value */}
      <ShowcaseSection
        title="Single Value"
        description="单值滑块"
      >
        <div class="flex flex-col gap-6 max-w-md">
          <For each={sizes}>
            {(s) => (
              <div class="flex flex-col gap-2">
                <label class="text-xs text-muted-foreground">{s.label}</label>
                <Slider
                  size={s.value}
                  defaultValue={[30]}
                />
              </div>
            )}
          </For>
        </div>
      </ShowcaseSection>

      {/* Range Mode */}
      <ShowcaseSection
        title="Range Mode"
        description="范围滑块"
      >
        <div class="flex flex-col gap-6 max-w-md">
          <For each={sizes}>
            {(s) => (
              <div class="flex flex-col gap-2">
                <label class="text-xs text-muted-foreground">{s.label}</label>
                <Slider
                  size={s.value}
                  defaultValue={[20, 70]}
                />
              </div>
            )}
          </For>
        </div>
      </ShowcaseSection>

      {/* With Marks */}
      <ShowcaseSection
        title="With Marks"
        description="带刻度标记"
      >
        <div class="flex flex-col gap-8 max-w-md">
          <Slider
            defaultValue={[50]}
            marks={[
              {value: 0, label: '0'},
              {value: 25, label: '25'},
              {value: 50, label: '50'},
              {value: 75, label: '75'},
              {value: 100, label: '100'},
            ]}
          />
        </div>
      </ShowcaseSection>

      {/* With Input */}
      <ShowcaseSection
        title="With Input"
        description="带输入框"
      >
        <div class="flex flex-col gap-6 max-w-lg">
          <Slider
            defaultValue={[50]}
            showInput
          />
          <Slider
            defaultValue={[20, 80]}
            showInput
            inputWidth="50px"
          />
        </div>
      </ShowcaseSection>

      {/* With Label */}
      <ShowcaseSection
        title="With Label"
        description="带标签"
      >
        <div class="flex flex-col gap-6 max-w-md">
          <Slider
            label="Volume"
            defaultValue={[75]}
          />
          <Slider
            label="Price Range"
            defaultValue={[100, 500]}
            min={0}
            max={1000}
            showInput
          />
        </div>
      </ShowcaseSection>

      {/* Disabled State */}
      <ShowcaseSection
        title="Disabled State"
        description="禁用状态"
      >
        <div class="max-w-md">
          <Slider
            disabled
            defaultValue={[50]}
          />
        </div>
      </ShowcaseSection>
    </div>
  )
}
