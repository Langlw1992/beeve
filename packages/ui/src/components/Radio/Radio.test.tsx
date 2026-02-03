/**
 * Radio 组件测试
 */

import {describe, it, expect, vi} from 'vitest'
import {render, screen, fireEvent, waitFor} from '@solidjs/testing-library'
import {createSignal} from 'solid-js'
import {Radio, RadioGroup} from './Radio'

describe('Radio', () => {
  // ==================== 渲染测试 ====================
  describe('渲染', () => {
    it('应该正确渲染 radio 元素', () => {
      render(() => <Radio value="test" />)
      expect(screen.getByRole('radio')).toBeInTheDocument()
    })

    it('应该渲染标签内容', () => {
      render(() => <Radio value="test">选项一</Radio>)
      expect(screen.getByText('选项一')).toBeInTheDocument()
    })

    it('没有标签时不应该渲染标签容器', () => {
      render(() => <Radio value="test" />)
      const labels = document.querySelectorAll('label span')
      // 只有 control 和 indicator span
      expect(labels.length).toBe(2)
    })
  })

  // ==================== 尺寸测试 ====================
  describe('尺寸 (size)', () => {
    it('默认尺寸应该是 md', () => {
      render(() => <Radio value="test">测试</Radio>)
      const control = document.querySelector('[data-state]')
      expect(control?.className).toContain('size-5')
    })

    it('应该支持 sm 尺寸', () => {
      render(() => (
        <Radio
          size="sm"
          value="test"
        >
          测试
        </Radio>
      ))
      const control = document.querySelector('[data-state]')
      expect(control?.className).toContain('size-4')
    })

    it('应该支持 lg 尺寸', () => {
      render(() => (
        <Radio
          size="lg"
          value="test"
        >
          测试
        </Radio>
      ))
      const control = document.querySelector('[data-state]')
      expect(control?.className).toContain('size-6')
    })
  })

  // ==================== 状态测试 ====================
  describe('状态', () => {
    it('默认应该是未选中状态', () => {
      render(() => <Radio value="test" />)
      const radio = screen.getByRole('radio')
      expect(radio).not.toBeChecked()
    })

    it('checked 为 true 时应该是选中状态', () => {
      render(() => (
        <Radio
          value="test"
          checked
        />
      ))
      const radio = screen.getByRole('radio')
      expect(radio).toBeChecked()
    })

    it('选中状态应该有正确的 data-state', () => {
      render(() => (
        <Radio
          value="test"
          checked
        />
      ))
      const control = document.querySelector('[data-state="checked"]')
      expect(control).toBeInTheDocument()
    })
  })

  // ==================== 禁用状态测试 ====================
  describe('禁用状态', () => {
    it('disabled 时 radio 应该被禁用', () => {
      render(() => (
        <Radio
          value="test"
          disabled
        />
      ))
      expect(screen.getByRole('radio')).toBeDisabled()
    })

    it('disabled 时应该有禁用样式', () => {
      render(() => (
        <Radio
          value="test"
          disabled
        >
          禁用
        </Radio>
      ))
      const label = document.querySelector('label')
      expect(label?.className).toContain('opacity-50')
    })

    it('disabled 时不应该响应点击', async () => {
      const handleChange = vi.fn()
      render(() => (
        <Radio
          value="test"
          disabled
          onChange={handleChange}
        />
      ))

      await fireEvent.click(screen.getByRole('radio'))

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  // ==================== 交互测试 ====================
  describe('交互', () => {
    it('点击时应该触发 onChange 回调', async () => {
      const handleChange = vi.fn()
      render(() => (
        <Radio
          value="test"
          onChange={handleChange}
        />
      ))

      await fireEvent.click(screen.getByRole('radio'))

      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('点击标签也应该触发选中', async () => {
      const handleChange = vi.fn()
      render(() => (
        <Radio
          value="test"
          onChange={handleChange}
        >
          点击我
        </Radio>
      ))

      await fireEvent.click(screen.getByText('点击我'))

      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  // ==================== 属性透传测试 ====================
  describe('属性透传', () => {
    it('应该支持 id 属性', () => {
      render(() => (
        <Radio
          value="test"
          id="my-radio"
        />
      ))
      expect(screen.getByRole('radio')).toHaveAttribute('id', 'my-radio')
    })

    it('应该支持 name 属性', () => {
      render(() => (
        <Radio
          value="test"
          name="options"
        />
      ))
      expect(screen.getByRole('radio')).toHaveAttribute('name', 'options')
    })

    it('应该支持 value 属性', () => {
      render(() => <Radio value="option1" />)
      expect(screen.getByRole('radio')).toHaveAttribute('value', 'option1')
    })
  })

  // ==================== 样式定制测试 ====================
  describe('样式定制', () => {
    it('应该支持自定义 class', () => {
      render(() => (
        <Radio
          value="test"
          class="custom-radio"
        />
      ))
      const label = document.querySelector('label')
      expect(label).toHaveClass('custom-radio')
    })
  })
})

describe('RadioGroup', () => {
  // ==================== 渲染测试 ====================
  describe('渲染', () => {
    it('应该正确渲染 radiogroup', () => {
      render(() => (
        <RadioGroup name="test">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      ))
      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
      expect(screen.getAllByRole('radio')).toHaveLength(2)
    })

    it('所有 radio 应该共享同一个 name', () => {
      render(() => (
        <RadioGroup name="fruit">
          <Radio value="apple">苹果</Radio>
          <Radio value="banana">香蕉</Radio>
        </RadioGroup>
      ))
      const radios = screen.getAllByRole('radio')
      for (const radio of radios) {
        expect(radio).toHaveAttribute('name', 'fruit')
      }
    })
  })

  // ==================== 受控模式测试 ====================
  describe('受控模式', () => {
    it('应该正确设置初始选中值', () => {
      render(() => (
        <RadioGroup
          name="test"
          value="b"
        >
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      ))
      const radios = screen.getAllByRole('radio')
      expect(radios[0]).not.toBeChecked()
      expect(radios[1]).toBeChecked()
    })

    it('点击时应该触发 onChange', async () => {
      const handleChange = vi.fn()
      render(() => (
        <RadioGroup
          name="test"
          value="a"
          onChange={handleChange}
        >
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      ))

      await fireEvent.click(screen.getAllByRole('radio')[1])

      expect(handleChange).toHaveBeenCalledWith('b')
    })

    it('受控模式下应该响应外部值变化', async () => {
      const [value, setValue] = createSignal('a')

      render(() => (
        <RadioGroup
          name="test"
          value={value()}
          onChange={setValue}
        >
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      ))

      const radios = screen.getAllByRole('radio')
      expect(radios[0]).toBeChecked()

      setValue('b')

      await waitFor(() => {
        expect(radios[1]).toBeChecked()
      })
    })
  })

  // ==================== 非受控模式测试 ====================
  describe('非受控模式', () => {
    it('defaultValue 应该设置初始选中值', () => {
      render(() => (
        <RadioGroup
          name="test"
          defaultValue="b"
        >
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      ))
      const radios = screen.getAllByRole('radio')
      expect(radios[0]).not.toBeChecked()
      expect(radios[1]).toBeChecked()
    })
  })

  // ==================== 禁用状态测试 ====================
  describe('禁用状态', () => {
    it('disabled 时所有 radio 应该被禁用', () => {
      render(() => (
        <RadioGroup
          name="test"
          disabled
        >
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      ))
      const radios = screen.getAllByRole('radio')
      for (const radio of radios) {
        expect(radio).toBeDisabled()
      }
    })

    it('disabled 时不应该响应点击', async () => {
      const handleChange = vi.fn()
      render(() => (
        <RadioGroup
          name="test"
          disabled
          onChange={handleChange}
        >
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      ))

      await fireEvent.click(screen.getAllByRole('radio')[0])

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  // ==================== 尺寸继承测试 ====================
  describe('尺寸继承', () => {
    it('Radio 应该继承 RadioGroup 的尺寸', () => {
      render(() => (
        <RadioGroup
          name="test"
          size="lg"
        >
          <Radio value="a">A</Radio>
        </RadioGroup>
      ))
      const control = document.querySelector('[data-state]')
      expect(control?.className).toContain('size-6')
    })

    it('Radio 自身的尺寸应该覆盖 RadioGroup 的尺寸', () => {
      render(() => (
        <RadioGroup
          name="test"
          size="lg"
        >
          <Radio
            value="a"
            size="sm"
          >
            A
          </Radio>
        </RadioGroup>
      ))
      const control = document.querySelector('[data-state]')
      expect(control?.className).toContain('size-4')
    })
  })
})
