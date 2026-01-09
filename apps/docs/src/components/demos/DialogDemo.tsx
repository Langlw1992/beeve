import { Dialog, Button } from '@beeve/ui'
import { createSignal } from 'solid-js'
import { DemoBox } from '../DemoBox'

export function DialogBasic() {
  const [open, setOpen] = createSignal(false)

  return (
    <DemoBox title="基础对话框">
      <Button onClick={() => setOpen(true)}>打开对话框</Button>
      <Dialog
        open={open()}
        onOpenChange={setOpen}
        title="对话框标题"
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <p>这是对话框的内容。</p>
      </Dialog>
    </DemoBox>
  )
}

export function DialogConfirm() {
  const [open, setOpen] = createSignal(false)

  return (
    <DemoBox title="确认对话框">
      <Button variant="destructive" onClick={() => setOpen(true)}>
        删除项目
      </Button>
      <Dialog
        open={open()}
        onOpenChange={setOpen}
        title="确认删除"
        description="此操作不可逆，是否确认删除？"
        okType="destructive"
        okText="删除"
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </DemoBox>
  )
}

export function DialogAsync() {
  const [open, setOpen] = createSignal(false)

  const handleOk = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setOpen(false)
  }

  return (
    <DemoBox title="异步操作" description="点击确定查看加载状态">
      <Button onClick={() => setOpen(true)}>提交数据</Button>
      <Dialog
        open={open()}
        onOpenChange={setOpen}
        title="提交确认"
        onOk={handleOk}
        onCancel={() => setOpen(false)}
      >
        <p>点击确定将模拟异步提交。</p>
      </Dialog>
    </DemoBox>
  )
}

export function DialogSizes() {
  const [size, setSize] = createSignal<'sm' | 'md' | 'lg' | 'xl'>('md')
  const [open, setOpen] = createSignal(false)

  const openWithSize = (s: typeof size extends () => infer T ? T : never) => {
    setSize(s)
    setOpen(true)
  }

  return (
    <DemoBox title="对话框尺寸">
      <Button variant="outline" onClick={() => openWithSize('sm')}>小</Button>
      <Button variant="outline" onClick={() => openWithSize('md')}>中</Button>
      <Button variant="outline" onClick={() => openWithSize('lg')}>大</Button>
      <Button variant="outline" onClick={() => openWithSize('xl')}>超大</Button>
      <Dialog
        open={open()}
        onOpenChange={setOpen}
        title={`${size().toUpperCase()} 尺寸对话框`}
        width={size()}
        onOk={() => setOpen(false)}
      >
        <p>这是 {size()} 尺寸的对话框。</p>
      </Dialog>
    </DemoBox>
  )
}

export function DialogCustomFooter() {
  const [open, setOpen] = createSignal(false)

  return (
    <DemoBox title="自定义底部">
      <Button onClick={() => setOpen(true)}>自定义底部</Button>
      <Dialog
        open={open()}
        onOpenChange={setOpen}
        title="自定义底部按钮"
        footer={
          <div class="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              稍后再说
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setOpen(false)}>
              确认
            </Button>
          </div>
        }
      >
        <p>可以自定义底部按钮区域。</p>
      </Dialog>
    </DemoBox>
  )
}

export function DialogNoFooter() {
  const [open, setOpen] = createSignal(false)

  return (
    <DemoBox title="无底部对话框">
      <Button onClick={() => setOpen(true)}>打开</Button>
      <Dialog
        open={open()}
        onOpenChange={setOpen}
        title="信息展示"
        footer={null}
      >
        <p>这个对话框没有底部按钮，点击关闭按钮或按 ESC 关闭。</p>
      </Dialog>
    </DemoBox>
  )
}
