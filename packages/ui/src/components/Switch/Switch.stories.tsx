import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { For, createSignal, type JSX } from 'solid-js'
import { Switch } from './Switch'

// ============================================================
// 变体定义
// ============================================================
const SIZES = ['sm', 'md', 'lg'] as const
const STATES = ['off', 'on'] as const

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
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** 交互演示 */
export const Playground: Story = {
  args: {
    children: '启用通知',
  },
}

/**
 * ## Size × State 矩阵
 */
export const SizeStateMatrix: Story = {
  render: () => (
    <Matrix
      rows={SIZES}
      cols={STATES}
      rowLabel={(size) => size}
      colLabel={(state) => state}
      renderCell={(size, state) => (
        <Switch
          size={size}
          checked={state === 'on'}
        >
          {size}
        </Switch>
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
        <Switch
          checked={state === 'on'}
          disabled={col === 'disabled'}
        >
          Label
        </Switch>
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
        <Switch checked={checked()} onChange={setChecked}>
          启用通知
        </Switch>
        <div class="text-xs text-muted-foreground">
          当前状态: {checked() ? '开启' : '关闭'}
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
 * ## 设置面板示例
 */
export const SettingsPanel: Story = {
  render: () => {
    const [settings, setSettings] = createSignal({
      notifications: true,
      darkMode: false,
      autoSave: true,
      analytics: false,
    })

    const toggle = (key: keyof typeof settings extends () => infer T ? keyof T : never) => {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    return (
      <div class="flex flex-col gap-4 w-64">
        <div class="flex items-center justify-between">
          <span class="text-sm">通知</span>
          <Switch checked={settings().notifications} onChange={() => toggle('notifications')} />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm">深色模式</span>
          <Switch checked={settings().darkMode} onChange={() => toggle('darkMode')} />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm">自动保存</span>
          <Switch checked={settings().autoSave} onChange={() => toggle('autoSave')} />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm">数据分析</span>
          <Switch checked={settings().analytics} onChange={() => toggle('analytics')} />
        </div>
      </div>
    )
  },
}

