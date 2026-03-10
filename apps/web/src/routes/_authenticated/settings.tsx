/**
 * 设置页面
 */
import {Button, Card, Label, Switch} from '@beeve/ui'
import {createFileRoute} from '@tanstack/solid-router'
import {createSignal} from 'solid-js'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const [notifications, setNotifications] = createSignal(true)
  const [darkMode, setDarkMode] = createSignal(false)

  return (
    <div class="space-y-6">
      <h1 class="text-3xl font-bold">设置</h1>

      <div class="grid gap-6">
        <Card class="p-6">
          <h2 class="text-lg font-semibold mb-4">偏好设置</h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <Label class="font-medium">通知</Label>
                <p class="text-sm text-gray-500">接收应用通知和更新</p>
              </div>
              <Switch
                checked={notifications()}
                onChange={setNotifications}
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <Label class="font-medium">深色模式</Label>
                <p class="text-sm text-gray-500">切换深色主题</p>
              </div>
              <Switch
                checked={darkMode()}
                onChange={setDarkMode}
              />
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <h2 class="text-lg font-semibold mb-4">数据管理</h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">导出数据</p>
                <p class="text-sm text-gray-500">下载你的个人数据副本</p>
              </div>
              <Button variant="outline">导出</Button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-destructive">删除账号</p>
                <p class="text-sm text-gray-500">永久删除你的账号和所有数据</p>
              </div>
              <Button variant="destructive">删除</Button>
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <h2 class="text-lg font-semibold mb-4">关于</h2>
          <div class="space-y-2 text-sm text-gray-500">
            <p>Beeve v0.1.0</p>
            <p>© 2025 Beeve. All rights reserved.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
