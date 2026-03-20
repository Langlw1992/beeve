import {createFileRoute, redirect} from '@tanstack/solid-router'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    throw redirect({
      to: '/settings',
      search: {tab: 'profile'},
    })
  },
  component: DashboardRedirect,
})

function DashboardRedirect() {
  return null
}
