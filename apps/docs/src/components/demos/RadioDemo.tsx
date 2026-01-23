import { Radio, Label } from '@beeve/ui'
import { createSignal } from 'solid-js'
import { DemoBox } from '../DemoBox'

export function RadioBasic() {
  const [value, setValue] = createSignal('option1')

  return (
    <DemoBox title="基础单选框" class="flex-col items-start">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <Radio
            id="opt1"
            name="basic"
            value="option1"
            checked={value() === 'option1'}
            onChange={() => setValue('option1')}
          />
          <Label for="opt1">选项一</Label>
        </div>
        <div class="flex items-center gap-2">
          <Radio
            id="opt2"
            name="basic"
            value="option2"
            checked={value() === 'option2'}
            onChange={() => setValue('option2')}
          />
          <Label for="opt2">选项二</Label>
        </div>
        <div class="flex items-center gap-2">
          <Radio
            id="opt3"
            name="basic"
            value="option3"
            checked={value() === 'option3'}
            onChange={() => setValue('option3')}
          />
          <Label for="opt3">选项三</Label>
        </div>
      </div>
      <p class="mt-2 text-sm text-muted-foreground">当前选择: {value()}</p>
    </DemoBox>
  )
}

export function RadioSizes() {
  return (
    <DemoBox title="单选框尺寸">
      <div class="flex items-center gap-2">
        <Radio id="sm" name="size" value="sm" size="sm" defaultChecked />
        <Label for="sm">小</Label>
      </div>
      <div class="flex items-center gap-2">
        <Radio id="md" name="size" value="md" size="md" />
        <Label for="md">中</Label>
      </div>
      <div class="flex items-center gap-2">
        <Radio id="lg" name="size" value="lg" size="lg" />
        <Label for="lg">大</Label>
      </div>
    </DemoBox>
  )
}

export function RadioDisabled() {
  return (
    <DemoBox title="禁用状态">
      <div class="flex items-center gap-2">
        <Radio id="disabled1" name="disabled" value="1" disabled />
        <Label for="disabled1" disabled>禁用未选中</Label>
      </div>
      <div class="flex items-center gap-2">
        <Radio id="disabled2" name="disabled" value="2" disabled defaultChecked />
        <Label for="disabled2" disabled>禁用已选中</Label>
      </div>
    </DemoBox>
  )
}
