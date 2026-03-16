import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/')({
  component: () => <div>Hello World</div>
})