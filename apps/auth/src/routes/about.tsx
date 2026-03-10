import {createFileRoute} from '@tanstack/solid-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main class="page-wrap px-4 py-12">
      <section class="island-shell rounded-2xl p-6 sm:p-8">
        <p class="island-kicker mb-2">关于</p>
        <h1 class="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          安全、可扩展的认证平台
        </h1>
        <p class="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          Beeve Auth 基于 TanStack Start 和 Better Auth
          构建，提供类型安全的路由、服务端渲染和现代化的认证能力。
          支持社交登录、邮箱密码登录、用户管理和权限控制。
        </p>
      </section>
    </main>
  )
}
