import type { ParentComponent } from 'solid-js'

export interface DemoBoxProps {
  title?: string
  description?: string
  class?: string
  /** 布局模式：default=flex wrap, block=块级容器（用于 Sidebar 等需要完整控制布局的组件） */
  layout?: 'default' | 'block'
}

export const DemoBox: ParentComponent<DemoBoxProps> = (props) => {
  const layout = () => props.layout ?? 'default'

  return (
    <div class="not-content my-6 overflow-hidden rounded-lg border border-border bg-card">
      {props.title && (
        <div class="border-b border-border px-4 py-3">
          <h4 class="text-sm font-medium text-foreground">{props.title}</h4>
          {props.description && (
            <p class="mt-1 text-xs text-muted-foreground">{props.description}</p>
          )}
        </div>
      )}
      <div
        class={
          layout() === 'block'
            ? `${props.class ?? ''}`
            : `flex flex-wrap items-center gap-4 p-6 ${props.class ?? ''}`
        }
      >
        {props.children}
      </div>
    </div>
  )
}
