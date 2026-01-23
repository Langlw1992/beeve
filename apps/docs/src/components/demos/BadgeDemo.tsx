import { Badge } from '@beeve/ui'
import { Bell, Mail, MessageSquare } from 'lucide-solid'
import { DemoBox } from '../DemoBox'

export function BadgeBasic() {
  return (
    <DemoBox title="基础徽标">
      <Badge count={5}>
        <div class="size-10 rounded bg-muted flex items-center justify-center">
          <Bell class="size-5" />
        </div>
      </Badge>
      <Badge count={99}>
        <div class="size-10 rounded bg-muted flex items-center justify-center">
          <Mail class="size-5" />
        </div>
      </Badge>
      <Badge count={100}>
        <div class="size-10 rounded bg-muted flex items-center justify-center">
          <MessageSquare class="size-5" />
        </div>
      </Badge>
    </DemoBox>
  )
}

export function BadgeDot() {
  return (
    <DemoBox title="小红点">
      <Badge dot>
        <div class="size-10 rounded bg-muted flex items-center justify-center">
          <Bell class="size-5" />
        </div>
      </Badge>
      <Badge dot color="blue">
        <div class="size-10 rounded bg-muted flex items-center justify-center">
          <Mail class="size-5" />
        </div>
      </Badge>
      <Badge dot color="green">
        <div class="size-10 rounded bg-muted flex items-center justify-center">
          <MessageSquare class="size-5" />
        </div>
      </Badge>
    </DemoBox>
  )
}

export function BadgeColors() {
  return (
    <DemoBox title="徽标颜色">
      <Badge count={5} color="default">
        <div class="size-10 rounded bg-muted" />
      </Badge>
      <Badge count={5} color="blue">
        <div class="size-10 rounded bg-muted" />
      </Badge>
      <Badge count={5} color="green">
        <div class="size-10 rounded bg-muted" />
      </Badge>
      <Badge count={5} color="orange">
        <div class="size-10 rounded bg-muted" />
      </Badge>
      <Badge count={5} color="red">
        <div class="size-10 rounded bg-muted" />
      </Badge>
    </DemoBox>
  )
}

export function BadgeStatus() {
  return (
    <DemoBox title="状态徽标">
      <Badge status="default" text="默认" />
      <Badge status="success" text="成功" />
      <Badge status="processing" text="处理中" />
      <Badge status="warning" text="警告" />
      <Badge status="error" text="错误" />
    </DemoBox>
  )
}
