/**
 * Switch 组件测试
 */

import {describe, it, expect, vi} from 'vitest'
import {render, screen, fireEvent, waitFor} from '@solidjs/testing-library'
import {createSignal} from 'solid-js'
import {Switch} from './Switch'

describe('Switch', () => {
  // ==================== 渲染测试 ====================
  describe('渲染', () => {
    it('应该正确渲染 switch 元素', () => {
      render(() => <Switch />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('应该渲染标签内容', () => {
      render(() => <Switch>启用通知</Switch>)
      expect(screen.getByText('启用通知')).toBeInTheDocument()
    })

    it('没有标签时不应该渲染标签容器', () => {
      render(() => <Switch />)
      const labels = document.querySelectorAll('label span')
      // 只有 track 和 thumb span
      expect(labels.length).toBe(2)
    })
  })

  // ==================== 尺寸测试 ====================
  describe('尺寸 (size)', () => {
    it('默认尺寸应该是 md', () => {
      render(() => <Switch>测试</Switch>)
      const track = document.querySelector('[data-state]')
      expect(track?.className).toContain('h-5')
    })

    it('应该支持 sm 尺寸', () => {
      render(() => <Switch size="sm">测试</Switch>)
      const track = document.querySelector('[data-state]')
      expect(track?.className).toContain('h-4')
    })

    it('应该支持 lg 尺寸', () => {
      render(() => <Switch size="lg">测试</Switch>)
      const track = document.querySelector('[data-state]')
      expect(track?.className).toContain('h-6')
    })
  })

  // ==================== 状态测试 ====================
  describe('状态', () => {
    it('默认应该是关闭状态', () => {
      render(() => <Switch />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).not.toBeChecked()
    })

    it('checked 为 true 时应该是开启状态', () => {
      render(() => <Switch checked />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toBeChecked()
    })

    it('defaultChecked 为 true 时应该默认开启', () => {
      render(() => <Switch defaultChecked />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toBeChecked()
    })

    it('开启状态应该有正确的 data-state', () => {
      render(() => <Switch checked />)
      const track = document.querySelector('[data-state="checked"]')
      expect(track).toBeInTheDocument()
    })

    it('关闭状态应该有正确的 data-state', () => {
      render(() => <Switch />)
      const track = document.querySelector('[data-state="unchecked"]')
      expect(track).toBeInTheDocument()
    })
  })

  // ==================== 禁用状态测试 ====================
  describe('禁用状态', () => {
    it('disabled 时 switch 应该被禁用', () => {
      render(() => <Switch disabled />)
      expect(screen.getByRole('switch')).toBeDisabled()
    })

    it('disabled 时应该有禁用样式', () => {
      render(() => <Switch disabled>禁用</Switch>)
      const label = document.querySelector('label')
      expect(label?.className).toContain('opacity-50')
    })

    it('disabled 时不应该响应点击', async () => {
      const handleChange = vi.fn()
      render(() => (
        <Switch
          disabled
          onChange={handleChange}
        />
      ))

      await fireEvent.click(screen.getByRole('switch'))

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  // ==================== 交互测试 ====================
  describe('交互', () => {
    it('点击时应该触发 onChange 回调', async () => {
      const handleChange = vi.fn()
      render(() => <Switch onChange={handleChange} />)

      await fireEvent.click(screen.getByRole('switch'))

      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('再次点击应该关闭', async () => {
      const handleChange = vi.fn()
      render(() => (
        <Switch
          checked
          onChange={handleChange}
        />
      ))

      await fireEvent.click(screen.getByRole('switch'))

      expect(handleChange).toHaveBeenCalledWith(false)
    })

    it('点击标签也应该触发状态切换', async () => {
      const handleChange = vi.fn()
      render(() => <Switch onChange={handleChange}>点击我</Switch>)

      await fireEvent.click(screen.getByText('点击我'))

      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  // ==================== 受控模式测试 ====================
  describe('受控模式', () => {
    it('受控模式下状态应该由外部控制', async () => {
      const [checked, setChecked] = createSignal(false)

      render(() => (
        <Switch
          checked={checked()}
          onChange={setChecked}
        />
      ))

      const switchEl = screen.getByRole('switch')
      expect(switchEl).not.toBeChecked()

      await fireEvent.click(switchEl)

      await waitFor(() => {
        expect(checked()).toBe(true)
        expect(switchEl).toBeChecked()
      })
    })
  })

  // ==================== 属性透传测试 ====================
  describe('属性透传', () => {
    it('应该支持 id 属性', () => {
      render(() => <Switch id="my-switch" />)
      expect(screen.getByRole('switch')).toHaveAttribute('id', 'my-switch')
    })

    it('应该支持 name 属性', () => {
      render(() => <Switch name="notifications" />)
      expect(screen.getByRole('switch')).toHaveAttribute(
        'name',
        'notifications',
      )
    })

    it('应该支持 value 属性', () => {
      render(() => <Switch value="yes" />)
      expect(screen.getByRole('switch')).toHaveAttribute('value', 'yes')
    })
  })

  // ==================== 样式定制测试 ====================
  describe('样式定制', () => {
    it('应该支持自定义 class', () => {
      render(() => <Switch class="custom-switch" />)
      const label = document.querySelector('label')
      expect(label).toHaveClass('custom-switch')
    })
  })

  // ==================== 无障碍测试 ====================
  describe('无障碍', () => {
    it('应该有正确的 aria-checked 属性', () => {
      render(() => <Switch checked />)
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    })

    it('关闭时 aria-checked 应该为 false', () => {
      render(() => <Switch />)
      expect(screen.getByRole('switch')).toHaveAttribute(
        'aria-checked',
        'false',
      )
    })
  })
})
