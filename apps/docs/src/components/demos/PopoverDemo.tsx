import { Popover, PopoverTitle, PopoverDescription, Button, Input, Label } from '@beeve/ui'
import { DemoBox } from '../DemoBox'

export function PopoverBasic() {
  return (
    <DemoBox title="基础用法">
      <Popover
        content={
          <div class="space-y-2">
            <PopoverTitle>气泡卡片标题</PopoverTitle>
            <PopoverDescription>这是气泡卡片的描述内容。</PopoverDescription>
          </div>
        }
      >
        <Button variant="outline">点击打开</Button>
      </Popover>
    </DemoBox>
  )
}

export function PopoverWithArrow() {
  return (
    <DemoBox title="带箭头">
      <Popover
        arrow
        content={
          <div class="space-y-2">
            <PopoverTitle>带箭头的气泡卡片</PopoverTitle>
            <PopoverDescription>箭头会指向触发元素。</PopoverDescription>
          </div>
        }
      >
        <Button variant="outline">带箭头</Button>
      </Popover>
    </DemoBox>
  )
}

export function PopoverPositions() {
  return (
    <DemoBox title="弹出位置">
      <Popover
        content={<PopoverDescription>顶部弹出</PopoverDescription>}
        positioning={{ placement: 'top' }}
        arrow
      >
        <Button variant="outline" size="sm">上</Button>
      </Popover>
      <Popover
        content={<PopoverDescription>右侧弹出</PopoverDescription>}
        positioning={{ placement: 'right' }}
        arrow
      >
        <Button variant="outline" size="sm">右</Button>
      </Popover>
      <Popover
        content={<PopoverDescription>底部弹出</PopoverDescription>}
        positioning={{ placement: 'bottom' }}
        arrow
      >
        <Button variant="outline" size="sm">下</Button>
      </Popover>
      <Popover
        content={<PopoverDescription>左侧弹出</PopoverDescription>}
        positioning={{ placement: 'left' }}
        arrow
      >
        <Button variant="outline" size="sm">左</Button>
      </Popover>
    </DemoBox>
  )
}

export function PopoverWithForm() {
  return (
    <DemoBox title="表单内容">
      <Popover
        content={
          <div class="space-y-4">
            <PopoverTitle>编辑信息</PopoverTitle>
            <div class="space-y-2">
              <Label for="name">名称</Label>
              <Input id="name" placeholder="请输入名称" />
            </div>
            <div class="space-y-2">
              <Label for="email">邮箱</Label>
              <Input id="email" type="email" placeholder="请输入邮箱" />
            </div>
            <div class="flex justify-end gap-2">
              <Button size="sm" variant="outline">取消</Button>
              <Button size="sm">保存</Button>
            </div>
          </div>
        }
      >
        <Button variant="outline">编辑</Button>
      </Popover>
    </DemoBox>
  )
}

export function PopoverHoverTrigger() {
  return (
    <DemoBox title="悬停触发">
      <Popover
        trigger="hover"
        arrow
        content={
          <div class="space-y-2">
            <PopoverTitle>悬停触发</PopoverTitle>
            <PopoverDescription>鼠标悬停时自动显示，移开后自动隐藏。</PopoverDescription>
          </div>
        }
      >
        <Button variant="outline">悬停显示</Button>
      </Popover>
      <Popover
        trigger="hover"
        arrow
        openDelay={0}
        closeDelay={0}
        content={<PopoverDescription>立即显示，无延迟</PopoverDescription>}
      >
        <Button variant="outline">无延迟</Button>
      </Popover>
    </DemoBox>
  )
}
