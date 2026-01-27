import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DatePicker } from './DatePicker'

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof DatePicker>

export const Default: Story = {
  args: {
    placeholder: 'Pick a date',
  },
}

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-64">
      <DatePicker size="sm" placeholder="Small" />
      <DatePicker size="md" placeholder="Medium" />
      <DatePicker size="lg" placeholder="Large" />
    </div>
  ),
}

export const WithLabel: Story = {
  args: {
    label: 'Birth Date',
    placeholder: 'Select...',
  },
}

export const ErrorState: Story = {
  args: {
    label: 'Deadline',
    error: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Unavailable',
    disabled: true,
  },
}
