import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { createSignal } from 'solid-js'
import { DateRangePicker } from './DateRangePicker'
import { today, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

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
    showPresets: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof DateRangePicker>

export const Basic: Story = {
  render: (args) => (
    <div class="w-[300px]">
      <DateRangePicker {...args} />
    </div>
  ),
  args: {
    placeholder: '选择日期范围',
  },
}

export const WithLabel: Story = {
  render: (args) => (
    <div class="w-[300px]">
      <DateRangePicker {...args} />
    </div>
  ),
  args: {
    label: '出行日期',
    placeholder: '开始日期 - 结束日期',
  },
}

export const WithPresets: Story = {
  render: (args) => (
    <div class="w-[300px]">
      <DateRangePicker {...args} />
    </div>
  ),
  args: {
    label: '日期范围',
    placeholder: '选择日期',
    showPresets: true,
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal<string[]>([])

    const handleChange = (details: { value: DateValue[]; valueAsString: string[] }) => {
      setValue(details.valueAsString)
    }

    return (
      <div class="flex flex-col gap-4 w-[300px]">
        <DateRangePicker
          label="受控日期范围"
          placeholder="选择日期"
          value={value()}
          onValueChange={handleChange}
          showPresets
        />
        <div class="text-sm text-muted-foreground">
          选中值: {value().length > 0 ? value().join(' - ') : '未选择'}
        </div>
      </div>
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-[300px]">
      <DateRangePicker size="sm" placeholder="Small (sm)" label="小尺寸" />
      <DateRangePicker size="md" placeholder="Default (md)" label="默认尺寸" />
      <DateRangePicker size="lg" placeholder="Large (lg)" label="大尺寸" />
    </div>
  ),
}

export const ErrorState: Story = {
  render: (args) => (
    <div class="w-[300px]">
      <DateRangePicker {...args} />
    </div>
  ),
  args: {
    label: '日期范围',
    placeholder: '选择日期',
    error: true,
  },
}

export const Disabled: Story = {
  render: (args) => (
    <div class="w-[300px]">
      <DateRangePicker {...args} />
    </div>
  ),
  args: {
    label: '日期范围',
    placeholder: '选择日期',
    disabled: true,
  },
}

export const MinMaxDate: Story = {
  render: () => {
    const tz = getLocalTimeZone()
    const todayDate = today(tz)
    // 只能选择今天前后7天的范围
    const minDate = todayDate.subtract({ days: 7 })
    const maxDate = todayDate.add({ days: 7 })

    return (
      <div class="flex flex-col gap-4 w-[300px]">
        <DateRangePicker
          label="限制日期范围"
          placeholder="只能选择前后7天"
          min={minDate}
          max={maxDate}
        />
        <div class="text-xs text-muted-foreground">
          可选范围: {minDate.toString()} ~ {maxDate.toString()}
        </div>
      </div>
    )
  },
}

export const CustomFormat: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-[350px]">
      <DateRangePicker
        format="YYYY-MM-DD"
        placeholder="YYYY-MM-DD"
        label="ISO 格式"
      />
      <DateRangePicker
        format="DD/MM/YYYY"
        placeholder="DD/MM/YYYY"
        label="欧洲格式"
      />
      <DateRangePicker
        format="MM-DD-YYYY"
        placeholder="MM-DD-YYYY"
        label="美国格式"
      />
      <DateRangePicker
        format="YYYY年MM月DD日"
        placeholder="选择日期范围"
        label="中文格式"
      />
    </div>
  ),
}
