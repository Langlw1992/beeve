import { Badge } from '@beeve/ui'
import { DemoBox } from '../DemoBox'

export function BadgeVariants() {
  return (
    <DemoBox title="徽标变体">
      <Badge variant="default">默认</Badge>
      <Badge variant="secondary">次要</Badge>
      <Badge variant="outline">轮廓</Badge>
      <Badge variant="success">成功</Badge>
      <Badge variant="warning">警告</Badge>
      <Badge variant="error">错误</Badge>
    </DemoBox>
  )
}

export function BadgeSizes() {
  return (
    <DemoBox title="徽标尺寸">
      <Badge size="sm">小徽标</Badge>
      <Badge size="md">中徽标</Badge>
      <Badge size="lg">大徽标</Badge>
    </DemoBox>
  )
}

export function BadgeUseCases() {
  return (
    <DemoBox title="使用场景">
      <span class="flex items-center gap-2">
        消息 <Badge variant="error">99+</Badge>
      </span>
      <span class="flex items-center gap-2">
        版本 <Badge variant="outline">v1.0.0</Badge>
      </span>
      <span class="flex items-center gap-2">
        状态 <Badge variant="success">已发布</Badge>
      </span>
      <span class="flex items-center gap-2">
        待处理 <Badge variant="warning">进行中</Badge>
      </span>
    </DemoBox>
  )
}
