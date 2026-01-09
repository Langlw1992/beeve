import { Skeleton, Card } from '@beeve/ui'
import { DemoBox } from '../DemoBox'

export function SkeletonBasic() {
  return (
    <DemoBox title="基础骨架屏" class="flex-col items-stretch gap-3">
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-3/4" />
      <Skeleton class="h-4 w-1/2" />
    </DemoBox>
  )
}

export function SkeletonShapes() {
  return (
    <DemoBox title="不同形状">
      <Skeleton class="size-12 rounded-full" />
      <Skeleton class="size-12 rounded" />
      <Skeleton class="h-12 w-24 rounded" />
      <Skeleton class="h-12 w-32 rounded-lg" />
    </DemoBox>
  )
}

export function SkeletonCard() {
  return (
    <DemoBox title="卡片骨架屏">
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
        <div class="mt-4">
          <Skeleton class="h-9 w-20" />
        </div>
      </Card>
    </DemoBox>
  )
}

export function SkeletonList() {
  return (
    <DemoBox title="列表骨架屏" class="flex-col items-stretch">
      {[1, 2, 3].map(() => (
        <div class="flex items-center gap-4 py-3">
          <Skeleton class="size-12 rounded" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-4 w-1/3" />
            <Skeleton class="h-3 w-2/3" />
          </div>
          <Skeleton class="h-8 w-16 rounded" />
        </div>
      ))}
    </DemoBox>
  )
}

export function SkeletonProfile() {
  return (
    <DemoBox title="个人资料骨架屏" class="flex-col items-center">
      <Skeleton class="size-24 rounded-full" />
      <Skeleton class="mt-4 h-6 w-32" />
      <Skeleton class="mt-2 h-4 w-48" />
      <div class="mt-4 flex gap-2">
        <Skeleton class="h-9 w-24 rounded" />
        <Skeleton class="h-9 w-24 rounded" />
      </div>
    </DemoBox>
  )
}

export function SkeletonParagraph() {
  return (
    <DemoBox title="段落骨架屏" class="flex-col items-stretch gap-4">
      <div class="space-y-2">
        <span class="text-sm">3 行</span>
        <Skeleton.Text rows={3} />
      </div>
      <div class="space-y-2">
        <span class="text-sm">5 行</span>
        <Skeleton.Text rows={5} />
      </div>
    </DemoBox>
  )
}

export function SkeletonAvatar() {
  return (
    <DemoBox title="头像骨架屏">
      <Skeleton.Avatar size="sm" />
      <Skeleton.Avatar size="md" />
      <Skeleton.Avatar size="lg" />
      <Skeleton.Avatar size={64} />
    </DemoBox>
  )
}
