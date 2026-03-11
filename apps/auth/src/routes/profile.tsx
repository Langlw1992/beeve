import { authClient } from '@/lib/auth'
import { Button, Card, Dialog, Input } from '@beeve/ui'
import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { ArrowLeft, Camera, LogOut, Save, User } from 'lucide-solid'
import { Show, createEffect, createSignal } from 'solid-js'
import { updateProfile } from '../lib/admin-api'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const navigate = useNavigate()
  const session = authClient.useSession()

  const [name, setName] = createSignal('')
  const [image, setImage] = createSignal('')
  const [isSaving, setIsSaving] = createSignal(false)
  const [saveError, setSaveError] = createSignal('')
  const [showSuccessDialog, setShowSuccessDialog] = createSignal(false)

  // 未登录时响应式重定向到登录页
  createEffect(() => {
    if (!session().isPending && !session().data) {
      navigate({ to: '/login' })
    }
  })

  // 当用户数据加载后，响应式初始化表单
  createEffect(() => {
    const u = session().data?.user
    if (u) {
      setName(u.name || '')
      setImage(u.image || '')
    }
  })

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError('')

    try {
      await updateProfile({ name: name(), image: image() })
      setShowSuccessDialog(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '更新失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate({ to: '/' })
  }

  return (
    <main class="page-wrap px-4 py-8">
      <div class="mx-auto max-w-2xl">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate({ to: '/dashboard' })}
          class="mb-6 inline-flex items-center gap-2 text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
        >
          <ArrowLeft class="size-4" />
          返回仪表盘
        </button>

        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="display-title text-3xl font-bold text-[var(--sea-ink)]">
              个人资料
            </h1>
            <p class="mt-1 text-[var(--sea-ink-soft)]">管理您的个人信息</p>
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
          <div class="space-y-6">
            {/* 头像卡片 */}
            <Card class="p-6">
              <h2 class="mb-4 text-lg font-semibold text-[var(--sea-ink)]">
                头像
              </h2>
              <div class="flex items-center gap-6">
                <div class="relative">
                  <Show
                    when={image()}
                    fallback={
                      <div class="flex size-24 items-center justify-center rounded-full bg-[var(--lagoon)]/20">
                        <User class="size-12 text-[var(--lagoon-deep)]" />
                      </div>
                    }
                  >
                    <img
                      src={image()}
                      alt="头像"
                      class="size-24 rounded-full object-cover"
                    />
                  </Show>
                  <button
                    class="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-[var(--lagoon)] text-white shadow-lg hover:bg-[var(--lagoon-deep)]"
                    title="更换头像"
                  >
                    <Camera class="size-4" />
                  </button>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-[var(--sea-ink-soft)]">
                    支持 JPG、PNG 格式，文件大小不超过 2MB
                  </p>
                  <p class="mt-1 text-xs text-[var(--sea-ink-soft)]">
                    或者输入图片 URL
                  </p>
                </div>
              </div>
              <div class="mt-4">
                <Input
                  placeholder="输入头像图片 URL"
                  value={image()}
                  onInput={(val) => setImage(val)}
                  allowClear
                />
              </div>
            </Card>

            {/* 基本信息卡片 */}
            <Card class="p-6">
              <h2 class="mb-4 text-lg font-semibold text-[var(--sea-ink)]">
                基本信息
              </h2>
              <div class="space-y-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                    用户名
                  </label>
                  <Input
                    placeholder="输入您的姓名"
                    value={name()}
                    onInput={(val) => setName(val)}
                    maxLength={50}
                    showCount
                  />
                </div>

                <div>
                  <label class="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                    邮箱
                  </label>
                  <Input
                    value={session().data?.user?.email || ''}
                    disabled
                    class="bg-muted"
                  />
                  <p class="mt-1 text-xs text-[var(--sea-ink-soft)]">
                    邮箱地址不可修改
                  </p>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label class="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                      账户类型
                    </label>
                    <Input
                      value={
                        session().data?.user?.userType === 'admin' ? '管理员' : '普通用户'
                      }
                      disabled
                      class="bg-muted"
                    />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                      账户状态
                    </label>
                    <Input
                      value={session().data?.user?.status === 'active' ? '正常' : '已禁用'}
                      disabled
                      class="bg-muted"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* 保存按钮 */}
            <div class="flex items-center justify-between">
              <Show when={saveError()}>
                <p class="text-sm text-destructive">{saveError()}</p>
              </Show>
              <div class="ml-auto flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard' })}
                >
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  loading={isSaving()}
                  disabled={!name().trim()}
                >
                  <Save class="size-4" />
                  保存修改
                </Button>
              </div>
            </div>
          </div>
        </Show>

        {/* 成功提示对话框 */}
        <Dialog
          open={showSuccessDialog()}
          onOpenChange={setShowSuccessDialog}
          title="保存成功"
          description="您的个人资料已更新"
          onOk={() => {
            setShowSuccessDialog(false)
          }}
          okText="确定"
        />
      </div>
    </main>
  )
}
