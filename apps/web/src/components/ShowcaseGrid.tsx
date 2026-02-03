/**
 * Cartesian product grid for showcasing component variants
 */

import {For, type Component, type JSX} from 'solid-js'

export interface VariantConfig<T extends string = string> {
  name: string
  values: {value: T; label: string}[]
}

interface ShowcaseGridProps<V1 extends string, V2 extends string> {
  title: string
  description?: string
  variant1: VariantConfig<V1>
  variant2: VariantConfig<V2>
  renderCell: (v1: V1, v2: V2) => JSX.Element
}

export function ShowcaseGrid<V1 extends string, V2 extends string>(
  props: ShowcaseGridProps<V1, V2>,
): JSX.Element {
  return (
    <section class="space-y-4">
      <div>
        <h2 class="text-xl font-semibold">{props.title}</h2>
        {props.description && (
          <p class="text-sm text-muted-foreground mt-1">{props.description}</p>
        )}
      </div>

      <div class="overflow-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="p-3 text-left text-xs text-muted-foreground font-medium border-b">
                {props.variant1.name} \ {props.variant2.name}
              </th>
              <For each={props.variant2.values}>
                {(v2) => (
                  <th class="p-3 text-center text-xs text-muted-foreground font-medium border-b">
                    {v2.label}
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={props.variant1.values}>
              {(v1) => (
                <tr>
                  <td class="p-3 text-xs text-muted-foreground font-medium border-b">
                    {v1.label}
                  </td>
                  <For each={props.variant2.values}>
                    {(v2) => (
                      <td class="p-3 text-center border-b">
                        {props.renderCell(v1.value, v2.value)}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  )
}

interface ShowcaseSectionProps {
  title: string
  description?: string
  children: JSX.Element
}

export const ShowcaseSection: Component<ShowcaseSectionProps> = (props) => {
  return (
    <section class="space-y-4">
      <div>
        <h2 class="text-xl font-semibold">{props.title}</h2>
        {props.description && (
          <p class="text-sm text-muted-foreground mt-1">{props.description}</p>
        )}
      </div>
      <div class="p-6 border rounded-[var(--radius-lg)] bg-card">
        {props.children}
      </div>
    </section>
  )
}

interface ShowcaseRowProps {
  label: string
  children: JSX.Element
}

export const ShowcaseRow: Component<ShowcaseRowProps> = (props) => {
  return (
    <div class="flex items-center gap-4">
      <span class="text-xs text-muted-foreground w-24 shrink-0">
        {props.label}
      </span>
      <div class="flex items-center gap-3 flex-wrap">{props.children}</div>
    </div>
  )
}
