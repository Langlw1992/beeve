import {createFileRoute} from '@tanstack/solid-router'
import {Show, createMemo, createSignal, For} from 'solid-js'
import {createQuery, useQueryClient} from '@tanstack/solid-query'
import {Card, Button, Badge} from '@beeve/ui'
import {
  User,
  Mail,
  Monitor,
  Smartphone,
  Trash2,
  Sun,
  Moon,
  Laptop,
} from 'lucide-solid'
import {requireAuth} from '@/lib/guards'
import {authClient} from '@/lib/auth/client'
import {useTheme} from '@beeve/ui'
import {AppLayout} from '@/components/AppLayout'

export const Route = createFileRoute('/settings')({
  beforeLoad: () => requireAuth(),
  component: SettingsPage,
})

function SettingsPage() {
  const queryClient = useQueryClient()
  const session = authClient.useSession()
  const theme = useTheme()

  const user = createMemo(() => session().data?.user)

  const sessions = createQuery(() => ({
    queryKey: ['sessions'],
    queryFn: async () => {
      const result = await authClient.listSessions()
      const currentToken = session().data?.session?.token
      return (result.data ?? []).map((s) => ({
        ...s,
        current: s.token === currentToken,
      }))
    },
  }))
  const [revoking, setRevoking] = createSignal<string | null>(null)

  const invalidateSessions = () =>
    queryClient.invalidateQueries({queryKey: ['sessions']})

  const revokeSession = async (sessionToken: string) => {
    setRevoking(sessionToken)
    try {
      await authClient.revokeSession({token: sessionToken})
      await invalidateSessions()
    } finally {
      setRevoking(null)
    }
  }

  const getDeviceIcon = (ua?: string | null) => {
    if (!ua) {
      return Monitor
    }
    if (/mobile|android|iphone|ipad/i.test(ua)) {
      return Smartphone
    }
    return Monitor
  }

  const getDeviceName = (ua?: string | null) => {
    if (!ua) {
      return 'Unknown device'
    }
    if (/chrome/i.test(ua)) {
      return 'Chrome'
    }
    if (/firefox/i.test(ua)) {
      return 'Firefox'
    }
    if (/safari/i.test(ua)) {
      return 'Safari'
    }
    if (/edge/i.test(ua)) {
      return 'Edge'
    }
    return 'Browser'
  }

  const modeOptions = [
    {value: 'light' as const, label: 'Light', icon: Sun},
    {value: 'dark' as const, label: 'Dark', icon: Moon},
    {value: 'system' as const, label: 'System', icon: Laptop},
  ]

  return (
    <AppLayout>
      <div class="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Settings</h1>
          <p class="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile section */}
        <Card title="Profile" variant="outlined" size="md">
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <Show
                when={user()?.image}
                fallback={
                  <div class="flex size-14 items-center justify-center rounded-full bg-muted text-xl font-semibold">
                    {user()?.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                }
              >
                <img
                  src={user()?.image ?? ''}
                  alt={user()?.name ?? ''}
                  class="size-14 rounded-full object-cover ring-2 ring-border"
                />
              </Show>
              <div>
                <p class="font-semibold text-lg">{user()?.name}</p>
                <p class="text-sm text-muted-foreground">{user()?.email}</p>
              </div>
            </div>

            <div class="grid gap-3 rounded-lg border border-border p-4 text-sm">
              <div class="flex items-center gap-3">
                <User class="size-4 text-muted-foreground" />
                <span class="text-muted-foreground">Name</span>
                <span class="ml-auto font-medium">{user()?.name ?? '—'}</span>
              </div>
              <div class="h-px bg-border" />
              <div class="flex items-center gap-3">
                <Mail class="size-4 text-muted-foreground" />
                <span class="text-muted-foreground">Email</span>
                <span class="ml-auto font-medium">{user()?.email ?? '—'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card title="Appearance" variant="outlined" size="md">
          <div class="space-y-3">
            <p class="text-sm text-muted-foreground">
              Choose your preferred color mode
            </p>
            <div class="flex gap-2">
              <For each={modeOptions}>
                {(option) => (
                  <button
                    type="button"
                    class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                    classList={{
                      'border-primary bg-primary/10 text-primary':
                        theme.config().mode === option.value,
                      'border-border hover:bg-accent':
                        theme.config().mode !== option.value,
                    }}
                    onClick={() => theme.setMode(option.value)}
                  >
                    <option.icon class="size-4" />
                    {option.label}
                  </button>
                )}
              </For>
            </div>
          </div>
        </Card>

        {/* Active sessions */}
        <Card
          title="Active Sessions"
          variant="outlined"
          size="md"
          extra={
            <Button
              variant="ghost"
              size="sm"
              onClick={invalidateSessions}
              loading={sessions.isPending}
            >
              Refresh
            </Button>
          }
        >
          <div class="space-y-3">
            <Show
              when={(sessions.data ?? []).length > 0}
              fallback={
                <p class="py-4 text-center text-sm text-muted-foreground">
                  {sessions.isPending ? 'Loading sessions...' : 'No active sessions'}
                </p>
              }
            >
              <For each={sessions.data ?? []}>
                {(sess) => {
                  const DeviceIcon = getDeviceIcon(sess.userAgent)
                  return (
                    <div class="flex items-center gap-3 rounded-lg border border-border p-3">
                      <DeviceIcon class="size-5 text-muted-foreground" />
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-medium">
                            {getDeviceName(sess.userAgent)}
                          </span>
                          <Show when={sess.current}>
                            <Badge
                              variant="default"
                              class="text-[10px] px-1.5 py-0"
                            >
                              Current
                            </Badge>
                          </Show>
                        </div>
                        <p class="truncate text-xs text-muted-foreground">
                          {new Date(sess.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Show when={!sess.current}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => revokeSession(sess.token)}
                          loading={revoking() === sess.token}
                          title="Revoke session"
                        >
                          <Trash2 class="size-4 text-destructive" />
                        </Button>
                      </Show>
                    </div>
                  )
                }}
              </For>
            </Show>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
