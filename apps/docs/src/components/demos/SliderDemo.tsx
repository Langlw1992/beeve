import { Slider, Label } from '@beeve/ui'
import { createSignal } from 'solid-js'
import { DemoBox } from '../DemoBox'

export function SliderBasic() {
  const [value, setValue] = createSignal([50])

  return (
    <DemoBox title="基础滑块" class="flex-col items-stretch">
      <Slider
        value={value()}
        onValueChange={(details) => setValue(details.value)}
        min={0}
        max={100}
      />
      <p class="mt-2 text-sm text-muted-foreground">
        当前值: {value()[0]}
      </p>
    </DemoBox>
  )
}

export function SliderRange() {
  const [value, setValue] = createSignal([20, 80])

  return (
    <DemoBox title="范围滑块" class="flex-col items-stretch">
      <Slider
        value={value()}
        onValueChange={(details) => setValue(details.value)}
        min={0}
        max={100}
      />
      <p class="mt-2 text-sm text-muted-foreground">
        范围: {value()[0]} - {value()[1]}
      </p>
    </DemoBox>
  )
}

export function SliderSizes() {
  return (
    <DemoBox title="滑块尺寸" class="flex-col items-stretch gap-6">
      <div class="space-y-2">
        <Label>小尺寸</Label>
        <Slider size="sm" defaultValue={[30]} />
      </div>
      <div class="space-y-2">
        <Label>中尺寸</Label>
        <Slider size="md" defaultValue={[50]} />
      </div>
      <div class="space-y-2">
        <Label>大尺寸</Label>
        <Slider size="lg" defaultValue={[70]} />
      </div>
    </DemoBox>
  )
}

export function SliderWithSteps() {
  const [value, setValue] = createSignal([50])

  return (
    <DemoBox title="步进滑块" class="flex-col items-stretch">
      <Slider
        value={value()}
        onValueChange={(details) => setValue(details.value)}
        min={0}
        max={100}
        step={10}
      />
      <p class="mt-2 text-sm text-muted-foreground">
        值 (步进 10): {value()[0]}
      </p>
    </DemoBox>
  )
}

export function SliderDisabled() {
  return (
    <DemoBox title="禁用状态" class="flex-col items-stretch">
      <Slider defaultValue={[40]} disabled />
    </DemoBox>
  )
}

export function SliderWithLabel() {
  const [volume, setVolume] = createSignal([75])

  return (
    <DemoBox title="带标签滑块" class="flex-col items-stretch">
      <div class="flex items-center justify-between">
        <Label>音量</Label>
        <span class="text-sm text-muted-foreground">{volume()[0]}%</span>
      </div>
      <Slider
        value={volume()}
        onValueChange={setVolume}
        min={0}
        max={100}
      />
    </DemoBox>
  )
}
