/**
 * Input Component Showcase Page
 */

import { type Component } from 'solid-js'
import { Input, type InputVariants } from '@beeve/ui'
import { ShowcaseGrid, ShowcaseSection } from '../components/ShowcaseGrid'

const variants: { value: NonNullable<InputVariants['variant']>; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'filled', label: 'Filled' },
  { value: 'borderless', label: 'Borderless' },
]

const sizes: { value: NonNullable<InputVariants['size']>; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

const statuses = [
  { value: 'normal', label: 'Normal' },
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
]

export const InputPage: Component = () => {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Input</h1>
        <p class="text-muted-foreground mt-2">
          输入框组件，支持 text、textarea、number 三种模式。
        </p>
      </div>

      {/* Variant x Size */}
      <ShowcaseGrid
        title="Variant × Size"
        description="样式变体与尺寸的笛卡尔积组合"
        variant1={{ name: 'Variant', values: variants }}
        variant2={{ name: 'Size', values: sizes }}
        renderCell={(variant, size) => (
          <Input variant={variant} size={size} placeholder={`${variant} ${size}`} class="w-48" />
        )}
      />

      {/* Variant x Status */}
      <ShowcaseGrid
        title="Variant × Status"
        description="样式变体与状态的笛卡尔积组合"
        variant1={{ name: 'Variant', values: variants }}
        variant2={{ name: 'Status', values: statuses }}
        renderCell={(variant, status) => (
          <Input
            variant={variant}
            status={status === 'normal' ? undefined : (status as 'error' | 'warning')}
            placeholder={`${variant}`}
            class="w-48"
          />
        )}
      />

      {/* Input Types */}
      <ShowcaseSection title="Input Types" description="不同的输入模式">
        <div class="flex flex-col gap-4 max-w-md">
          <Input placeholder="Text input" />
          <Input type="password" placeholder="Password input" />
          <Input inputType="number" placeholder="Number input" showControls min={0} max={100} />
          <Input inputType="textarea" placeholder="Textarea input" rows={3} />
        </div>
      </ShowcaseSection>

      {/* Features */}
      <ShowcaseSection title="Features" description="输入框的各种功能">
        <div class="flex flex-col gap-4 max-w-md">
          <Input placeholder="With clear button" allowClear defaultValue="Clear me" />
          <Input placeholder="With character count" showCount maxLength={50} />
          <Input prefix={<span>🔍</span>} placeholder="With prefix" />
          <Input suffix={<span>@gmail.com</span>} placeholder="With suffix" />
          <Input
            inputType="textarea"
            placeholder="Textarea with count"
            showCount
            maxLength={200}
            rows={3}
          />
        </div>
      </ShowcaseSection>

      {/* Disabled State */}
      <ShowcaseSection title="Disabled State" description="禁用状态">
        <div class="flex flex-col gap-4 max-w-md">
          <Input disabled placeholder="Disabled input" defaultValue="Cannot edit" />
          <Input
            inputType="textarea"
            disabled
            placeholder="Disabled textarea"
            defaultValue="Cannot edit"
          />
        </div>
      </ShowcaseSection>
    </div>
  )
}

