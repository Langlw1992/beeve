import {Radio, RadioGroup} from '@beeve/ui'
import {createSignal} from 'solid-js'

export function RadioBasic() {
  return (
    <RadioGroup
      defaultValue="apple"
      class="flex flex-col gap-2"
    >
      <Radio value="apple">Apple</Radio>
      <Radio value="banana">Banana</Radio>
      <Radio value="orange">Orange</Radio>
    </RadioGroup>
  )
}

export function RadioSizes() {
  return (
    <div class="flex flex-col gap-6">
      <RadioGroup
        defaultValue="1"
        size="sm"
        class="flex items-center gap-4"
      >
        <Radio value="1">Small 1</Radio>
        <Radio value="2">Small 2</Radio>
      </RadioGroup>
      <RadioGroup
        defaultValue="1"
        size="md"
        class="flex items-center gap-4"
      >
        <Radio value="1">Medium 1</Radio>
        <Radio value="2">Medium 2</Radio>
      </RadioGroup>
      <RadioGroup
        defaultValue="1"
        size="lg"
        class="flex items-center gap-4"
      >
        <Radio value="1">Large 1</Radio>
        <Radio value="2">Large 2</Radio>
      </RadioGroup>
    </div>
  )
}

export function RadioStates() {
  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium">Group Disabled</span>
        <RadioGroup
          defaultValue="1"
          disabled
          class="flex gap-4"
        >
          <Radio value="1">Option 1</Radio>
          <Radio value="2">Option 2</Radio>
        </RadioGroup>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium">Item Disabled</span>
        <RadioGroup
          defaultValue="1"
          class="flex gap-4"
        >
          <Radio value="1">Enabled</Radio>
          <Radio
            value="2"
            disabled
          >
            Disabled
          </Radio>
        </RadioGroup>
      </div>
    </div>
  )
}

export function RadioControlled() {
  const [value, setValue] = createSignal('email')

  return (
    <div class="flex flex-col gap-4">
      <RadioGroup
        value={value()}
        onChange={setValue}
        class="flex flex-col gap-2"
      >
        <Radio value="email">Email</Radio>
        <Radio value="phone">Phone</Radio>
        <Radio value="push">Push Notification</Radio>
      </RadioGroup>
      <div class="text-sm text-muted-foreground">Selected value: {value()}</div>
    </div>
  )
}
