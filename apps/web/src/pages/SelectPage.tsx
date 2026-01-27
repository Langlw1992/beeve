import { Select } from '@beeve/ui'
import { createSignal } from 'solid-js'
import { ShowcaseSection } from '../components/ShowcaseGrid'

export function SelectPage() {
  const [value, setValue] = createSignal<string | number | undefined>('apple')
  const [multiValue, setMultiValue] = createSignal<(string | number)[]>(['apple', 'banana'])

  const fruitOptions = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Blueberry', value: 'blueberry' },
    { label: 'Grapes', value: 'grapes' },
    { label: 'Pineapple', value: 'pineapple' },
    { label: 'Strawberry', value: 'strawberry' },
    { label: 'Watermelon', value: 'watermelon' },
  ]

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Select</h1>
        <p class="text-muted-foreground mt-2">
          Displays a list of options for the user to pick from—triggered by a button.
        </p>
      </div>

      <ShowcaseSection title="Basic">
        <div class="w-[200px]">
          <Select
            label="Favorite Fruit"
            placeholder="Select a fruit"
            options={fruitOptions}
            value={value()}
            onChange={setValue}
          />
        </div>
      </ShowcaseSection>

       <ShowcaseSection title="Searchable & Clearable">
        <div class="w-[200px]">
          <Select
            label="Search Fruit"
            placeholder="Search..."
            options={fruitOptions}
            searchable
            clearable
            defaultValue="grapes"
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Multiple">
        <div class="w-[300px]">
          <Select
             label="Multiple Fruits"
             options={fruitOptions}
             value={multiValue()}
             onChange={setMultiValue}
             multiple
             maxCount={2}
             placeholder="Select fruits..."
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Error State">
        <div class="w-[200px]">
          <Select
            label="Error Example"
            options={fruitOptions}
            errorMessage="This field is required"
            error
          />
        </div>
      </ShowcaseSection>
           
      <ShowcaseSection title="Disabled">
        <div class="w-[200px]">
          <Select
            label="Disabled"
            options={fruitOptions}
            disabled
            value="apple"
          />
        </div>
      </ShowcaseSection>
    </div>
  )
}
