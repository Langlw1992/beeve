/**
 * 用户中心页 - 用户信息、关联账号、活跃会话管理
 */
import {createSignal, createEffect, Show, For, onMount} from 'solid-js'
import {createFileRoute, useNavigate} from '@tanstack/solid-router'
import {Button, Skeleton} from '@beeve/ui'
import {LogOut, Monitor, Smartphone, X} from 'lucide-solid'
import {tv} from 'tailwind-variants'
import {authClient} from '../lib/auth-client'

// ==================== 样式定义 ====================

const profileStyles = tv({
  slots: {
    container: 'flex min-h-screen items-center justify-center px-4 py-8',
    wrapper: 'w-full max-w-md space-y-6',
    card: 'rounded-[var(--radius)] border border-border bg-card p-6',
    sectionTitle: 'text-sm font-medium text-muted-foreground mb-3',
    avatar:
      'flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold',
    avatarImage: 'size-16 rounded-full object-cover',
    badge:
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
    badgeCurrent: 'bg-primary/10 text-primary',
    sessionItem:
      'flex items-center justify-between gap-3 rounded-[var(--radius)] border border-border p-3',
    providerItem:
      'flex items-center gap-3 rounded-[var(--radius)] border border-border p-3',
  },
})()

// ==================== 品牌图标 ====================

/** Google 品牌图标 */
function GoogleIcon() {
  return (
    <svg
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="Google"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

/** GitHub 品牌图标 */
function GitHubIcon() {
  return (
    <svg
      class="size-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-label="GitHub"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

// ==================== 工具函数 ====================

/** 获取用户名首字母 */
function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

/** 格式化日期 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '未知'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** 解析 User-Agent 判断设备类型 */
function isMobileDevice(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false
  return /mobile|android|iphone|ipad/i.test(userAgent)
}

/** 从 User-Agent 提取浏览器信息 */
function parseBrowser(userAgent: string | null | undefined): string {
  if (!userAgent) return '未知浏览器'
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg'))
    return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
    return 'Safari'
  if (userAgent.includes('Edg')) return 'Edge'
  return '未知浏览器'
}

// ==================== 会话类型 ====================

type SessionInfo = {
  id: string
  token: string
  expiresAt: Date
  createdAt: Date
  ipAddress: string | null
  userAgent: string | null
  userId: string
}

// ==================== 用户中心页组件 ====================

function ProfilePage() {
  const navigate = useNavigate()
  const session = authClient.useSession()
  const [sessions, setSessions] = createSignal<SessionInfo[]>([])
  const [sessionsLoading, setSessionsLoading] = createSignal(true)
  const [revokingToken, setRevokingToken] = createSignal<string | null>(null)
  const [signOutLoading, setSignOutLoading] = createSignal(false)

  // 未登录时重定向到登录页
  createEffect(() => {
    if (!session().isPending && !session().data) {
      navigate({to: '/sign-in'})
    }
  })

  // 加载活跃会话列表
  onMount(async () => {
    try {
      const result = await authClient.listSessions()
      if (result.data) {
        setSessions(result.data as SessionInfo[])
      }
    } catch {
      // 忽略错误
    } finally {
      setSessionsLoading(false)
    }
  })

  /** 撤销指定会话 */
  const handleRevokeSession = async (token: string) => {
    setRevokingToken(token)
    try {
      await authClient.revokeSession({token})
      setSessions((prev) => prev.filter((s) => s.token !== token))
    } catch {
      // 忽略错误
    } finally {
      setRevokingToken(null)
    }
  }

  /** 退出登录 */
  const handleSignOut = async () => {
    setSignOutLoading(true)
    try {
      await authClient.signOut()
      navigate({to: '/sign-in'})
    } catch {
      setSignOutLoading(false)
    }
  }

  /** 判断是否为当前会话 */
  const isCurrentSession = (sessionToken: string) => {
    const currentSession = session().data?.session
    return currentSession?.token === sessionToken
  }

  const user = () => session().data?.user
  const isPending = () => session().isPending

  return (
    <div class={profileStyles.container()}>
      <div class={profileStyles.wrapper()}>
        {/* Logo 和标题 */}
        <div class="text-center">
          <div class="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold">
            B
          </div>
          <h1 class="mt-4 text-2xl font-bold tracking-tight text-foreground">
            用户中心
          </h1>
        </div>

        {/* 用户信息卡片 */}
        <div class={profileStyles.card()}>
          <Show
            when={!isPending()}
            fallback={
              <div class="flex items-center gap-4">
                <Skeleton.Avatar size="lg" />
                <div class="flex-1 space-y-2">
                  <Skeleton
                    width="60%"
                    height={20}
                  />
                  <Skeleton
                    width="80%"
                    height={14}
                  />
                  <Skeleton
                    width="50%"
                    height={12}
                  />
                </div>
              </div>
            }
          >
            <div class="flex items-center gap-4">
              <Show
                when={user()?.image}
                fallback={
                  <div class={profileStyles.avatar()}>
                    {getInitials(user()?.name)}
                  </div>
                }
              >
                <img
                  src={user()?.image ?? ''}
                  alt={user()?.name ?? '用户头像'}
                  class={profileStyles.avatarImage()}
                />
              </Show>
              <div class="flex-1 min-w-0">
                <div class="text-lg font-semibold text-foreground truncate">
                  {user()?.name ?? '未设置名称'}
                </div>
                <div class="text-sm text-muted-foreground truncate">
                  {user()?.email}
                </div>
                <div class="text-xs text-muted-foreground mt-1">
                  注册于 {formatDate(user()?.createdAt)}
                </div>
              </div>
            </div>
          </Show>
        </div>

        {/* 已关联账号 */}
        <div class={profileStyles.card()}>
          <div class={profileStyles.sectionTitle()}>已关联账号</div>
          <div class="space-y-2">
            <div class={profileStyles.providerItem()}>
              <GoogleIcon />
              <span class="text-sm text-foreground">Google</span>
            </div>
            <div class={profileStyles.providerItem()}>
              <GitHubIcon />
              <span class="text-sm text-foreground">GitHub</span>
            </div>
          </div>
        </div>

        {/* 活跃会话 */}
        <div class={profileStyles.card()}>
          <div class={profileStyles.sectionTitle()}>活跃会话</div>
          <Show
            when={!sessionsLoading()}
            fallback={
              <div class="space-y-2">
                <Skeleton
                  width="100%"
                  height={56}
                />
                <Skeleton
                  width="100%"
                  height={56}
                />
              </div>
            }
          >
            <div class="space-y-2">
              <For each={sessions()}>
                {(s) => (
                  <div class={profileStyles.sessionItem()}>
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      <Show
                        when={isMobileDevice(s.userAgent)}
                        fallback={
                          <Monitor class="size-4 shrink-0 text-muted-foreground" />
                        }
                      >
                        <Smartphone class="size-4 shrink-0 text-muted-foreground" />
                      </Show>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-foreground truncate">
                            {parseBrowser(s.userAgent)}
                          </span>
                          <Show when={isCurrentSession(s.token)}>
                            <span
                              class={`${profileStyles.badge()} ${profileStyles.badgeCurrent()}`}
                            >
                              当前
                            </span>
                          </Show>
                        </div>
                        <div class="text-xs text-muted-foreground">
                          {s.ipAddress ?? '未知 IP'} · {formatDate(s.createdAt)}
                        </div>
                      </div>
                    </div>
                    <Show when={!isCurrentSession(s.token)}>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="撤销此会话"
                        loading={revokingToken() === s.token}
                        onClick={() => handleRevokeSession(s.token)}
                      >
                        <X class="size-4" />
                      </Button>
                    </Show>
                  </div>
                )}
              </For>
              <Show when={sessions().length === 0}>
                <div class="text-sm text-muted-foreground text-center py-4">
                  暂无活跃会话
                </div>
              </Show>
            </div>
          </Show>
        </div>

        {/* 退出登录 */}
        <Button
          variant="outline"
          size="lg"
          class="w-full"
          loading={signOutLoading()}
          onClick={handleSignOut}
        >
          <LogOut class="size-4" />
          退出登录
        </Button>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})
