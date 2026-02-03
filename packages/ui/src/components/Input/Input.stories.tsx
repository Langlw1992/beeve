import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {For, createSignal, type JSX} from 'solid-js'
import {Input, Label} from '@beeve/ui'
import type {InputProps} from './Input'
import {Search, Mail} from 'lucide-solid'

// ============================================================
// 变体定义
// ============================================================
const SIZES = ['sm', 'md', 'lg'] as const
const VARIANTS = ['default', 'filled', 'borderless'] as const
const STATUSES = [undefined, 'error', 'warning'] as const

// ============================================================
// 辅助组件
// ============================================================

/** 矩阵单元格 */
const Cell = (props: {label?: string; children: JSX.Element}) => (
  <div class="flex flex-col gap-1">
    {props.label && (
      <span class="text-xs text-muted-foreground">{props.label}</span>
    )}
    {props.children}
  </div>
)

/** 矩阵容器 - 使用 CSS Grid 实现对齐 */
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
      'grid-template-columns': `5rem repeat(${props.cols.length}, minmax(12rem, 1fr))`,
    }}
  >
    {/* 左上角空白 */}
    <div />
    {/* 列标题 */}
    <For each={props.cols}>
      {(col) => (
        <div class="text-xs text-muted-foreground font-medium text-center">
          {props.colLabel(col)}
        </div>
      )}
    </For>
    {/* 行数据 */}
    <For each={props.rows}>
      {(row) => (
        <>
          <div class="text-xs text-muted-foreground font-medium">
            {props.rowLabel(row)}
          </div>
          <For each={props.cols}>
            {(col) => <div>{props.renderCell(row, col)}</div>}
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
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** 交互演示 */
export const Playground: Story = {
  args: {
    placeholder: '请输入内容',
    size: 'md',
    variant: 'default',
  },
}

/**
 * ## Size × Variant 矩阵
 * 展示所有尺寸和变体的组合
 */
export const SizeVariantMatrix: Story = {
  render: () => (
    <Matrix
      rows={SIZES}
      cols={VARIANTS}
      rowLabel={(size) => size}
      colLabel={(variant) => variant}
      renderCell={(size, variant) => (
        <Input
          size={size}
          variant={variant}
          placeholder={`${size} / ${variant}`}
        />
      )}
    />
  ),
}

/**
 * ## Status × Variant 矩阵
 * 展示所有状态和变体的组合
 */
export const StatusVariantMatrix: Story = {
  render: () => (
    <Matrix
      rows={STATUSES}
      cols={VARIANTS}
      rowLabel={(status) => status ?? 'normal'}
      colLabel={(variant) => variant}
      renderCell={(status, variant) => (
        <Input
          variant={variant}
          status={status as InputProps['status']}
          placeholder={status ?? 'normal'}
        />
      )}
    />
  ),
}

/**
 * ## 功能特性展示
 * 展示各种功能：前缀/后缀、清空、密码、字数统计
 */
export const Features: Story = {
  render: () => (
    <div class="grid grid-cols-2 gap-6 w-[500px]">
      <Cell label="前缀图标">
        <Input
          prefix={<Search class="size-3.5" />}
          placeholder="搜索..."
        />
      </Cell>
      <Cell label="后缀文本">
        <Input
          suffix={<span class="text-xs">.com</span>}
          placeholder="网站"
        />
      </Cell>
      <Cell label="一键清空">
        <Input
          allowClear
          defaultValue="可以清空"
        />
      </Cell>
      <Cell label="密码切换">
        <Input
          type="password"
          placeholder="密码"
        />
      </Cell>
      <Cell label="字数统计">
        <Input
          showCount
          maxLength={20}
          placeholder="限制20字"
        />
      </Cell>
      <Cell label="组合使用">
        <Input
          prefix={<Mail class="size-3.5" />}
          allowClear
          showCount
          maxLength={50}
          placeholder="邮箱地址"
        />
      </Cell>
    </div>
  ),
}

/**
 * ## 禁用状态
 * 各变体的禁用状态展示
 */
export const Disabled: Story = {
  render: () => (
    <div class="grid grid-cols-3 gap-4">
      <For each={VARIANTS}>
        {(variant) => (
          <Cell label={variant}>
            <Input
              variant={variant}
              disabled
              value="禁用状态"
            />
          </Cell>
        )}
      </For>
    </div>
  ),
}

/**
 * ## Textarea 模式
 * 多行文本输入，支持手动拉伸
 */
export const TextareaMode: Story = {
  render: () => (
    <div class="flex flex-col gap-6 w-80">
      <Cell label="基础 textarea">
        <Input
          inputType="textarea"
          placeholder="请输入多行文本..."
        />
      </Cell>
      <Cell label="指定行数 (5行)">
        <Input
          inputType="textarea"
          rows={5}
          placeholder="5 行高度"
        />
      </Cell>
      <Cell label="字数统计">
        <Input
          inputType="textarea"
          showCount
          maxLength={200}
          placeholder="限制 200 字"
        />
      </Cell>
      <Cell label="不同尺寸">
        <div class="flex flex-col gap-2">
          <Input
            inputType="textarea"
            size="sm"
            placeholder="sm"
            rows={2}
          />
          <Input
            inputType="textarea"
            size="md"
            placeholder="md"
            rows={2}
          />
          <Input
            inputType="textarea"
            size="lg"
            placeholder="lg"
            rows={2}
          />
        </div>
      </Cell>
    </div>
  ),
}

/**
 * ## Number 模式
 * 数字输入，支持增减按钮
 */
export const NumberMode: Story = {
  render: () => {
    const [value, setValue] = createSignal('10')
    return (
      <div class="flex flex-col gap-6 w-64">
        <Cell label="基础数字输入">
          <Input
            inputType="number"
            placeholder="请输入数字"
          />
        </Cell>
        <Cell label="带增减按钮">
          <Input
            inputType="number"
            showControls
            defaultValue="5"
          />
        </Cell>
        <Cell label="设置范围 (0-100)">
          <Input
            inputType="number"
            showControls
            min={0}
            max={100}
            defaultValue="50"
          />
        </Cell>
        <Cell label="设置步长 (step=5)">
          <Input
            inputType="number"
            showControls
            step={5}
            min={0}
            max={100}
            defaultValue="25"
          />
        </Cell>
        <Cell label="受控模式">
          <Input
            inputType="number"
            showControls
            value={value()}
            onInput={setValue}
            min={0}
            max={99}
          />
          <span class="text-xs text-muted-foreground mt-1">
            当前值: {value()}
          </span>
        </Cell>
      </div>
    )
  },
}

/**
 * ## 表单示例
 * 与 Label 配合使用的表单场景
 */
export const FormExample: Story = {
  render: () => {
    const [form, setForm] = createSignal({
      username: '',
      email: '',
      password: '',
      bio: '',
      age: '18',
    })
    const update = (field: keyof ReturnType<typeof form>) => (v: string) =>
      setForm((prev) => ({...prev, [field]: v}))

    return (
      <div class="flex flex-col gap-4 w-72">
        <div class="flex flex-col gap-1.5">
          <Label
            for="username"
            required
          >
            用户名
          </Label>
          <Input
            id="username"
            value={form().username}
            onInput={update('username')}
            placeholder="请输入用户名"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label
            for="email"
            required
          >
            邮箱
          </Label>
          <Input
            id="email"
            type="email"
            prefix={<Mail class="size-3.5" />}
            value={form().email}
            onInput={update('email')}
            placeholder="请输入邮箱"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label
            for="password"
            required
          >
            密码
          </Label>
          <Input
            id="password"
            type="password"
            value={form().password}
            onInput={update('password')}
            placeholder="请输入密码"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="age">年龄</Label>
          <Input
            id="age"
            inputType="number"
            showControls
            min={1}
            max={150}
            value={form().age}
            onInput={update('age')}
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="bio">个人简介</Label>
          <Input
            id="bio"
            inputType="textarea"
            showCount
            maxLength={100}
            rows={3}
            value={form().bio}
            onInput={update('bio')}
            placeholder="介绍一下自己..."
          />
        </div>
      </div>
    )
  },
}
