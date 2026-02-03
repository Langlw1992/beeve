import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {createSignal, createEffect} from 'solid-js'
import {Select, type SelectValue} from './Select'

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
      description: 'The size of the select component',
      table: {defaultValue: {summary: 'md'}},
    },
    error: {
      control: 'boolean',
      description: 'Whether the select is in an error state',
    },
    errorMessage: {
      control: 'text',
      description: 'The error message to display',
    },
    disabled: {
      control: 'boolean',
    },
    multiple: {
      control: 'boolean',
    },
    searchable: {
      control: 'boolean',
    },
    clearable: {
      control: 'boolean',
    },
    onChange: {action: 'value changed'},
  },
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Select>

const fruitOptions = [
  {label: 'Apple', value: 'apple'},
  {label: 'Banana', value: 'banana'},
  {label: 'Blueberry', value: 'blueberry'},
  {label: 'Grapes', value: 'grapes'},
  {label: 'Pineapple', value: 'pineapple'},
  {label: 'Strawberry', value: 'strawberry'},
  {label: 'Watermelon', value: 'watermelon'},
]

const frameworkOptions = [
  {label: 'SolidJS', value: 'solid'},
  {label: 'React', value: 'react'},
  {label: 'Vue', value: 'vue'},
  {label: 'Svelte', value: 'svelte'},
  {label: 'Angular', value: 'angular'},
]

export const Default: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Select a fruit',
    label: 'Favorite Fruit',
  },
  render: (args) => (
    <div class="w-64">
      <Select {...args} />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal<SelectValue | undefined>('solid')
    return (
      <div class="flex flex-col gap-4 w-64">
        <Select
          label="Frontend Framework"
          options={frameworkOptions}
          value={value()}
          onChange={setValue}
        />
        <div class="text-sm text-muted-foreground">
          Selected value:{' '}
          <code class="bg-muted px-1 rounded">{String(value())}</code>
        </div>
      </div>
    )
  },
}

export const Searchable: Story = {
  args: {
    ...Default.args,
    searchable: true,
    placeholder: 'Search fruits...',
  },
  render: (args) => (
    <div class="w-64">
      <Select {...args} />
    </div>
  ),
}

export const Clearable: Story = {
  args: {
    ...Default.args,
    clearable: true,
    defaultValue: 'apple',
    label: 'Clearable Selection',
  },
  render: (args) => (
    <div class="w-64">
      <Select {...args} />
    </div>
  ),
}

export const Multiple: Story = {
  args: {
    options: frameworkOptions,
    multiple: true,
    label: 'Tech Stack (Multi)',
    placeholder: 'Pick multiple...',
    defaultValue: ['solid', 'react'],
  },
  render: (args) => (
    <div class="w-80">
      <Select {...args} />
    </div>
  ),
}

export const MaxCount: Story = {
  args: {
    options: fruitOptions,
    multiple: true,
    maxCount: 2,
    defaultValue: ['apple', 'banana', 'grapes', 'strawberry'],
    label: 'Fruits (Max 2 visible)',
  },
  render: (args) => (
    <div class="w-80">
      <Select {...args} />
    </div>
  ),
}

export const SearchableMulti: Story = {
  args: {
    ...Multiple.args,
    searchable: true,
    label: 'Searchable Multi Select',
    placeholder: 'Search stacks...',
  },
  render: (args) => (
    <div class="w-80">
      <Select {...args} />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div class="flex flex-col gap-8 w-64">
      <Select
        {...args}
        size="sm"
        label="Small (sm)"
        options={fruitOptions}
        placeholder="Small select"
      />
      <Select
        {...args}
        size="md"
        label="Default (md)"
        options={fruitOptions}
        placeholder="Default select"
      />
      <Select
        {...args}
        size="lg"
        label="Large (lg)"
        options={fruitOptions}
        placeholder="Large select"
      />
    </div>
  ),
}

export const AsyncOptions: Story = {
  render: () => {
    const [options, setOptions] = createSignal<
      {label: string; value: string}[]
    >([])
    const [loading, setLoading] = createSignal(true)

    // Simulate fetch
    createEffect(() => {
      const t = setTimeout(() => {
        setOptions(fruitOptions)
        setLoading(false)
      }, 1500)
      return () => clearTimeout(t)
    })

    return (
      <div class="w-64">
        <Select
          options={options()}
          label="Async Data Fetch"
          placeholder={loading() ? 'Loading data...' : 'Select fruit'}
          disabled={loading()}
        />
      </div>
    )
  },
}

export const ErrorState: Story = {
  args: {
    ...Default.args,
    label: 'Required Field',
    errorMessage: 'Please select a valid option',
    error: true,
  },
  render: (args) => (
    <div class="w-64">
      <Select {...args} />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    ...Default.args,
    label: 'Disabled Select',
    disabled: true,
    defaultValue: 'banana',
  },
  render: (args) => (
    <div class="w-64">
      <Select {...args} />
    </div>
  ),
}
