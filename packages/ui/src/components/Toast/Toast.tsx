/**
 * @beeve/ui - Toast Component
 * 消息提示组件，支持命令式调用
 */
import {
  createMemo,
  createUniqueId,
  Show,
  splitProps,
  type Component,
  type JSX,
  type ComponentProps,
} from 'solid-js'
import {Portal} from 'solid-js/web'
import * as toastMachine from '@zag-js/toast'
import {useMachine, normalizeProps, Key} from '@zag-js/solid'
import {tv} from 'tailwind-variants'
import {
  X,
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  LoaderCircle,
} from 'lucide-solid'

// ==================== 类型定义 ====================

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading'
export type ToastPlacement =
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'

export interface ToastOptions {
  id?: string
  title?: JSX.Element
  description?: JSX.Element
  type?: ToastType
  duration?: number
  closable?: boolean
  onClose?: () => void
}

// ==================== 样式定义 ====================

const toastStyles = tv({
  slots: {
    group: [
      'fixed z-[9999] flex flex-col',
      'pointer-events-none',
      'outline-none',
    ],
    root: [
      'pointer-events-auto absolute',
      'flex items-start gap-3',
      'w-[356px] rounded-md border bg-background p-4 shadow-lg',
      // Zag CSS variables for animation
      '[translate:var(--x)_var(--y)]',
      '[scale:var(--scale)]',
      '[z-index:var(--z-index)]',
      '[opacity:var(--opacity)]',
      'will-change-[translate,opacity,scale]',
      'transition-[translate,scale,opacity] duration-400',
      '[transition-timing-function:cubic-bezier(0.21,1.02,0.73,1)]',
      'data-[state=closed]:duration-200',
      'data-[state=closed]:[transition-timing-function:cubic-bezier(0.06,0.71,0.55,1)]',
    ],
    icon: 'mt-0.5 shrink-0',
    content: 'flex-1 min-w-0 pr-6',
    title: 'text-sm font-semibold text-foreground',
    description:
      'mt-1 text-sm text-muted-foreground [&_a]:text-primary [&_a]:underline',
    close: [
      'absolute top-3 right-3',
      'inline-flex items-center justify-center',
      'size-6 rounded-md opacity-70',
      'hover:opacity-100 hover:bg-muted',
      'focus:outline-none focus:ring-2 focus:ring-primary/20',
      'transition-all',
    ],
  },
  variants: {
    type: {
      info: {icon: 'text-sky-500'},
      success: {icon: 'text-emerald-500'},
      warning: {icon: 'text-amber-500'},
      error: {icon: 'text-rose-500'},
      loading: {icon: 'text-muted-foreground'},
    },
  },
  defaultVariants: {
    type: 'info',
  },
})

const styles = toastStyles()

// ==================== Global Store ====================

export const toaster = toastMachine.createStore({
  placement: 'top-end',
  overlap: true,
  gap: 16,
  max: 5,
})

// Track active toasts for fail-safe dismiss
let activeToastIds: string[] = []
toaster.subscribe((state) => {
  if (Array.isArray(state)) {
    activeToastIds = state.map((t) => t.id)
  }
})

// ==================== API Implementation ====================

const createToast = (options: ToastOptions) => {
  const {id, ...rest} = options
  if (id) {
    toaster.update(id, rest)
    return id
  }
  return toaster.create(rest)
}

export const toast = {
  create: createToast,
  info: (message: string, options?: Omit<ToastOptions, 'type'>) =>
    createToast({description: message, type: 'info', ...options}),
  success: (message: string, options?: Omit<ToastOptions, 'type'>) =>
    createToast({description: message, type: 'success', ...options}),
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) =>
    createToast({description: message, type: 'warning', ...options}),
  error: (message: string, options?: Omit<ToastOptions, 'type'>) =>
    createToast({description: message, type: 'error', ...options}),
  loading: (message: string, options?: Omit<ToastOptions, 'type'>) =>
    createToast({
      description: message,
      type: 'loading',
      duration: Number.POSITIVE_INFINITY,
      ...options,
    }),
  update: (id: string, options: ToastOptions) => toaster.update(id, options),
  dismiss: (id?: string) => {
    if (id) {
      toaster.dismiss(id)
    } else {
      // 优先尝试官方 dismiss all
      toaster.dismiss()
      // Fail-safe: 如果官方方法未涵盖，手动清除所有追踪的 ID
      for (const tid of activeToastIds) {
        toaster.dismiss(tid)
      }
    }
  },
  remove: (id?: string) => {
    if (id) {
      toaster.remove(id)
    } else {
      // remove() 官方不支持无参调用，需手动遍历
      for (const tid of activeToastIds) {
        toaster.remove(tid)
      }
    }
  },
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: JSX.Element
      success: JSX.Element | ((data: T) => JSX.Element)
      error: JSX.Element | ((err: unknown) => JSX.Element)
    },
  ): Promise<T> => {
    const id = toast.loading(options.loading as string)
    promise
      .then((data) => {
        const message =
          typeof options.success === 'function'
            ? options.success(data)
            : options.success
        toaster.update(id, {
          description: message,
          type: 'success',
          duration: 2000,
        })
      })
      .catch((err) => {
        const message =
          typeof options.error === 'function'
            ? options.error(err)
            : options.error
        toaster.update(id, {
          description: message,
          type: 'error',
          duration: 5000,
        })
      })
    return promise
  },
}

// ==================== Components ====================

const ToastIcon: Component<{type: ToastType}> = (props) => {
  return (
    <Show
      when={props.type !== 'loading'}
      fallback={<LoaderCircle class="size-5 animate-spin" />}
    >
      <Show when={props.type === 'info'}>
        <Info class="size-5" />
      </Show>
      <Show when={props.type === 'success'}>
        <CheckCircle2 class="size-5" />
      </Show>
      <Show when={props.type === 'warning'}>
        <AlertTriangle class="size-5" />
      </Show>
      <Show when={props.type === 'error'}>
        <XCircle class="size-5" />
      </Show>
    </Show>
  )
}

interface ToastItemProps {
  toast: () => toastMachine.Options<unknown>
  // biome-ignore lint/suspicious/noExplicitAny: Zag Internal Type
  parent: any
  index: () => number
}

const ToastItem: Component<ToastItemProps> = (props) => {
  const machineProps = createMemo(() => ({
    ...props.toast(),
    parent: props.parent,
    index: props.index(),
  }))
  const service = useMachine(toastMachine.machine, machineProps)
  const api = createMemo(() => toastMachine.connect(service, normalizeProps))
  const type = () => (api().type as ToastType) || 'info'
  const variantStyles = () => toastStyles({type: type()})

  const rootProps = () => {
    const zagProps = api().getRootProps()
    return {
      ...zagProps,
      class: `${styles.root()} ${zagProps.class || ''}`.trim(),
    }
  }

  return (
    <div {...rootProps()}>
      <span class={variantStyles().icon()}>
        <ToastIcon type={type()} />
      </span>
      <div class={styles.content()}>
        <Show when={api().title}>
          <div
            {...api().getTitleProps()}
            class={styles.title()}
          >
            {api().title}
          </div>
        </Show>
        <Show when={api().description}>
          <div
            {...api().getDescriptionProps()}
            class={styles.description()}
          >
            {api().description}
          </div>
        </Show>
      </div>
      <Show when={api().closable !== false}>
        <button
          {...api().getCloseTriggerProps()}
          class={styles.close()}
          aria-label="关闭"
        >
          <X class="size-4" />
        </button>
      </Show>
    </div>
  )
}

export interface ToasterProps extends ComponentProps<'div'> {
  placement?: ToastPlacement
  overlap?: boolean
  gap?: number
  max?: number
}

export const Toaster: Component<ToasterProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'placement',
    'overlap',
    'gap',
    'max',
    'class',
    'children',
  ])

  const service = useMachine(toastMachine.group.machine, () => ({
    id: createUniqueId(),
    store: toaster,
    placement: local.placement ?? 'top-end',
    overlap: local.overlap ?? true,
    gap: local.gap ?? 16,
    max: local.max ?? 5,
  }))

  const api = createMemo(() =>
    toastMachine.group.connect(service, normalizeProps),
  )
  const groupProps = () => {
    const zagProps = api().getGroupProps()
    return {
      ...zagProps,
      class:
        `${styles.group()} ${local.class || ''} ${zagProps.class || ''}`.trim(),
    }
  }

  return (
    <Portal>
      <div
        {...groupProps()}
        {...rest}
      >
        <Key
          each={api().getToasts()}
          by={(t) => t.id}
        >
          {(t, index) => (
            <ToastItem
              toast={t}
              parent={service}
              index={index}
            />
          )}
        </Key>
      </div>
    </Portal>
  )
}
