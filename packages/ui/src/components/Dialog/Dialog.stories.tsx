import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {createSignal} from 'solid-js'
import {Dialog} from './Dialog'
import {Button} from '../Button'

/**
 * # Dialog 对话框
 *
 * 对话框是一种模态窗口，用于在不离开当前页面的情况下显示重要信息或请求用户输入。
 * API 风格参考 Ant Design，通过 props 配置所有内容。
 *
 * ## 何时使用
 *
 * - 需要用户确认某个操作时
 * - 需要展示详细信息但不想跳转页面时
 * - 需要用户填写表单时
 *
 * ## 设计指南
 *
 * - 对话框应该有明确的标题
 * - 避免在对话框中嵌套另一个对话框
 * - 危险操作应该使用 alertdialog 角色
 */
const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '对话框组件，antd 风格 API。基于 Zag.js 实现，支持无障碍。',
      },
    },
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

/**
 * ## 基础用法
 *
 * 最简单的对话框示例，通过 props 配置标题、描述和按钮。
 */
export const Basic: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false)

    return (
      <div>
        <Button onClick={() => setOpen(true)}>打开对话框</Button>
        <Dialog
          open={open()}
          onOpenChange={setOpen}
          title="对话框标题"
          description="这是对话框的描述内容，可以包含任何信息。"
        />
      </div>
    )
  },
}

/**
 * ## 受控模式
 *
 * 使用 `open` 和 `onOpenChange` 属性来控制对话框的打开状态。
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false)

    return (
      <div class="flex flex-col gap-4">
        <Button onClick={() => setOpen(true)}>打开对话框</Button>
        <p class="text-sm text-muted-foreground">
          当前状态: {open() ? '打开' : '关闭'}
        </p>

        <Dialog
          open={open()}
          onOpenChange={setOpen}
          title="受控对话框"
          description="这个对话框的状态由外部控制。"
        />
      </div>
    )
  },
}

/**
 * ## 确认对话框
 *
 * 常用于危险操作的确认，使用 `role="alertdialog"` 提高无障碍性。
 * 使用 `okType="destructive"` 将确定按钮设为危险样式。
 */
export const Confirmation: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false)

    return (
      <div>
        <Button
          variant="destructive"
          onClick={() => setOpen(true)}
        >
          删除账户
        </Button>
        <Dialog
          open={open()}
          onOpenChange={setOpen}
          title="确认删除"
          description="您确定要删除账户吗？此操作不可撤销，所有数据将被永久删除。"
          role="alertdialog"
          okText="确认删除"
          okType="destructive"
          onOk={() => console.log('确认删除')}
          onCancel={() => console.log('取消删除')}
        />
      </div>
    )
  },
}

/**
 * ## 表单对话框
 *
 * 对话框中包含表单，适用于编辑信息等场景。使用 `children` 传递表单内容。
 */
export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false)

    return (
      <div>
        <Button onClick={() => setOpen(true)}>编辑个人资料</Button>
        <Dialog
          open={open()}
          onOpenChange={setOpen}
          title="编辑个人资料"
          description="修改您的个人信息，完成后点击保存。"
          okText="保存"
        >
          <form class="space-y-4">
            <div class="grid gap-2">
              <label
                for="name"
                class="text-sm font-medium leading-none"
              >
                姓名
              </label>
              <input
                id="name"
                type="text"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="请输入姓名"
              />
            </div>
            <div class="grid gap-2">
              <label
                for="email"
                class="text-sm font-medium leading-none"
              >
                邮箱
              </label>
              <input
                id="email"
                type="email"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="请输入邮箱"
              />
            </div>
          </form>
        </Dialog>
      </div>
    )
  },
}

/**
 * ## 异步操作 (Promise Loading)
 *
 * 当 `onOk` 返回 Promise 时，确定按钮会自动进入 loading 状态。
 * Promise resolve 后自动关闭对话框，reject 则保持打开。
 */
export const AsyncOperation: Story = {
  render: () => {
    const [openSuccess, setOpenSuccess] = createSignal(false)
    const [openFail, setOpenFail] = createSignal(false)

    // 模拟异步 API 调用
    const mockApiCall = (success = true) => {
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (success) {
            console.log('API 调用成功')
            resolve()
          } else {
            console.log('API 调用失败')
            reject(new Error('操作失败'))
          }
        }, 2000)
      })
    }

    return (
      <div class="flex gap-4">
        <Button onClick={() => setOpenSuccess(true)}>成功示例</Button>
        <Dialog
          open={openSuccess()}
          onOpenChange={setOpenSuccess}
          title="异步操作"
          description="点击确认后会模拟一个 2 秒的 API 调用，成功后自动关闭。Loading 期间无法关闭对话框。"
          role="alertdialog"
          okText="确认 (2秒后成功)"
          onOk={() => mockApiCall(true)}
        />

        <Button
          variant="destructive"
          onClick={() => setOpenFail(true)}
        >
          失败示例
        </Button>
        <Dialog
          open={openFail()}
          onOpenChange={setOpenFail}
          title="异步操作"
          description="点击确认后会模拟一个 2 秒的 API 调用，失败后保持对话框打开。"
          role="alertdialog"
          okText="确认 (2秒后失败)"
          okType="destructive"
          onOk={() => mockApiCall(false)}
        />
      </div>
    )
  },
}

/**
 * ## 自定义 Footer
 *
 * 通过 `footer` prop 可以自定义底部按钮区域，设为 `null` 则不显示底部。
 */
export const CustomFooter: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false)
    const [openNoFooter, setOpenNoFooter] = createSignal(false)

    return (
      <div class="flex gap-4">
        <Button onClick={() => setOpen(true)}>自定义 Footer</Button>
        <Dialog
          open={open()}
          onOpenChange={setOpen}
          title="自定义底部"
          description="这个对话框有自定义的底部按钮。"
          footer={
            <div class="flex justify-between w-full">
              <Button
                variant="ghost"
                onClick={() => console.log('帮助')}
              >
                帮助
              </Button>
              <div class="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  稍后再说
                </Button>
                <Button onClick={() => setOpen(false)}>立即处理</Button>
              </div>
            </div>
          }
        />

        <Button
          variant="outline"
          onClick={() => setOpenNoFooter(true)}
        >
          无 Footer
        </Button>
        <Dialog
          open={openNoFooter()}
          onOpenChange={setOpenNoFooter}
          title="无底部按钮"
          description="这个对话框没有底部按钮区域。"
          footer={null}
        />
      </div>
    )
  },
}

/**
 * ## 不同宽度
 *
 * 使用 `width` prop 可以设置对话框的宽度。
 */
export const DifferentWidths: Story = {
  render: () => {
    const [openSm, setOpenSm] = createSignal(false)
    const [openLg, setOpenLg] = createSignal(false)
    const [openXl, setOpenXl] = createSignal(false)

    return (
      <div class="flex gap-4">
        <Button onClick={() => setOpenSm(true)}>小尺寸</Button>
        <Dialog
          open={openSm()}
          onOpenChange={setOpenSm}
          width="sm"
          title="小尺寸对话框"
          description="这是一个小尺寸的对话框。"
        />

        <Button onClick={() => setOpenLg(true)}>大尺寸</Button>
        <Dialog
          open={openLg()}
          onOpenChange={setOpenLg}
          width="lg"
          title="大尺寸对话框"
          description="这是一个大尺寸的对话框。"
        />

        <Button onClick={() => setOpenXl(true)}>超大尺寸</Button>
        <Dialog
          open={openXl()}
          onOpenChange={setOpenXl}
          width="xl"
          title="超大尺寸对话框"
          description="这是一个超大尺寸的对话框。"
        />
      </div>
    )
  },
}
