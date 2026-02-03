/**
 * Progress Component Showcase Page
 */

import {createSignal, onCleanup} from 'solid-js'
import {createFileRoute} from '@tanstack/solid-router'
import {Progress, Button, type ProgressVariants} from '@beeve/ui'
import {ShowcaseGrid, ShowcaseSection} from '../components/ShowcaseGrid'

const statuses: {
  value: NonNullable<ProgressVariants['status']>
  label: string
}[] = [
  {value: 'normal', label: 'Normal'},
  {value: 'success', label: 'Success'},
  {value: 'exception', label: 'Exception'},
  {value: 'active', label: 'Active'},
]

const sizes: {value: NonNullable<ProgressVariants['size']>; label: string}[] = [
  {value: 'sm', label: 'Small'},
  {value: 'md', label: 'Medium'},
  {value: 'lg', label: 'Large'},
]

function ProgressPage() {
  const [percent, setPercent] = createSignal(30)
  const [autoPercent, setAutoPercent] = createSignal(0)

  // Auto progress demo
  const interval = setInterval(() => {
    setAutoPercent((p) => (p >= 100 ? 0 : p + 10))
  }, 1000)
  onCleanup(() => clearInterval(interval))

  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Progress</h1>
        <p class="text-muted-foreground mt-2">
          进度条组件，展示操作的当前进度。
        </p>
      </div>

      {/* Status x Size Grid */}
      <ShowcaseGrid
        title="Status × Size"
        description="所有状态与尺寸的笛卡尔积组合"
        variant1={{name: 'Status', values: statuses}}
        variant2={{name: 'Size', values: sizes}}
        renderCell={(status, size) => (
          <div class="w-32">
            <Progress
              percent={60}
              status={status}
              size={size}
            />
          </div>
        )}
      />

      {/* Interactive */}
      <ShowcaseSection
        title="交互式进度"
        description="可以手动控制进度"
      >
        <div class="flex flex-col gap-4 w-full max-w-md">
          <Progress percent={percent()} />
          <div class="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPercent((p) => Math.max(0, p - 10))}
            >
              -10%
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPercent((p) => Math.min(100, p + 10))}
            >
              +10%
            </Button>
            <span class="ml-auto text-sm text-muted-foreground">
              {percent()}%
            </span>
          </div>
        </div>
      </ShowcaseSection>

      {/* Auto Progress */}
      <ShowcaseSection
        title="自动进度"
        description="自动递增的进度条"
      >
        <div class="w-full max-w-md">
          <Progress
            percent={autoPercent()}
            status="active"
          />
        </div>
      </ShowcaseSection>

      {/* Circle Progress */}
      <ShowcaseSection
        title="环形进度"
        description="圆形进度指示器"
      >
        <div class="flex flex-wrap gap-6">
          <Progress
            type="circle"
            percent={30}
            size="sm"
          />
          <Progress
            type="circle"
            percent={60}
            size="md"
          />
          <Progress
            type="circle"
            percent={100}
            size="lg"
          />
          <Progress
            type="circle"
            percent={50}
            status="exception"
          />
        </div>
      </ShowcaseSection>

      {/* Custom Format */}
      <ShowcaseSection
        title="自定义格式"
        description="自定义进度显示格式"
      >
        <div class="flex flex-wrap gap-6">
          <Progress
            type="circle"
            percent={75}
            format={(p) => `${p}分`}
          />
          <Progress
            percent={80}
            class="w-48"
            format={(p) => `已完成 ${p}%`}
          />
        </div>
      </ShowcaseSection>

      {/* Steps Progress */}
      <ShowcaseSection
        title="分段进度"
        description="分步骤的进度指示"
      >
        <div class="flex flex-col gap-4 w-full max-w-md">
          <Progress.Steps
            steps={5}
            current={2}
          />
          <Progress.Steps
            steps={5}
            current={4}
            status="success"
          />
          <Progress.Steps
            steps={5}
            current={3}
            status="exception"
          />
        </div>
      </ShowcaseSection>

      {/* Without Info */}
      <ShowcaseSection
        title="隐藏信息"
        description="不显示进度百分比"
      >
        <div class="w-full max-w-md">
          <Progress
            percent={60}
            showInfo={false}
          />
        </div>
      </ShowcaseSection>

      {/* Custom Colors */}
      <ShowcaseSection
        title="自定义颜色"
        description="自定义进度条颜色"
      >
        <div class="flex flex-col gap-4 w-full max-w-md">
          <Progress
            percent={40}
            strokeColor="#8b5cf6"
          />
          <Progress
            percent={60}
            strokeColor="#ec4899"
          />
          <Progress
            percent={80}
            strokeColor="#14b8a6"
          />
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/progress')({
  component: ProgressPage,
})
