import { Card, Button, Badge } from '@beeve/ui'
import { DemoBox } from '../DemoBox'

export function CardBasic() {
  return (
    <DemoBox title="基础卡片">
      <Card
        class="w-80"
        title="卡片标题"
        description="这是卡片的描述文本"
      >
        <p>这里是卡片的主要内容区域。</p>
      </Card>
    </DemoBox>
  )
}

export function CardWithFooter() {
  return (
    <DemoBox title="带底部卡片">
      <Card
        class="w-80"
        title="创建项目"
        description="填写信息创建新项目"
        actions={
          <>
            <Button variant="outline">取消</Button>
            <Button>创建</Button>
          </>
        }
      >
        <p class="text-sm text-muted-foreground">
          项目将在创建后立即可用。
        </p>
      </Card>
    </DemoBox>
  )
}

export function CardVariants() {
  return (
    <DemoBox title="卡片变体" class="flex-col items-stretch gap-4">
      <Card variant="outlined" title="边框卡片">
        默认边框样式
      </Card>
      <Card variant="elevated" title="阴影卡片">
        带阴影效果
      </Card>
      <Card variant="filled" title="填充卡片">
        填充背景色
      </Card>
    </DemoBox>
  )
}

export function CardSizes() {
  return (
    <DemoBox title="卡片尺寸" class="flex-col items-stretch gap-4">
      <Card size="sm" title="小卡片">
        小尺寸内边距
      </Card>
      <Card size="md" title="中卡片">
        中尺寸内边距
      </Card>
      <Card size="lg" title="大卡片">
        大尺寸内边距
      </Card>
    </DemoBox>
  )
}

export function CardInteractive() {
  return (
    <DemoBox title="可交互卡片">
      <Card
        class="w-80"
        hoverable
        title="可点击卡片"
        description="悬停查看效果"
        extra={<Badge color="green">新</Badge>}
        onClick={() => console.log('clicked')}
      >
        <p class="text-sm">点击此卡片可以执行操作。</p>
      </Card>
    </DemoBox>
  )
}

export function CardWithCover() {
  return (
    <DemoBox title="带封面卡片">
      <Card
        class="w-80"
        cover="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
        coverAlt="山景"
        title="美丽风景"
        description="瑞士阿尔卑斯山"
      >
        <p class="text-sm">这是一张美丽的风景照片。</p>
      </Card>
    </DemoBox>
  )
}

export function CardLoading() {
  return (
    <DemoBox title="加载状态">
      <Card
        class="w-80"
        loading
        loadingConfig={{ title: true, rows: 3 }}
      />
      <Card
        class="w-80"
        loading
        loadingConfig={{ avatar: true, rows: 2 }}
      />
    </DemoBox>
  )
}

export function CardStats() {
  return (
    <DemoBox title="统计卡片">
      <Card class="w-48" size="sm">
        <p class="text-sm text-muted-foreground">总用户</p>
        <p class="text-3xl font-bold">12,345</p>
        <p class="text-xs text-success">+12% 较上月</p>
      </Card>
      <Card class="w-48" size="sm">
        <p class="text-sm text-muted-foreground">收入</p>
        <p class="text-3xl font-bold">¥89,000</p>
        <p class="text-xs text-error">-5% 较上月</p>
      </Card>
    </DemoBox>
  )
}
