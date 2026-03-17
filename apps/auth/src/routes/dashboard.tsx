import {createFileRoute} from '@tanstack/solid-router'
import type {JSX} from 'solid-js'
import {Show, createMemo} from 'solid-js'
import {Card, Badge, Button} from '@beeve/ui'
import {User, Mail, Calendar, ExternalLink} from 'lucide-solid'
import {requireAuth} from '@/lib/guards'
import {authClient} from '@/lib/auth/client'
import {AppLayout} from '@/components/AppLayout'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => requireAuth(),
  component: DashboardPage,
})

function DashboardPage() {
  const session = authClient.useSession()

  const user = createMemo(() => session().data?.user)

  const createdAt = createMemo(() => {
    const date = user()?.createdAt
    if (!date) {
      return ''
    }
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  const isAdmin = createMemo(() => user()?.role === 'admin')

  return (
    <AppLayout>
      <div class="mx-auto max-w-4xl space-y-6">
        {/* Welcome */}
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p class="text-muted-foreground">
            Welcome back, {user()?.name ?? 'User'}
          </p>
        </div>

        {/* Profile card */}
        <Card variant="outlined" size="lg">
          <div class="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Show
              when={user()?.image}
              fallback={
                <div class="flex size-16 items-center justify-center rounded-full bg-muted text-2xl font-semibold">
                  {user()?.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
              }
            >
              <img
                src={user()?.image ?? ''}
                alt={user()?.name ?? ''}
                class="size-16 rounded-full object-cover ring-2 ring-border"
              />
            </Show>

            <div class="flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-semibold">{user()?.name}</h2>
                <Show when={isAdmin()}>
                  <Badge variant="default">Admin</Badge>
                </Show>
              </div>
              <p class="text-sm text-muted-foreground">{user()?.email}</p>
            </div>

            <a href="/settings">
              <Button variant="outline" size="md">
                Edit profile
                <ExternalLink class="size-3.5" />
              </Button>
            </a>
          </div>
        </Card>

        {/* Info grid */}
        <div class="grid gap-4 sm:grid-cols-3">
          <InfoCard
            icon={<User class="size-4 text-primary" />}
            label="Account ID"
            value={user()?.id?.slice(0, 8) ?? '—'}
          />
          <InfoCard
            icon={<Mail class="size-4 text-primary" />}
            label="Email verified"
            value={user()?.emailVerified ? 'Yes' : 'No'}
          />
          <InfoCard
            icon={<Calendar class="size-4 text-primary" />}
            label="Member since"
            value={createdAt() || '—'}
          />
        </div>

        {/* Quick actions */}
        <Card title="Quick Actions" variant="outlined" size="md">
          <div class="grid gap-3 sm:grid-cols-2">
            <a href="/settings">
              <ActionCard
                title="Account Settings"
                description="Manage your profile and sessions"
              />
            </a>
            <Show when={isAdmin()}>
              <a href="/admin">
                <ActionCard
                  title="Admin Panel"
                  description="Manage users and system settings"
                />
              </a>
            </Show>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

function InfoCard(props: {icon: JSX.Element; label: string; value: string}) {
  return (
    <div class="rounded-xl border border-border bg-card p-4">
      <div class="mb-2 flex items-center gap-2 text-muted-foreground">
        {props.icon}
        <span class="text-xs font-medium uppercase tracking-wider">
          {props.label}
        </span>
      </div>
      <p class="text-lg font-semibold">{props.value}</p>
    </div>
  )
}

function ActionCard(props: {title: string; description: string}) {
  return (
    <div class="group rounded-lg border border-border p-4 transition-colors hover:bg-accent">
      <h3 class="font-medium group-hover:text-accent-foreground">
        {props.title}
      </h3>
      <p class="mt-1 text-sm text-muted-foreground">{props.description}</p>
    </div>
  )
}
