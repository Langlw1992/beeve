import { Presence, Button } from '@beeve/ui'
import { createSignal } from 'solid-js'
import { DemoBox } from '../DemoBox'

export function PresenceBasic() {
  const [present, setPresent] = createSignal(true)

  return (
    <DemoBox title="基础用法" description="控制元素的显示/隐藏">
      <div class="flex flex-col gap-4 w-full">
        <Button onClick={() => setPresent(!present())}>
          {present() ? '隐藏' : '显示'}
        </Button>
        <Presence present={present()}>
          <div class="p-4 bg-primary/10 rounded-md border border-primary/20">
            这是一个受控显示的内容区域
          </div>
        </Presence>
      </div>
    </DemoBox>
  )
}

export function PresenceWithAnimation() {
  const [present, setPresent] = createSignal(true)

  return (
    <DemoBox title="带动画效果" description="配合 CSS 动画实现进入/退出效果">
      <div class="flex flex-col gap-4 w-full">
        <Button onClick={() => setPresent(!present())}>
          {present() ? '隐藏' : '显示'}
        </Button>
        <Presence present={present()} unmountOnExit>
          <div
            class="p-4 bg-primary/10 rounded-md border border-primary/20 transition-all duration-300 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-2"
          >
            带有淡入淡出和滑动动画的内容
          </div>
        </Presence>
      </div>
    </DemoBox>
  )
}

export function PresenceLazyMount() {
  const [present, setPresent] = createSignal(false)

  return (
    <DemoBox title="懒加载" description="首次显示时才挂载元素">
      <div class="flex flex-col gap-4 w-full">
        <Button onClick={() => setPresent(!present())}>
          {present() ? '隐藏' : '显示'}
        </Button>
        <Presence present={present()} lazyMount>
          <div class="p-4 bg-primary/10 rounded-md border border-primary/20">
            这个内容只有在首次点击显示时才会被挂载到 DOM
          </div>
        </Presence>
      </div>
    </DemoBox>
  )
}

export function PresenceUnmountOnExit() {
  const [present, setPresent] = createSignal(true)

  return (
    <DemoBox title="退出时卸载" description="隐藏后从 DOM 中移除元素">
      <div class="flex flex-col gap-4 w-full">
        <Button onClick={() => setPresent(!present())}>
          {present() ? '隐藏' : '显示'}
        </Button>
        <Presence present={present()} unmountOnExit>
          <div class="p-4 bg-primary/10 rounded-md border border-primary/20">
            隐藏后这个元素会从 DOM 中完全移除
          </div>
        </Presence>
      </div>
    </DemoBox>
  )
}

export function PresenceOnExitComplete() {
  const [present, setPresent] = createSignal(true)
  const [message, setMessage] = createSignal('')

  return (
    <DemoBox title="退出完成回调" description="动画完成后触发回调">
      <div class="flex flex-col gap-4 w-full">
        <div class="flex items-center gap-4">
          <Button onClick={() => setPresent(!present())}>
            {present() ? '隐藏' : '显示'}
          </Button>
          {message() && (
            <span class="text-sm text-muted-foreground">{message()}</span>
          )}
        </div>
        <Presence
          present={present()}
          unmountOnExit
          onExitComplete={() => setMessage('退出动画完成！')}
        >
          <div
            class="p-4 bg-primary/10 rounded-md border border-primary/20 transition-all duration-500 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out"
          >
            隐藏时会触发 onExitComplete 回调
          </div>
        </Presence>
      </div>
    </DemoBox>
  )
}

export function PresenceRenderProps() {
  const [present, setPresent] = createSignal(true)

  return (
    <DemoBox title="渲染函数" description="通过函数获取 presence 状态">
      <div class="flex flex-col gap-4 w-full">
        <Button onClick={() => setPresent(!present())}>
          {present() ? '隐藏' : '显示'}
        </Button>
        <Presence present={present()}>
          {({ isPresent }) => (
            <div class="p-4 bg-primary/10 rounded-md border border-primary/20">
              当前状态: {isPresent ? '显示中' : '隐藏中（动画进行中）'}
            </div>
          )}
        </Presence>
      </div>
    </DemoBox>
  )
}
