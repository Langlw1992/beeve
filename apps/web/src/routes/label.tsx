/**
 * Label Component Showcase Page
 */

import { createFileRoute } from '@tanstack/solid-router'
import { Label, Input } from '@beeve/ui'
import { ShowcaseSection } from '../components/ShowcaseGrid'

function LabelPage() {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Label</h1>
        <p class="text-muted-foreground mt-2">表单标签组件，用于标识表单元素。</p>
      </div>

      {/* Basic */}
      <ShowcaseSection title="Basic" description="基本用法">
        <div class="flex flex-col gap-4 max-w-md">
          <div class="flex flex-col gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" />
          </div>
        </div>
      </ShowcaseSection>

      {/* Required */}
      <ShowcaseSection title="Required" description="必填标记">
        <div class="flex flex-col gap-4 max-w-md">
          <div class="flex flex-col gap-2">
            <Label for="username" required>
              Username
            </Label>
            <Input id="username" placeholder="Required field" />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="bio">Bio</Label>
            <Input id="bio" inputType="textarea" placeholder="Optional field" />
          </div>
        </div>
      </ShowcaseSection>

      {/* Disabled */}
      <ShowcaseSection title="Disabled" description="禁用状态">
        <div class="flex flex-col gap-4 max-w-md">
          <div class="flex flex-col gap-2">
            <Label for="disabled-input" disabled>
              Disabled Label
            </Label>
            <Input id="disabled-input" disabled placeholder="Disabled input" />
          </div>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/label')({
  component: LabelPage,
})

