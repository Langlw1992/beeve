import {createFileRoute} from '@tanstack/solid-router'
import {createMemo, For, Show} from 'solid-js'
import {Badge, Button, Card} from '@beeve/ui'
import {
  Calendar,
  ExternalLink,
  Mail,
  Shield,
  Sparkles,
  User,
  Waypoints,
} from 'lucide-solid'
import {AppLayout} from '@/components/AppLayout'
import {isAdminUser} from '@/lib/auth/policy'
import {requireAuth} from '@/lib/guards'
import {loadCurrentUserData} from '@/lib/loaders/account'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => requireAuth(),
  loader: async () => loadCurrentUserData(),
  component: DashboardPage,
})

function DashboardPage() {
  const me = Route.useLoaderData()
  const user = createMemo(() => me().user)
  const isAdmin = createMemo(() => isAdminUser(user()))

  const createdAt = createMemo(() =>
    new Date(user().createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  )

  const updatedAt = createMemo(() =>
    new Date(user().updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  )

  const accountStats = createMemo(() => [
    {
      label: 'Account ID',
      value: user().id.slice(0, 8),
      icon: User,
      tone: 'text-primary',
    },
    {
      label: 'Email status',
      value: user().emailVerified ? 'Verified' : 'Pending',
      icon: Mail,
      tone: user().emailVerified ? 'text-emerald-600' : 'text-amber-600',
    },
    {
      label: 'Member since',
      value: createdAt(),
      icon: Calendar,
      tone: 'text-sky-600',
    },
    {
      label: 'Access level',
      value: isAdmin() ? 'Admin' : 'Member',
      icon: Shield,
      tone: isAdmin() ? 'text-fuchsia-600' : 'text-muted-foreground',
    },
  ])

  const workspaceChecklist = createMemo(() => [
    {
      title: 'Identity is available before hydration',
      description:
        'Profile, role, and verification state are rendered on the server so refreshes stay stable.',
    },
    {
      title: 'Settings stay focused on account operations',
      description:
        'Profile changes, appearance preferences, and session controls now live in one dedicated workspace.',
    },
    {
      title: isAdmin()
        ? 'Administrative tools are already unlocked'
        : 'Admin tools remain hidden until a privileged role is assigned',
      description: isAdmin()
        ? 'Open the admin workspace to manage user roles, bans, and session revocation.'
        : 'Navigation and server-side access checks stay aligned so non-admin users never see the admin panel.',
    },
  ])

  const nextActions = createMemo(() => {
    const actions = [
      {
        href: '/settings',
        title: 'Review profile details',
        description: 'Update your display name, avatar, and appearance preference.',
      },
      {
        href: '/settings',
        title: 'Inspect active sessions',
        description:
          'Confirm which browsers or devices are signed in and revoke anything stale.',
      },
    ]

    if (isAdmin()) {
      actions.push({
        href: '/admin',
        title: 'Open the admin workspace',
        description:
          'Manage users, roles, bans, and session revocation without leaving the auth app.',
      })
    }

    return actions
  })

  return (
    <AppLayout
      user={user()}
      currentPath="/dashboard"
      pageTitle={`Welcome back, ${user().name}`}
      pageDescription="This account overview is rendered with a server-verified session so identity data is present on first paint."
      pageActions={
        <>
          <a href="/settings">
            <Button variant="outline">
              Open settings
              <ExternalLink class="size-4" />
            </Button>
          </a>
          <Show when={isAdmin()}>
            <a href="/admin">
              <Button>
                Admin panel
                <Shield class="size-4" />
              </Button>
            </a>
          </Show>
        </>
      }
    >
      <div class="space-y-6 lg:space-y-8">
        <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div class="overflow-hidden rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(15,23,42,0)_65%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))] p-6 shadow-sm sm:p-8">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div class="flex items-start gap-4 sm:gap-5">
                <Show
                  when={user().image}
                  fallback={
                    <div class="flex size-18 items-center justify-center rounded-[24px] bg-primary/12 text-2xl font-semibold text-primary">
                      {user().name.charAt(0).toUpperCase()}
                    </div>
                  }
                >
                  <img
                    src={user().image ?? ''}
                    alt={user().name}
                    class="size-18 rounded-[24px] object-cover ring-1 ring-border"
                  />
                </Show>

                <div class="space-y-4">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-sm text-primary">
                      <Sparkles class="size-4" />
                      Account overview
                    </div>
                    <div>
                      <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
                        {user().name}
                      </h2>
                      <p class="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                        Signed in as {user().email}. This page is meant to answer
                        the immediate questions first: who this user is, what level of
                        access they have, and where they should go next.
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    <Badge variant={user().emailVerified ? 'default' : 'secondary'}>
                      {user().emailVerified ? 'Verified email' : 'Verification pending'}
                    </Badge>
                    <Badge variant="outline">Updated {updatedAt()}</Badge>
                    <Show when={isAdmin()}>
                      <Badge variant="outline">Admin access</Badge>
                    </Show>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card title="Identity Snapshot" variant="outlined" size="lg">
            <div class="space-y-3">
              <SnapshotRow
                label="Display name"
                value={user().name}
                description="Shown across the authenticated workspace."
              />
              <SnapshotRow
                label="Primary email"
                value={user().email}
                description="Managed by the linked social identity provider."
              />
              <SnapshotRow
                label="Current role"
                value={isAdmin() ? 'Admin' : 'Member'}
                description="Used by the server guard before protected pages render."
              />
            </div>
          </Card>
        </section>

        <section class="grid gap-4 lg:grid-cols-4">
          <For each={accountStats()}>
            {(stat) => (
              <div class="rounded-[24px] border border-border/70 bg-card/90 p-4 shadow-sm">
                <div class={`mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] ${stat.tone}`}>
                  <stat.icon class="size-4" />
                  {stat.label}
                </div>
                <p class="text-lg font-semibold tracking-tight">{stat.value}</p>
              </div>
            )}
          </For>
        </section>

        <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card title="Workspace Readiness" variant="outlined" size="lg">
            <div class="space-y-3">
              <For each={workspaceChecklist()}>
                {(item, index) => (
                  <div class="flex gap-4 rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div class="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                      {index() + 1}
                    </div>
                    <div>
                      <h3 class="font-medium">{item.title}</h3>
                      <p class="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Card>

          <Card title="Recommended Actions" variant="outlined" size="lg">
            <div class="space-y-3">
              <For each={nextActions()}>
                {(item) => (
                  <a
                    href={item.href}
                    class="block rounded-2xl border border-border/70 p-4 transition-colors hover:bg-accent"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <h3 class="font-medium">{item.title}</h3>
                        <p class="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <ExternalLink class="mt-0.5 size-4 text-muted-foreground" />
                    </div>
                  </a>
                )}
              </For>
            </div>
          </Card>
        </section>

        <section class="grid gap-6 lg:grid-cols-2">
          <Card title="Security Posture" variant="outlined" size="lg">
            <div class="space-y-3">
              <ReadinessRow
                icon={Shield}
                title="Server-side access guard"
                description="Protected routes validate the session before the page renders, which avoids client-only redirect flashes."
              />
              <ReadinessRow
                icon={Mail}
                title="Provider-controlled identity"
                description="Email is treated as the canonical identifier coming from the social login provider."
              />
              <ReadinessRow
                icon={Waypoints}
                title="Session review is one step away"
                description="Use settings to inspect active sessions and revoke browsers or devices you no longer trust."
              />
            </div>
          </Card>

          <Card title="Account Timeline" variant="outlined" size="lg">
            <div class="space-y-3">
              <TimelineRow
                label="Created"
                value={createdAt()}
                description="The first successful sign-in timestamp stored for this user."
              />
              <TimelineRow
                label="Last profile update"
                value={updatedAt()}
                description="Tracks the latest account metadata change visible to the app."
              />
              <TimelineRow
                label="Verification status"
                value={user().emailVerified ? 'Completed' : 'Pending'}
                description="Reflects whether the linked provider has confirmed the email."
              />
            </div>
          </Card>
        </section>
      </div>
    </AppLayout>
  )
}

function SnapshotRow(props: {
  label: string
  value: string
  description: string
}) {
  return (
    <div class="rounded-2xl border border-border/70 bg-background/80 p-4">
      <div class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {props.label}
      </div>
      <div class="mt-2 text-lg font-semibold tracking-tight">{props.value}</div>
      <p class="mt-2 text-sm text-muted-foreground">{props.description}</p>
    </div>
  )
}

function ReadinessRow(props: {
  icon: typeof Shield
  title: string
  description: string
}) {
  return (
    <div class="flex gap-4 rounded-2xl border border-border/70 bg-background/80 p-4">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted">
        <props.icon class="size-4 text-muted-foreground" />
      </div>
      <div>
        <h3 class="font-medium">{props.title}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{props.description}</p>
      </div>
    </div>
  )
}

function TimelineRow(props: {
  label: string
  value: string
  description: string
}) {
  return (
    <div class="rounded-2xl border border-border/70 bg-background/80 p-4">
      <div class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {props.label}
      </div>
      <div class="mt-2 text-base font-semibold">{props.value}</div>
      <p class="mt-2 text-sm text-muted-foreground">{props.description}</p>
    </div>
  )
}
