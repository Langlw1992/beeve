/**
 * @beeve/ui - Dialog Component
 * 对话框组件，基于 Zag.js 实现，antd 风格的命令式 API
 *
 * @example
 * ```tsx
 * <Dialog
 *   open={open()}
 *   onOpenChange={setOpen}
 *   title="确认删除"
 *   description="此操作不可逆"
 *   onOk={handleDelete}
 *   onCancel={() => setOpen(false)}
 * />
 * ```
 */

import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  Show,
  splitProps,
  type Component,
  type JSX,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import * as dialog from '@zag-js/dialog'
import * as presence from '@zag-js/presence'
import { useMachine, normalizeProps } from '@zag-js/solid'
import { X } from 'lucide-solid'
import { tv } from 'tailwind-variants'
import { Button } from '../Button'

// ==================== 样式定义 ====================

const dialogStyles = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50',
      'bg-black/50',
      // 基于 data-state 的进入/退出动画
      'data-[state=open]:animate-in data-[state=open]:fade-in-0',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
      'duration-200',
    ],
    positioner: [
      'fixed inset-0 z-50',
      'flex items-center justify-center',
      'overflow-y-auto p-4',
    ],
    content: [
      'bg-background',
      'relative z-50',
      'grid gap-4',
      'w-full',
      'rounded-lg border p-6 shadow-lg',
      // 基于 data-state 的进入/退出动画
      'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'duration-200',
    ],
    header: [
      'flex flex-col gap-2',
      'text-center sm:text-left',
    ],
    body: [
      'text-sm text-muted-foreground',
    ],
    footer: [
      'flex flex-col-reverse gap-2',
      'sm:flex-row sm:justify-end sm:gap-2',
    ],
    title: [
      'text-lg font-semibold leading-none tracking-tight',
    ],
    description: [
      'text-sm text-muted-foreground',
    ],
    close: [
      'absolute top-4 right-4',
    ],
  },
  variants: {
    width: {
      sm: { content: 'max-w-sm' },
      md: { content: 'max-w-md' },
      lg: { content: 'max-w-lg' },
      xl: { content: 'max-w-xl' },
      '2xl': { content: 'max-w-2xl' },
      full: { content: 'max-w-full' },
    },
  },
  defaultVariants: {
    width: 'lg',
  },
})

const styles = dialogStyles()

// ==================== 类型定义 ====================

export type DialogProps = {
  /** 是否打开对话框 */
  open?: boolean
  /** 打开状态变化回调 */
  onOpenChange?: (open: boolean) => void

  /** 对话框标题 */
  title?: JSX.Element
  /** 对话框描述/副标题 */
  description?: JSX.Element
  /** 对话框内容 */
  children?: JSX.Element
  /** 自定义底部内容，设为 null 则不显示底部 */
  footer?: JSX.Element | null

  /** 确定按钮文字，默认 "确定" */
  okText?: string
  /** 取消按钮文字，默认 "取消" */
  cancelText?: string
  /** 确定按钮类型 */
  okType?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  /** 确定按钮 loading 状态 */
  confirmLoading?: boolean
  /** 取消按钮 loading 状态 */
  cancelLoading?: boolean

  /** 点击确定的回调，返回 Promise 时自动显示 loading */
  onOk?: () => void | Promise<void>
  /** 点击取消的回调 */
  onCancel?: () => void

  /** 对话框宽度 */
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /** 是否显示关闭按钮，默认 true */
  closable?: boolean
  /** 点击遮罩是否关闭，默认 true */
  maskClosable?: boolean
  /** 按 ESC 是否关闭，默认 true */
  keyboard?: boolean
  /** 对话框角色 */
  role?: 'dialog' | 'alertdialog'

  /** 自定义类名 */
  class?: string
}

// ==================== 主组件 ====================

export const Dialog: Component<DialogProps> = (props) => {
  const [local] = splitProps(props, [
    'open',
    'onOpenChange',
    'title',
    'description',
    'children',
    'footer',
    'okText',
    'cancelText',
    'okType',
    'confirmLoading',
    'cancelLoading',
    'onOk',
    'onCancel',
    'width',
    'closable',
    'maskClosable',
    'keyboard',
    'role',
    'class',
  ])

  // 内部 loading 状态（用于自动处理 Promise）
  const [internalConfirmLoading, setInternalConfirmLoading] = createSignal(false)
  const [internalCancelLoading, setInternalCancelLoading] = createSignal(false)

  // 合并外部和内部 loading 状态
  const isConfirmLoading = () => local.confirmLoading || internalConfirmLoading()
  const isCancelLoading = () => local.cancelLoading || internalCancelLoading()
  const isPending = createMemo(() => isConfirmLoading() || isCancelLoading())

  // 是否可关闭
  const canClose = createMemo(() => {
    if (local.closable === false) { return false }
    return !isPending()
  })

  // Dialog state machine
  const dialogService = useMachine(dialog.machine, () => ({
    id: createUniqueId(),
    open: local.open,
    closeOnInteractOutside: canClose() && (local.maskClosable ?? true),
    closeOnEscapeKeyDown: canClose() && (local.keyboard ?? true),
    role: local.role ?? 'dialog',
    onOpenChange: (details) => {
      if (!details.open && isPending()) {
        return
      }
      local.onOpenChange?.(details.open)
      if (!details.open) {
        setInternalConfirmLoading(false)
        setInternalCancelLoading(false)
      }
    },
  }))

  const api = createMemo(() => dialog.connect(dialogService, normalizeProps))

  // 处理确定按钮点击
  const handleOk = async () => {
    if (isPending()) { return }

    if (!local.onOk) {
      api().setOpen(false)
      return
    }

    const result = local.onOk()

    if (result instanceof Promise) {
      setInternalConfirmLoading(true)
      try {
        await result
        api().setOpen(false)
      } catch {
        // Promise rejected，不关闭
      } finally {
        setInternalConfirmLoading(false)
      }
    } else {
      api().setOpen(false)
    }
  }

  // 处理取消按钮点击
  const handleCancel = async () => {
    if (isPending()) { return }

    if (local.onCancel) {
      local.onCancel()
    }
    api().setOpen(false)
  }

  // 关闭按钮点击
  const handleCloseClick = (e: MouseEvent) => {
    if (isPending()) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    // 直接调用 api 关闭
    api().setOpen(false)
  }

  // 渲染底部按钮
  const renderFooter = () => {
    // footer 为 null 时不显示
    if (local.footer === null) {
      return null
    }

    // 自定义 footer
    if (local.footer !== undefined) {
      return <div class={styles.footer()}>{local.footer}</div>
    }

    // 默认 footer
    return (
      <div class={styles.footer()}>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isPending()}
          loading={isCancelLoading()}
        >
          {local.cancelText ?? '取消'}
        </Button>
        <Button
          variant={local.okType ?? 'primary'}
          onClick={handleOk}
          disabled={isPending()}
          loading={isConfirmLoading()}
        >
          {local.okText ?? '确定'}
        </Button>
      </div>
    )
  }

  const variantStyles = dialogStyles({ width: local.width })

  // Presence 状态机 - 用于退出动画
  const [wasEverPresent, setWasEverPresent] = createSignal(false)
  const presenceService = useMachine(presence.machine, () => ({
    present: api().open,
  }))
  const presenceApi = createMemo(() => presence.connect(presenceService, normalizeProps))

  // 追踪是否曾经显示过
  createEffect(() => {
    if (presenceApi().present) {
      setWasEverPresent(true)
    }
  })

  // 设置 presence 节点引用（绑定到 backdrop 以监听动画事件）
  const setPresenceRef = (node: HTMLElement | null) => {
    if (!node) { return }
    presenceService.send({ type: 'NODE.SET', node })
  }

  // 计算是否应该卸载（退出动画完成后）
  const shouldUnmount = createMemo(() =>
    !presenceApi().present && wasEverPresent()
  )

  return (
    <Show when={!shouldUnmount()}>
      <Portal>
        <div
          ref={setPresenceRef}
          {...api().getBackdropProps()}
          hidden={!presenceApi().present}
          data-state={api().open ? 'open' : 'closed'}
          class={styles.overlay()}
        />
        <div {...api().getPositionerProps()} class={styles.positioner()}>
          <div
            {...api().getContentProps()}
            hidden={!presenceApi().present}
            data-state={api().open ? 'open' : 'closed'}
            class={variantStyles.content({ class: local.class })}
          >
            {/* Header */}
            <Show when={local.title || local.description}>
              <div class={styles.header()}>
                <Show when={local.title}>
                  <h2 {...api().getTitleProps()} class={styles.title()}>
                    {local.title}
                  </h2>
                </Show>
                <Show when={local.description}>
                  <p {...api().getDescriptionProps()} class={styles.description()}>
                    {local.description}
                  </p>
                </Show>
              </div>
            </Show>

            {/* Body */}
            <Show when={local.children}>
              <div class={styles.body()}>{local.children}</div>
            </Show>

            {/* Footer */}
            {renderFooter()}

            {/* Close button */}
            <Show when={local.closable !== false}>
              <Button
                variant="ghost"
                size="icon"
                class={styles.close()}
                disabled={isPending()}
                onClick={handleCloseClick}
                title="关闭"
                aria-label={api().getCloseTriggerProps()['aria-label']}
              >
                <X class="size-3.5" />
              </Button>
            </Show>
          </div>
        </div>
      </Portal>
    </Show>
  )
}
