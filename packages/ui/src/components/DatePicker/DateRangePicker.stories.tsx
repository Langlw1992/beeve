import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DateRangePicker } from './DateRangePicker'

const meta: Meta<typeof DateRangePicker> = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
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
    numOfMonths: {
      control: { type: 'number' },
    },
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    }
  },
}

export default meta
type Story = StoryObj<typeof DateRangePicker>

export const Basic: Story = {
  render: (args) => <div class="w-[300px]"><DateRangePicker {...args} /></div>,
  args: {
    placeholder: 'Pick a date range',
  },
}

export const WithLabel: Story = {
  render: (args) => <div class="w-[300px]"><DateRangePicker {...args} /></div>,
  args: {
    label: 'Travel Dates',
    placeholder: 'Start date - End date',
  },
}

export const SingleMonth: Story = {
  render: (args) => <div class="w-[300px]"><DateRangePicker {...args} /></div>,
  args: {
    numOfMonths: 1,
    placeholder: 'Single month view',
  },
}

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-[300px]">
      <DateRangePicker size="sm" placeholder="Small (sm)" />
      <DateRangePicker size="md" placeholder="Default (md)" />
      <DateRangePicker size="lg" placeholder="Large (lg)" />
    </div>
  ),
}

export const ErrorState: Story = {
  render: (args) => <div class="w-[300px]"><DateRangePicker {...args} /></div>,
  args: {
    label: 'Date Range',
    placeholder: 'Select dates',
    error: true,
  },
}

export const Disabled: Story = {
  render: (args) => <div class="w-[300px]"><DateRangePicker {...args} /></div>,
  args: {
    label: 'Date Range',
    placeholder: 'Select dates',
    disabled: true,
  },
}
