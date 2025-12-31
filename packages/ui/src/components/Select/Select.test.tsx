/**
 * Select 组件测试
 * 遵循 TDD 原则，先编写测试用例
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { Select } from './Select'

const defaultOptions = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
  { label: '禁用项', value: 'disabled', disabled: true },
]

/** 获取 trigger 按钮（通过 data-part="trigger" 属性） */
const getTrigger = () => document.querySelector('[data-part="trigger"]') as HTMLElement

/** 获取 control 容器（通过 data-part="control" 属性） */
const getControl = () => document.querySelector('[data-part="control"]') as HTMLElement

describe('Select', () => {
  // ==================== 基础渲染测试 ====================
  describe('渲染', () => {
    it('应该正确渲染 Select 组件', () => {
      render(() => <Select options={defaultOptions} placeholder="请选择" />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('应该显示 placeholder', () => {
      render(() => <Select options={defaultOptions} placeholder="请选择水果" />)
      expect(screen.getByPlaceholderText('请选择水果')).toBeInTheDocument()
    })

    it('应该渲染触发按钮', () => {
      render(() => <Select options={defaultOptions} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  // ==================== 下拉展开测试 ====================
  // 注意：zag-js 状态机在 jsdom 环境中的事件处理有限制
  // 这些交互测试需要通过 Playwright e2e 测试来覆盖
  describe('下拉展开', () => {
    it.skip('点击后应该展开下拉列表 (需要 e2e 测试)', async () => {
      // zag-js 的状态机在 jsdom 中无法正确响应点击事件
    })

    it.skip('展开后应该显示所有选项 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })

    it.skip('禁用选项应该有 aria-disabled 属性 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })

    it.skip('应该触发 onOpenChange 回调 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })
  })

  // ==================== 选择功能测试 ====================
  // 注意：需要展开下拉列表的测试在 jsdom 中无法工作，需要 e2e 测试
  describe('选择', () => {
    it.skip('点击选项后应该选中并关闭下拉 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })

    it.skip('选中后应该显示选中的标签 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })

    it.skip('应该触发 onChange 回调 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })

    it.skip('应该触发 onSelect 回调 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })

    it.skip('禁用选项不应该被选中 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })
  })

  // ==================== 受控模式测试 ====================
  describe('受控模式', () => {
    it('value 属性应该控制选中值', async () => {
      render(() => <Select options={defaultOptions} value="banana" />)

      expect(screen.getByRole('combobox')).toHaveValue('香蕉')
    })

    it('受控模式下值变化应该正确响应', async () => {
      const [value, setValue] = createSignal<string | undefined>('apple')

      render(() => (
        <Select options={defaultOptions} value={value()} onChange={(v) => setValue(v as string)} />
      ))

      expect(screen.getByRole('combobox')).toHaveValue('苹果')

      setValue('orange')

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveValue('橙子')
      })
    })
  })

  // ==================== 清除功能测试 ====================
  describe('清除功能', () => {
    it('allowClear 时应该显示清除按钮', async () => {
      render(() => <Select options={defaultOptions} value="apple" allowClear />)

      // 清除按钮应该存在
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('点击清除按钮应该清空值', async () => {
      const handleChange = vi.fn()
      render(() => <Select options={defaultOptions} value="apple" allowClear onChange={handleChange} />)

      await fireEvent.click(screen.getByRole('button', { name: /clear/i }))

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(undefined, undefined)
      })
    })

    it('应该触发 onClear 回调', async () => {
      const handleClear = vi.fn()
      render(() => <Select options={defaultOptions} value="apple" allowClear onClear={handleClear} />)

      await fireEvent.click(screen.getByRole('button', { name: /clear/i }))

      await waitFor(() => {
        expect(handleClear).toHaveBeenCalled()
      })
    })

    it('无值时不应该显示清除按钮', () => {
      render(() => <Select options={defaultOptions} allowClear />)

      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    })

    it('清空后清除按钮应该消失', async () => {
      const [value, setValue] = createSignal<string | undefined>('apple')

      render(() => (
        <Select
          options={defaultOptions}
          value={value()}
          onChange={(v) => setValue(v as string | undefined)}
          allowClear
        />
      ))

      // 有值时应该显示清除按钮
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()

      // 点击清除按钮
      await fireEvent.click(screen.getByRole('button', { name: /clear/i }))

      // 清空后清除按钮应该消失
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
      })
    })

    it('disabled 时不应该显示清除按钮', () => {
      render(() => <Select options={defaultOptions} value="apple" allowClear disabled />)

      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    })
  })

  // ==================== 搜索功能测试 ====================
  describe('搜索功能', () => {
    it('showSearch 时输入框应该可编辑', () => {
      render(() => <Select options={defaultOptions} showSearch />)

      const input = screen.getByRole('combobox')
      expect(input).not.toHaveAttribute('readonly')
    })

    it.skip('输入时应该过滤选项 (需要 e2e 测试)', async () => {
      // zag-js 的 input 事件在 jsdom 中不完全工作
    })

    it.skip('应该触发 onSearch 回调 (需要 e2e 测试)', async () => {
      // zag-js 的 input 事件在 jsdom 中不完全工作
    })

    it.skip('filterOption=false 时不应该过滤选项 (需要 e2e 测试)', async () => {
      // zag-js 的 input 事件在 jsdom 中不完全工作
    })

    it.skip('自定义 filterOption 函数 (需要 e2e 测试)', async () => {
      // zag-js 的 input 事件在 jsdom 中不完全工作
    })
  })

  // ==================== 加载状态测试 ====================
  describe('加载状态', () => {
    it('loading 时应该显示加载指示器', () => {
      render(() => <Select options={defaultOptions} loading />)

      expect(screen.getByTestId('select-loading')).toBeInTheDocument()
    })

    it('loading 时仍然可以打开下拉菜单', async () => {
      render(() => <Select options={defaultOptions} loading />)

      await fireEvent.click(screen.getByRole('combobox'))

      // loading 状态下仍然可以打开下拉菜单
      await waitFor(() => {
        const listbox = screen.queryByRole('listbox')
        // 下拉菜单应该可以打开
        expect(listbox).toBeInTheDocument()
      })
    })
  })

  // ==================== 禁用状态测试 ====================
  describe('禁用状态', () => {
    it('disabled 时输入框应该被禁用', () => {
      render(() => <Select options={defaultOptions} disabled />)

      expect(screen.getByRole('combobox')).toBeDisabled()
    })

    it('disabled 时点击不应该展开下拉', async () => {
      render(() => <Select options={defaultOptions} disabled />)

      await fireEvent.click(screen.getByRole('combobox'))

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  // ==================== 多选模式测试 ====================
  // 注意：需要展开下拉列表的测试在 jsdom 中无法工作，需要 e2e 测试
  describe('多选模式', () => {
    it.skip('mode="multiple" 应该支持多选 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })

    it.skip('多选模式 onChange 应该返回数组 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })

    it.skip('多选模式应该触发 onDeselect (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })
  })

  // ==================== 尺寸测试 ====================
  describe('尺寸', () => {
    it('默认尺寸应该是 md', () => {
      render(() => <Select options={defaultOptions} />)
      const control = getControl()
      expect(control.className).toContain('h-8')
    })

    it('应该支持 sm 尺寸', () => {
      render(() => <Select options={defaultOptions} size="sm" />)
      const control = getControl()
      expect(control.className).toContain('h-7')
    })

    it('应该支持 lg 尺寸', () => {
      render(() => <Select options={defaultOptions} size="lg" />)
      const control = getControl()
      expect(control.className).toContain('h-9')
    })
  })

  // ==================== 变体测试 ====================
  describe('变体', () => {
    it('默认变体应该有边框', () => {
      render(() => <Select options={defaultOptions} />)
      const control = getControl()
      expect(control.className).toContain('border')
    })

    it('应该支持 borderless 变体', () => {
      render(() => <Select options={defaultOptions} variant="borderless" />)
      const control = getControl()
      expect(control.className).toContain('border-transparent')
    })
  })

  // ==================== 状态测试 ====================
  describe('状态', () => {
    it('error 状态应该有错误样式', () => {
      render(() => <Select options={defaultOptions} status="error" />)
      const control = getControl()
      expect(control.className).toContain('border-destructive')
    })

    it('warning 状态应该有警告样式', () => {
      render(() => <Select options={defaultOptions} status="warning" />)
      const control = getControl()
      expect(control.className).toContain('border-warning')
    })
  })

  // ==================== 附加数据测试 ====================
  describe('附加数据', () => {
    it.skip('onChange 应该返回完整的 option 对象包含 data (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })
  })

  // ==================== 无障碍测试 ====================
  describe('无障碍', () => {
    it('trigger 应该有正确的 aria 属性', () => {
      render(() => <Select options={defaultOptions} />)

      const trigger = getTrigger()
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('combobox 默认 aria-expanded 为 false', () => {
      render(() => <Select options={defaultOptions} />)

      const combobox = screen.getByRole('combobox')
      expect(combobox).toHaveAttribute('aria-expanded', 'false')
    })

    it.skip('展开时应该有 aria-expanded=true (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })

    it.skip('listbox 应该有正确的 role (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })
  })

  // ==================== 样式定制测试 ====================
  describe('样式定制', () => {
    it('应该支持自定义 class', () => {
      render(() => <Select options={defaultOptions} class="custom-select" />)
      // class 应用在 root 元素上
      const root = getControl().parentElement
      expect(root).toHaveClass('custom-select')
    })
  })

  // ==================== 空状态测试 ====================
  describe('空状态', () => {
    it.skip('无选项时应该显示空状态 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })

    it.skip('应该支持自定义空状态内容 (需要 e2e 测试)', async () => {
      // 需要先展开下拉列表
    })
  })
})

