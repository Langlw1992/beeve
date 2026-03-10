/**
 * @beeve/ui - Card Component Exports
 */

import {Card as CardComponent} from './Card'
import type {Component, JSX} from 'solid-js'
import {tv} from 'tailwind-variants'

// 复用 Card 的样式
const cardParts = tv({
  slots: {
    header: 'flex flex-col space-y-1.5 p-6',
    title: 'text-2xl font-semibold leading-none tracking-tight',
    description: 'text-sm text-muted-foreground',
    content: 'p-6 pt-0',
    footer: 'flex items-center p-6 pt-0',
  },
})

const styles = cardParts()

// CardHeader 子组件
export const CardHeader: Component<{class?: string; children: JSX.Element}> = (
  props,
) => (
  <div class={[styles.header(), props.class].filter(Boolean).join(' ')}>
    {props.children}
  </div>
)

// CardTitle 子组件
export const CardTitle: Component<{class?: string; children: JSX.Element}> = (
  props,
) => (
  <h3 class={[styles.title(), props.class].filter(Boolean).join(' ')}>
    {props.children}
  </h3>
)

// CardDescription 子组件
export const CardDescription: Component<{
  class?: string
  children: JSX.Element
}> = (props) => (
  <p class={[styles.description(), props.class].filter(Boolean).join(' ')}>
    {props.children}
  </p>
)

// CardContent 子组件
export const CardContent: Component<{class?: string; children: JSX.Element}> = (
  props,
) => (
  <div class={[styles.content(), props.class].filter(Boolean).join(' ')}>
    {props.children}
  </div>
)

// CardFooter 子组件
export const CardFooter: Component<{class?: string; children: JSX.Element}> = (
  props,
) => (
  <div class={[styles.footer(), props.class].filter(Boolean).join(' ')}>
    {props.children}
  </div>
)

export const Card = CardComponent
export type {CardProps, CardVariants} from './Card'
