/**
 * @beeve/ui - Tabs Component Stories
 * 选项卡组件故事
 */

import type {Meta, StoryObj} from 'storybook-solidjs'
import {Tabs, TabsList, TabsTrigger, TabsContent, TabsIndicator} from './Tabs'
import {Badge} from '../Badge'
import {Input} from '../Input'
import {createSignal, For} from 'solid-js'
import {FileText, Image, Music, Video, Settings} from 'lucide-solid'

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'filled', 'card', 'pill', 'underline'],
      description: '样式变体',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '尺寸',
    },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: '布局方向',
    },
    activationMode: {
      control: 'radio',
      options: ['automatic', 'manual'],
      description: '激活模式',
    },
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

// ==================== Default ====================

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">账户</TabsTrigger>
        <TabsTrigger value="tab2">密码</TabsTrigger>
        <TabsTrigger value="tab3">通知</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>管理你的账户设置和偏好。</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>更改你的密码。</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>配置如何接收通知。</p>
      </TabsContent>
    </Tabs>
  ),
}

// ==================== Sizes ====================

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-8">
      <div>
        <h3 class="text-sm font-medium mb-2">Small (sm) - 用于密集场景</h3>
        <Tabs
          defaultValue="tab1"
          size="sm"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p>Small 尺寸的内容</p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 class="text-sm font-medium mb-2">Medium (md) - 默认尺寸</h3>
        <Tabs
          defaultValue="tab1"
          size="md"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p>Medium 尺寸的内容</p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 class="text-sm font-medium mb-2">Large (lg) - 用于主要操作</h3>
        <Tabs
          defaultValue="tab1"
          size="lg"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p>Large 尺寸的内容</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
}

// ==================== Variants ====================

export const Variants: Story = {
  render: () => (
    <div class="flex flex-col gap-8">
      <div>
        <h3 class="text-sm font-medium mb-2">Default - 简洁样式</h3>
        <Tabs
          defaultValue="tab1"
          variant="default"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h3 class="text-sm font-medium mb-2">Filled - 填充背景</h3>
        <Tabs
          defaultValue="tab1"
          variant="filled"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h3 class="text-sm font-medium mb-2">Card - 卡片样式</h3>
        <Tabs
          defaultValue="tab1"
          variant="card"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h3 class="text-sm font-medium mb-2">
          Pill - 胶囊样式（类似 Segments）
        </h3>
        <Tabs
          defaultValue="tab1"
          variant="pill"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h3 class="text-sm font-medium mb-2">Underline - 下划线样式</h3>
        <Tabs
          defaultValue="tab1"
          variant="underline"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
            <TabsIndicator />
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
}

// ==================== Vertical ====================

export const Vertical: Story = {
  render: () => (
    <div class="flex gap-8">
      <div class="flex-1">
        <h3 class="text-sm font-medium mb-2">垂直布局 - Default</h3>
        <Tabs
          defaultValue="tab1"
          orientation="vertical"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p>账户设置内容</p>
          </TabsContent>
          <TabsContent value="tab2">
            <p>密码设置内容</p>
          </TabsContent>
          <TabsContent value="tab3">
            <p>通知设置内容</p>
          </TabsContent>
        </Tabs>
      </div>

      <div class="flex-1">
        <h3 class="text-sm font-medium mb-2">垂直布局 - Filled</h3>
        <Tabs
          defaultValue="tab1"
          orientation="vertical"
          variant="filled"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p>账户设置内容</p>
          </TabsContent>
          <TabsContent value="tab2">
            <p>密码设置内容</p>
          </TabsContent>
          <TabsContent value="tab3">
            <p>通知设置内容</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
}

// ==================== Disabled ====================

export const Disabled: Story = {
  render: () => (
    <div class="flex flex-col gap-8">
      <div>
        <h3 class="text-sm font-medium mb-2">部分禁用</h3>
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">可用</TabsTrigger>
            <TabsTrigger
              value="tab2"
              disabled
            >
              禁用
            </TabsTrigger>
            <TabsTrigger value="tab3">可用</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p>第一个标签页内容</p>
          </TabsContent>
          <TabsContent value="tab3">
            <p>第三个标签页内容</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
}

// ==================== Controlled ====================

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal('tab1')

    return (
      <div class="flex flex-col gap-4">
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3 py-1 text-sm bg-primary text-white rounded"
            onClick={() => setValue('tab1')}
          >
            切换到账户
          </button>
          <button
            type="button"
            class="px-3 py-1 text-sm bg-primary text-white rounded"
            onClick={() => setValue('tab2')}
          >
            切换到密码
          </button>
          <button
            type="button"
            class="px-3 py-1 text-sm bg-primary text-white rounded"
            onClick={() => setValue('tab3')}
          >
            切换到通知
          </button>
        </div>

        <p class="text-sm text-muted-foreground">当前值: {value()}</p>

        <Tabs
          value={value()}
          onValueChange={(details) => setValue(details.value)}
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p>账户设置内容</p>
          </TabsContent>
          <TabsContent value="tab2">
            <p>密码设置内容</p>
          </TabsContent>
          <TabsContent value="tab3">
            <p>通知设置内容</p>
          </TabsContent>
        </Tabs>
      </div>
    )
  },
}

// ==================== LazyMount ====================

export const LazyMount: Story = {
  render: () => {
    const LazyContent = (props: {name: string}) => {
      console.log(`[LazyMount] ${props.name} 组件已挂载`)
      return (
        <div class="p-4 border rounded">
          <p>
            这是 <strong>{props.name}</strong> 的内容
          </p>
          <p class="text-sm text-muted-foreground mt-2">
            打开控制台查看挂载日志
          </p>
        </div>
      )
    }

    return (
      <div class="flex flex-col gap-4">
        <div class="p-3 bg-blue-50 dark:bg-blue-950 rounded text-sm">
          <p class="font-medium">💡 懒加载演示</p>
          <p class="text-muted-foreground mt-1">
            首次切换到 tab 时才会挂载内容，打开控制台查看挂载日志。
          </p>
        </div>

        <Tabs
          defaultValue="tab1"
          lazyMount
        >
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2 (懒加载)</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3 (懒加载)</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <LazyContent name="Tab 1" />
          </TabsContent>
          <TabsContent value="tab2">
            <LazyContent name="Tab 2" />
          </TabsContent>
          <TabsContent value="tab3">
            <LazyContent name="Tab 3" />
          </TabsContent>
        </Tabs>
      </div>
    )
  },
}

// ==================== KeepAlive ====================

export const KeepAlive: Story = {
  render: () => (
    <div class="flex flex-col gap-4">
      <div class="p-3 bg-green-50 dark:bg-green-950 rounded text-sm">
        <p class="font-medium">✨ Keep-alive 演示</p>
        <p class="text-muted-foreground mt-1">
          切换 tab 后，输入框的内容会保持不丢失。
        </p>
      </div>

      <Tabs
        defaultValue="tab1"
        keepAlive
        lazyMount
      >
        <TabsList>
          <TabsTrigger value="tab1">表单 1</TabsTrigger>
          <TabsTrigger value="tab2">表单 2</TabsTrigger>
          <TabsTrigger value="tab3">表单 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <div class="space-y-2">
            <Input placeholder="在这里输入内容..." />
            <p class="text-sm text-muted-foreground">
              切换到其他 tab 后再回来，内容仍然保留
            </p>
          </div>
        </TabsContent>
        <TabsContent value="tab2">
          <div class="space-y-2">
            <Input placeholder="表单 2 的输入框..." />
            <p class="text-sm text-muted-foreground">
              每个 tab 的状态都独立保存
            </p>
          </div>
        </TabsContent>
        <TabsContent value="tab3">
          <div class="space-y-2">
            <Input placeholder="表单 3 的输入框..." />
            <p class="text-sm text-muted-foreground">
              适合需要保持表单状态的场景
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

// ==================== UnmountOnExit ====================

export const UnmountOnExit: Story = {
  render: () => (
    <div class="flex flex-col gap-4">
      <div class="p-3 bg-amber-50 dark:bg-amber-950 rounded text-sm">
        <p class="font-medium">🗑️ 卸载控制演示</p>
        <p class="text-muted-foreground mt-1">
          离开 tab 后内容会被卸载，切换回来时重新初始化。
        </p>
      </div>

      <Tabs
        defaultValue="tab1"
        unmountOnExit
      >
        <TabsList>
          <TabsTrigger value="tab1">表单 1</TabsTrigger>
          <TabsTrigger value="tab2">表单 2</TabsTrigger>
          <TabsTrigger value="tab3">表单 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <div class="space-y-2">
            <Input placeholder="输入内容后切换 tab..." />
            <p class="text-sm text-muted-foreground">
              切换后内容会丢失（节省内存）
            </p>
          </div>
        </TabsContent>
        <TabsContent value="tab2">
          <div class="space-y-2">
            <Input placeholder="表单 2 的输入框..." />
            <p class="text-sm text-muted-foreground">每次进入都是全新的状态</p>
          </div>
        </TabsContent>
        <TabsContent value="tab3">
          <div class="space-y-2">
            <Input placeholder="表单 3 的输入框..." />
            <p class="text-sm text-muted-foreground">
              适合一次性内容，不需要保持状态
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

// ==================== Complex ====================

export const Complex: Story = {
  render: () => (
    <Tabs
      defaultValue="documents"
      variant="default"
    >
      <TabsList>
        <TabsTrigger
          value="documents"
          class="gap-2"
        >
          <FileText class="size-4" />
          文档
          <Badge size="sm">12</Badge>
        </TabsTrigger>
        <TabsTrigger
          value="images"
          class="gap-2"
        >
          <Image class="size-4" />
          图片
          <Badge size="sm">8</Badge>
        </TabsTrigger>
        <TabsTrigger
          value="music"
          class="gap-2"
        >
          <Music class="size-4" />
          音乐
          <Badge size="sm">24</Badge>
        </TabsTrigger>
        <TabsTrigger
          value="videos"
          class="gap-2"
        >
          <Video class="size-4" />
          视频
          <Badge size="sm">3</Badge>
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          disabled
          class="gap-2"
        >
          <Settings class="size-4" />
          设置
        </TabsTrigger>
      </TabsList>
      <TabsContent value="documents">
        <div class="p-4 border rounded">
          <p class="font-medium">文档文件夹</p>
          <p class="text-sm text-muted-foreground mt-1">包含 12 个文档</p>
        </div>
      </TabsContent>
      <TabsContent value="images">
        <div class="p-4 border rounded">
          <p class="font-medium">图片文件夹</p>
          <p class="text-sm text-muted-foreground mt-1">包含 8 张图片</p>
        </div>
      </TabsContent>
      <TabsContent value="music">
        <div class="p-4 border rounded">
          <p class="font-medium">音乐文件夹</p>
          <p class="text-sm text-muted-foreground mt-1">包含 24 首音乐</p>
        </div>
      </TabsContent>
      <TabsContent value="videos">
        <div class="p-4 border rounded">
          <p class="font-medium">视频文件夹</p>
          <p class="text-sm text-muted-foreground mt-1">包含 3 个视频</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
}

// ==================== Performance ====================

export const Performance: Story = {
  render: () => {
    const tabs = Array.from({length: 50}, (_, i) => ({
      value: `tab-${i + 1}`,
      label: `Tab ${i + 1}`,
    }))

    return (
      <div class="flex flex-col gap-4">
        <div class="p-3 bg-purple-50 dark:bg-purple-950 rounded text-sm">
          <p class="font-medium">⚡ 性能优化演示</p>
          <p class="text-muted-foreground mt-1">
            50 个 tabs + 懒加载，只有激活的 tab 会渲染内容。
          </p>
        </div>

        <Tabs
          defaultValue="tab-1"
          lazyMount
          size="sm"
        >
          <TabsList class="flex-wrap">
            <For each={tabs}>
              {(tab) => (
                <TabsTrigger value={tab.value}>{tab.label}</TabsTrigger>
              )}
            </For>
          </TabsList>
          <For each={tabs}>
            {(tab) => (
              <TabsContent value={tab.value}>
                <div class="p-4 border rounded">
                  <p>
                    这是 <strong>{tab.label}</strong> 的内容
                  </p>
                  <p class="text-sm text-muted-foreground mt-2">
                    首次切换到这里时才挂载此内容
                  </p>
                </div>
              </TabsContent>
            )}
          </For>
        </Tabs>
      </div>
    )
  },
}

// ==================== WithIndicator ====================

export const WithIndicator: Story = {
  render: () => (
    <div class="flex flex-col gap-8">
      <div>
        <h3 class="text-sm font-medium mb-2">Default + Indicator</h3>
        <Tabs
          defaultValue="tab1"
          variant="default"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
            <TabsIndicator />
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h3 class="text-sm font-medium mb-2">Underline + Indicator</h3>
        <Tabs
          defaultValue="tab1"
          variant="underline"
        >
          <TabsList>
            <TabsTrigger value="tab1">账户</TabsTrigger>
            <TabsTrigger value="tab2">密码</TabsTrigger>
            <TabsTrigger value="tab3">通知</TabsTrigger>
            <TabsIndicator />
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
}
