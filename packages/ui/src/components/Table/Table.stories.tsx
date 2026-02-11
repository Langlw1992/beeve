import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {createSignal} from 'solid-js'
import {
  Table,
  DataTable,
  useDataTable,
  columns,
  actionColumn,
  indexColumn,
} from './index'
import type {ColumnDef, Row, RowSelectionState} from './types'
import {Badge} from '../Badge'
import {Button} from '../Button'
import {toast, Toaster} from '../Toast'

// ==================== 示例数据类型 ====================

interface Person {
  id: number
  firstName: string
  lastName: string
  age: number
  email: string
  status: 'active' | 'inactive' | 'pending'
}

// ==================== 示例数据 ====================

const defaultData: Person[] = [
  {
    id: 1,
    firstName: '张',
    lastName: '三',
    age: 28,
    email: 'zhangsan@example.com',
    status: 'active',
  },
  {
    id: 2,
    firstName: '李',
    lastName: '四',
    age: 32,
    email: 'lisi@example.com',
    status: 'inactive',
  },
  {
    id: 3,
    firstName: '王',
    lastName: '五',
    age: 24,
    email: 'wangwu@example.com',
    status: 'pending',
  },
  {
    id: 4,
    firstName: '赵',
    lastName: '六',
    age: 45,
    email: 'zhaoliu@example.com',
    status: 'active',
  },
  {
    id: 5,
    firstName: '钱',
    lastName: '七',
    age: 36,
    email: 'qianqi@example.com',
    status: 'active',
  },
]

const generateData = (count: number): Person[] =>
  Array.from({length: count}, (_, i) => ({
    id: i + 1,
    firstName: ['张', '李', '王', '赵', '钱', '孙', '周', '吴'][i % 8],
    lastName: ['三', '四', '五', '六', '七', '八', '九', '十'][i % 8],
    age: 20 + (i % 40),
    email: `user${i + 1}@example.com`,
    status: (['active', 'inactive', 'pending'] as const)[i % 3],
  }))

const largeData = generateData(50)

// ==================== 列定义（使用简化 API）====================

const simpleColumns = columns<Person>([
  {key: 'id', title: 'ID', width: 60},
  {key: 'firstName', title: '姓'},
  {key: 'lastName', title: '名'},
  {key: 'age', title: '年龄', width: 80, sort: true},
  {key: 'email', title: '邮箱'},
  {
    key: 'status',
    title: '状态',
    render: (value) => {
      const status = value as Person['status']
      const statusMap = {
        active: 'success',
        inactive: 'default',
        pending: 'warning',
      } as const
      const labelMap = {
        active: '活跃',
        inactive: '未激活',
        pending: '待审核',
      }
      return (
        <Badge
          status={statusMap[status]}
          text={labelMap[status]}
        />
      )
    },
  },
])

// 带操作列
const columnsWithAction = [
  ...simpleColumns,
  actionColumn<Person>({
    title: '操作',
    width: 120,
    render: (row) => (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => toast.info(`编辑用户: ${row.firstName} ${row.lastName}`)}
      >
        编辑
      </Button>
    ),
  }),
]

// 带序号列
const columnsWithIndex = [indexColumn<Person>(), ...simpleColumns]

// ==================== 原生列定义 ====================

const nativeColumns: ColumnDef<Person, unknown>[] = [
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
    enableSorting: true,
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
      const statusMap = {
        active: 'success',
        inactive: 'default',
        pending: 'warning',
      } as const
      const labelMap = {
        active: '活跃',
        inactive: '未激活',
        pending: '待审核',
      }
      return (
        <Badge
          status={statusMap[status]}
          text={labelMap[status]}
        />
      )
    },
  },
]

// ==================== Meta ====================

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
    selectable: {
      control: 'boolean',
      description: '是否启用行选中',
    },
    expandable: {
      control: 'boolean',
      description: '是否启用行展开',
    },
    loading: {
      control: 'boolean',
      description: '加载状态',
    },
  },
} satisfies Meta<typeof Table<Person>>

export default meta
type Story = StoryObj<typeof meta>

// ==================== 基础用法 ====================

export const Default: Story = {
  args: {
    data: defaultData,
    columns: simpleColumns,
  },
}

export const WithNativeColumns: Story = {
  name: '使用原生列定义',
  args: {
    data: defaultData,
    columns: nativeColumns,
  },
}

export const Bordered: Story = {
  name: '带边框',
  args: {
    data: defaultData,
    columns: simpleColumns,
    variant: 'bordered',
  },
}

export const Striped: Story = {
  name: '条纹表格',
  args: {
    data: defaultData,
    columns: simpleColumns,
    striped: true,
  },
}

export const Hoverable: Story = {
  name: '可悬停',
  render: () => {
    return (
      <>
        <Toaster />
        <DataTable
          data={defaultData}
          columns={simpleColumns}
          rowCount={defaultData.length}
          hoverable={true}
          onRowClick={(row) =>
            toast.info(`点击了: ${row.firstName} ${row.lastName}`)
          }
        />
      </>
    )
  },
}

export const SmallSize: Story = {
  name: '紧凑尺寸',
  args: {
    data: defaultData,
    columns: simpleColumns,
    size: 'sm',
    variant: 'bordered',
  },
}

export const LargeSize: Story = {
  name: '宽松尺寸',
  args: {
    data: defaultData,
    columns: simpleColumns,
    size: 'lg',
  },
}

export const Loading: Story = {
  name: '加载状态',
  args: {
    data: defaultData,
    columns: simpleColumns,
    loading: true,
  },
}

export const Empty: Story = {
  name: '空状态',
  args: {
    data: [],
    columns: simpleColumns,
    emptyText: '没有找到数据',
  },
}

// ==================== 列工具 ====================

export const WithActionColumn: Story = {
  name: '操作列',
  render: () => {
    return (
      <>
        <Toaster />
        <DataTable
          data={defaultData}
          columns={columnsWithAction}
          rowCount={defaultData.length}
        />
      </>
    )
  },
}

export const WithIndexColumn: Story = {
  name: '序号列',
  args: {
    data: defaultData,
    columns: columnsWithIndex,
  },
}

// ==================== 分页 ====================

export const WithPagination: Story = {
  name: '分页',
  args: {
    data: largeData,
    columns: simpleColumns,
    pageSize: 10,
  },
}

// ==================== 行选中 ====================

export const Selectable: Story = {
  name: '行选中',
  args: {
    data: defaultData,
    columns: simpleColumns,
    selectable: true,
  },
}

export const SelectableWithCallback: Story = {
  name: '行选中（带回调）',
  render: () => {
    const [selection, setSelection] = createSignal<RowSelectionState>({})

    return (
      <div class="space-y-4">
        <Table
          data={defaultData}
          columns={simpleColumns}
          selectable
          onSelection={setSelection}
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

export const Expandable: Story = {
  name: '行展开',
  args: {
    data: defaultData,
    columns: simpleColumns,
    expandable: true,
    renderExpanded: (row: Row<Person>) => (
      <div class="p-4 bg-muted/30 rounded-md">
        <h4 class="font-medium mb-2">详细信息</h4>
        <dl class="grid grid-cols-2 gap-2 text-sm">
          <dt class="text-muted-foreground">ID:</dt>
          <dd>{row.original.id}</dd>
          <dt class="text-muted-foreground">姓名:</dt>
          <dd>
            {row.original.firstName}
            {row.original.lastName}
          </dd>
          <dt class="text-muted-foreground">年龄:</dt>
          <dd>{row.original.age}</dd>
          <dt class="text-muted-foreground">邮箱:</dt>
          <dd>{row.original.email}</dd>
        </dl>
      </div>
    ),
  },
}

// ==================== 组合功能 ====================

export const FullFeatured: Story = {
  name: '全功能组合',
  args: {
    data: largeData,
    columns: columnsWithAction,
    selectable: true,
    expandable: true,
    variant: 'bordered',
    hoverable: true,
    pageSize: 10,
    renderExpanded: (row: Row<Person>) => (
      <div class="p-4 bg-muted/30 rounded-md">
        <p class="text-sm">
          <strong>
            {row.original.firstName}
            {row.original.lastName}
          </strong>{' '}
          的详细信息 - 邮箱: {row.original.email}
        </p>
      </div>
    ),
  },
}

// ==================== DataTable 示例 ====================

export const DataTableBasic: Story = {
  name: 'DataTable 基础',
  render: () => {
    // 模拟服务端数据
    const [page, setPage] = createSignal(0)
    const pageSize = 5
    const total = largeData.length

    // 模拟分页数据
    const pageData = () =>
      largeData.slice(page() * pageSize, (page() + 1) * pageSize)

    return (
      <DataTable
        data={pageData()}
        columns={simpleColumns}
        rowCount={total}
        pagination={{pageIndex: page(), pageSize}}
        onPagination={(updater) => {
          const newValue =
            typeof updater === 'function'
              ? updater({pageIndex: page(), pageSize})
              : updater
          setPage(newValue.pageIndex)
        }}
      />
    )
  },
}

export const DataTableWithHook: Story = {
  name: 'DataTable + useDataTable Hook',
  render: () => {
    const [filters, setFilters] = createSignal({status: ''})

    const {tableProps, state, reset, selectedRows} = useDataTable({
      pageSize: 5,
      deps: () => [filters()],
    })

    // 模拟服务端数据过滤和分页
    const filteredData = () => {
      const status = filters().status
      if (!status) {
        return largeData
      }
      return largeData.filter((item) => item.status === status)
    }

    const pageData = () => {
      const {pageIndex, pageSize} = state().pagination
      return filteredData().slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize,
      )
    }

    return (
      <div class="space-y-4">
        <div class="flex gap-2 items-center">
          <select
            class="border rounded px-2 py-1 text-sm"
            value={filters().status}
            onChange={(e) => setFilters({status: e.target.value})}
          >
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="inactive">未激活</option>
            <option value="pending">待审核</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
          >
            重置
          </Button>
          <span class="text-sm text-muted-foreground ml-auto">
            已选中: {selectedRows().length} 项
          </span>
        </div>
        <DataTable
          data={pageData()}
          columns={simpleColumns}
          rowCount={filteredData().length}
          selectable
          {...tableProps}
        />
        <div class="text-xs text-muted-foreground">
          状态: {JSON.stringify(state())}
        </div>
      </div>
    )
  },
}
