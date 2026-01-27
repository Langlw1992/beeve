import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Table, type ColumnDef } from './Table'
import { Badge } from '../Badge'

// 示例数据类型
interface Person {
  id: number
  firstName: string
  lastName: string
  age: number
  email: string
  status: 'active' | 'inactive' | 'pending'
}

// 示例数据
const defaultData: Person[] = [
  { id: 1, firstName: '张', lastName: '三', age: 28, email: 'zhangsan@example.com', status: 'active' },
  { id: 2, firstName: '李', lastName: '四', age: 32, email: 'lisi@example.com', status: 'inactive' },
  { id: 3, firstName: '王', lastName: '五', age: 24, email: 'wangwu@example.com', status: 'pending' },
  { id: 4, firstName: '赵', lastName: '六', age: 45, email: 'zhaoliu@example.com', status: 'active' },
  { id: 5, firstName: '钱', lastName: '七', age: 36, email: 'qianqi@example.com', status: 'active' },
]

// 列定义
const defaultColumns: ColumnDef<Person, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 60,
  },
  {
    accessorFn: (row) => `${row.firstName}${row.lastName}`,
    id: 'fullName',
    header: '姓名',
  },
  {
    accessorKey: 'age',
    header: '年龄',
    size: 80,
  },
  {
    accessorKey: 'email',
    header: '邮箱',
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: (info) => {
      const status = info.getValue() as Person['status']
      const variantMap = {
        active: 'success',
        inactive: 'secondary',
        pending: 'warning',
      } as const
      const labelMap = {
        active: '活跃',
        inactive: '未激活',
        pending: '待审核',
      }
      return <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>
    },
  },
]

const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered'],
      description: '表格变体',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '表格尺寸',
    },
    striped: {
      control: 'boolean',
      description: '是否显示条纹',
    },
    hoverable: {
      control: 'boolean',
      description: '是否可悬停高亮',
    },
    emptyText: {
      control: 'text',
      description: '空状态文本',
    },
  },
} satisfies Meta<typeof Table<Person>>

export default meta
type Story = StoryObj<typeof meta>

// 基础用法
export const Default: Story = {
  args: {
    data: defaultData,
    columns: defaultColumns,
  },
}

// 带边框
export const Bordered: Story = {
  args: {
    data: defaultData,
    columns: defaultColumns,
    variant: 'bordered',
  },
}

// 条纹表格
export const Striped: Story = {
  args: {
    data: defaultData,
    columns: defaultColumns,
    striped: true,
  },
}

// 可悬停
export const Hoverable: Story = {
  args: {
    data: defaultData,
    columns: defaultColumns,
    hoverable: true,
    onRowClick: (row) => alert(`点击了: ${row.firstName}${row.lastName}`),
  },
}

// 紧凑尺寸
export const SmallSize: Story = {
  args: {
    data: defaultData,
    columns: defaultColumns,
    size: 'sm',
    variant: 'bordered',
  },
}

// 宽松尺寸
export const LargeSize: Story = {
  args: {
    data: defaultData,
    columns: defaultColumns,
    size: 'lg',
  },
}

// 空状态
export const Empty: Story = {
  args: {
    data: [],
    columns: defaultColumns,
    emptyText: '没有找到数据',
  },
}

// 组合样式
export const Combined: Story = {
  args: {
    data: defaultData,
    columns: defaultColumns,
    variant: 'bordered',
    striped: true,
    hoverable: true,
    size: 'sm',
  },
}

// 生成更多数据用于分页
const generateData = (count: number): Person[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    firstName: ['张', '李', '王', '赵', '钱', '孙', '周', '吴'][i % 8],
    lastName: ['三', '四', '五', '六', '七', '八', '九', '十'][i % 8],
    age: 20 + (i % 40),
    email: `user${i + 1}@example.com`,
    status: (['active', 'inactive', 'pending'] as const)[i % 3],
  }))

const largeData = generateData(50)

// 排序功能
export const Sortable: Story = {
  args: {
    data: defaultData,
    columns: defaultColumns,
    enableSorting: true,
  },
}

// 分页功能
export const WithPagination: Story = {
  args: {
    data: largeData,
    columns: defaultColumns,
    pagination: true,
    pageSize: 10,
  },
}

// 分页 + 显示总数
export const PaginationWithTotal: Story = {
  args: {
    data: largeData,
    columns: defaultColumns,
    pagination: true,
    pageSize: 10,
    paginationProps: {
      showTotal: true,
    },
  },
}

// 分页 + 快速跳转
export const PaginationWithJumper: Story = {
  args: {
    data: largeData,
    columns: defaultColumns,
    pagination: true,
    pageSize: 10,
    paginationProps: {
      showTotal: true,
      showQuickJumper: true,
    },
  },
}

// 排序 + 分页
export const SortableWithPagination: Story = {
  args: {
    data: largeData,
    columns: defaultColumns,
    enableSorting: true,
    pagination: true,
    pageSize: 10,
    variant: 'bordered',
    paginationProps: {
      showTotal: true,
    },
  },
}

