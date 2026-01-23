import { Switch, Label } from '@beeve/ui'
import { createSignal } from 'solid-js'
import { DemoBox } from '../DemoBox'

export function SwitchBasic() {
  const [checked, setChecked] = createSignal(false)

  return (
    <DemoBox title="基础开关">
      <div class="flex items-center gap-3">
        <Switch
          id="basic"
          checked={checked()}
          onChange={setChecked}
        />
        <Label for="basic">开启通知</Label>
      </div>
    </DemoBox>
  )
}

export function SwitchSizes() {
  return (
    <DemoBox title="开关尺寸">
      <div class="flex items-center gap-3">
        <Switch id="sm" size="sm" defaultChecked />
        <Label for="sm">小</Label>
      </div>
      <div class="flex items-center gap-3">
        <Switch id="md" size="md" defaultChecked />
        <Label for="md">中</Label>
      </div>
      <div class="flex items-center gap-3">
        <Switch id="lg" size="lg" defaultChecked />
        <Label for="lg">大</Label>
      </div>
    </DemoBox>
  )
}

export function SwitchStates() {
  return (
    <DemoBox title="开关状态">
      <div class="flex items-center gap-3">
        <Switch id="off" />
        <Label for="off">关闭</Label>
      </div>
      <div class="flex items-center gap-3">
        <Switch id="on" defaultChecked />
        <Label for="on">开启</Label>
      </div>
      <div class="flex items-center gap-3">
        <Switch id="disabled-off" disabled />
        <Label for="disabled-off" disabled>禁用关闭</Label>
      </div>
      <div class="flex items-center gap-3">
        <Switch id="disabled-on" disabled defaultChecked />
        <Label for="disabled-on" disabled>禁用开启</Label>
      </div>
    </DemoBox>
  )
}

export function SwitchWithDescription() {
  const [darkMode, setDarkMode] = createSignal(false)
  const [autoSave, setAutoSave] = createSignal(true)

  return (
    <DemoBox title="带描述开关" class="flex-col items-stretch gap-4">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label for="dark">深色模式</Label>
          <p class="text-sm text-muted-foreground">启用深色主题</p>
        </div>
        <Switch
          id="dark"
          checked={darkMode()}
          onChange={setDarkMode}
        />
      </div>
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label for="autosave">自动保存</Label>
          <p class="text-sm text-muted-foreground">每隔5分钟自动保存草稿</p>
        </div>
        <Switch
          id="autosave"
          checked={autoSave()}
          onChange={setAutoSave}
        />
      </div>
    </DemoBox>
  )
}
