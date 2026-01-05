/**
 * Select Component Showcase Page
 */

import { type Component } from 'solid-js'
import { Select } from '@beeve/ui'
import { ShowcaseGrid, ShowcaseSection } from '../components/ShowcaseGrid'

const fruitOptions = [
  { value: 'apple', label: '🍎 Apple' },
  { value: 'banana', label: '🍌 Banana' },
  { value: 'cherry', label: '🍒 Cherry' },
  { value: 'grape', label: '🍇 Grape' },
  { value: 'orange', label: '🍊 Orange' },
]

const variants = [
  { value: 'default' as const, label: 'Default' },
  { value: 'filled' as const, label: 'Filled' },
  { value: 'borderless' as const, label: 'Borderless' },
]

const sizes = [
  { value: 'sm' as const, label: 'Small' },
  { value: 'md' as const, label: 'Medium' },
  { value: 'lg' as const, label: 'Large' },
]

const statuses = [
  { value: 'normal', label: 'Normal' },
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
]

export const SelectPage: Component = () => {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Select</h1>
        <p class="text-muted-foreground mt-2">
          选择器组件，支持搜索、清除和多种样式变体。
        </p>
      </div>

      {/* Variant x Size */}
      <ShowcaseGrid
        title="Variant × Size"
        description="样式变体与尺寸的笛卡尔积组合"
        variant1={{ name: 'Variant', values: variants }}
        variant2={{ name: 'Size', values: sizes }}
        renderCell={(variant, size) => (
          <Select
            variant={variant}
            size={size}
            options={fruitOptions}
            placeholder={`${variant} ${size}`}
            class="w-48"
          />
        )}
      />

      {/* Variant x Status */}
      <ShowcaseGrid
        title="Variant × Status"
        description="样式变体与状态的笛卡尔积组合"
        variant1={{ name: 'Variant', values: variants }}
        variant2={{ name: 'Status', values: statuses }}
        renderCell={(variant, status) => (
          <Select
            variant={variant}
            status={status === 'normal' ? undefined : (status as 'error' | 'warning')}
            options={fruitOptions}
            placeholder={`${variant}`}
            class="w-48"
          />
        )}
      />

      {/* Features */}
      <ShowcaseSection title="Features" description="选择器的各种功能">
        <div class="flex flex-col gap-4 max-w-md">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground">With Clear</label>
            <Select
              options={fruitOptions}
              placeholder="Select with clear"
              allowClear
              defaultValue="apple"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground">With Search</label>
            <Select options={fruitOptions} placeholder="Search fruits..." />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground">Loading State</label>
            <Select options={[]} placeholder="Loading..." loading />
          </div>
        </div>
      </ShowcaseSection>

      {/* Disabled State */}
      <ShowcaseSection title="Disabled State" description="禁用状态">
        <div class="flex flex-col gap-4 max-w-md">
          <Select
            options={fruitOptions}
            placeholder="Disabled select"
            disabled
            defaultValue="apple"
          />
        </div>
      </ShowcaseSection>
    </div>
  )
}

