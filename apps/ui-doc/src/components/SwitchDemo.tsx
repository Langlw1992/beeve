import { Switch } from '@beeve/ui'
import { createSignal } from 'solid-js'

export function SwitchBasic() {
  return <Switch>飞行模式</Switch>
}

export function SwitchSizes() {
  return (
    <div class="flex flex-wrap items-center gap-6">
      <Switch size="sm">Small</Switch>
      <Switch size="md">Medium</Switch>
      <Switch size="lg">Large</Switch>
    </div>
  )
}

export function SwitchDisabled() {
  return (
    <div class="flex flex-wrap items-center gap-6">
      <Switch disabled>禁用</Switch>
      <Switch disabled checked>禁用且选中</Switch>
    </div>
  )
}

export function SwitchControlled() {
  const [checked, setChecked] = createSignal(true)

  return (
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <Switch checked={checked()} onChange={setChecked}>
          显示通知
        </Switch>
      </div>
      <div class="text-sm text-foreground/60">
        当前状态: {checked() ? '开启' : '关闭'}
      </div>
    </div>
  )
}
