import {createFileRoute} from '@tanstack/solid-router'
import {
  Suspense,
  For,
  Show,
  createMemo,
  createResource,
  createSignal,
} from 'solid-js'
import {Dynamic} from 'solid-js/web'
import {Badge, Button, Card, Input, useTheme} from '@beeve/ui'
import {
  Calendar,
  ExternalLink,
  Laptop,
  Mail,
  Monitor,
  Moon,
  Palette,
  Save,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  User,
} from 'lucide-solid'
import {AppLayout} from '@/components/AppLayout'
import {requireAuth} from '@/lib/guards'
import {
  loadCurrentUserData,
  loadUserSessionsData,
} from '@/lib/loaders/account'
import {
  revokeOtherUserSessions,
  revokeUserSession,
  updateCurrentUserPreferences,
  updateCurrentUserProfile,
} from '@/lib/services/client/account'
import type {ThemeMode, UserSessionDto} from '@/lib/services/contracts'

export const Route = createFileRoute('/settings')({
  beforeLoad: () => requireAuth(),
  loader: async () => loadCurrentUserData(),
  component: SettingsPage,
})

function SettingsPage() {
  const initialMe = Route.useLoaderData()
  const theme = useTheme()

  const [me, setMe] = createSignal(initialMe())
  const [name, setName] = createSignal(me().user.name)
  const [image, setImage] = createSignal(me().user.image ?? '')
  const [themeMode, setThemeMode] = createSignal(me().preferences.themeMode)
  const [profileMessage, setProfileMessage] = createSignal<string | null>(null)
  const [preferencesMessage, setPreferencesMessage] =
    createSignal<string | null>(null)
  const [savingProfile, setSavingProfile] = createSignal(false)
  const [savingPreferences, setSavingPreferences] = createSignal(false)
  const [revoking, setRevoking] = createSignal<string | null>(null)
  const [revokingOthers, setRevokingOthers] = createSignal(false)
  const [sessions, {refetch: refetchSessions}] = createResource(() =>
    loadUserSessionsData(),
  )

  const currentUser = createMemo(() => me().user)

  const memberSince = createMemo(() =>
    new Date(currentUser().createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  )

  const lastUpdated = createMemo(() =>
    new Date(currentUser().updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  )

  const profileDirty = createMemo(
    () =>
      name().trim() !== currentUser().name ||
      (image().trim() || null) !== (currentUser().image ?? null),
  )

  const saveProfile = async () => {
    setSavingProfile(true)
    setProfileMessage(null)

    try {
      const updated = await updateCurrentUserProfile({
        name: name().trim(),
        image: image().trim() || null,
      })

      setMe(updated)
      setName(updated.user.name)
      setImage(updated.user.image ?? '')
      setProfileMessage('Profile updated.')
    } catch (error) {
      setProfileMessage(
        error instanceof Error ? error.message : 'Failed to update profile.',
      )
    } finally {
      setSavingProfile(false)
    }
  }

  const saveThemePreference = async (mode: ThemeMode) => {
    const previousMode = themeMode()

    setSavingPreferences(true)
    setPreferencesMessage(null)
    setThemeMode(mode)
    theme.setMode(mode)

    try {
      await updateCurrentUserPreferences({themeMode: mode})
      setMe((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          themeMode: mode,
        },
      }))
      setPreferencesMessage('Appearance updated.')
    } catch (error) {
      setThemeMode(previousMode)
      theme.setMode(previousMode)
      setPreferencesMessage(
        error instanceof Error ? error.message : 'Failed to save preferences.',
      )
    } finally {
      setSavingPreferences(false)
    }
  }

  const handleRevokeSession = async (token: string) => {
    setRevoking(token)

    try {
      await revokeUserSession(token)
      void refetchSessions()
    } finally {
      setRevoking(null)
    }
  }

  const handleRevokeOtherSessions = async () => {
    setRevokingOthers(true)

    try {
      await revokeOtherUserSessions()
      void refetchSessions()
    } finally {
      setRevokingOthers(false)
    }
  }

  return (
    <AppLayout
      user={currentUser()}
      currentPath="/settings"
      pageTitle="Account settings"
      pageDescription="Editable profile fields render immediately from the server, while session details stream in beneath the account shell."
      pageActions={
        <>
          <Badge variant={currentUser().emailVerified ? 'default' : 'secondary'}>
            {currentUser().emailVerified ? 'Verified email' : 'Verification pending'}
          </Badge>
          <a href="/dashboard">
            <Button variant="outline">
              Dashboard
              <ExternalLink class="size-4" />
            </Button>
          </a>
        </>
      }
    >
      <div class="space-y-6 lg:space-y-8">
        <section class="grid gap-4 md:grid-cols-3">
          <FactPanel
            label="Primary email"
            value={currentUser().email}
            description="Controlled by your social identity provider."
          />
          <FactPanel
            label="Role"
            value={currentUser().role}
            description="Checked on the server before protected views render."
          />
          <FactPanel
            label="Member since"
            value={memberSince()}
            description="Useful when you need a quick account history reference."
          />
        </section>

        <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card title="Profile details" variant="outlined" size="lg">
            <div class="space-y-5">
              <div class="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p class="font-medium">Identity fields</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  Keep editable fields separate from provider-controlled ones so users
                  know exactly what this app owns.
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <Input
                  id="display-name"
                  name="displayName"
                  value={name()}
                  onInput={setName}
                  placeholder="Display name"
                  prefix={<User class="size-4 text-muted-foreground" />}
                />
                <Input
                  id="avatar-image-url"
                  name="avatarImageUrl"
                  value={image()}
                  onInput={setImage}
                  placeholder="Avatar image URL"
                  prefix={<Mail class="size-4 text-muted-foreground" />}
                />
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <ReadOnlySetting
                  label="Primary email"
                  value={currentUser().email}
                  description="This stays read-only because the identity provider is the source of truth."
                />
                <ReadOnlySetting
                  label="Verification"
                  value={currentUser().emailVerified ? 'Verified' : 'Pending'}
                  description="Verification state comes from the linked provider and is surfaced here for clarity."
                />
              </div>

              <div class="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="space-y-1">
                  <Show when={profileMessage()}>
                    {(message) => (
                      <p class="text-sm text-muted-foreground">{message()}</p>
                    )}
                  </Show>
                  <p class="text-xs text-muted-foreground">
                    Last synced account metadata on {lastUpdated()}.
                  </p>
                </div>

                <Button
                  onClick={saveProfile}
                  loading={savingProfile()}
                  disabled={!name().trim() || !profileDirty()}
                >
                  <Save class="size-4" />
                  Save profile
                </Button>
              </div>
            </div>
          </Card>

          <div class="space-y-6">
            <AppearanceSettingsCard
              mode={themeMode}
              saving={savingPreferences}
              message={preferencesMessage}
              onSelect={saveThemePreference}
            />

            <Card title="Account controls" variant="outlined" size="lg">
              <div class="space-y-3">
                <SettingsFact
                  icon={Calendar}
                  label="Member since"
                  value={memberSince()}
                />
                <SettingsFact
                  icon={Shield}
                  label="Role"
                  value={currentUser().role}
                />
                <SettingsFact
                  icon={Mail}
                  label="Email"
                  value={currentUser().email}
                />
              </div>
            </Card>
          </div>
        </section>

        <Suspense fallback={<ActiveSessionsFallback />}>
          <ActiveSessionsSection
            sessions={sessions}
            onRefresh={refetchSessions}
            onRevokeSession={handleRevokeSession}
            onRevokeOthers={handleRevokeOtherSessions}
            revoking={revoking}
            revokingOthers={revokingOthers}
          />
        </Suspense>
      </div>
    </AppLayout>
  )
}

function AppearanceSettingsCard(props: {
  mode: () => ThemeMode
  saving: () => boolean
  message: () => string | null
  onSelect: (mode: ThemeMode) => Promise<void>
}) {
  const modeOptions = [
    {value: 'light' as const, label: 'Light', icon: Sun},
    {value: 'dark' as const, label: 'Dark', icon: Moon},
    {value: 'system' as const, label: 'System', icon: Laptop},
  ]

  return (
    <Card title="Appearance" variant="outlined" size="lg">
      <div class="space-y-4">
        <div class="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
          <Palette class="mt-0.5 size-5 text-primary" />
          <div>
            <p class="font-medium">Interface mode</p>
            <p class="mt-1 text-sm text-muted-foreground">
              Preference is stored on the server so the selected mode stays
              consistent across authenticated sessions.
            </p>
          </div>
        </div>

        <div class="grid gap-2">
          <For each={modeOptions}>
            {(option) => (
              <button
                type="button"
                class="flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors"
                classList={{
                  'border-primary bg-primary/8': props.mode() === option.value,
                  'border-border/70 hover:bg-accent': props.mode() !== option.value,
                }}
                onClick={() => void props.onSelect(option.value)}
                disabled={props.saving()}
              >
                <div class="flex items-center gap-3">
                  <option.icon class="size-4" />
                  <div>
                    <div class="font-medium">{option.label}</div>
                    <div class="text-xs text-muted-foreground">
                      {option.value === 'system'
                        ? 'Follow the device preference.'
                        : `Force ${option.label.toLowerCase()} mode.`}
                    </div>
                  </div>
                </div>
                <Show when={props.mode() === option.value}>
                  <Badge variant="outline">Active</Badge>
                </Show>
              </button>
            )}
          </For>
        </div>

        <Show when={props.message()}>
          {(message) => <p class="text-sm text-muted-foreground">{message()}</p>}
        </Show>
      </div>
    </Card>
  )
}

function ActiveSessionsSection(props: {
  sessions: () => {sessions: UserSessionDto[]} | undefined
  onRefresh: () => unknown
  onRevokeSession: (token: string) => Promise<void>
  onRevokeOthers: () => Promise<void>
  revoking: () => string | null
  revokingOthers: () => boolean
}) {
  const sessionList = createMemo(() => props.sessions()?.sessions ?? [])

  return (
    <Card
      title="Active sessions"
      variant="outlined"
      size="lg"
      extra={
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => void props.onRefresh()}>
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={props.onRevokeOthers}
            loading={props.revokingOthers()}
          >
            Sign out others
          </Button>
        </div>
      }
    >
      <div class="space-y-3">
        <Show
          when={sessionList().length > 0}
          fallback={
            <div class="rounded-2xl border border-dashed border-border/70 bg-background/70 p-5 text-sm text-muted-foreground">
              No active sessions were returned for this account.
            </div>
          }
        >
          <For each={sessionList()}>
            {(sessionItem) => (
              <SessionRow
                sessionItem={sessionItem}
                onRevokeSession={props.onRevokeSession}
                revoking={props.revoking}
              />
            )}
          </For>
        </Show>
      </div>
    </Card>
  )
}

function SessionRow(props: {
  sessionItem: UserSessionDto
  onRevokeSession: (token: string) => Promise<void>
  revoking: () => string | null
}) {
  const DeviceIcon = createMemo(() => {
    const ua = props.sessionItem.userAgent

    if (!ua) {
      return Monitor
    }

    if (/mobile|android|iphone|ipad/i.test(ua)) {
      return Smartphone
    }

    return Monitor
  })

  const deviceName = createMemo(() => {
    const ua = props.sessionItem.userAgent

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
  })

  return (
    <div class="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
      <div class="flex size-10 items-center justify-center rounded-2xl bg-muted">
        <Dynamic component={DeviceIcon()} class="size-5 text-muted-foreground" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium">{deviceName()}</span>
          <Show when={props.sessionItem.current}>
            <Badge variant="default" class="px-1.5 py-0 text-[10px]">
              Current
            </Badge>
          </Show>
        </div>
        <p class="mt-1 truncate text-xs text-muted-foreground">
          Signed in {new Date(props.sessionItem.createdAt).toLocaleString()}
        </p>
      </div>
      <Show when={!props.sessionItem.current}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => props.onRevokeSession(props.sessionItem.token)}
          loading={props.revoking() === props.sessionItem.token}
          title="Revoke session"
        >
          <Trash2 class="size-4 text-destructive" />
        </Button>
      </Show>
    </div>
  )
}

function ActiveSessionsFallback() {
  return (
    <Card
      title="Active sessions"
      variant="outlined"
      size="lg"
      loading
      loadingConfig={{rows: 4}}
    />
  )
}

function FactPanel(props: {
  label: string
  value: string
  description: string
}) {
  return (
    <div class="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
      <div class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {props.label}
      </div>
      <div class="mt-2 text-base font-semibold">{props.value}</div>
      <p class="mt-2 text-sm text-muted-foreground">{props.description}</p>
    </div>
  )
}

function ReadOnlySetting(props: {
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

function SettingsFact(props: {
  icon: typeof Calendar
  label: string
  value: string
}) {
  return (
    <div class="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
      <div class="flex size-10 items-center justify-center rounded-2xl bg-muted">
        <props.icon class="size-4 text-muted-foreground" />
      </div>
      <div class="min-w-0">
        <div class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {props.label}
        </div>
        <div class="mt-1 truncate text-sm font-medium">{props.value}</div>
      </div>
    </div>
  )
}
