import { Progress } from '@beeve/ui'
import { createSignal, onCleanup } from 'solid-js'
import { DemoBox } from '../DemoBox'

export function ProgressBasic() {
  return (
    <DemoBox title="基础进度条" class="flex-col items-stretch">
      <Progress percent={60} />
    </DemoBox>
  )
}

export function ProgressVariants() {
  return (
    <DemoBox title="进度条变体" class="flex-col items-stretch gap-4">
      <div class="space-y-2">
        <span class="text-sm">默认</span>
        <Progress percent={60} />
      </div>
      <div class="space-y-2">
        <span class="text-sm">成功</span>
        <Progress percent={100} status="success" />
      </div>
      <div class="space-y-2">
        <span class="text-sm">警告</span>
        <Progress percent={75} status="active" />
      </div>
      <div class="space-y-2">
        <span class="text-sm">错误</span>
        <Progress percent={30} status="exception" />
      </div>
    </DemoBox>
  )
}

export function ProgressSizes() {
  return (
    <DemoBox title="进度条尺寸" class="flex-col items-stretch gap-4">
      <div class="space-y-2">
        <span class="text-sm">小</span>
        <Progress percent={60} size="sm" />
      </div>
      <div class="space-y-2">
        <span class="text-sm">中</span>
        <Progress percent={60} size="md" />
      </div>
      <div class="space-y-2">
        <span class="text-sm">大</span>
        <Progress percent={60} size="lg" />
      </div>
    </DemoBox>
  )
}

export function ProgressAnimated() {
  const [percent, setPercent] = createSignal(0)

  const interval = setInterval(() => {
    setPercent((v) => (v >= 100 ? 0 : v + 10))
  }, 500)

  onCleanup(() => clearInterval(interval))

  return (
    <DemoBox title="动画进度条" class="flex-col items-stretch">
      <Progress percent={percent()} />
      <p class="mt-2 text-sm text-muted-foreground">
        进度: {percent()}%
      </p>
    </DemoBox>
  )
}

export function ProgressIndeterminate() {
  return (
    <DemoBox title="不确定进度" class="flex-col items-stretch">
      <Progress indeterminate />
    </DemoBox>
  )
}

export function ProgressWithLabel() {
  return (
    <DemoBox title="带标签进度条" class="flex-col items-stretch gap-4">
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span>上传进度</span>
          <span>45%</span>
        </div>
        <Progress percent={45} />
      </div>
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span>下载完成</span>
          <span>100%</span>
        </div>
        <Progress percent={100} status="success" />
      </div>
    </DemoBox>
  )
}
