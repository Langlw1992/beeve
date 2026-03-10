import {useSession, useSignUp, useSocialSignIn} from '@beeve/auth-client'
import {Button, Card, Input, Label} from '@beeve/ui'
import {Link, createFileRoute, useNavigate} from '@tanstack/solid-router'
import {ArrowRight, Chrome, Github, Lock, Mail, User} from 'lucide-solid'
import {Show, createEffect, createSignal} from 'solid-js'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const {isAuthenticated} = useSession()
  const {signUp, isLoading: isEmailLoading, error: emailError} = useSignUp()
  const {
    signInWithGoogle,
    signInWithGithub,
    isLoading: isSocialLoading,
  } = useSocialSignIn()

  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [confirmPassword, setConfirmPassword] = createSignal('')
  const [validationError, setValidationError] = createSignal('')

  // 如果已登录，响应式重定向到 dashboard
  createEffect(() => {
    if (isAuthenticated()) {
      navigate({to: '/dashboard'})
    }
  })

  const validateForm = () => {
    if (!name().trim()) {
      setValidationError('请输入姓名')
      return false
    }
    if (!email().trim()) {
      setValidationError('请输入邮箱地址')
      return false
    }
    if (!password()) {
      setValidationError('请输入密码')
      return false
    }
    if (password().length < 8) {
      setValidationError('密码至少需要 8 个字符')
      return false
    }
    if (password() !== confirmPassword()) {
      setValidationError('两次输入的密码不一致')
      return false
    }
    setValidationError('')
    return true
  }

  const handleEmailRegister = async (e: Event) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await signUp(name(), email(), password())
      navigate({to: '/dashboard'})
    } catch {
      // 错误已在 hook 中处理
    }
  }

  const handleGoogleLogin = () => {
    signInWithGoogle()
  }

  const handleGithubLogin = () => {
    signInWithGithub()
  }

  return (
    <main class="page-wrap flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <h1 class="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)]">
            创建账号
          </h1>
          <p class="text-[var(--sea-ink-soft)]">
            注册 Beeve 账号，开启您的旅程
          </p>
        </div>

        <Card
          variant="outlined"
          class="overflow-visible"
        >
          <div class="space-y-6 p-6">
            {/* 社交登录按钮 */}
            <div class="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isSocialLoading()}
                class="gap-2"
              >
                <Chrome class="size-4" />
                <span>Google</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleGithubLogin}
                disabled={isSocialLoading()}
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
                  或使用邮箱注册
                </span>
              </div>
            </div>

            {/* 邮箱注册表单 */}
            <form
              onSubmit={handleEmailRegister}
              class="space-y-4"
            >
              <div class="space-y-2">
                <Label for="name">姓名</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="您的姓名"
                  value={name()}
                  onInput={(value) => setName(value)}
                  disabled={isEmailLoading()}
                  prefix={<User class="size-4" />}
                  autocomplete="name"
                />
              </div>

              <div class="space-y-2">
                <Label for="email">邮箱地址</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email()}
                  onInput={(value) => setEmail(value)}
                  disabled={isEmailLoading()}
                  prefix={<Mail class="size-4" />}
                  autocomplete="email"
                />
              </div>

              <div class="space-y-2">
                <Label for="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password()}
                  onInput={(value) => setPassword(value)}
                  disabled={isEmailLoading()}
                  prefix={<Lock class="size-4" />}
                  autocomplete="new-password"
                />
                <p class="text-xs text-[var(--sea-ink-soft)]">
                  密码至少需要 8 个字符
                </p>
              </div>

              <div class="space-y-2">
                <Label for="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword()}
                  onInput={(value) => setConfirmPassword(value)}
                  disabled={isEmailLoading()}
                  prefix={<Lock class="size-4" />}
                  autocomplete="new-password"
                />
              </div>

              <Show when={validationError() || emailError()}>
                <div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {validationError() || emailError()?.message}
                </div>
              </Show>

              <Button
                type="submit"
                class="w-full"
                loading={isEmailLoading()}
                disabled={
                  !name() || !email() || !password() || !confirmPassword()
                }
              >
                <span>创建账号</span>
                <ArrowRight class="size-4" />
              </Button>
            </form>

            {/* 登录链接 */}
            <div class="text-center text-sm">
              <span class="text-[var(--sea-ink-soft)]">已有账号？</span>{' '}
              <Link
                to="/login"
                class="font-medium text-[var(--lagoon-deep)] hover:text-[var(--sea-ink)]"
              >
                立即登录
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
