import {createFileRoute, Link} from '@tanstack/solid-router'
import {Button} from '@beeve/ui'
import {
  ArrowRight,
  Github,
  LayoutDashboard,
  Shield,
  Smartphone,
} from 'lucide-solid'
import {requireGuest} from '@/lib/guards'

export const Route = createFileRoute('/')({
  beforeLoad: () => requireGuest(),
  component: IndexPage,
})

const featureCards = [
  {
    icon: Shield,
    title: '默认安全',
    description: 'OAuth 登录、服务端会话和权限校验统一收口。',
  },
  {
    icon: LayoutDashboard,
    title: '个人中心',
    description: '资料、会话和偏好收敛到一个更明确的入口。',
  },
  {
    icon: Smartphone,
    title: '多端同步',
    description: 'Web、iOS 和 macOS 共享同一身份状态。',
  },
] as const

function IndexPage() {
  return (
    <div class="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent)]">
      <header class="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 sm:px-8">
        <div class="flex items-center gap-2">
          <div class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            B
          </div>
          <div>
            <p class="font-semibold text-lg leading-none">Beeve 认证中心</p>
            <p class="mt-1 text-xs text-muted-foreground">统一身份入口</p>
          </div>
        </div>

        <Link to="/login">
          <Button variant="outline" size="md" class="gap-2">
            进入登录
            <ArrowRight class="size-3.5" />
          </Button>
        </Link>
      </header>

      <main class="mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-12">
        <section class="max-w-2xl space-y-8">
          <div class="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            <Shield class="size-4 text-primary" />
            统一认证中心
          </div>

          <div class="space-y-5">
            <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              一次登录，访问
              <span class="text-primary"> Beeve </span>
              的全部服务
            </h1>
            <p class="max-w-xl text-lg text-muted-foreground sm:text-xl">
              将身份、权限和会话集中在一个入口，减少重复登录，让个人中心先于其他功能页成为默认落点。
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <Link to="/login">
              <Button size="lg" class="w-full gap-2 px-8 sm:w-auto">
                立即登录
                <ArrowRight class="size-4" />
              </Button>
            </Link>
            <Link to="/ui-preview">
              <Button variant="outline" size="lg" class="gap-2 px-8">
                UI preview
                <ArrowRight class="size-4" />
              </Button>
            </Link>
            <a
              href="https://github.com/Langlw1992/beeve"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" class="w-full gap-2 px-8 sm:w-auto">
                <Github class="size-4" />
                GitHub 仓库
              </Button>
            </a>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            {featureCards.map((item) => (
              <FeatureCard
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </section>

        <aside class="relative">
          <div class="absolute inset-0 rounded-[32px] bg-primary/10 blur-3xl" />
          <div class="relative overflow-hidden rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-[0_20px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <div class="space-y-5">
              <div class="space-y-2">
                <p class="text-sm font-medium text-primary">登录后你将获得</p>
                <h2 class="text-2xl font-semibold tracking-tight">
                  更清晰的认证入口
                </h2>
                <p class="text-sm text-muted-foreground">
                  把仪表盘、设置和管理后台收拢到统一身份下，减少跳转和重复登录。
                </p>
              </div>

              <div class="space-y-3">
              <StepRow
                index="01"
                title="选择社交账号"
                description="使用 Google、GitHub 或 Apple 完成登录。"
              />
              <StepRow
                index="02"
                title="完成服务端校验"
                description="会话会在服务端确认，页面刷新也能保持稳定。"
              />
              <StepRow
                index="03"
                title="进入个人中心"
                description="普通用户先到资料、会话和偏好，管理员再单独进入管理后台。"
              />
            </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <MiniStat title="统一身份" value="1 个账号" />
                <MiniStat title="受保护页面" value="2 层校验" />
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer class="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Beeve。保留所有权利。
      </footer>
    </div>
  )
}

function FeatureCard(props: {
  icon: typeof Shield
  title: string
  description: string
}) {
  return (
    <div class="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
      <props.icon class="size-5 text-primary" />
      <h3 class="mt-4 font-semibold">{props.title}</h3>
      <p class="mt-2 text-sm text-muted-foreground">{props.description}</p>
    </div>
  )
}

function StepRow(props: {
  index: string
  title: string
  description: string
}) {
  return (
    <div class="flex gap-4 rounded-2xl border border-border/70 bg-background/80 p-4">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
        {props.index}
      </div>
      <div>
        <h3 class="font-medium">{props.title}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{props.description}</p>
      </div>
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
