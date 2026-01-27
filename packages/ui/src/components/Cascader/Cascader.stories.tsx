import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { Cascader, type CascaderOption } from './Cascader'

const meta: Meta<typeof Cascader> = {
  title: 'Components/Cascader',
  component: Cascader,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    expandTrigger: {
      control: 'select',
      options: ['click', 'hover'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Cascader>

// 示例数据：省市区
const locationOptions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖区' },
          { value: 'yuhang', label: '余杭区' },
          { value: 'binjiang', label: '滨江区' },
        ],
      },
      {
        value: 'ningbo',
        label: '宁波',
        children: [
          { value: 'haishu', label: '海曙区' },
          { value: 'jiangbei', label: '江北区' },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      {
        value: 'nanjing',
        label: '南京',
        children: [
          { value: 'xuanwu', label: '玄武区' },
          { value: 'qinhuai', label: '秦淮区' },
        ],
      },
      {
        value: 'suzhou',
        label: '苏州',
        children: [
          { value: 'gusu', label: '姑苏区' },
          { value: 'wuzhong', label: '吴中区' },
        ],
      },
    ],
  },
]

/** 基础用法 */
export const Basic: Story = {
  args: {
    options: locationOptions,
    placeholder: '请选择地区',
  },
}

/** 默认值 */
export const DefaultValue: Story = {
  args: {
    options: locationOptions,
    defaultValue: ['zhejiang', 'hangzhou', 'xihu'],
    placeholder: '请选择地区',
  },
}

/** 可清除 */
export const Clearable: Story = {
  args: {
    options: locationOptions,
    defaultValue: ['zhejiang', 'hangzhou', 'xihu'],
    clearable: true,
    placeholder: '请选择地区',
  },
}

/** 悬停展开 */
export const HoverExpand: Story = {
  args: {
    options: locationOptions,
    expandTrigger: 'hover',
    placeholder: '悬停展开子菜单',
  },
}

/** 选择即改变 */
export const ChangeOnSelect: Story = {
  args: {
    options: locationOptions,
    changeOnSelect: true,
    placeholder: '选择任意级别即可',
  },
}

/** 禁用状态 */
export const Disabled: Story = {
  args: {
    options: locationOptions,
    disabled: true,
    defaultValue: ['zhejiang', 'hangzhou'],
    placeholder: '已禁用',
  },
}

/** 不同尺寸 */
export const Sizes: Story = {
  render: () => (
    <div class="flex flex-col gap-4 w-64">
      <Cascader options={locationOptions} size="sm" placeholder="小尺寸" />
      <Cascader options={locationOptions} size="md" placeholder="中尺寸（默认）" />
      <Cascader options={locationOptions} size="lg" placeholder="大尺寸" />
    </div>
  ),
}

/** 受控模式 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal<string[]>([])
    return (
      <div class="flex flex-col gap-4 w-64">
        <Cascader
          options={locationOptions}
          value={value()}
          onChange={(details) => setValue(details.value)}
          placeholder="受控模式"
          clearable
        />
        <div class="text-sm text-muted-foreground">
          当前值: {JSON.stringify(value())}
        </div>
      </div>
    )
  },
}

/** 仅显示最后一级 */
export const ShowLastPath: Story = {
  args: {
    options: locationOptions,
    defaultValue: ['zhejiang', 'hangzhou', 'xihu'],
    showPath: 'last',
    placeholder: '仅显示最后一级',
  },
}

/** 多选模式 */
export const Multiple: Story = {
  render: () => {
    const [value, setValue] = createSignal<string[][]>([])
    return (
      <div class="flex flex-col gap-4 w-80">
        <Cascader
          multiple
          options={locationOptions}
          value={value()}
          onChange={(details) => setValue(details.value)}
          placeholder="请选择多个地区"
          clearable
        />
        <div class="text-sm text-muted-foreground">
          已选: {value().length} 项
        </div>
      </div>
    )
  },
}

/** 多选 - 仅显示最后一级 */
export const MultipleShowLast: Story = {
  render: () => {
    const [value, setValue] = createSignal<string[][]>([
      ['zhejiang', 'hangzhou', 'xihu'],
      ['jiangsu', 'suzhou', 'gusu'],
    ])
    return (
      <div class="flex flex-col gap-4 w-80">
        <Cascader
          multiple
          options={locationOptions}
          value={value()}
          onChange={(details) => setValue(details.value)}
          showPath="last"
          placeholder="仅显示最后一级"
          clearable
        />
        <div class="text-sm text-muted-foreground">
          已选: {value().map((v) => v[v.length - 1]).join(', ')}
        </div>
      </div>
    )
  },
}

/** 多选 - 限制标签数量 */
export const MultipleMaxTags: Story = {
  render: () => {
    const [value, setValue] = createSignal<string[][]>([
      ['zhejiang', 'hangzhou', 'xihu'],
      ['zhejiang', 'hangzhou', 'yuhang'],
      ['jiangsu', 'suzhou', 'gusu'],
    ])
    return (
      <div class="flex flex-col gap-4 w-80">
        <Cascader
          multiple
          options={locationOptions}
          value={value()}
          onChange={(details) => setValue(details.value)}
          maxTagCount={2}
          showPath="last"
          placeholder="最多显示2个标签"
          clearable
        />
        <div class="text-sm text-muted-foreground">
          已选: {value().length} 项
        </div>
      </div>
    )
  },
}

/** 多选 - 所有节点可选 */
export const MultipleAllSelectable: Story = {
  render: () => {
    const [value, setValue] = createSignal<string[][]>([])
    return (
      <div class="flex flex-col gap-4 w-80">
        <Cascader
          multiple
          options={locationOptions}
          value={value()}
          onChange={(details) => setValue(details.value)}
          checkStrategy="all"
          showPath="full"
          placeholder="所有节点都可选"
          clearable
        />
        <div class="text-sm text-muted-foreground">
          已选: {value().length} 项
        </div>
      </div>
    )
  },
}

/** 多选 - 仅父节点可选 */
export const MultipleParentSelectable: Story = {
  render: () => {
    const [value, setValue] = createSignal<string[][]>([])
    return (
      <div class="flex flex-col gap-4 w-80">
        <Cascader
          multiple
          options={locationOptions}
          value={value()}
          onChange={(details) => setValue(details.value)}
          checkStrategy="parent"
          showPath="full"
          placeholder="仅父节点可选"
          clearable
        />
        <div class="text-sm text-muted-foreground">
          已选: {value().length} 项（仅可选有子节点的选项）
        </div>
      </div>
    )
  },
}

