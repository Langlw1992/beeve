/**
 * @beeve/ui - Card Component Exports
 */

import {Card as CardComponent} from './Card'
import type {Component, JSX} from 'solid-js'
import {tv} from 'tailwind-variants'
import {twMerge} from 'tailwind-merge'

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

export const CardHeader: Component<{class?: string; children: JSX.Element}> = (
  props,
) => (
  <div class={twMerge(styles.header(), props.class)}>
    {props.children}
  </div>
)

export const CardTitle: Component<{class?: string; children: JSX.Element}> = (
  props,
) => (
  <h3 class={twMerge(styles.title(), props.class)}>
    {props.children}
  </h3>
)

export const CardDescription: Component<{
  class?: string
  children: JSX.Element
}> = (props) => (
  <p class={twMerge(styles.description(), props.class)}>
    {props.children}
  </p>
)

export const CardContent: Component<{class?: string; children: JSX.Element}> = (
  props,
) => (
  <div class={twMerge(styles.content(), props.class)}>
    {props.children}
  </div>
)

export const CardFooter: Component<{class?: string; children: JSX.Element}> = (
  props,
) => (
  <div class={twMerge(styles.footer(), props.class)}>
    {props.children}
  </div>
)

export const Card = CardComponent
export type {CardProps, CardVariants} from './Card'
