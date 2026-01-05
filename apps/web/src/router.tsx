/**
 * Simple hash router for component showcase
 */

import { createSignal, Show, type Component, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export type Route = {
  path: string
  label: string
  component: Component
}

const [currentPath, setCurrentPath] = createSignal(
  window.location.hash.slice(1) || '/'
)

// Listen for hash changes
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    setCurrentPath(window.location.hash.slice(1) || '/')
  })
}

export function navigate(path: string) {
  window.location.hash = path
}

export function useCurrentPath() {
  return currentPath
}

export interface RouterProps {
  routes: Route[]
  fallback?: JSX.Element
}

export const Router: Component<RouterProps> = (props) => {
  const findRoute = () => props.routes.find((r) => r.path === currentPath())

  return (
    <Show when={findRoute()} fallback={props.fallback ?? <div>Page not found</div>}>
      {(route) => <Dynamic component={route().component} />}
    </Show>
  )
}

