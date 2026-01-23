import { Checkbox, Label } from '@beeve/ui'
import { createSignal } from 'solid-js'
import { DemoBox } from '../DemoBox'

export function CheckboxBasic() {
  const [checked, setChecked] = createSignal(false)

  return (
    <DemoBox title="基础复选框">
      <div class="flex items-center gap-2">
        <Checkbox
          id="basic"
          checked={checked()}
          onChange={setChecked}
        />
        <Label for="basic">同意服务条款</Label>
      </div>
    </DemoBox>
  )
}

export function CheckboxSizes() {
  return (
    <DemoBox title="复选框尺寸">
      <div class="flex items-center gap-2">
        <Checkbox id="sm" size="sm" defaultChecked />
        <Label for="sm">小</Label>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox id="md" size="md" defaultChecked />
        <Label for="md">中</Label>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox id="lg" size="lg" defaultChecked />
        <Label for="lg">大</Label>
      </div>
    </DemoBox>
  )
}

export function CheckboxStates() {
  return (
    <DemoBox title="复选框状态">
      <div class="flex items-center gap-2">
        <Checkbox id="unchecked" />
        <Label for="unchecked">未选中</Label>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox id="checked" defaultChecked />
        <Label for="checked">选中</Label>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox id="indeterminate" indeterminate />
        <Label for="indeterminate">不确定</Label>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox id="disabled" disabled />
        <Label for="disabled" disabled>禁用</Label>
      </div>
    </DemoBox>
  )
}

export function CheckboxGroup() {
  const [selected, setSelected] = createSignal<string[]>(['apple'])

  const items = [
    { value: 'apple', label: '苹果' },
    { value: 'banana', label: '香蕉' },
    { value: 'orange', label: '橙子' },
  ]

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <DemoBox title="复选框组" class="flex-col items-start">
      <div class="flex flex-col gap-2">
        {items.map((item) => (
          <div class="flex items-center gap-2">
            <Checkbox
              id={item.value}
              checked={selected().includes(item.value)}
              onChange={() => toggle(item.value)}
            />
            <Label for={item.value}>{item.label}</Label>
          </div>
        ))}
      </div>
      <p class="mt-2 text-sm text-muted-foreground">
        已选择: {selected().join(', ') || '无'}
      </p>
    </DemoBox>
  )
}
