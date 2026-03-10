/**
 * 登录页面
 */
import {createFileRoute, useNavigate, useSearch} from '@tanstack/solid-router'
import {createSignal} from 'solid-js'
import {authClient} from '../lib/auth-client'
import {Button, Input, Label, Card} from '@beeve/ui'

// 定义搜索参数类型
interface LoginSearch {
  redirect?: string
}

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const search = useSearch({from: '/login'}) as unknown as () => LoginSearch
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal('')

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await authClient.signIn.email({
      email: email(),
      password: password(),
    })

    setIsLoading(false)

    if (result.error) {
      setError(result.error.message || '登录失败')
      return
    }

    const redirect = search().redirect
    navigate({to: redirect || '/dashboard'})
  }

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <Card class="w-full max-w-md p-6">
        <h1 class="text-2xl font-bold mb-6">登录 Beeve</h1>

        <form
          onSubmit={handleSubmit}
          class="space-y-4"
        >
          <div>
            <Label for="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={email()}
              onInput={(value) => setEmail(value)}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <Label for="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={password()}
              onInput={(value) => setPassword(value)}
            />
          </div>

          {error() && <div class="text-red-500 text-sm">{error()}</div>}

          <Button
            type="submit"
            loading={isLoading()}
            class="w-full"
          >
            登录
          </Button>
        </form>

        <div class="mt-4">
          <p class="text-center text-sm text-gray-500">或使用以下方式登录</p>
          <div class="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() =>
                authClient.signIn.social({
                  provider: 'google',
                  callbackURL: `${window.location.origin}/dashboard`,
                })
              }
              class="flex-1"
            >
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                authClient.signIn.social({
                  provider: 'github',
                  callbackURL: `${window.location.origin}/dashboard`,
                })
              }
              class="flex-1"
            >
              GitHub
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
