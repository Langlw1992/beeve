import { toast, Toaster, Button } from '@beeve/ui'
import { DemoBox } from '../DemoBox'

export function ToastBasic() {
  return (
    <DemoBox title="基础用法">
      <Button onClick={() => toast.info('这是一条提示信息')}>Info</Button>
      <Button variant="primary" onClick={() => toast.success('操作成功')}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.warning('请注意检查')}>
        Warning
      </Button>
      <Button variant="destructive" onClick={() => toast.error('操作失败，请重试')}>
        Error
      </Button>
      <Toaster />
    </DemoBox>
  )
}

export function ToastWithTitle() {
  return (
    <DemoBox title="带标题">
      <Button
        onClick={() =>
          toast.success('您的更改已保存', {
            title: '保存成功',
          })
        }
      >
        带标题
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast.error('服务器返回 500 错误，请稍后重试', {
            title: '网络请求失败',
          })
        }
      >
        错误详情
      </Button>
      <Toaster />
    </DemoBox>
  )
}

export function ToastLoading() {
  return (
    <DemoBox title="Loading 状态">
      <Button
        onClick={() => {
          const id = toast.loading('正在提交...')
          setTimeout(() => {
            toast.success('提交成功', { id })
          }, 2000)
        }}
      >
        模拟提交
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          const id = toast.loading('正在加载数据...')
          setTimeout(() => {
            toast.error('加载失败，请检查网络', { id })
          }, 2000)
        }}
      >
        模拟失败
      </Button>
      <Toaster />
    </DemoBox>
  )
}

export function ToastPromise() {
  return (
    <DemoBox title="Promise 辅助">
      <Button
        onClick={() => {
          const mockFetch = () =>
            new Promise<{ name: string }>((resolve, reject) => {
              setTimeout(() => {
                if (Math.random() > 0.5) {
                  resolve({ name: '用户数据' })
                } else {
                  reject(new Error('网络超时'))
                }
              }, 2000)
            })

          toast.promise(mockFetch(), {
            loading: '正在获取数据...',
            success: (data) => `获取成功: ${data.name}`,
            error: (err) =>
              `获取失败: ${err instanceof Error ? err.message : '未知错误'}`,
          })
        }}
      >
        Promise 示例（50% 成功率）
      </Button>
      <Toaster />
    </DemoBox>
  )
}

export function ToastRichContent() {
  return (
    <DemoBox title="富文本内容">
      <Button
        onClick={() =>
          toast.create({
            title: <span class="font-bold text-primary">重要通知</span>,
            description: (
              <div>
                您的订单已发货，点击{' '}
                <a href="#" class="text-primary underline">
                  这里
                </a>{' '}
                查看物流详情
              </div>
            ),
            type: 'info',
          })
        }
      >
        带链接
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.create({
            title: '文件上传完成',
            description: (
              <div class="space-y-1">
                <p>
                  已上传 <strong>3</strong> 个文件
                </p>
                <ul class="text-xs list-disc pl-4">
                  <li>document.pdf</li>
                  <li>image.png</li>
                  <li>data.xlsx</li>
                </ul>
              </div>
            ),
            type: 'success',
          })
        }
      >
        列表内容
      </Button>
      <Toaster />
    </DemoBox>
  )
}

export function ToastManualDismiss() {
  let toastId: string | undefined

  return (
    <DemoBox title="手动关闭">
      <Button
        onClick={() => {
          toastId = toast.loading('持续显示中...', {
            duration: Number.POSITIVE_INFINITY,
          })
        }}
      >
        显示持久 Toast
      </Button>
      <Button variant="outline" onClick={() => toast.dismiss(toastId)}>
        关闭 Toast
      </Button>
      <Button variant="ghost" onClick={() => toast.dismiss()}>
        关闭全部
      </Button>
      <Toaster />
    </DemoBox>
  )
}

export function ToastStacking() {
  return (
    <DemoBox title="堆叠显示">
      <Button
        onClick={() => {
          toast.info('第一条消息')
          setTimeout(() => toast.success('第二条消息'), 300)
          setTimeout(() => toast.warning('第三条消息'), 600)
          setTimeout(() => toast.error('第四条消息'), 900)
        }}
      >
        连续创建 4 个 Toast
      </Button>
      <Toaster />
    </DemoBox>
  )
}
