/**
 * Presence Component Showcase Page
 */

import { createSignal } from 'solid-js'
import { createFileRoute } from '@tanstack/solid-router'
import { Presence, Button } from '@beeve/ui'
import { ShowcaseSection } from '../components/ShowcaseGrid'

function PresencePage() {
  const [basic, setBasic] = createSignal(true)
  const [animated, setAnimated] = createSignal(true)
  const [lazy, setLazy] = createSignal(false)
  const [unmount, setUnmount] = createSignal(true)
  const [callback, setCallback] = createSignal(true)
  const [callbackMsg, setCallbackMsg] = createSignal('')
  const [renderProps, setRenderProps] = createSignal(true)

  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Presence</h1>
        <p class="text-muted-foreground mt-2">
          存在状态组件，用于处理元素的进入/退出动画。
        </p>
      </div>

      {/* Basic */}
      <ShowcaseSection title="基础用法" description="控制元素的显示/隐藏">
        <div class="flex flex-col gap-4 w-full max-w-md">
          <Button onClick={() => setBasic(!basic())}>
            {basic() ? '隐藏' : '显示'}
          </Button>
          <Presence present={basic()}>
            <div class="p-4 bg-primary/10 rounded-md border border-primary/20">
              这是一个受控显示的内容区域
            </div>
          </Presence>
        </div>
      </ShowcaseSection>

      {/* With Animation */}
      <ShowcaseSection title="带动画效果" description="配合 CSS 动画实现进入/退出效果">
        <div class="flex flex-col gap-4 w-full max-w-md">
          <Button onClick={() => setAnimated(!animated())}>
            {animated() ? '隐藏' : '显示'}
          </Button>
          <Presence present={animated()} unmountOnExit>
            <div
              class="p-4 bg-primary/10 rounded-md border border-primary/20 transition-all duration-300 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-2"
            >
              带有淡入淡出和滑动动画的内容
            </div>
          </Presence>
        </div>
      </ShowcaseSection>

      {/* Lazy Mount */}
      <ShowcaseSection title="懒加载" description="首次显示时才挂载元素">
        <div class="flex flex-col gap-4 w-full max-w-md">
          <Button onClick={() => setLazy(!lazy())}>
            {lazy() ? '隐藏' : '显示'}
          </Button>
          <Presence present={lazy()} lazyMount>
            <div class="p-4 bg-primary/10 rounded-md border border-primary/20">
              这个内容只有在首次点击显示时才会被挂载到 DOM
            </div>
          </Presence>
        </div>
      </ShowcaseSection>

      {/* Unmount on Exit */}
      <ShowcaseSection title="退出时卸载" description="隐藏后从 DOM 中移除元素">
        <div class="flex flex-col gap-4 w-full max-w-md">
          <Button onClick={() => setUnmount(!unmount())}>
            {unmount() ? '隐藏' : '显示'}
          </Button>
          <Presence present={unmount()} unmountOnExit>
            <div class="p-4 bg-primary/10 rounded-md border border-primary/20">
              隐藏后这个元素会从 DOM 中完全移除
            </div>
          </Presence>
        </div>
      </ShowcaseSection>

      {/* Exit Complete Callback */}
      <ShowcaseSection title="退出完成回调" description="动画完成后触发回调">
        <div class="flex flex-col gap-4 w-full max-w-md">
          <div class="flex items-center gap-4">
            <Button onClick={() => setCallback(!callback())}>
              {callback() ? '隐藏' : '显示'}
            </Button>
            {callbackMsg() && (
              <span class="text-sm text-muted-foreground">{callbackMsg()}</span>
            )}
          </div>
          <Presence
            present={callback()}
            unmountOnExit
            onExitComplete={() => setCallbackMsg('退出动画完成！')}
          >
            <div
              class="p-4 bg-primary/10 rounded-md border border-primary/20 transition-all duration-500 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out"
            >
              隐藏时会触发 onExitComplete 回调
            </div>
          </Presence>
        </div>
      </ShowcaseSection>

      {/* Render Props */}
      <ShowcaseSection title="渲染函数" description="通过函数获取 presence 状态">
        <div class="flex flex-col gap-4 w-full max-w-md">
          <Button onClick={() => setRenderProps(!renderProps())}>
            {renderProps() ? '隐藏' : '显示'}
          </Button>
          <Presence present={renderProps()}>
            {({ isPresent }) => (
              <div class="p-4 bg-primary/10 rounded-md border border-primary/20">
                当前状态: {isPresent ? '显示中' : '隐藏中（动画进行中）'}
              </div>
            )}
          </Presence>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/presence')({
  component: PresencePage,
})
