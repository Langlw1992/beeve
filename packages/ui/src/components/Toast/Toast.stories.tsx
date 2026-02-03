import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {toast, Toaster} from './Toast'
import {Button} from '../Button'

const meta: Meta = {
  title: 'Components/Toast',
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj

// ==================== 基础用法 ====================

export const Default: Story = {
  render: () => (
    <div class="flex flex-wrap gap-2">
      <Button onClick={() => toast.info('这是一条提示信息')}>Info</Button>
      <Button
        variant="primary"
        onClick={() => toast.success('操作成功')}
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning('请注意检查')}
      >
        Warning
      </Button>
      <Button
        variant="destructive"
        onClick={() => toast.error('操作失败，请重试')}
      >
        Error
      </Button>
    </div>
  ),
}

// ==================== 带标题 ====================

export const WithTitle: Story = {
  render: () => (
    <div class="flex flex-wrap gap-2">
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
    </div>
  ),
}

// ==================== Loading 状态 ====================

export const Loading: Story = {
  render: () => (
    <div class="flex flex-wrap gap-2">
      <Button
        onClick={() => {
          const id = toast.loading('正在提交...')
          // 模拟异步操作
          setTimeout(() => {
            toast.success('提交成功', {id})
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
            toast.error('加载失败，请检查网络', {id})
          }, 2000)
        }}
      >
        模拟失败
      </Button>
    </div>
  ),
}

// ==================== Promise 辅助 ====================

export const PromiseHelper: Story = {
  render: () => (
    <Button
      onClick={() => {
        const mockFetch = () =>
          new Promise<{name: string}>((resolve, reject) => {
            setTimeout(() => {
              if (Math.random() > 0.5) {
                resolve({name: '用户数据'})
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
  ),
}

// ==================== 富文本支持 ====================

export const RichText: Story = {
  render: () => (
    <div class="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          toast.create({
            title: <span class="font-bold text-primary">重要通知</span>,
            description: (
              <div>
                您的订单已发货，点击{' '}
                <a
                  href="/orders"
                  class="text-primary underline"
                >
                  这里
                </a>{' '}
                查看物流详情
              </div>
            ),
            type: 'info',
          })
        }
      >
        带链接的通知
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
      <Button
        variant="destructive"
        onClick={() =>
          toast.create({
            title: <span class="flex items-center gap-1">⚠️ 验证失败</span>,
            description: (
              <div>
                表单存在以下错误：
                <ul class="text-xs mt-1 list-disc pl-4 text-destructive">
                  <li>邮箱格式不正确</li>
                  <li>密码长度不足</li>
                </ul>
              </div>
            ),
            type: 'error',
          })
        }
      >
        错误列表
      </Button>
    </div>
  ),
}

// ==================== 手动关闭 ====================

export const ManualDismiss: Story = {
  render: () => {
    let toastId: string | undefined

    return (
      <div class="flex gap-2">
        <Button
          onClick={() => {
            toastId = toast.loading('持续显示中...', {
              duration: Number.POSITIVE_INFINITY,
            })
          }}
        >
          显示持久 Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.dismiss(toastId)}
        >
          关闭 Toast
        </Button>
        <Button
          variant="ghost"
          onClick={() => toast.dismiss()}
        >
          关闭全部
        </Button>
      </div>
    )
  },
}

// ==================== 多个 Toast 堆叠 ====================

export const Stacking: Story = {
  render: () => (
    <div class="flex flex-wrap gap-2">
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
    </div>
  ),
}
