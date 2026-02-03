/**
 * Skeleton Component Showcase Page
 */

import {createFileRoute} from '@tanstack/solid-router'
import {Skeleton, Card} from '@beeve/ui'
import {ShowcaseSection} from '../components/ShowcaseGrid'

function SkeletonPage() {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Skeleton</h1>
        <p class="text-muted-foreground mt-2">
          骨架屏组件，用于内容加载时的占位效果。
        </p>
      </div>

      {/* Basic */}
      <ShowcaseSection
        title="基础用法"
        description="基础的骨架屏元素"
      >
        <div class="flex flex-col gap-3 w-full max-w-md">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
        </div>
      </ShowcaseSection>

      {/* Shapes */}
      <ShowcaseSection
        title="不同形状"
        description="支持圆形、方形等形状"
      >
        <div class="flex items-center gap-4">
          <Skeleton class="size-12 rounded-full" />
          <Skeleton class="size-12 rounded" />
          <Skeleton class="h-12 w-24 rounded" />
        </div>
      </ShowcaseSection>

      {/* Text Skeleton */}
      <ShowcaseSection
        title="段落骨架屏"
        description="使用 Skeleton.Text 快速创建段落"
      >
        <div class="flex gap-8">
          <div class="w-48">
            <Skeleton.Text rows={3} />
          </div>
          <div class="w-48">
            <Skeleton.Text rows={5} />
          </div>
        </div>
      </ShowcaseSection>

      {/* Avatar Skeleton */}
      <ShowcaseSection
        title="头像骨架屏"
        description="不同尺寸的头像占位"
      >
        <div class="flex items-center gap-4">
          <Skeleton.Avatar size="sm" />
          <Skeleton.Avatar size="md" />
          <Skeleton.Avatar size="lg" />
          <Skeleton.Avatar size={64} />
        </div>
      </ShowcaseSection>

      {/* Button Skeleton */}
      <ShowcaseSection
        title="按钮骨架屏"
        description="按钮形状的占位"
      >
        <div class="flex items-center gap-4">
          <Skeleton.Button size="sm" />
          <Skeleton.Button size="md" />
          <Skeleton.Button size="lg" />
        </div>
      </ShowcaseSection>

      {/* Image Skeleton */}
      <ShowcaseSection
        title="图片骨架屏"
        description="不同宽高比的图片占位"
      >
        <div class="flex gap-4">
          <div class="w-24">
            <Skeleton.Image aspectRatio="1:1" />
          </div>
          <div class="w-32">
            <Skeleton.Image aspectRatio="4:3" />
          </div>
          <div class="w-40">
            <Skeleton.Image aspectRatio="16:9" />
          </div>
        </div>
      </ShowcaseSection>

      {/* Paragraph Skeleton */}
      <ShowcaseSection
        title="带标题的段落"
        description="包含标题和内容的组合"
      >
        <div class="w-64">
          <Skeleton.Paragraph
            title
            rows={3}
          />
        </div>
      </ShowcaseSection>

      {/* Card Skeleton */}
      <ShowcaseSection
        title="卡片骨架屏"
        description="完整的卡片加载占位"
      >
        <Card class="w-80">
          <div class="flex items-center gap-3 mb-4">
            <Skeleton class="size-10 rounded-full" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-3 w-16" />
            </div>
          </div>
          <div class="space-y-2">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-3/4" />
          </div>
        </Card>
      </ShowcaseSection>

      {/* List Skeleton */}
      <ShowcaseSection
        title="列表骨架屏"
        description="列表项的加载占位"
      >
        <div class="w-80 space-y-0">
          {[1, 2, 3].map(() => (
            <div class="flex items-center gap-4 py-3 border-b last:border-b-0">
              <Skeleton class="size-12 rounded" />
              <div class="flex-1 space-y-2">
                <Skeleton class="h-4 w-1/3" />
                <Skeleton class="h-3 w-2/3" />
              </div>
              <Skeleton class="h-8 w-16 rounded" />
            </div>
          ))}
        </div>
      </ShowcaseSection>

      {/* Animation Types */}
      <ShowcaseSection
        title="动画类型"
        description="支持不同的动画效果"
      >
        <div class="flex flex-col gap-4 w-full max-w-md">
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground w-16">Pulse</span>
            <Skeleton
              animation="pulse"
              class="h-4 flex-1"
            />
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground w-16">Wave</span>
            <Skeleton
              animation="wave"
              class="h-4 flex-1"
            />
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground w-16">None</span>
            <Skeleton
              animation="none"
              class="h-4 flex-1"
            />
          </div>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/skeleton')({
  component: SkeletonPage,
})
