import { Button } from '@beeve/ui'
import { Loader2, Mail, ChevronRight } from 'lucide-solid'
import { createSignal } from 'solid-js'
import { DemoBox } from '../DemoBox'

export function ButtonVariants() {
  return (
    <DemoBox title="按钮变体">
      <Button variant="primary">主要按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="outline">轮廓按钮</Button>
      <Button variant="ghost">幽灵按钮</Button>
      <Button variant="destructive">危险按钮</Button>
    </DemoBox>
  )
}

export function ButtonSizes() {
  return (
    <DemoBox title="按钮尺寸">
      <Button size="sm">小按钮</Button>
      <Button size="md">中按钮</Button>
      <Button size="lg">大按钮</Button>
    </DemoBox>
  )
}

export function ButtonWithIcon() {
  return (
    <DemoBox title="带图标按钮">
      <Button>
        <Mail class="mr-2 size-4" />
        发送邮件
      </Button>
      <Button variant="outline">
        下一步
        <ChevronRight class="ml-2 size-4" />
      </Button>
    </DemoBox>
  )
}

export function ButtonLoading() {
  const [loading, setLoading] = createSignal(false)

  const handleClick = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <DemoBox title="加载状态" description="点击按钮查看加载效果">
      <Button loading={loading()} onClick={handleClick}>
        {loading() ? (
          <>
            <Loader2 class="mr-2 size-4 animate-spin" />
            加载中...
          </>
        ) : (
          '点击加载'
        )}
      </Button>
      <Button loading disabled>
        <Loader2 class="mr-2 size-4 animate-spin" />
        处理中
      </Button>
    </DemoBox>
  )
}

export function ButtonDisabled() {
  return (
    <DemoBox title="禁用状态">
      <Button disabled>禁用按钮</Button>
      <Button variant="outline" disabled>禁用轮廓</Button>
      <Button variant="destructive" disabled>禁用危险</Button>
    </DemoBox>
  )
}
