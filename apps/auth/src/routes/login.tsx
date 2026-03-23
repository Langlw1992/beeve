import {createFileRoute, Link} from '@tanstack/solid-router'
import {For, createMemo, createSignal} from 'solid-js'
import type {JSX} from 'solid-js'
import {Button} from '@beeve/ui'
import {
  ArrowLeft,
  CheckCircle,
  LayoutDashboard,
  Shield,
  Smartphone,
} from 'lucide-solid'
import {requireGuest} from '@/lib/guards'
import {getEnabledSocialProviders} from '@/lib/auth/functions'
import {signInWithSocial} from '@/lib/services/client/auth'

type SocialProvider = 'google' | 'github' | 'apple'

const socialProviderOptions: Array<{
  id: SocialProvider
  label: string
  Icon: () => JSX.Element
}> = [
  {id: 'google', label: '继续使用 Google 登录', Icon: GoogleIcon},
  {id: 'github', label: '继续使用 GitHub 登录', Icon: GithubIcon},
  {id: 'apple', label: '继续使用 Apple 登录', Icon: AppleIcon},
]

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    await requireGuest()
    return {
      availableProviders: await getEnabledSocialProviders(),
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const [loading, setLoading] = createSignal<SocialProvider | null>(null)
  const routeContext = Route.useRouteContext()

  const enabledProviders = createMemo(() =>
    socialProviderOptions.filter(
      (provider) => routeContext().availableProviders[provider.id],
    ),
  )

  const handleSocialLogin = async (provider: SocialProvider) => {
    setLoading(provider)
    try {
      await signInWithSocial(provider)
    } catch {
      setLoading(null)
    }
  }

  return (
    <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent)]">
      <div class="mx-auto grid min-h-screen max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section class="relative overflow-hidden rounded-[32px] border border-border/70 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),rgba(255,255,255,0.02)_55%),linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))] p-8 shadow-[0_20px_80px_-36px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <div class="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div class="relative flex h-full flex-col justify-between gap-10">
            <div class="space-y-8">
              <Link
                to="/"
                class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft class="size-3.5" />
                返回首页
              </Link>

              <div class="space-y-5">
                <div class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-1.5 text-sm text-muted-foreground">
                  <Shield class="size-4 text-primary" />
                  统一认证入口
                </div>
                <div class="space-y-3">
                  <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
                    一次登录，直接进入
                    <span class="text-primary"> Beeve </span>
                    个人中心
                  </h1>
                  <p class="max-w-xl text-lg text-muted-foreground">
                    用你最熟悉的社交账号完成登录，系统会在服务端确认会话并根据权限进入个人中心或管理后台。
                  </p>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                <BenefitCard
                  icon={CheckCircle}
                  title="统一身份"
                  description="一个账号进入个人中心和管理后台。"
                />
                <BenefitCard
                  icon={LayoutDashboard}
                  title="个人中心"
                  description="资料、会话和偏好集中在一个页面里。"
                />
                <BenefitCard
                  icon={Smartphone}
                  title="跨端一致"
                  description="Web、iOS 和 macOS 使用同一会话状态。"
                />
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <MiniStat title="可见入口" value="个人中心 + 管理后台" />
              <MiniStat title="安全基础" value="服务端校验" />
            </div>
          </div>
        </section>

        <section class="flex items-center">
          <div class="w-full rounded-[32px] border border-border/70 bg-card/95 p-6 shadow-[0_20px_80px_-36px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
            <div class="mb-8 space-y-3">
              <div class="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                B
              </div>
              <div>
                <h2 class="text-2xl font-bold tracking-tight">欢迎回来</h2>
                <p class="mt-1 text-muted-foreground">登录你的 Beeve 账户</p>
              </div>
            </div>

            <div class="space-y-3">
              <For each={enabledProviders()}>
                {(provider) => (
                  <Button
                    variant="outline"
                    class="w-full justify-center gap-3"
                    disabled={loading() !== null}
                    loading={loading() === provider.id}
                    onClick={() => handleSocialLogin(provider.id)}
                  >
                    <provider.Icon />
                    {provider.label}
                  </Button>
                )}
              </For>
            </div>

            <div
              classList={{
                hidden: enabledProviders().length > 0,
              }}
              class="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
            >
              当前还没有配置任何社交登录方式。请先添加 OAuth 凭据后再登录。
            </div>

            <div class="my-6 flex items-center gap-3">
              <div class="h-px flex-1 bg-border" />
              <span class="text-xs text-muted-foreground">安全登录</span>
              <div class="h-px flex-1 bg-border" />
            </div>

            <p class="text-center text-xs leading-6 text-muted-foreground">
              继续即表示你同意 Beeve 的《服务条款》和《隐私政策》。
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function BenefitCard(props: {
  icon: typeof Shield
  title: string
  description: string
}) {
  return (
    <div class="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur">
      <props.icon />
      <h3 class="mt-4 font-semibold">{props.title}</h3>
      <p class="mt-2 text-sm text-muted-foreground">{props.description}</p>
    </div>
  )
}

function MiniStat(props: {title: string; value: string}) {
  return (
    <div class="rounded-2xl border border-border/70 bg-background/80 p-4">
      <div class="text-xs font-medium tracking-[0.12em] text-muted-foreground">
        {props.title}
      </div>
      <div class="mt-2 text-lg font-semibold tracking-tight">{props.value}</div>
    </div>
  )
}

// Brand SVG icons
function GoogleIcon() {
  return (
    <svg class="size-5" viewBox="0 0 24 24" role="img" aria-label="Google">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg
      class="size-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-label="GitHub"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg
      class="size-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-label="Apple"
    >
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}
