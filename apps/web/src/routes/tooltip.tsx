/**
 * Tooltip Component Showcase Page
 */

import {createFileRoute} from '@tanstack/solid-router'
import {Tooltip, Button} from '@beeve/ui'
import {ShowcaseSection} from '../components/ShowcaseGrid'

function TooltipPage() {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Tooltip</h1>
        <p class="text-muted-foreground mt-2">
          文字提示组件，在鼠标悬停时显示额外信息。
        </p>
      </div>

      {/* Basic */}
      <ShowcaseSection
        title="Basic"
        description="基本用法"
      >
        <div class="flex gap-4">
          <Tooltip content="This is a tooltip">
            <Button variant="outline">Hover me</Button>
          </Tooltip>
          <Tooltip content="Another tooltip with more text content">
            <Button variant="outline">Hover me too</Button>
          </Tooltip>
        </div>
      </ShowcaseSection>

      {/* Placement */}
      <ShowcaseSection
        title="Placement"
        description="不同位置"
      >
        <div class="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div />
          <Tooltip
            content="Top"
            positioning={{placement: 'top'}}
          >
            <Button
              variant="outline"
              class="w-full"
            >
              Top
            </Button>
          </Tooltip>
          <div />

          <Tooltip
            content="Left"
            positioning={{placement: 'left'}}
          >
            <Button
              variant="outline"
              class="w-full"
            >
              Left
            </Button>
          </Tooltip>
          <div />
          <Tooltip
            content="Right"
            positioning={{placement: 'right'}}
          >
            <Button
              variant="outline"
              class="w-full"
            >
              Right
            </Button>
          </Tooltip>

          <div />
          <Tooltip
            content="Bottom"
            positioning={{placement: 'bottom'}}
          >
            <Button
              variant="outline"
              class="w-full"
            >
              Bottom
            </Button>
          </Tooltip>
          <div />
        </div>
      </ShowcaseSection>

      {/* With Arrow */}
      <ShowcaseSection
        title="With Arrow"
        description="带箭头"
      >
        <div class="flex gap-4">
          <Tooltip
            content="Tooltip with arrow"
            arrow
          >
            <Button variant="outline">With Arrow</Button>
          </Tooltip>
          <Tooltip content="Without arrow">
            <Button variant="outline">Without Arrow</Button>
          </Tooltip>
        </div>
      </ShowcaseSection>

      {/* Rich Content */}
      <ShowcaseSection
        title="Rich Content"
        description="丰富内容"
      >
        <div class="flex gap-4">
          <Tooltip
            content={
              <div class="flex flex-col gap-1">
                <div class="font-semibold">Title</div>
                <div class="text-xs opacity-80">
                  Additional information here
                </div>
              </div>
            }
          >
            <Button variant="outline">Rich Content</Button>
          </Tooltip>
          <Tooltip
            content={<span class="text-yellow-500">⚠️ Warning message</span>}
          >
            <Button variant="outline">With Icon</Button>
          </Tooltip>
        </div>
      </ShowcaseSection>

      {/* On Different Elements */}
      <ShowcaseSection
        title="On Different Elements"
        description="不同元素上使用"
      >
        <div class="flex items-center gap-6">
          <Tooltip content="Text tooltip">
            <span class="underline decoration-dashed cursor-help">
              Hover this text
            </span>
          </Tooltip>
          <Tooltip content="Icon tooltip">
            <span class="text-2xl cursor-pointer">🎯</span>
          </Tooltip>
          <Tooltip content="Badge tooltip">
            <span class="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">
              Badge
            </span>
          </Tooltip>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/tooltip')({
  component: TooltipPage,
})
