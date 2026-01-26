import { Select } from '@beeve/ui'

const OPTIONS = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Solid', value: 'solid' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
]

export function SelectBasic() {
  return <Select options={OPTIONS} placeholder="Select a framework" class="w-[200px]" />
}

export function SelectSizes() {
  return (
    <div class="flex flex-col gap-4">
      <Select size="sm" options={OPTIONS} placeholder="Small Select" class="w-[200px]" />
      <Select size="md" options={OPTIONS} placeholder="Medium Select" class="w-[200px]" />
      <Select size="lg" options={OPTIONS} placeholder="Large Select" class="w-[200px]" />
    </div>
  )
}

export function SelectVariants() {
  return (
    <div class="flex flex-col gap-4">
      <Select variant="default" options={OPTIONS} placeholder="Default" class="w-[200px]" />
      <Select variant="filled" options={OPTIONS} placeholder="Filled" class="w-[200px]" />
      <Select variant="borderless" options={OPTIONS} placeholder="Borderless" class="w-[200px]" />
    </div>
  )
}

export function SelectStates() {
  return (
    <div class="flex flex-col gap-4">
      <Select disabled options={OPTIONS} placeholder="Disabled" class="w-[200px]" />
      <Select status="error" options={OPTIONS} placeholder="Error" class="w-[200px]" />
      <Select status="warning" options={OPTIONS} placeholder="Warning" class="w-[200px]" />
    </div>
  )
}

export function SelectSearchable() {
  return (
    <Select
      showSearch
      options={OPTIONS}
      placeholder="Search a framework"
      class="w-[200px]"
    />
  )
}

export function SelectMultiple() {
  return (
    <div class="flex flex-col gap-4">
      <Select
        mode="multiple"
        options={OPTIONS}
        placeholder="Select multiple"
        class="min-w-[300px]"
        defaultValue={['solid', 'react']}
      />
    </div>
  )
}

export function SelectClearable() {
   return <Select allowClear options={OPTIONS} placeholder="Select and clear" class="w-[200px]" />
}
