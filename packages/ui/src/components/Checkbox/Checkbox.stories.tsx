import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { For, createSignal, type JSX } from 'solid-js'
import { Checkbox } from './Checkbox'

// ============================================================
// 变体定义
// ============================================================
const SIZES = ['sm', 'md', 'lg'] as const
const STATES = ['unchecked', 'checked', 'indeterminate'] as const

// ============================================================
// 辅助组件
// ============================================================

/** 矩阵容器 */
const Matrix = <R, C>(props: {
  rows: readonly R[]
  cols: readonly C[]
  rowLabel: (row: R) => string
  colLabel: (col: C) => string
  renderCell: (row: R, col: C) => JSX.Element
}) => (
  <div
    class="grid gap-4 items-center"
    style={{ 'grid-template-columns': `5rem repeat(${props.cols.length}, minmax(8rem, 1fr))` }}
  >
    <div />
    <For each={props.cols}>
      {(col) => (
        <div class="text-xs text-muted-foreground font-medium text-center">
          {props.colLabel(col)}
        </div>
      )}
    </For>
    <For each={props.rows}>
      {(row) => (
        <>
          <div class="text-xs text-muted-foreground font-medium">{props.rowLabel(row)}</div>
          <For each={props.cols}>
            {(col) => <div class="flex justify-center">{props.renderCell(row, col)}</div>}
          </For>
        </>
      )}
    </For>
  </div>
)

// ============================================================
// Meta
// ============================================================
const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** 交互演示 */
export const Playground: Story = {
  args: {
    children: '同意服务条款',
  },
}

/**
 * ## Size × State 矩阵
 * 展示所有尺寸和状态的组合
 */
export const SizeStateMatrix: Story = {
  render: () => (
    <Matrix
      rows={SIZES}
      cols={STATES}
      rowLabel={(size) => size}
      colLabel={(state) => state}
      renderCell={(size, state) => (
        <Checkbox
          size={size}
          checked={state === 'checked'}
          indeterminate={state === 'indeterminate'}
        >
          {size}
        </Checkbox>
      )}
    />
  ),
}

/**
 * ## 禁用状态矩阵
 */
export const DisabledMatrix: Story = {
  render: () => (
    <Matrix
      rows={STATES}
      cols={['normal', 'disabled'] as const}
      rowLabel={(state) => state}
      colLabel={(col) => col}
      renderCell={(state, col) => (
        <Checkbox
          checked={state === 'checked'}
          indeterminate={state === 'indeterminate'}
          disabled={col === 'disabled'}
        >
          Label
        </Checkbox>
      )}
    />
  ),
}

/**
 * ## 受控模式
 */
export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = createSignal(false)
    return (
      <div class="flex flex-col gap-4 items-start">
        <Checkbox checked={checked()} onChange={setChecked}>
          同意服务条款
        </Checkbox>
        <div class="text-xs text-muted-foreground">
          当前状态: {checked() ? '选中' : '未选中'}
        </div>
        <button
          type="button"
          class="px-3 py-1 text-sm border rounded"
          onClick={() => setChecked(!checked())}
        >
          切换状态
        </button>
      </div>
    )
  },
}

/**
 * ## 复选框组
 */
export const Group: Story = {
  render: () => {
    const [selected, setSelected] = createSignal<string[]>([])
    const options = ['苹果', '香蕉', '橙子', '葡萄']

    const toggle = (value: string) => {
      setSelected((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      )
    }

    const allChecked = () => selected().length === options.length
    const someChecked = () => selected().length > 0 && selected().length < options.length

    return (
      <div class="flex flex-col gap-3">
        <Checkbox
          checked={allChecked()}
          indeterminate={someChecked()}
          onChange={(checked) => setSelected(checked ? [...options] : [])}
        >
          全选
        </Checkbox>
        <div class="flex flex-col gap-2 pl-6">
          <For each={options}>
            {(option) => (
              <Checkbox
                checked={selected().includes(option)}
                onChange={() => toggle(option)}
              >
                {option}
              </Checkbox>
            )}
          </For>
        </div>
        <div class="text-xs text-muted-foreground mt-2">
          已选择: {selected().join(', ') || '无'}
        </div>
      </div>
    )
  },
}

