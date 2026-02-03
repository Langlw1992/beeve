import {Input} from '@beeve/ui'
import {SearchIcon, MailIcon, GlobeIcon} from 'lucide-solid'

export function InputBasic() {
  return (
    <Input
      placeholder="Basic Input"
      class="max-w-sm"
    />
  )
}

export function InputSizes() {
  return (
    <div class="flex flex-col gap-4 max-w-sm">
      <Input
        size="sm"
        placeholder="Small Input"
      />
      <Input
        size="md"
        placeholder="Medium Input"
      />
      <Input
        size="lg"
        placeholder="Large Input"
      />
    </div>
  )
}

export function InputVariants() {
  return (
    <div class="flex flex-col gap-4 max-w-sm">
      <Input
        variant="default"
        placeholder="Default Variant"
      />
      <Input
        variant="filled"
        placeholder="Filled Variant"
      />
      <Input
        variant="borderless"
        placeholder="Borderless Variant"
      />
    </div>
  )
}

export function InputStates() {
  return (
    <div class="flex flex-col gap-4 max-w-sm">
      <Input
        disabled
        placeholder="Disabled Input"
        value="Disabled Value"
      />
      <Input
        status="error"
        placeholder="Error State"
      />
      <Input
        status="warning"
        placeholder="Warning State"
      />
    </div>
  )
}

export function InputWithIcons() {
  return (
    <div class="flex flex-col gap-4 max-w-sm">
      <Input
        prefix={<SearchIcon class="size-4" />}
        placeholder="Search..."
      />
      <Input
        suffix={<MailIcon class="size-4" />}
        placeholder="Email"
      />
      <Input
        prefix={<GlobeIcon class="size-4" />}
        suffix=".com"
        placeholder="yoursite"
      />
    </div>
  )
}

export function InputPassword() {
  return (
    <Input
      type="password"
      placeholder="Password"
      class="max-w-sm"
    />
  )
}

export function InputTextarea() {
  return (
    <div class="flex flex-col gap-4 max-w-sm">
      <Input
        inputType="textarea"
        placeholder="Type your message here."
      />
      <Input
        inputType="textarea"
        rows={4}
        placeholder="With rows=4"
      />
    </div>
  )
}

export function InputNumber() {
  return (
    <div class="flex flex-col gap-4 max-w-sm">
      <Input
        inputType="number"
        placeholder="Number input"
      />
      <Input
        inputType="number"
        showControls
        placeholder="With Controls"
        defaultValue={10}
      />
      <Input
        inputType="number"
        min={0}
        max={10}
        step={1}
        showControls
        placeholder="Min 0, Max 10"
      />
    </div>
  )
}

export function InputFeatures() {
  return (
    <div class="flex flex-col gap-4 max-w-sm">
      <Input
        allowClear
        placeholder="Allow Clear (type something)"
      />
      <Input
        showCount
        maxLength={20}
        placeholder="Show Count (max 20)"
      />
    </div>
  )
}
