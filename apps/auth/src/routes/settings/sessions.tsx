import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, Show, For } from 'solid-js'
import { requireAuth } from '@/lib/guards'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { authClient } from '@/lib/auth/client'

export const Route = createFileRoute('/settings/sessions')({
  component: SessionsPage,
  beforeLoad: requireAuth,
})

// 设备图标
const DesktopIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const MobileIcon = () => (
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
)

interface Session {
  id: string
  userAgent?: string | null
  ipAddress?: string | null
  createdAt: Date
  updatedAt: Date
  token: string
}

function SessionsPage() {
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [sessions, setSessions] = createSignal<Session[]>([])
  const [isRevoking, setIsRevoking] = createSignal<string | null>(null)

  // 获取会话列表
  const fetchSessions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.listSessions()

      if (result.error) {
        setError(result.error.message || 'Failed to load sessions')
      } else {
        // Map the result data to our Session interface
        const mappedSessions: Session[] = (result.data || []).map(s => ({
          id: s.id,
          userAgent: s.userAgent,
          ipAddress: s.ipAddress,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          token: s.token,
        }))
        setSessions(mappedSessions)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // 终止会话
  const handleRevokeSession = async (sessionToken: string) => {
    setIsRevoking(sessionToken)
    setError(null)

    try {
      const result = await authClient.revokeSession({ token: sessionToken })

      if (result.error) {
        setError(result.error.message || 'Failed to revoke session')
      } else {
        // 刷新列表
        await fetchSessions()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsRevoking(null)
    }
  }

  // 终止所有其他会话
  const handleRevokeAllOtherSessions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.revokeOtherSessions()

      if (result.error) {
        setError(result.error.message || 'Failed to revoke sessions')
      } else {
        // 刷新列表
        await fetchSessions()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // 初始化加载
  fetchSessions()

  // 检测设备类型（简单判断）
  const getDeviceIcon = (userAgent: string | null | undefined) => {
    const ua = (userAgent ?? '').toLowerCase()
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <MobileIcon />
    }
    return <DesktopIcon />
  }

  return (
    <DashboardLayout>
      <div class="space-y-6">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-neutral-900 dark:text-white">
              Active Sessions
            </h1>
            <p class="mt-2 text-neutral-600 dark:text-neutral-400">
              View and manage your active sessions across all devices.
            </p>
          </div>

          <button
            onClick={handleRevokeAllOtherSessions}
            disabled={isLoading() || sessions().length <= 1}
            class="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            Sign out all other devices
          </button>
        </div>

        {/* 错误提示 */}
        <Show when={error()}>
          {(msg) => (
            <div class="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {msg()}
            </div>
          )}
        </Show>

        {/* 会话列表 */}
        <div class="rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <div class="border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
            <h3 class="text-lg font-medium text-neutral-900 dark:text-white">
              Your Sessions
            </h3>
          </div>

          <Show
            when={!isLoading()}
            fallback={
              <div class="flex items-center justify-center p-8">
                <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-600" />
              </div>
            }
          >
            <div class="divide-y divide-neutral-200 dark:divide-neutral-700">
              <For each={sessions()}>
                {(session, index) => (
                  <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-4">
                      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                        {getDeviceIcon(session.userAgent)}
                      </div>
                      <div>
                        <p class="font-medium text-neutral-900 dark:text-white">
                          {index() === 0 ? 'Current session' : 'Active session'}
                        </p>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400">
                          {session.ipAddress ?? 'Unknown IP'} · Last active {session.updatedAt.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Show when={index() !== 0}>
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={isRevoking() === session.id}
                        class="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                      >
                        <Show
                          when={isRevoking() === session.id}
                          fallback="Sign out"
                        >
                          <span class="flex items-center gap-2">
                            <div class="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
                            Signing out...
                          </span>
                        </Show>
                      </button>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* 安全提示 */}
        <div class="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
          <p class="font-medium">Security Tip</p>
          <p class="mt-1">
            If you notice any unfamiliar sessions, sign them out immediately and consider reviewing your connected accounts.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
