import {Checkbox} from '@beeve/ui'
import {createSignal} from 'solid-js'

export function CheckboxBasic() {
  return <Checkbox>Accept terms and conditions</Checkbox>
}

export function CheckboxSizes() {
  return (
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <Checkbox size="sm">Small Checkbox</Checkbox>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox size="md">Medium Checkbox (Default)</Checkbox>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox size="lg">Large Checkbox</Checkbox>
      </div>
    </div>
  )
}

export function CheckboxStates() {
  return (
    <div class="flex flex-col gap-4">
      <Checkbox defaultChecked={false}>Unchecked</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox disabled>Disabled Unchecked</Checkbox>
      <Checkbox
        disabled
        defaultChecked
      >
        Disabled Checked
      </Checkbox>
      <Checkbox
        disabled
        indeterminate
      >
        Disabled Indeterminate
      </Checkbox>
    </div>
  )
}

export function CheckboxControlled() {
  const [checked, setChecked] = createSignal(false)

  return (
    <div class="flex flex-col gap-2">
      <Checkbox
        checked={checked()}
        onChange={setChecked}
      >
        {checked() ? 'Checked' : 'Unchecked'}
      </Checkbox>
      <div class="text-sm text-muted-foreground">
        Current value: {checked().toString()}
      </div>
    </div>
  )
}
