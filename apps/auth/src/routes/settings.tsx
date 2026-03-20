import {createFileRoute} from '@tanstack/solid-router'
import {
  For,
  Show,
  Suspense,
  createEffect,
  createMemo,
  createResource,
  createSignal,
} from 'solid-js'
import {Dynamic} from 'solid-js/web'
import {
  Badge,
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useTheme,
} from '@beeve/ui'
import {
  Calendar,
  Image,
  Laptop,
  Mail,
  Monitor,
  Moon,
  Save,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  User,
} from 'lucide-solid'
import {AppLayout} from '@/components/AppLayout'
import {formatUserRoleLabel, isAdminUser} from '@/lib/auth/policy'
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

type SettingsTab = 'profile' | 'sessions' | 'preferences'

const settingsTabs: Array<{
  value: SettingsTab
  label: string
  description: string
  icon: typeof User
}> = [
  {
    value: 'profile',
    label: '资料',
    description: '编辑显示名称和头像。',
    icon: User,
  },
  {
    value: 'sessions',
    label: '会话',
    description: '查看和回收登录设备。',
    icon: Monitor,
  },
  {
    value: 'preferences',
    label: '偏好',
    description: '调整界面外观。',
    icon: Sun,
  },
]

export const Route = createFileRoute('/settings')({
  beforeLoad: () => requireAuth(),
  validateSearch: (search: Record<string, unknown>) => ({
    tab: isSettingsTab(search.tab) ? search.tab : 'profile',
  }),
  loader: async () => loadCurrentUserData(),
  component: SettingsPage,
})

function SettingsPage() {
  const initialMe = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
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
  const [shouldLoadSessions, setShouldLoadSessions] = createSignal(
    search().tab === 'sessions',
  )

  createEffect(() => {
    if (search().tab === 'sessions') {
      setShouldLoadSessions(true)
    }
  })

  const [sessions, {refetch: refetchSessions}] = createResource(
    shouldLoadSessions,
    async (load) => {
      if (!load) {
        return undefined
      }

      return loadUserSessionsData()
    },
  )

  const currentUser = createMemo(() => me().user)
  const activeTab = createMemo(() => search().tab)
  const isAdmin = createMemo(() => isAdminUser(currentUser()))

  const memberSince = createMemo(() =>
    new Date(currentUser().createdAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  )

  const lastUpdated = createMemo(() =>
    new Date(currentUser().updatedAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  )

  const profileDirty = createMemo(
    () =>
      name().trim() !== currentUser().name ||
      (image().trim() || null) !== (currentUser().image ?? null),
  )

  const profileFacts = createMemo(() => [
    {
      icon: Mail,
      label: '主邮箱',
      value: currentUser().email,
      description: '由身份提供方托管。',
    },
    {
      icon: Shield,
      label: '角色',
      value: formatUserRoleLabel(currentUser().role),
      description: '由服务端守卫和权限策略共同决定。',
    },
    {
      icon: Calendar,
      label: '验证状态',
      value: currentUser().emailVerified ? '已验证' : '待验证',
      description: '邮箱是否已由提供方确认。',
    },
    {
      icon: Calendar,
      label: '加入时间',
      value: memberSince(),
      description: '首次成功登录的时间点。',
    },
  ])

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
      setProfileMessage('资料已更新。')
    } catch (error) {
      setProfileMessage(
        error instanceof Error ? error.message : '无法更新个人资料。',
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
      setPreferencesMessage('外观设置已更新。')
    } catch (error) {
      setThemeMode(previousMode)
      theme.setMode(previousMode)
      setPreferencesMessage(
        error instanceof Error ? error.message : '无法保存偏好设置。',
      )
    } finally {
      setSavingPreferences(false)
    }
  }

  const handleTabChange = (value: SettingsTab) => {
    void navigate({
      search: (current) => ({...current, tab: value}),
      replace: true,
      resetScroll: false,
    })
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
      pageTitle="个人中心"
      pageDescription="资料、会话和偏好都放在一个页面里，切换标签即可完成主要操作。"
    >
      <div class="rounded-[28px] border border-border/60 bg-background/70 p-4 shadow-[0_24px_90px_-58px_rgba(15,23,42,0.55)] backdrop-blur sm:p-6 lg:p-8">
        <div class="space-y-6">
        <section class="space-y-5">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-start gap-4">
              <Show
                when={currentUser().image}
                fallback={
                  <div class="flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/60 text-lg font-semibold shadow-sm">
                    {currentUser().name.charAt(0).toUpperCase()}
                  </div>
                }
              >
                <img
                  src={currentUser().image ?? ''}
                  alt={currentUser().name}
                  class="size-14 rounded-2xl object-cover ring-1 ring-border/50"
                />
              </Show>

              <div class="space-y-2">
                <p class="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  个人中心
                </p>
                <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {currentUser().name}
                </h1>
                <p class="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                  资料、会话和偏好统一收口到一个页面里。普通用户只需要理解这一个入口，切换标签即可完成主要操作。
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <Badge
                variant={currentUser().emailVerified ? 'default' : 'secondary'}
              >
                {currentUser().emailVerified ? '邮箱已验证' : '邮箱待验证'}
              </Badge>
              <Badge variant="outline">最近同步 {lastUpdated()}</Badge>
              <Show when={isAdmin()}>
                <Badge variant="outline">管理员</Badge>
              </Show>
            </div>
          </div>
        </section>

        <Tabs
          value={activeTab()}
          onValueChange={(details) => handleTabChange(details.value as SettingsTab)}
          class="gap-6"
          variant="filled"
          size="sm"
          lazyMount
          keepAlive
        >
          <TabsList class="w-fit max-w-full overflow-x-auto">
            <For each={settingsTabs}>
              {(tab) => (
                <TabsTrigger value={tab.value} class="shrink-0 gap-2 px-3">
                  <tab.icon class="size-4" />
                  {tab.label}
                </TabsTrigger>
              )}
            </For>
          </TabsList>

          <TabsContent value="profile" class="pt-6">
            <ProfileTab
              memberSince={memberSince()}
              lastUpdated={lastUpdated()}
              profileFacts={profileFacts()}
              name={name}
              image={image}
              setName={setName}
              setImage={setImage}
              profileMessage={profileMessage}
              savingProfile={savingProfile}
              profileDirty={profileDirty}
              onSave={saveProfile}
            />
          </TabsContent>

          <TabsContent value="sessions" class="pt-6">
            <Suspense
              fallback={
                <SectionFallback
                  title="会话"
                  description="正在加载会话信息。"
                />
              }
            >
              <SessionsTab
                sessions={sessions}
                loading={sessions.loading}
                revoking={revoking}
                revokingOthers={revokingOthers}
                onRefresh={() => void refetchSessions()}
                onRevokeSession={handleRevokeSession}
                onRevokeOthers={handleRevokeOtherSessions}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="preferences" class="pt-6">
            <PreferencesTab
              themeMode={themeMode}
              savingPreferences={savingPreferences}
              preferencesMessage={preferencesMessage}
              onSelect={saveThemePreference}
            />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}

function ProfileTab(props: {
  memberSince: string
  lastUpdated: string
  profileFacts: Array<{
    icon: typeof User
    label: string
    value: string
    description: string
  }>
  name: () => string
  image: () => string
  setName: (value: string) => void
  setImage: (value: string) => void
  profileMessage: () => string | null
  savingProfile: () => boolean
  profileDirty: () => boolean
  onSave: () => Promise<void>
}) {
  return (
    <div class="grid gap-8 lg:grid-cols-[1fr_0.92fr]">
      <section class="space-y-4">
        <SectionHeading
          title="资料"
          description="只编辑你能控制的字段，避免让用户误以为邮箱也可在这里改。"
        />

        <div class="grid gap-4 sm:grid-cols-2">
          <Input
            id="display-name"
            name="displayName"
            value={props.name()}
            onInput={props.setName}
            placeholder="显示名称"
            prefix={<User class="size-4 text-muted-foreground" />}
          />
          <Input
            id="avatar-image-url"
            name="avatarImageUrl"
            value={props.image()}
            onInput={props.setImage}
            placeholder="头像图片地址"
            prefix={<Image class="size-4 text-muted-foreground" />}
          />
        </div>

        <div class="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <Show when={props.profileMessage()}>
              {(message) => (
                <p class="text-sm text-muted-foreground">{message()}</p>
              )}
            </Show>
            <p class="text-xs text-muted-foreground">
              最近一次同步账户元数据发生在 {props.lastUpdated}。
            </p>
          </div>

          <Button
            onClick={props.onSave}
            loading={props.savingProfile()}
            disabled={!props.name().trim() || !props.profileDirty()}
          >
            <Save class="size-4" />
            保存资料
          </Button>
        </div>
      </section>

      <section class="space-y-4">
        <SectionHeading
          title="账户信息"
          description="只读信息集中展示，快速核对即可。"
        />

        <div class="divide-y divide-border/60 border-y border-border/60">
          <For each={props.profileFacts}>
            {(fact) => (
              <InfoRow
                icon={fact.icon}
                label={fact.label}
                value={fact.value}
                description={fact.description}
              />
            )}
          </For>
        </div>

        <p class="text-xs text-muted-foreground">
          用户名和头像由你自己管理，邮箱和角色仍以身份提供方与服务端权限校验为准。
        </p>
      </section>
    </div>
  )
}

function PreferencesTab(props: {
  themeMode: () => ThemeMode
  savingPreferences: () => boolean
  preferencesMessage: () => string | null
  onSelect: (mode: ThemeMode) => Promise<void>
}) {
  const modeOptions = [
    {value: 'light' as const, label: '浅色', icon: Sun},
    {value: 'dark' as const, label: '深色', icon: Moon},
    {value: 'system' as const, label: '跟随系统', icon: Laptop},
  ]

  return (
    <section class="space-y-4">
      <SectionHeading
        title="偏好"
        description="当前阶段先保留外观设置，后续可以继续扩展通知、语言等轻量选项。"
      />

      <div class="divide-y divide-border/60 border-y border-border/60">
        <For each={modeOptions}>
          {(option) => (
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 px-3 py-4 text-left transition-colors hover:bg-accent/30"
              classList={{
                'bg-muted/40': props.themeMode() === option.value,
              }}
              onClick={() => void props.onSelect(option.value)}
              disabled={props.savingPreferences()}
            >
              <div class="flex items-center gap-3">
                <div class="flex size-8 items-center justify-center rounded-md border border-border/60 bg-muted/40">
                  <option.icon class="size-4 text-muted-foreground" />
                </div>
                <div>
                  <div class="font-medium">{option.label}</div>
                  <div class="text-xs text-muted-foreground">
                    {option.value === 'system'
                      ? '跟随设备偏好。'
                      : `固定为${option.label}模式。`}
                  </div>
                </div>
              </div>
              <Show when={props.themeMode() === option.value}>
                <Badge variant="outline">当前</Badge>
              </Show>
            </button>
          )}
        </For>
      </div>

      <Show when={props.preferencesMessage()}>
        {(message) => <p class="text-sm text-muted-foreground">{message()}</p>}
      </Show>
    </section>
  )
}

function SessionsTab(props: {
  sessions: () => {sessions: UserSessionDto[]} | undefined
  loading: boolean
  revoking: () => string | null
  revokingOthers: () => boolean
  onRefresh: () => unknown
  onRevokeSession: (token: string) => Promise<void>
  onRevokeOthers: () => Promise<void>
}) {
  const sessionList = createMemo(() => props.sessions()?.sessions ?? [])

  return (
    <section class="space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          title="会话"
          description="查看当前登录设备，并清理不再需要的会话。"
        />
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => void props.onRefresh()}>
            刷新
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={props.onRevokeOthers}
            loading={props.revokingOthers()}
          >
            退出其他设备
          </Button>
        </div>
      </div>

      <div class="divide-y divide-border/60 border-y border-border/60">
        <Show
          when={!props.loading && sessionList().length > 0}
          fallback={
            <div class="px-3 py-4 text-sm text-muted-foreground">
              {props.loading
                ? '正在加载会话信息。'
                : '当前账户没有返回任何活跃会话。'}
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
    </section>
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
      return '未知设备'
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

    return '浏览器'
  })

  return (
    <div class="flex items-start gap-3 px-3 py-4">
      <div class="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40">
        <Dynamic component={DeviceIcon()} class="size-4 text-muted-foreground" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium">{deviceName()}</span>
          <Show when={props.sessionItem.current}>
            <Badge variant="default" class="px-1.5 py-0 text-[10px]">
              当前会话
            </Badge>
          </Show>
        </div>
        <p class="mt-1 text-xs text-muted-foreground">
          登录于 {new Date(props.sessionItem.createdAt).toLocaleString('zh-CN')}
        </p>
      </div>
      <Show when={!props.sessionItem.current}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => props.onRevokeSession(props.sessionItem.token)}
          loading={props.revoking() === props.sessionItem.token}
          title="撤销会话"
        >
          <Trash2 class="size-4 text-destructive" />
        </Button>
      </Show>
    </div>
  )
}

function InfoRow(props: {
  icon?: typeof User
  label: string
  value: string
  description?: string
}) {
  return (
    <div class="flex items-start gap-3 px-3 py-4">
      {props.icon ? (
        <div class="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40">
          <Dynamic component={props.icon} class="size-4 text-muted-foreground" />
        </div>
      ) : (
        <div class="size-8 shrink-0" />
      )}
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline justify-between gap-3">
          <p class="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {props.label}
          </p>
          <p class="text-sm font-medium text-foreground">{props.value}</p>
        </div>
        <Show when={props.description}>
          {(description) => (
            <p class="mt-1 text-xs leading-5 text-muted-foreground">
              {description()}
            </p>
          )}
        </Show>
      </div>
    </div>
  )
}

function SectionHeading(props: {
  title: string
  description: string
}) {
  return (
    <div class="space-y-1">
      <h3 class="text-sm font-semibold tracking-tight text-foreground">
        {props.title}
      </h3>
      <p class="text-sm leading-6 text-muted-foreground">{props.description}</p>
    </div>
  )
}

function SectionFallback(props: {
  title: string
  description: string
}) {
  return (
    <section class="space-y-4">
      <SectionHeading title={props.title} description={props.description} />
      <div class="divide-y divide-border/60 border-y border-border/60">
        <div class="px-3 py-4 text-sm text-muted-foreground">
          正在加载。
        </div>
      </div>
    </section>
  )
}

function isSettingsTab(value: unknown): value is SettingsTab {
  return typeof value === 'string' && settingsTabs.some((tab) => tab.value === value)
}
