/* @refresh reload */
import { render } from 'solid-js/web'
import { RouterProvider, createRouter } from '@tanstack/solid-router'
import { ThemeProvider } from '@beeve/ui'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router
  }
}

const root = document.getElementById('root')

render(
  () => (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  ),
  root!
)
