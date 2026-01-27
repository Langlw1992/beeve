import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DatePicker, DateRangePicker } from '@beeve/ui'
import { createSignal } from 'solid-js'

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    showTime: {
        control: 'boolean'
    }
  },
}

export default meta
type Story = StoryObj<typeof DatePicker>

export const Basic: Story = {
  render: (args) => <div class="w-[350px]"><DatePicker {...args} /></div>,
  args: {
    placeholder: 'Pick a date',
  },
}

export const WithTime: Story = {
  render: (args) => <div class="w-[350px]"><DatePicker {...args} /></div>,
  args: {
    placeholder: 'Pick date & time',
    showTime: true
  },
}

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-[350px]">
      <DatePicker size="sm" placeholder="Small (sm)" />
      <DatePicker size="md" placeholder="Default (md)" />
      <DatePicker size="lg" placeholder="Large (lg)" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-[350px]">
      <DatePicker label="Default" />
      <DatePicker label="Error" error />
      <DatePicker label="Disabled" disabled />
      <DatePicker label="With Value" value="2024-01-01" />
    </div>
  ),
}

export const RangePicker: Story = {
    render: () => {
        const [val, setVal] = createSignal<string[]>(['', ''])
        return (
            <div class="w-[400px]">
                <DateRangePicker 
                    value={val()} 
                    onChange={(v) => v && setVal(v)} 
                    placeholder="Select range" 
                />
                <div class="mt-2 text-xs text-slate-500">
                    Range: {val().join(' - ')}
                </div>
            </div>
        )
    }
}
