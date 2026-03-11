import { authClient } from '@/lib/auth'
import { Button, Input, Label } from '@beeve/ui'
import { Link, createFileRoute, useNavigate } from '@tanstack/solid-router'
import { ArrowRight, Chrome, Github, Lock, Mail } from 'lucide-solid'
import { Show, createEffect, createSignal } from 'solid-js'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const session = authClient.useSession()

  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  // 如果已登录，响应式重定向到 dashboard
  createEffect(() => {
    if (session().data) {
      navigate({ to: '/dashboard' })
    }
  })

  const handleEmailLogin = async (e: Event) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.signIn.email({
        email: email(),
        password: password(),
      })

      if (result.error) {
        setError(result.error.message || '登录失败')
        return
      }

      navigate({ to: '/dashboard' })
    } catch {
      setError('登录过程中发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/dashboard`,
    })
  }

  const handleGithubLogin = () => {
    authClient.signIn.social({
      provider: 'github',
      callbackURL: `${window.location.origin}/dashboard`,
    })
  }

  return (
    <main class="page-wrap flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <h1 class="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)]">
            欢迎回来
          </h1>
          <p class="text-[var(--sea-ink-soft)]">登录您的 Beeve 账号以继续</p>
        </div>

        <div class="rounded-lg border border-[var(--line)] bg-card p-6 shadow-sm">
          {/* 社交登录按钮 */}
          <div class="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              class="gap-2"
            >
              <Chrome class="size-4" />
              <span>Google</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleGithubLogin}
              class="gap-2"
            >
              <Github class="size-4" />
              <span>GitHub</span>
            </Button>
          </div>

          {/* 分隔线 */}
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-[var(--line)]" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-card px-2 text-muted-foreground">
                或使用邮箱登录
              </span>
            </div>
          </div>

          {/* 邮箱登录表单 */}
          <form
            onSubmit={handleEmailLogin}
            class="space-y-4"
          >
            <div class="space-y-2">
              <Label for="email">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email()}
                onInput={(value) => setEmail(value)}
                disabled={isLoading()}
                prefix={<Mail class="size-4" />}
                autocomplete="email"
              />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="password">密码</Label>
                <a
                  href="#"
                  class="text-xs text-[var(--lagoon-deep)] hover:text-[var(--sea-ink)]"
                >
                  忘记密码？
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password()}
                onInput={(value) => setPassword(value)}
                disabled={isLoading()}
                prefix={<Lock class="size-4" />}
                autocomplete="current-password"
              />
            </div>

            <Show when={error()}>
              <div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error()}
              </div>
            </Show>

            <Button
              type="submit"
              class="w-full"
              loading={isLoading()}
              disabled={!email() || !password()}
            >
              <span>登录</span>
              <ArrowRight class="size-4" />
            </Button>
          </form>

          {/* 注册链接 */}
          <div class="text-center text-sm">
            <span class="text-[var(--sea-ink-soft)]">还没有账号？</span>{' '}
            <Link
              to="/register"
              class="font-medium text-[var(--lagoon-deep)] hover:text-[var(--sea-ink)]"
            >
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
