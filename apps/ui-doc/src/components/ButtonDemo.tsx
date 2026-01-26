import { Button } from '@beeve/ui'
import { createSignal } from 'solid-js'
import { PlusIcon, UploadIcon, ChevronRightIcon, TrashIcon } from 'lucide-solid'

export function ButtonVariants() {
  return (
    <div class="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}

export function ButtonSizes() {
  return (
    <div class="flex flex-wrap items-center gap-4">
      <Button size="lg">Large</Button>
      <Button size="md">Medium</Button>
      <Button size="sm">Small</Button>
      <Button size="icon">
        <PlusIcon class="size-4" />
      </Button>
    </div>
  )
}

export function ButtonDisabled() {
  return (
    <div class="flex flex-wrap gap-4">
      <Button disabled>Primary</Button>
      <Button variant="secondary" disabled>Secondary</Button>
      <Button variant="outline" disabled>Outline</Button>
      <Button variant="destructive" disabled>Destructive</Button>
    </div>
  )
}

export function ButtonLoading() {
  const [loading, setLoading] = createSignal(false)

  const handleClick = async () => {
    setLoading(true)
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
  }

  return (
    <div class="flex flex-wrap items-center gap-4">
      <Button loading>Loading</Button>
      <Button loading variant="secondary">Loading</Button>
      <Button loading={loading()} onClick={handleClick}>
        {loading() ? '提交中...' : '点击加载'}
      </Button>
    </div>
  )
}

export function ButtonWithIcon() {
  return (
    <div class="flex flex-wrap gap-4">
      <Button>
        <PlusIcon class="size-4" />
        新建
      </Button>

      <Button variant="outline">
        <UploadIcon class="size-4" />
        上传
      </Button>

      <Button variant="secondary">
        设置
        <ChevronRightIcon class="size-4" />
      </Button>

      <Button variant="destructive">
        <TrashIcon class="size-4" />
        删除
      </Button>
    </div>
  )
}

export function ButtonGroup() {
  return (
    <div class="flex flex-col gap-4">
      <div class="flex gap-3">
        <Button variant="outline">取消</Button>
        <Button>确定</Button>
      </div>

      <div class="flex gap-3">
        <Button variant="ghost">重置</Button>
        <Button variant="outline">保存草稿</Button>
        <Button>提交</Button>
      </div>

      <div class="flex gap-3">
        <Button variant="outline">取消</Button>
        <Button variant="destructive">确认删除</Button>
      </div>
    </div>
  )
}
