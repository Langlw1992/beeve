import { Tooltip, Button } from '@beeve/ui'
import { DemoBox } from '../DemoBox'

export function TooltipBasic() {
  return (
    <DemoBox title="基础提示">
      <Tooltip content="这是提示内容">
        <Button variant="outline">悬停查看提示</Button>
      </Tooltip>
    </DemoBox>
  )
}

export function TooltipPositions() {
  return (
    <DemoBox title="提示位置">
      <Tooltip content="顶部提示" positioning={{ placement: 'top' }}>
        <Button variant="outline" size="sm">上</Button>
      </Tooltip>
      <Tooltip content="右侧提示" positioning={{ placement: 'right' }}>
        <Button variant="outline" size="sm">右</Button>
      </Tooltip>
      <Tooltip content="底部提示" positioning={{ placement: 'bottom' }}>
        <Button variant="outline" size="sm">下</Button>
      </Tooltip>
      <Tooltip content="左侧提示" positioning={{ placement: 'left' }}>
        <Button variant="outline" size="sm">左</Button>
      </Tooltip>
    </DemoBox>
  )
}

export function TooltipWithDelay() {
  return (
    <DemoBox title="延迟显示">
      <Tooltip content="立即显示" openDelay={0}>
        <Button variant="outline">无延迟</Button>
      </Tooltip>
      <Tooltip content="延迟显示" openDelay={500}>
        <Button variant="outline">500ms 延迟</Button>
      </Tooltip>
      <Tooltip content="长延迟" openDelay={1000}>
        <Button variant="outline">1秒延迟</Button>
      </Tooltip>
    </DemoBox>
  )
}

export function TooltipDisabled() {
  return (
    <DemoBox title="禁用提示">
      <Tooltip content="这个提示不会显示" disabled>
        <Button variant="outline">禁用提示</Button>
      </Tooltip>
      <Tooltip content="这个提示会显示">
        <Button variant="outline">启用提示</Button>
      </Tooltip>
    </DemoBox>
  )
}

export function TooltipRichContent() {
  return (
    <DemoBox title="富文本提示">
      <Tooltip
        content={
          <div class="space-y-1">
            <p class="font-medium">提示标题</p>
            <p class="text-xs text-muted-foreground">
              这是一段详细的说明文本，可以包含多行内容。
            </p>
          </div>
        }
      >
        <Button variant="outline">富文本提示</Button>
      </Tooltip>
    </DemoBox>
  )
}
