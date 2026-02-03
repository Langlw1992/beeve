import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {For, createSignal, type JSX} from 'solid-js'
import {Radio, RadioGroup} from './Radio'

// ============================================================
// 变体定义
// ============================================================
const SIZES = ['sm', 'md', 'lg'] as const
const STATES = ['unchecked', 'checked'] as const

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
    style={{
      'grid-template-columns': `5rem repeat(${props.cols.length}, minmax(8rem, 1fr))`,
    }}
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
          <div class="text-xs text-muted-foreground font-medium">
            {props.rowLabel(row)}
          </div>
          <For each={props.cols}>
            {(col) => (
              <div class="flex justify-center">
                {props.renderCell(row, col)}
              </div>
            )}
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
  title: 'Components/Radio',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** 交互演示 */
export const Playground: Story = {
  args: {
    value: 'option1',
    children: '选项一',
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
        <Radio
          size={size}
          value="demo"
          checked={state === 'checked'}
        >
          {size}
        </Radio>
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
        <Radio
          value="demo"
          checked={state === 'checked'}
          disabled={col === 'disabled'}
        >
          Label
        </Radio>
      )}
    />
  ),
}

/**
 * ## Radio Group
 * 单选框组
 */
export const Group: Story = {
  render: () => {
    const [value, setValue] = createSignal('apple')

    return (
      <div class="flex flex-col gap-4">
        <RadioGroup
          value={value()}
          onChange={setValue}
          name="fruit"
        >
          <div class="flex flex-col gap-2">
            <Radio value="apple">苹果</Radio>
            <Radio value="banana">香蕉</Radio>
            <Radio value="orange">橙子</Radio>
            <Radio value="grape">葡萄</Radio>
          </div>
        </RadioGroup>
        <div class="text-xs text-muted-foreground">当前选择: {value()}</div>
      </div>
    )
  },
}

/**
 * ## 水平布局
 */
export const Horizontal: Story = {
  render: () => {
    const [value, setValue] = createSignal('option1')

    return (
      <RadioGroup
        value={value()}
        onChange={setValue}
        name="options"
      >
        <div class="flex gap-4">
          <Radio value="option1">选项一</Radio>
          <Radio value="option2">选项二</Radio>
          <Radio value="option3">选项三</Radio>
        </div>
      </RadioGroup>
    )
  },
}

/**
 * ## 不同尺寸的组
 */
export const GroupSizes: Story = {
  render: () => (
    <div class="flex flex-col gap-6">
      <For each={SIZES}>
        {(size) => (
          <div class="flex flex-col gap-2">
            <div class="text-xs text-muted-foreground font-medium">{size}</div>
            <RadioGroup
              size={size}
              defaultValue="a"
              name={`group-${size}`}
            >
              <div class="flex gap-4">
                <Radio value="a">选项 A</Radio>
                <Radio value="b">选项 B</Radio>
                <Radio value="c">选项 C</Radio>
              </div>
            </RadioGroup>
          </div>
        )}
      </For>
    </div>
  ),
}

/**
 * ## 禁用的组
 */
export const DisabledGroup: Story = {
  render: () => (
    <RadioGroup
      disabled
      defaultValue="option1"
      name="disabled-group"
    >
      <div class="flex gap-4">
        <Radio value="option1">选项一</Radio>
        <Radio value="option2">选项二</Radio>
        <Radio value="option3">选项三</Radio>
      </div>
    </RadioGroup>
  ),
}
