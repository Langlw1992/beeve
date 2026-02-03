/**
 * @beeve/ui - Progress Stories
 */

import type {JSX} from 'solid-js'
import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {createSignal, onMount, onCleanup} from 'solid-js'
import {Progress} from './Progress'

/**
 * # Progress 进度条
 *
 * 展示操作的当前进度。
 *
 * ## 何时使用
 *
 * - 在操作需要较长时间才能完成时，为用户显示该操作的当前进度和状态
 * - 当一个操作会打断当前界面，或者需要在后台运行，且耗时可能超过 2 秒时
 * - 当需要显示一个操作完成的百分比时
 */
const meta = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

// ==================== 辅助组件 ====================

/** Story 区块 */
const Section = (props: {
  title: string
  description?: string
  children: JSX.Element
}) => (
  <div class="space-y-4">
    <div>
      <h3 class="text-sm font-medium text-foreground">{props.title}</h3>
      {props.description && (
        <p class="text-xs text-muted-foreground mt-1">{props.description}</p>
      )}
    </div>
    {props.children}
  </div>
)

// ==================== Stories ====================

/** 基础线性进度条 */
export const Basic: Story = {
  render: () => (
    <Section
      title="基础用法"
      description="不同百分比的进度显示"
    >
      <div class="w-[360px] space-y-5">
        <Progress percent={30} />
        <Progress percent={50} />
        <Progress percent={70} />
        <Progress percent={100} />
      </div>
    </Section>
  ),
}

/** 环形进度条 */
export const Circle: Story = {
  render: () => (
    <Section
      title="环形进度"
      description="圆环形式展示进度"
    >
      <div class="flex items-center gap-10">
        <Progress
          type="circle"
          percent={30}
        />
        <Progress
          type="circle"
          percent={70}
        />
        <Progress
          type="circle"
          percent={100}
        />
      </div>
    </Section>
  ),
}

/** 状态 */
export const Status: Story = {
  render: () => (
    <div class="space-y-10">
      <Section
        title="线性进度条状态"
        description="normal / success / exception / active"
      >
        <div class="w-[360px] space-y-5">
          <div class="space-y-1">
            <Progress
              percent={50}
              status="normal"
            />
            <p class="text-xs text-muted-foreground">normal</p>
          </div>
          <div class="space-y-1">
            <Progress
              percent={100}
              status="success"
            />
            <p class="text-xs text-muted-foreground">success</p>
          </div>
          <div class="space-y-1">
            <Progress
              percent={70}
              status="exception"
            />
            <p class="text-xs text-muted-foreground">exception</p>
          </div>
          <div class="space-y-1">
            <Progress
              percent={50}
              status="active"
            />
            <p class="text-xs text-muted-foreground">active（条纹动画）</p>
          </div>
        </div>
      </Section>

      <Section
        title="环形进度条状态"
        description="不同状态的环形进度"
      >
        <div class="flex items-center gap-8">
          <div class="text-center space-y-2">
            <Progress
              type="circle"
              percent={50}
              status="normal"
            />
            <p class="text-xs text-muted-foreground">normal</p>
          </div>
          <div class="text-center space-y-2">
            <Progress
              type="circle"
              percent={100}
              status="success"
            />
            <p class="text-xs text-muted-foreground">success</p>
          </div>
          <div class="text-center space-y-2">
            <Progress
              type="circle"
              percent={70}
              status="exception"
            />
            <p class="text-xs text-muted-foreground">exception</p>
          </div>
        </div>
      </Section>
    </div>
  ),
}

/** 尺寸 */
export const Sizes: Story = {
  render: () => (
    <div class="space-y-10">
      <Section
        title="线性进度条尺寸"
        description="sm / md / lg"
      >
        <div class="w-[360px] space-y-5">
          <div class="space-y-1">
            <Progress
              percent={50}
              size="sm"
            />
            <p class="text-xs text-muted-foreground">small</p>
          </div>
          <div class="space-y-1">
            <Progress
              percent={50}
              size="md"
            />
            <p class="text-xs text-muted-foreground">medium（默认）</p>
          </div>
          <div class="space-y-1">
            <Progress
              percent={50}
              size="lg"
            />
            <p class="text-xs text-muted-foreground">large</p>
          </div>
        </div>
      </Section>

      <Section
        title="环形进度条尺寸"
        description="不同尺寸的环形进度"
      >
        <div class="flex items-end gap-8">
          <div class="text-center space-y-2">
            <Progress
              type="circle"
              percent={75}
              size="sm"
            />
            <p class="text-xs text-muted-foreground">sm</p>
          </div>
          <div class="text-center space-y-2">
            <Progress
              type="circle"
              percent={75}
              size="md"
            />
            <p class="text-xs text-muted-foreground">md</p>
          </div>
          <div class="text-center space-y-2">
            <Progress
              type="circle"
              percent={75}
              size="lg"
            />
            <p class="text-xs text-muted-foreground">lg</p>
          </div>
        </div>
      </Section>
    </div>
  ),
}

/** 分段进度条 */
export const Steps: Story = {
  render: () => (
    <Section
      title="分段进度"
      description="步骤式进度展示"
    >
      <div class="w-[360px] space-y-5">
        <div class="space-y-1">
          <Progress.Steps
            steps={5}
            current={0}
          />
          <p class="text-xs text-muted-foreground">0 / 5</p>
        </div>
        <div class="space-y-1">
          <Progress.Steps
            steps={5}
            current={2}
          />
          <p class="text-xs text-muted-foreground">2 / 5</p>
        </div>
        <div class="space-y-1">
          <Progress.Steps
            steps={5}
            current={5}
            status="success"
          />
          <p class="text-xs text-muted-foreground">完成</p>
        </div>
        <div class="space-y-1">
          <Progress.Steps
            steps={5}
            current={3}
            status="exception"
          />
          <p class="text-xs text-muted-foreground">异常</p>
        </div>
      </div>
    </Section>
  ),
}

/** 自定义格式化 */
export const CustomFormat: Story = {
  render: () => (
    <div class="space-y-10">
      <Section
        title="自定义文字"
        description="format 函数自定义显示内容"
      >
        <div class="w-[360px] space-y-5">
          <Progress
            percent={100}
            format={() => '完成'}
          />
          <Progress
            percent={50}
            format={(p) => `${p}/100`}
          />
        </div>
      </Section>

      <Section
        title="环形自定义"
        description="支持 JSX 自定义内容"
      >
        <div class="flex items-center gap-8">
          <Progress
            type="circle"
            percent={75}
            format={(p) => (
              <div class="text-center">
                <div class="text-xl font-semibold">{p}</div>
                <div class="text-xs text-muted-foreground">分数</div>
              </div>
            )}
          />
          <Progress
            type="circle"
            percent={100}
            format={() => (
              <span class="text-green-500 font-medium">已完成</span>
            )}
          />
        </div>
      </Section>
    </div>
  ),
}

/** 隐藏进度信息 */
export const HideInfo: Story = {
  render: () => (
    <div class="space-y-10">
      <Section
        title="隐藏信息"
        description="showInfo={false} 隐藏百分比文字"
      >
        <div class="w-[360px] space-y-5">
          <Progress
            percent={50}
            showInfo={false}
          />
          <Progress
            percent={75}
            showInfo={false}
          />
        </div>
      </Section>

      <Section
        title="环形隐藏"
        description="只显示进度环"
      >
        <div class="flex items-center gap-8">
          <Progress
            type="circle"
            percent={50}
            showInfo={false}
          />
          <Progress
            type="circle"
            percent={75}
            showInfo={false}
          />
        </div>
      </Section>
    </div>
  ),
}

/** 自定义颜色 */
export const CustomColors: Story = {
  render: () => (
    <div class="space-y-10">
      <Section
        title="自定义颜色"
        description="strokeColor 和 trailColor"
      >
        <div class="w-[360px] space-y-5">
          <Progress
            percent={50}
            strokeColor="#8b5cf6"
          />
          <Progress
            percent={75}
            strokeColor="#ec4899"
          />
          <Progress
            percent={60}
            strokeColor="#f97316"
            trailColor="#fed7aa"
          />
        </div>
      </Section>

      <Section
        title="环形自定义颜色"
        description="支持各种颜色"
      >
        <div class="flex items-center gap-8">
          <Progress
            type="circle"
            percent={75}
            strokeColor="#8b5cf6"
          />
          <Progress
            type="circle"
            percent={75}
            strokeColor="#ec4899"
          />
          <Progress
            type="circle"
            percent={75}
            strokeColor="#10b981"
          />
        </div>
      </Section>
    </div>
  ),
}

/** 动态进度 */
export const Dynamic: Story = {
  render: () => {
    const [percent, setPercent] = createSignal(0)

    onMount(() => {
      const timer = setInterval(() => {
        setPercent((p) => {
          if (p >= 100) {
            return 0
          }
          return p + 10
        })
      }, 500)

      onCleanup(() => clearInterval(timer))
    })

    return (
      <Section
        title="动态进度"
        description="自动递增演示"
      >
        <div class="space-y-8">
          <div class="w-[360px]">
            <Progress
              percent={percent()}
              status={percent() >= 100 ? 'success' : 'active'}
            />
          </div>

          <div class="flex justify-center">
            <Progress
              type="circle"
              percent={percent()}
              status={percent() >= 100 ? 'success' : 'normal'}
            />
          </div>
        </div>
      </Section>
    )
  },
}

/** 步骤进度示例 */
export const StepsExample: Story = {
  render: () => {
    const [current, setCurrent] = createSignal(0)

    onMount(() => {
      const timer = setInterval(() => {
        setCurrent((c) => {
          if (c >= 5) {
            return 0
          }
          return c + 1
        })
      }, 800)

      onCleanup(() => clearInterval(timer))
    })

    return (
      <Section
        title="步骤动画"
        description="自动步进演示"
      >
        <div class="w-[360px] space-y-3">
          <Progress.Steps
            steps={5}
            current={current()}
          />
          <p class="text-sm text-muted-foreground text-center">
            步骤 {current()} / 5
          </p>
        </div>
      </Section>
    )
  },
}
