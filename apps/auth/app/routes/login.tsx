import {createFileRoute, useNavigate} from '@tanstack/solid-router'
import {createSignal, Show} from 'solid-js'
import {Button, Card, CardContent, CardHeader, CardTitle} from '@beeve/ui'
import {
  Github,
  Chrome,
  Shield,
  ArrowRight,
  UserCog,
  User,
  Eye,
} from 'lucide-solid'

// 开发模式用户类型
type DevRole = 'admin' | 'user' | 'auditor'

interface DevUser {
  id: string
  name: string
  email: string
  role: DevRole
  permissions: string[]
}

const DEV_USERS: Record<DevRole, DevUser> = {
  admin: {
    id: 'dev-admin-001',
    name: '管理员',
    email: 'admin@beeve.com',
    role: 'admin',
    permissions: ['*', 'user:read', 'user:write', 'role:read', 'audit:read'],
  },
  user: {
    id: 'dev-user-001',
    name: '普通用户',
    email: 'user@beeve.com',
    role: 'user',
    permissions: ['profile:read', 'profile:write'],
  },
  auditor: {
    id: 'dev-auditor-001',
    name: '审计员',
    email: 'auditor@beeve.com',
    role: 'auditor',
    permissions: ['profile:read', 'audit:read', 'user:read'],
  },
}

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = createSignal<string | null>(null)

  const handleDevLogin = (role: DevRole) => {
    setIsLoading(role)
    const user = DEV_USERS[role]
    // 存储到 localStorage 模拟登录状态
    localStorage.setItem('dev-user', JSON.stringify(user))
    setTimeout(() => {
      navigate({to: '/dashboard'})
    }, 300)
  }

  const handleOAuthLogin = (provider: 'github' | 'google') => {
    setIsLoading(provider)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    window.location.href = `${apiUrl}/api/auth/${provider}`
  }

  return (
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        {/* Logo */}
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-xl mb-4 shadow-lg">
            <Shield class="h-8 w-8 text-white" />
          </div>
          <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">
            Beeve Auth
          </h1>
          <p class="text-slate-500 mt-2 text-sm">企业级用户身份管理系统</p>
        </div>

        <Card class="border-slate-200 shadow-sm">
          <CardHeader class="pb-4">
            <CardTitle class="text-base font-medium text-slate-700">
              选择登录方式
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Button
              variant="outline"
              class="w-full h-11 justify-start gap-3 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
              onClick={() => handleOAuthLogin('github')}
              loading={isLoading() === 'github'}
            >
              <Github class="h-5 w-5 text-slate-700" />
              <span class="text-slate-700 font-medium">使用 GitHub 登录</span>
            </Button>

            <Button
              variant="outline"
              class="w-full h-11 justify-start gap-3 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
              onClick={() => handleOAuthLogin('google')}
              loading={isLoading() === 'google'}
            >
              <Chrome class="h-5 w-5 text-blue-500" />
              <span class="text-slate-700 font-medium">使用 Google 登录</span>
            </Button>

            {/* 开发模式快速登录 */}
            <div class="mt-6 pt-6 border-t border-slate-200">
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                开发模式快速登录
              </p>
              <div class="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  class="flex-col h-auto py-3 gap-1"
                  onClick={() => handleDevLogin('admin')}
                  loading={isLoading() === 'admin'}
                >
                  <UserCog class="h-4 w-4" />
                  <span class="text-xs">管理员</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  class="flex-col h-auto py-3 gap-1"
                  onClick={() => handleDevLogin('auditor')}
                  loading={isLoading() === 'auditor'}
                >
                  <Eye class="h-4 w-4" />
                  <span class="text-xs">审计员</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  class="flex-col h-auto py-3 gap-1"
                  onClick={() => handleDevLogin('user')}
                  loading={isLoading() === 'user'}
                >
                  <User class="h-4 w-4" />
                  <span class="text-xs">普通用户</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p class="text-center text-xs text-slate-400 mt-8">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  )
}
