/**
 * Toast Component Showcase Page
 */

import {createFileRoute} from '@tanstack/solid-router'
import {toast, Button} from '@beeve/ui'
import {ShowcaseSection} from '../components/ShowcaseGrid'

function ToastPage() {
  const showBasicToast = () => {
    toast.info('这是一条普通消息')
  }

  const showSuccessToast = () => {
    toast.success('操作成功完成！')
  }

  const showWarningToast = () => {
    toast.warning('请注意，这是一条警告消息')
  }

  const showErrorToast = () => {
    toast.error('操作失败，请重试')
  }

  const showLoadingToast = () => {
    const id = toast.loading('正在处理中...')
    setTimeout(() => {
      toast.update(id, {
        description: '处理完成！',
        type: 'success',
        duration: 2000,
      })
    }, 2000)
  }

  const showWithTitle = () => {
    toast.create({
      title: '通知标题',
      description: '这是带有标题的消息通知',
      type: 'info',
    })
  }

  const showLongDuration = () => {
    toast.create({
      description: '这条消息会显示 10 秒',
      type: 'info',
      duration: 10000,
    })
  }

  const showNonClosable = () => {
    toast.create({
      description: '这条消息不能手动关闭（3秒后自动消失）',
      type: 'warning',
      closable: false,
      duration: 3000,
    })
  }

  const showPromiseToast = () => {
    const promise = new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          resolve('数据加载成功')
        } else {
          reject(new Error('网络错误'))
        }
      }, 2000)
    })

    toast.promise(promise, {
      loading: '正在加载数据...',
      success: (data) => `${data}`,
      error: (err) => `失败: ${(err as Error).message}`,
    })
  }

  const dismissAll = () => {
    toast.dismiss()
  }

  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Toast</h1>
        <p class="text-muted-foreground mt-2">消息提示组件，支持命令式调用。</p>
      </div>

      {/* Basic Types */}
      <ShowcaseSection
        title="消息类型"
        description="支持多种消息类型"
      >
        <div class="flex flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={showBasicToast}
          >
            Info
          </Button>
          <Button
            variant="outline"
            onClick={showSuccessToast}
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={showWarningToast}
          >
            Warning
          </Button>
          <Button
            variant="outline"
            onClick={showErrorToast}
          >
            Error
          </Button>
        </div>
      </ShowcaseSection>

      {/* Loading Toast */}
      <ShowcaseSection
        title="加载状态"
        description="显示加载中的消息，完成后更新"
      >
        <Button onClick={showLoadingToast}>显示加载消息</Button>
      </ShowcaseSection>

      {/* With Title */}
      <ShowcaseSection
        title="带标题"
        description="消息可以包含标题"
      >
        <Button
          variant="outline"
          onClick={showWithTitle}
        >
          带标题的消息
        </Button>
      </ShowcaseSection>

      {/* Duration */}
      <ShowcaseSection
        title="自定义时长"
        description="可以设置消息显示时长"
      >
        <div class="flex gap-4">
          <Button
            variant="outline"
            onClick={showLongDuration}
          >
            显示 10 秒
          </Button>
          <Button
            variant="outline"
            onClick={showNonClosable}
          >
            不可关闭
          </Button>
        </div>
      </ShowcaseSection>

      {/* Promise */}
      <ShowcaseSection
        title="Promise 支持"
        description="自动处理异步操作的状态"
      >
        <Button onClick={showPromiseToast}>模拟异步请求</Button>
      </ShowcaseSection>

      {/* Dismiss All */}
      <ShowcaseSection
        title="关闭所有"
        description="一键关闭所有消息"
      >
        <div class="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              toast.info('消息 1')
              toast.success('消息 2')
              toast.warning('消息 3')
            }}
          >
            显示多条消息
          </Button>
          <Button
            variant="destructive"
            onClick={dismissAll}
          >
            关闭所有
          </Button>
        </div>
      </ShowcaseSection>

      {/* API Reference */}
      <ShowcaseSection
        title="API 参考"
        description="可用的 toast 方法"
      >
        <div class="text-sm space-y-2">
          <p>
            <code class="bg-muted px-1 rounded">toast.info(message)</code> -
            显示信息消息
          </p>
          <p>
            <code class="bg-muted px-1 rounded">toast.success(message)</code> -
            显示成功消息
          </p>
          <p>
            <code class="bg-muted px-1 rounded">toast.warning(message)</code> -
            显示警告消息
          </p>
          <p>
            <code class="bg-muted px-1 rounded">toast.error(message)</code> -
            显示错误消息
          </p>
          <p>
            <code class="bg-muted px-1 rounded">toast.loading(message)</code> -
            显示加载消息
          </p>
          <p>
            <code class="bg-muted px-1 rounded">
              toast.promise(promise, options)
            </code>{' '}
            - 处理 Promise
          </p>
          <p>
            <code class="bg-muted px-1 rounded">toast.dismiss(id?)</code> -
            关闭消息
          </p>
          <p>
            <code class="bg-muted px-1 rounded">toast.update(id, options)</code>{' '}
            - 更新消息
          </p>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/toast')({
  component: ToastPage,
})
