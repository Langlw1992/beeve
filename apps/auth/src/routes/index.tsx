import { authClient } from '@/lib/auth'
import { Link, createFileRoute } from '@tanstack/solid-router'
import { ArrowRight, Lock, Shield, Zap } from 'lucide-solid'
import { Show } from 'solid-js'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const session = authClient.useSession()

  return (
    <main class="page-wrap px-4 pb-8 pt-14">
      <section class="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div class="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div class="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />

        <p class="island-kicker mb-3">Beeve Auth</p>
        <h1 class="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          安全、简洁的认证解决方案
        </h1>
        <p class="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          基于 Better Auth 构建的统一认证系统，支持社交登录、邮箱密码登录，
          为您的应用提供安全、流畅的用户体验。
        </p>

        <div class="flex flex-wrap gap-3">
          <Show
            when={session().data}
            fallback={
              <>
                <Link
                  to="/login"
                  class="inline-flex items-center gap-2 rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
                >
                  立即登录
                  <ArrowRight class="size-4" />
                </Link>
                <Link
                  to="/register"
                  class="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
                >
                  注册账号
                </Link>
              </>
            }
          >
            <Link
              to="/dashboard"
              class="inline-flex items-center gap-2 rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
            >
              进入仪表板
              <ArrowRight class="size-4" />
            </Link>
          </Show>
        </div>
      </section>

      <section class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Shield,
            title: '安全可靠',
            desc: '基于 Better Auth 构建，支持会话管理、CSRF 保护等安全特性。',
          },
          {
            icon: Zap,
            title: '社交登录',
            desc: '支持 Google、GitHub 等主流社交账号一键登录，提升用户体验。',
          },
          {
            icon: Lock,
            title: '权限管理',
            desc: '内置用户角色和权限系统，灵活控制访问权限。',
          },
        ].map((feature, index) => (
          <article
            class="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ 'animation-delay': `${index * 90 + 80}ms` }}
          >
            <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--lagoon)]/10">
              <feature.icon class="size-5 text-[var(--lagoon-deep)]" />
            </div>
            <h2 class="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {feature.title}
            </h2>
            <p class="m-0 text-sm text-[var(--sea-ink-soft)]">{feature.desc}</p>
          </article>
        ))}
      </section>

      <section class="island-shell mt-8 rounded-2xl p-6">
        <p class="island-kicker mb-4">技术栈</p>
        <div class="flex flex-wrap gap-3">
          {[
            'TanStack Start',
            'SolidJS',
            'Better Auth',
            'Tailwind CSS',
            'TypeScript',
          ].map((tech) => (
            <span class="rounded-full bg-[var(--lagoon)]/10 px-3 py-1 text-sm text-[var(--lagoon-deep)]">
              {tech}
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}
