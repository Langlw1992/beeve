import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { createSignal } from 'solid-js'
import { Pagination } from './Pagination'

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '分页尺寸',
    },
    simple: {
      control: 'boolean',
      description: '简洁模式',
    },
    showTotal: {
      control: 'boolean',
      description: '显示总数',
    },
    showQuickJumper: {
      control: 'boolean',
      description: '显示快速跳转',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

// 基础用法
export const Default: Story = {
  args: {
    current: 1,
    total: 100,
    pageSize: 10,
  },
  render: (args) => {
    const [page, setPage] = createSignal(args.current)
    return (
      <Pagination
        {...args}
        current={page()}
        onChange={setPage}
      />
    )
  },
}

// 简洁模式
export const Simple: Story = {
  args: {
    current: 1,
    total: 50,
    pageSize: 10,
    simple: true,
  },
  render: (args) => {
    const [page, setPage] = createSignal(args.current)
    return (
      <Pagination
        {...args}
        current={page()}
        onChange={setPage}
      />
    )
  },
}

// 显示总数
export const ShowTotal: Story = {
  args: {
    current: 1,
    total: 85,
    pageSize: 10,
    showTotal: true,
  },
  render: (args) => {
    const [page, setPage] = createSignal(args.current)
    return (
      <Pagination
        {...args}
        current={page()}
        onChange={setPage}
      />
    )
  },
}

// 自定义总数显示
export const CustomTotal: Story = {
  args: {
    current: 1,
    total: 85,
    pageSize: 10,
  },
  render: (args) => {
    const [page, setPage] = createSignal(args.current)
    return (
      <Pagination
        {...args}
        current={page()}
        onChange={setPage}
        showTotal={(total, range) => (
          <span>显示 {range[0]}-{range[1]} 条，共 {total} 条</span>
        )}
      />
    )
  },
}

// 快速跳转
export const QuickJumper: Story = {
  args: {
    current: 1,
    total: 500,
    pageSize: 10,
    showQuickJumper: true,
  },
  render: (args) => {
    const [page, setPage] = createSignal(args.current)
    return (
      <Pagination
        {...args}
        current={page()}
        onChange={setPage}
      />
    )
  },
}

// 小尺寸
export const SmallSize: Story = {
  args: {
    current: 1,
    total: 100,
    pageSize: 10,
    size: 'sm',
  },
  render: (args) => {
    const [page, setPage] = createSignal(args.current)
    return (
      <Pagination
        {...args}
        current={page()}
        onChange={setPage}
      />
    )
  },
}

// 大尺寸
export const LargeSize: Story = {
  args: {
    current: 1,
    total: 100,
    pageSize: 10,
    size: 'lg',
  },
  render: (args) => {
    const [page, setPage] = createSignal(args.current)
    return (
      <Pagination
        {...args}
        current={page()}
        onChange={setPage}
      />
    )
  },
}

// 禁用状态
export const Disabled: Story = {
  args: {
    current: 3,
    total: 100,
    pageSize: 10,
    disabled: true,
  },
}

