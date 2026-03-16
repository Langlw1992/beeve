import { createFileRoute } from '@tanstack/solid-router'
import { requireAuth } from '@/lib/guards'
import DashboardLayout from '@/components/layout/DashboardLayout'

export const Route = createFileRoute('/settings/accounts')({
  component: AccountsPage,
  beforeLoad: requireAuth,
})

function AccountsPage() {
  return (
    <DashboardLayout>
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-semibold text-neutral-900 dark:text-white">
            Account Connections
          </h1>
          <p class="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage your connected social accounts.
          </p>
        </div>

        <div class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <p class="text-neutral-600 dark:text-neutral-400">
            Multi-account linking is currently not available.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
