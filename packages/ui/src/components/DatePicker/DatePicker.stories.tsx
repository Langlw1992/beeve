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

export const CustomFormat: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-64">
      <DatePicker format="YYYY-MM-DD" placeholder="YYYY-MM-DD" label="ISO 格式" />
      <DatePicker format="DD/MM/YYYY" placeholder="DD/MM/YYYY" label="欧洲格式" />
      <DatePicker format="MM-DD-YYYY" placeholder="MM-DD-YYYY" label="美国格式" />
      <DatePicker format="YYYY年MM月DD日" placeholder="选择日期" label="中文格式" />
      <DatePicker format="DD.MM.YYYY" placeholder="DD.MM.YYYY" label="点分隔" />
    </div>
  ),
}

export const WithTimeFormat: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-64">
      <DatePicker
        showTime
        format="YYYY-MM-DD HH:mm"
        placeholder="选择日期时间"
        label="24小时制"
      />
      <DatePicker
        showTime
        format="DD/MM/YYYY hh:mm A"
        placeholder="选择日期时间"
        label="12小时制"
      />
    </div>
  ),
}
