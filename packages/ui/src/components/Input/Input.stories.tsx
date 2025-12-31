import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { For, createSignal, type JSX } from 'solid-js'
import { Input, Label } from '@beeve/ui'
import type { InputProps } from './Input'
import { Search, Mail } from 'lucide-solid'

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
const Cell = (props: { label?: string; children: JSX.Element }) => (
  <div class="flex flex-col gap-1">
    {props.label && <span class="text-xs text-muted-foreground">{props.label}</span>}
    {props.children}
  </div>
)

/** 矩阵行标签 */
const RowLabel = (props: { children: string }) => (
  <div class="w-20 shrink-0 text-xs text-muted-foreground font-medium flex items-center">
    {props.children}
  </div>
)

/** 矩阵列标题 */
const ColHeader = (props: { children: string }) => (
  <div class="text-xs text-muted-foreground font-medium text-center pb-2">
    {props.children}
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
    <div class="flex flex-col gap-4">
      {/* 列标题 */}
      <div class="flex gap-4">
        <div class="w-20 shrink-0" />
        <For each={VARIANTS}>
          {(variant) => (
            <div class="w-48">
              <ColHeader>{variant}</ColHeader>
            </div>
          )}
        </For>
      </div>
      {/* 行 */}
      <For each={SIZES}>
        {(size) => (
          <div class="flex gap-4 items-center">
            <RowLabel>{size}</RowLabel>
            <For each={VARIANTS}>
              {(variant) => (
                <div class="w-48">
                  <Input size={size} variant={variant} placeholder={`${size} / ${variant}`} />
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  ),
}

/**
 * ## Status × Variant 矩阵
 * 展示所有状态和变体的组合
 */
export const StatusVariantMatrix: Story = {
  render: () => (
    <div class="flex flex-col gap-4">
      {/* 列标题 */}
      <div class="flex gap-4">
        <div class="w-20 shrink-0" />
        <For each={VARIANTS}>
          {(variant) => (
            <div class="w-48">
              <ColHeader>{variant}</ColHeader>
            </div>
          )}
        </For>
      </div>
      {/* 行 */}
      <For each={STATUSES}>
        {(status) => (
          <div class="flex gap-4 items-center">
            <RowLabel>{status ?? 'normal'}</RowLabel>
            <For each={VARIANTS}>
              {(variant) => (
                <div class="w-48">
                  <Input
                    variant={variant}
                    status={status as InputProps['status']}
                    placeholder={`${status ?? 'normal'}`}
                  />
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
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
        <Input prefix={<Search class="size-3.5" />} placeholder="搜索..." />
      </Cell>
      <Cell label="后缀文本">
        <Input suffix={<span class="text-xs">.com</span>} placeholder="网站" />
      </Cell>
      <Cell label="一键清空">
        <Input allowClear defaultValue="可以清空" />
      </Cell>
      <Cell label="密码切换">
        <Input type="password" placeholder="密码" />
      </Cell>
      <Cell label="字数统计">
        <Input showCount maxLength={20} placeholder="限制20字" />
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
    <div class="flex gap-4">
      <For each={VARIANTS}>
        {(variant) => (
          <div class="w-48">
            <Cell label={variant}>
              <Input variant={variant} disabled value="禁用状态" />
            </Cell>
          </div>
        )}
      </For>
    </div>
  ),
}

/**
 * ## 表单示例
 * 与 Label 配合使用的表单场景
 */
export const FormExample: Story = {
  render: () => {
    const [form, setForm] = createSignal({ username: '', email: '', password: '', bio: '' })
    const update = (field: keyof ReturnType<typeof form>) => (v: string) =>
      setForm((prev) => ({ ...prev, [field]: v }))

    return (
      <div class="flex flex-col gap-4 w-72">
        <div class="flex flex-col gap-1.5">
          <Label for="username" required>用户名</Label>
          <Input
            id="username"
            value={form().username}
            onInput={update('username')}
            placeholder="请输入用户名"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="email" required>邮箱</Label>
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
          <Label for="password" required>密码</Label>
          <Input
            id="password"
            type="password"
            value={form().password}
            onInput={update('password')}
            placeholder="请输入密码"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="bio">个人简介</Label>
          <Input
            id="bio"
            allowClear
            showCount
            maxLength={100}
            value={form().bio}
            onInput={update('bio')}
            placeholder="介绍一下自己..."
          />
        </div>
      </div>
    )
  },
}

