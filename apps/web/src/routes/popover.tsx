/**
 * Popover Component Showcase Page
 */

import { createFileRoute } from '@tanstack/solid-router'
import { Popover, PopoverTitle, PopoverDescription, Button } from '@beeve/ui'
import { ShowcaseSection } from '../components/ShowcaseGrid'

function PopoverPage() {
  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Popover</h1>
        <p class="text-muted-foreground mt-2">
          气泡卡片组件，用于展示更多信息或操作。
        </p>
      </div>

      {/* Basic Popover */}
      <ShowcaseSection title="基础用法" description="点击触发的气泡卡片">
        <Popover
          content={
            <div>
              <PopoverTitle>气泡标题</PopoverTitle>
              <PopoverDescription>这是气泡卡片的内容描述。</PopoverDescription>
            </div>
          }
        >
          <Button variant="outline">点击打开</Button>
        </Popover>
      </ShowcaseSection>

      {/* Hover Trigger */}
      <ShowcaseSection title="悬停触发" description="鼠标悬停触发的气泡卡片">
        <Popover
          trigger="hover"
          content={
            <div>
              <PopoverTitle>悬停提示</PopoverTitle>
              <PopoverDescription>鼠标悬停时显示此内容。</PopoverDescription>
            </div>
          }
        >
          <Button variant="outline">悬停打开</Button>
        </Popover>
      </ShowcaseSection>

      {/* With Arrow */}
      <ShowcaseSection title="带箭头" description="显示指向触发元素的箭头">
        <Popover
          arrow
          content={
            <div>
              <PopoverTitle>带箭头的气泡</PopoverTitle>
              <PopoverDescription>箭头指向触发元素。</PopoverDescription>
            </div>
          }
        >
          <Button variant="outline">带箭头</Button>
        </Popover>
      </ShowcaseSection>

      {/* Placement */}
      <ShowcaseSection title="弹出位置" description="支持不同的弹出方向">
        <div class="flex flex-wrap gap-4">
          <Popover
            placement="top"
            content={<PopoverDescription>顶部弹出</PopoverDescription>}
          >
            <Button variant="outline">Top</Button>
          </Popover>
          <Popover
            placement="bottom"
            content={<PopoverDescription>底部弹出</PopoverDescription>}
          >
            <Button variant="outline">Bottom</Button>
          </Popover>
          <Popover
            placement="left"
            content={<PopoverDescription>左侧弹出</PopoverDescription>}
          >
            <Button variant="outline">Left</Button>
          </Popover>
          <Popover
            placement="right"
            content={<PopoverDescription>右侧弹出</PopoverDescription>}
          >
            <Button variant="outline">Right</Button>
          </Popover>
        </div>
      </ShowcaseSection>

      {/* Rich Content */}
      <ShowcaseSection title="丰富内容" description="气泡卡片可以包含复杂内容">
        <Popover
          content={
            <div class="space-y-3">
              <PopoverTitle>用户信息</PopoverTitle>
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span class="text-lg">👤</span>
                </div>
                <div>
                  <div class="font-medium">张三</div>
                  <div class="text-sm text-muted-foreground">前端开发工程师</div>
                </div>
              </div>
              <div class="flex gap-2 pt-2">
                <Button size="sm" variant="outline">查看资料</Button>
                <Button size="sm">发送消息</Button>
              </div>
            </div>
          }
        >
          <Button>查看用户</Button>
        </Popover>
      </ShowcaseSection>

      {/* Controlled */}
      <ShowcaseSection title="受控模式" description="可以通过 open 属性控制显示状态">
        <Popover
          defaultOpen
          content={
            <div>
              <PopoverTitle>默认打开</PopoverTitle>
              <PopoverDescription>这个气泡卡片默认是打开的。</PopoverDescription>
            </div>
          }
        >
          <Button variant="outline">默认打开</Button>
        </Popover>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/popover')({
  component: PopoverPage,
})
