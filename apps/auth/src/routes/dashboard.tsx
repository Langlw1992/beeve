import { authClient } from '@/lib/auth'
import { Button, Card } from '@beeve/ui'
import { Link, createFileRoute, useNavigate } from '@tanstack/solid-router'
import { LogOut, Shield, User } from 'lucide-solid'
import { Show, createEffect } from 'solid-js'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const session = authClient.useSession()

  // 未登录时响应式重定向到登录页
  createEffect(() => {
    if (!session().isPending && !session().data) {
      navigate({ to: '/login' })
    }
  })

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate({ to: '/' })
  }

  return (
    <main class="page-wrap px-4 py-12">
      <div class="mx-auto max-w-4xl">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="display-title text-3xl font-bold text-[var(--sea-ink)]">
              仪表板
            </h1>
            <p class="mt-1 text-[var(--sea-ink-soft)]">
              欢迎回到 Beeve 管理后台
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
          >
            <LogOut class="size-4" />
            <span>退出登录</span>
          </Button>
        </div>

        <Show
          when={!session().isPending}
          fallback={
            <div class="flex items-center justify-center py-20">
              <div class="text-[var(--sea-ink-soft)]">加载中...</div>
            </div>
          }
        >
          <div class="grid gap-6 md:grid-cols-2">
            {/* 用户信息卡片 */}
            <Card
              title="用户信息"
              class="relative overflow-hidden"
            >
              <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--lagoon)]/10" />
              <div class="relative space-y-4">
                <div class="flex items-center gap-4">
                  <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--lagoon)]/20">
                    <User class="size-8 text-[var(--lagoon-deep)]" />
                  </div>
                  <div>
                    <p class="text-lg font-semibold text-[var(--sea-ink)]">
                      {session().data?.user?.name || '未设置姓名'}
                    </p>
                    <p class="text-sm text-[var(--sea-ink-soft)]">
                      {session().data?.user?.email}
                    </p>
                  </div>
                </div>
                <div class="rounded-lg bg-muted p-3 text-sm">
                  <p class="text-[var(--sea-ink-soft)]">
                    用户 ID: {session().data?.user?.id}
                  </p>
                </div>
              </div>
            </Card>

            {/* 权限信息卡片 */}
            <Card
              title="权限信息"
              class="relative overflow-hidden"
            >
              <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--palm)]/10" />
              <div class="relative space-y-4">
                <div class="flex items-center gap-4">
                  <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--palm)]/20">
                    <Shield class="size-8 text-[var(--palm)]" />
                  </div>
                  <div>
                    <p class="text-lg font-semibold text-[var(--sea-ink)]">
                      角色权限
                    </p>
                    <p class="text-sm text-[var(--sea-ink-soft)]">
                      管理您的访问权限
                    </p>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span class="inline-flex items-center rounded-full bg-[var(--lagoon)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--lagoon-deep)]">
                    已登录用户
                  </span>
                  <Show when={session().data?.user?.userType === 'admin'}>
                    <span class="inline-flex items-center rounded-full bg-[var(--palm)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--palm)]">
                      管理员
                    </span>
                  </Show>
                </div>
              </div>
            </Card>

            {/* 快速操作卡片 */}
            <Card
              title="快速操作"
              description="常用功能入口"
              class="md:col-span-2"
            >
              <div class="grid gap-4 sm:grid-cols-3">
                <Link
                  to="/profile"
                  class="flex items-center gap-3 rounded-lg border border-[var(--line)] p-4 transition-colors hover:bg-[var(--foam)]"
                >
                  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--lagoon)]/10">
                    <User class="size-5 text-[var(--lagoon-deep)]" />
                  </div>
                  <div>
                    <p class="font-medium text-[var(--sea-ink)]">个人资料</p>
                    <p class="text-xs text-[var(--sea-ink-soft)]">
                      管理您的个人信息
                    </p>
                  </div>
                </Link>

                <Show when={session().data?.user?.userType === 'admin'}>
                  <Link
                    to="/admin/users"
                    class="flex items-center gap-3 rounded-lg border border-[var(--line)] p-4 transition-colors hover:bg-[var(--foam)]"
                  >
                    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--palm)]/10">
                      <Shield class="size-5 text-[var(--palm)]" />
                    </div>
                    <div>
                      <p class="font-medium text-[var(--sea-ink)]">管理后台</p>
                      <p class="text-xs text-[var(--sea-ink-soft)]">
                        系统管理设置
                      </p>
                    </div>
                  </Link>
                </Show>

                <Link
                  to="/"
                  class="flex items-center gap-3 rounded-lg border border-[var(--line)] p-4 transition-colors hover:bg-[var(--foam)]"
                >
                  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <LogOut class="size-5 text-[var(--sea-ink-soft)]" />
                  </div>
                  <div>
                    <p class="font-medium text-[var(--sea-ink)]">返回首页</p>
                    <p class="text-xs text-[var(--sea-ink-soft)]">
                      回到应用首页
                    </p>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </Show>
      </div>
    </main>
  )
}
