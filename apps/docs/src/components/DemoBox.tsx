import type { ParentComponent } from 'solid-js'

export interface DemoBoxProps {
  title?: string
  description?: string
  class?: string
}

export const DemoBox: ParentComponent<DemoBoxProps> = (props) => {
  return (
    <div class="not-content my-6 rounded-lg border border-border bg-card">
      {props.title && (
        <div class="border-b border-border px-4 py-3">
          <h4 class="text-sm font-medium text-foreground">{props.title}</h4>
          {props.description && (
            <p class="mt-1 text-xs text-muted-foreground">{props.description}</p>
          )}
        </div>
      )}
      <div class={`flex flex-wrap items-center gap-4 p-6 ${props.class ?? ''}`}>
        {props.children}
      </div>
    </div>
  )
}
