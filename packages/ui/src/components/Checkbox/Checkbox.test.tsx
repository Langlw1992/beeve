/**
 * Checkbox 组件测试
 */

import {describe, it, expect, vi} from 'vitest'
import {render, screen, fireEvent, waitFor} from '@solidjs/testing-library'
import {createSignal} from 'solid-js'
import {Checkbox} from './Checkbox'

describe('Checkbox', () => {
  // ==================== 渲染测试 ====================
  describe('渲染', () => {
    it('应该正确渲染 checkbox 元素', () => {
      render(() => <Checkbox />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('应该渲染标签内容', () => {
      render(() => <Checkbox>同意条款</Checkbox>)
      expect(screen.getByText('同意条款')).toBeInTheDocument()
    })

    it('没有标签时不应该渲染标签容器', () => {
      render(() => <Checkbox />)
      const labels = document.querySelectorAll('label span')
      // 只有 control span，没有 label span
      expect(labels.length).toBe(1)
    })
  })

  // ==================== 尺寸测试 ====================
  describe('尺寸 (size)', () => {
    it('默认尺寸应该是 md', () => {
      render(() => <Checkbox>测试</Checkbox>)
      const control = document.querySelector('[data-state]')
      expect(control?.className).toContain('size-5')
    })

    it('应该支持 sm 尺寸', () => {
      render(() => <Checkbox size="sm">测试</Checkbox>)
      const control = document.querySelector('[data-state]')
      expect(control?.className).toContain('size-4')
    })

    it('应该支持 lg 尺寸', () => {
      render(() => <Checkbox size="lg">测试</Checkbox>)
      const control = document.querySelector('[data-state]')
      expect(control?.className).toContain('size-6')
    })
  })

  // ==================== 状态测试 ====================
  describe('状态', () => {
    it('默认应该是未选中状态', () => {
      render(() => <Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('checked 为 true 时应该是选中状态', () => {
      render(() => <Checkbox checked />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('defaultChecked 为 true 时应该默认选中', () => {
      render(() => <Checkbox defaultChecked />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('indeterminate 状态应该正确设置', () => {
      render(() => <Checkbox indeterminate />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('选中状态应该显示勾选图标', () => {
      render(() => <Checkbox checked />)
      const control = document.querySelector('[data-state="checked"]')
      expect(control).toBeInTheDocument()
    })

    it('不确定状态应该显示横线图标', () => {
      render(() => <Checkbox indeterminate />)
      const control = document.querySelector('[data-state="indeterminate"]')
      expect(control).toBeInTheDocument()
    })
  })

  // ==================== 禁用状态测试 ====================
  describe('禁用状态', () => {
    it('disabled 时 checkbox 应该被禁用', () => {
      render(() => <Checkbox disabled />)
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })

    it('disabled 时应该有禁用样式', () => {
      render(() => <Checkbox disabled>禁用</Checkbox>)
      const label = document.querySelector('label')
      expect(label?.className).toContain('opacity-50')
    })

    it('disabled 时不应该响应点击', async () => {
      const handleChange = vi.fn()
      render(() => (
        <Checkbox
          disabled
          onChange={handleChange}
        />
      ))

      await fireEvent.click(screen.getByRole('checkbox'))

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  // ==================== 交互测试 ====================
  describe('交互', () => {
    it('点击时应该触发 onChange 回调', async () => {
      const handleChange = vi.fn()
      render(() => <Checkbox onChange={handleChange} />)

      await fireEvent.click(screen.getByRole('checkbox'))

      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('再次点击应该取消选中', async () => {
      const handleChange = vi.fn()
      render(() => (
        <Checkbox
          checked
          onChange={handleChange}
        />
      ))

      await fireEvent.click(screen.getByRole('checkbox'))

      expect(handleChange).toHaveBeenCalledWith(false)
    })

    it('点击标签也应该触发状态切换', async () => {
      const handleChange = vi.fn()
      render(() => <Checkbox onChange={handleChange}>点击我</Checkbox>)

      await fireEvent.click(screen.getByText('点击我'))

      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  // ==================== 受控模式测试 ====================
  describe('受控模式', () => {
    it('受控模式下状态应该由外部控制', async () => {
      const [checked, setChecked] = createSignal(false)

      render(() => (
        <Checkbox
          checked={checked()}
          onChange={setChecked}
        />
      ))

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()

      await fireEvent.click(checkbox)

      await waitFor(() => {
        expect(checked()).toBe(true)
        expect(checkbox).toBeChecked()
      })
    })
  })

  // ==================== 属性透传测试 ====================
  describe('属性透传', () => {
    it('应该支持 id 属性', () => {
      render(() => <Checkbox id="my-checkbox" />)
      expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'my-checkbox')
    })

    it('应该支持 name 属性', () => {
      render(() => <Checkbox name="agreement" />)
      expect(screen.getByRole('checkbox')).toHaveAttribute('name', 'agreement')
    })

    it('应该支持 value 属性', () => {
      render(() => <Checkbox value="yes" />)
      expect(screen.getByRole('checkbox')).toHaveAttribute('value', 'yes')
    })
  })

  // ==================== 样式定制测试 ====================
  describe('样式定制', () => {
    it('应该支持自定义 class', () => {
      render(() => <Checkbox class="custom-checkbox" />)
      const label = document.querySelector('label')
      expect(label).toHaveClass('custom-checkbox')
    })
  })
})
