import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {createSignal} from 'solid-js'
import DatePicker from './DatePicker'

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
    placeholder: '选择日期',
  },
}

export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-64">
      <DatePicker
        size="sm"
        placeholder="Small"
      />
      <DatePicker
        size="md"
        placeholder="Medium"
      />
      <DatePicker
        size="lg"
        placeholder="Large"
      />
    </div>
  ),
}

export const WithLabel: Story = {
  args: {
    label: '出生日期',
    placeholder: '选择日期...',
  },
}

export const ErrorState: Story = {
  args: {
    label: '截止日期',
    error: true,
    placeholder: '选择日期',
  },
}

export const Disabled: Story = {
  args: {
    label: '不可用',
    disabled: true,
    placeholder: '选择日期',
  },
}

export const CustomFormat: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-64">
      <DatePicker
        format="YYYY-MM-DD"
        placeholder="YYYY-MM-DD"
        label="ISO 格式"
      />
      <DatePicker
        format="DD/MM/YYYY"
        placeholder="DD/MM/YYYY"
        label="欧洲格式"
      />
      <DatePicker
        format="MM-DD-YYYY"
        placeholder="MM-DD-YYYY"
        label="美国格式"
      />
      <DatePicker
        format="YYYY年MM月DD日"
        placeholder="选择日期"
        label="中文格式"
      />
      <DatePicker
        format="DD.MM.YYYY"
        placeholder="DD.MM.YYYY"
        label="点分隔"
      />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal<string>('2024-01-15')

    return (
      <div class="flex flex-col gap-4 w-64">
        <DatePicker
          label="受控组件"
          value={value()}
          onChange={(details) => {
            setValue(details.valueAsString || '')
          }}
        />
        <div class="text-sm text-muted-foreground">
          当前值: {value() || '未选择'}
        </div>
      </div>
    )
  },
}

export const WithDefaultValue: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-64">
      <DatePicker
        label="默认值（字符串）"
        defaultValue="2024-01-01"
      />
      <DatePicker
        label="默认值（Date对象）"
        defaultValue={new Date(2024, 0, 15)}
      />
    </div>
  ),
}

export const WithMinMax: Story = {
  render: () => {
    const today = new Date()
    const nextMonth = new Date(today)
    nextMonth.setMonth(today.getMonth() + 1)

    return (
      <div class="flex flex-col gap-4 w-64">
        <DatePicker
          label="限制范围（未来30天）"
          min={today}
          max={nextMonth}
          placeholder="选择日期"
        />
        <DatePicker
          label="限制最小日期"
          min="2024-01-01"
          placeholder="2024年1月1日之后"
        />
        <DatePicker
          label="限制最大日期"
          max="2024-12-31"
          placeholder="2024年12月31日之前"
        />
      </div>
    )
  },
}

export const DisableWeekends: Story = {
  render: () => (
    <DatePicker
      label="禁用周末"
      placeholder="选择工作日"
      isDateUnavailable={(date) => {
        const dayOfWeek = new Date(date.year, date.month - 1, date.day).getDay()
        return dayOfWeek === 0 || dayOfWeek === 6
      }}
    />
  ),
}

export const DisableSpecificDates: Story = {
  render: () => {
    const holidays = ['2024-01-01', '2024-05-01', '2024-10-01']

    return (
      <DatePicker
        label="禁用节假日"
        placeholder="选择日期"
        isDateUnavailable={(date) => {
          const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
          return holidays.includes(dateStr)
        }}
      />
    )
  },
}

export const MultipleValues: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = createSignal<string>()

    return (
      <div class="flex flex-col gap-4 w-80">
        <DatePicker
          label="选择日期"
          placeholder="点击选择"
          onChange={(details) => {
            console.log('DateValue:', details.value)
            console.log('String:', details.valueAsString)
            console.log('Date Object:', details.valueAsDate)
            setSelectedDate(details.valueAsString || '')
          }}
        />
        <div class="p-3 bg-muted rounded-md text-sm">
          <div class="font-medium mb-2">回调提供三种格式：</div>
          <ul class="list-disc list-inside space-y-1 text-muted-foreground">
            <li>DateValue: Zag.js 原生格式</li>
            <li>String: ISO 字符串格式</li>
            <li>Date: JavaScript Date 对象</li>
          </ul>
          {selectedDate() && (
            <div class="mt-2 pt-2 border-t">
              <span class="font-medium">当前选择:</span> {selectedDate()}
            </div>
          )}
        </div>
      </div>
    )
  },
}

export const DifferentLocales: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-64">
      <DatePicker
        label="中文"
        locale="zh-CN"
        placeholder="选择日期"
      />
      <DatePicker
        label="English"
        locale="en-US"
        placeholder="Pick a date"
      />
      <DatePicker
        label="日本語"
        locale="ja-JP"
        placeholder="日付を選択"
      />
      <DatePicker
        label="Français"
        locale="fr-FR"
        placeholder="Choisir une date"
      />
    </div>
  ),
}
