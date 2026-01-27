import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Table, createSelectionColumn, createExpandColumn, type ColumnDef, type RowSelectionState } from './Table'
import { Badge } from '../Badge'
import { createSignal } from 'solid-js'

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

// ==================== 行选择 ====================

// 带选择列的列定义
const columnsWithSelection: ColumnDef<Person, unknown>[] = [
  createSelectionColumn<Person>(),
  ...defaultColumns,
]

// 基础行选择
export const RowSelection: Story = {
  args: {
    data: defaultData,
    columns: columnsWithSelection,
    enableRowSelection: true,
  },
}

// 行选择 + 回调
export const RowSelectionWithCallback: Story = {
  render: () => {
    const [selection, setSelection] = createSignal<RowSelectionState>({})

    return (
      <div class="space-y-4">
        <Table
          data={defaultData}
          columns={columnsWithSelection}
          enableRowSelection
          onRowSelectionChange={setSelection}
          getRowId={(row) => String(row.id)}
        />
        <div class="text-sm text-muted-foreground">
          选中行 ID: {JSON.stringify(Object.keys(selection()))}
        </div>
      </div>
    )
  },
}

// ==================== 行展开 ====================

// 带展开列的列定义
const columnsWithExpand: ColumnDef<Person, unknown>[] = [
  createExpandColumn<Person>(),
  ...defaultColumns,
]

// 基础行展开
export const RowExpanding: Story = {
  args: {
    data: defaultData,
    columns: columnsWithExpand,
    enableExpanding: true,
    renderExpandedRow: (row: Person) => (
      <div class="p-4 bg-muted/30 rounded-md">
        <h4 class="font-medium mb-2">详细信息</h4>
        <dl class="grid grid-cols-2 gap-2 text-sm">
          <dt class="text-muted-foreground">ID:</dt>
          <dd>{row.id}</dd>
          <dt class="text-muted-foreground">姓名:</dt>
          <dd>{row.firstName}{row.lastName}</dd>
          <dt class="text-muted-foreground">年龄:</dt>
          <dd>{row.age}</dd>
          <dt class="text-muted-foreground">邮箱:</dt>
          <dd>{row.email}</dd>
          <dt class="text-muted-foreground">状态:</dt>
          <dd>{row.status}</dd>
        </dl>
      </div>
    ),
  },
}

// ==================== 列固定 ====================

// 带固定列的列定义
const columnsWithPinning: ColumnDef<Person, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 60,
  },
  {
    accessorFn: (row) => `${row.firstName}${row.lastName}`,
    id: 'fullName',
    header: '姓名',
    size: 100,
  },
  {
    accessorKey: 'age',
    header: '年龄',
    size: 80,
  },
  {
    id: 'placeholder1',
    header: '占位列1',
    cell: () => '...',
    size: 200,
  },
  {
    id: 'placeholder2',
    header: '占位列2',
    cell: () => '...',
    size: 200,
  },
  {
    accessorKey: 'email',
    header: '邮箱',
    size: 200,
  },
  {
    accessorKey: 'status',
    header: '状态',
    size: 100,
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

// 列固定 - 左侧固定
export const ColumnPinningLeft: Story = {
  args: {
    data: defaultData,
    columns: columnsWithPinning,
    enableColumnPinning: true,
    defaultColumnPinning: {
      left: ['id', 'fullName'],
      right: [],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
}

// 列固定 - 右侧固定
export const ColumnPinningRight: Story = {
  args: {
    data: defaultData,
    columns: columnsWithPinning,
    enableColumnPinning: true,
    defaultColumnPinning: {
      left: [],
      right: ['status'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
}

// 列固定 - 左右都固定
export const ColumnPinningBoth: Story = {
  args: {
    data: defaultData,
    columns: columnsWithPinning,
    enableColumnPinning: true,
    defaultColumnPinning: {
      left: ['id'],
      right: ['status'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
}

// ==================== 组合功能 ====================

// 带选择列和展开列
const columnsWithAll: ColumnDef<Person, unknown>[] = [
  createSelectionColumn<Person>(),
  createExpandColumn<Person>(),
  ...defaultColumns,
]

// 全功能组合
export const FullFeatured: Story = {
  args: {
    data: largeData,
    columns: columnsWithAll,
    enableRowSelection: true,
    enableExpanding: true,
    enableSorting: true,
    pagination: true,
    pageSize: 10,
    variant: 'bordered',
    hoverable: true,
    paginationProps: {
      showTotal: true,
    },
    renderExpandedRow: (row: Person) => (
      <div class="p-4 bg-muted/30 rounded-md">
        <p class="text-sm">
          <strong>{row.firstName}{row.lastName}</strong> 的详细信息 - 邮箱: {row.email}
        </p>
      </div>
    ),
  },
}

