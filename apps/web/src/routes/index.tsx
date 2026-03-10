/**
 * 首页 - 产品介绍和登录入口
 */
import {createFileRoute, Link, redirect} from '@tanstack/solid-router'
import {Button, Card} from '@beeve/ui'
import {authClient} from '@/lib/auth-client'
import {Header} from '@/components/layout/Header'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const {data: session} = await authClient.getSession()
    return {user: session?.user}
  },
  component: HomePage,
})

function HomePage() {
  const context = Route.useRouteContext() as () => {
    user?: {id: string; name: string; email: string; image?: string | null}
  }

  return (
    <div class="min-h-screen flex flex-col">
      <Header user={context().user} />

      <main class="flex-1 flex items-center justify-center p-4">
        <Card
          class="max-w-lg w-full p-8 text-center"
          variant="elevated"
        >
          <h1 class="text-4xl font-bold mb-4">欢迎来到 Beeve</h1>
          <p class="text-lg text-gray-600 mb-8">
            Beeve 是一个现代化的应用平台，提供强大的功能和优雅的用户体验。
          </p>
          <div class="flex gap-4 justify-center">
            {context().user ? (
              <Link to="/dashboard">
                <Button size="lg">进入控制台</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="lg">开始使用</Button>
              </Link>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
