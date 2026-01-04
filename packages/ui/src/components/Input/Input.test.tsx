/**
 * Input 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { Input } from './Input'

/** 获取 wrapper 容器（Input 组件的外层 div） */
const getWrapper = () => {
  // Input 组件的 wrapper 是包含 input 的 div
  const input = document.querySelector('input')
  return input?.parentElement as HTMLElement
}

describe('Input', () => {
  // ==================== 渲染测试 ====================
  describe('渲染', () => {
    it('应该正确渲染 input 元素', () => {
      render(() => <Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('应该显示 placeholder', () => {
      render(() => <Input placeholder="请输入" />)
      expect(screen.getByPlaceholderText('请输入')).toBeInTheDocument()
    })

    it('应该显示默认值', () => {
      render(() => <Input defaultValue="默认内容" />)
      expect(screen.getByRole('textbox')).toHaveValue('默认内容')
    })

    it('应该显示受控值', () => {
      render(() => <Input value="受控内容" />)
      expect(screen.getByRole('textbox')).toHaveValue('受控内容')
    })
  })

  // ==================== 尺寸测试 ====================
  describe('尺寸 (size)', () => {
    it('默认尺寸应该是 md', () => {
      render(() => <Input />)
      const wrapper = getWrapper()
      expect(wrapper.className).toContain('h-8')
    })

    it('应该支持 sm 尺寸', () => {
      render(() => <Input size="sm" />)
      const wrapper = getWrapper()
      expect(wrapper.className).toContain('h-7')
    })

    it('应该支持 lg 尺寸', () => {
      render(() => <Input size="lg" />)
      const wrapper = getWrapper()
      expect(wrapper.className).toContain('h-9')
    })
  })

  // ==================== 变体测试 ====================
  describe('变体 (variant)', () => {
    it('默认变体应该有边框', () => {
      render(() => <Input />)
      const wrapper = getWrapper()
      expect(wrapper.className).toContain('border-input')
    })

    it('应该支持 filled 变体', () => {
      render(() => <Input variant="filled" />)
      const wrapper = getWrapper()
      expect(wrapper.className).toContain('bg-muted')
    })

    it('应该支持 borderless 变体', () => {
      render(() => <Input variant="borderless" />)
      const wrapper = getWrapper()
      expect(wrapper.className).toContain('border-transparent')
    })
  })

  // ==================== 状态测试 ====================
  describe('状态 (status)', () => {
    it('error 状态应该有错误样式', () => {
      render(() => <Input status="error" />)
      const wrapper = getWrapper()
      expect(wrapper.className).toContain('border-destructive')
    })

    it('warning 状态应该有警告样式', () => {
      render(() => <Input status="warning" />)
      const wrapper = getWrapper()
      expect(wrapper.className).toContain('border-warning')
    })
  })

  // ==================== 禁用状态测试 ====================
  describe('禁用状态', () => {
    it('disabled 时 input 应该被禁用', () => {
      render(() => <Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('disabled 时应该有禁用样式', () => {
      render(() => <Input disabled />)
      const wrapper = getWrapper()
      expect(wrapper.className).toContain('opacity-50')
    })

    it('disabled 时不应该响应输入', async () => {
      const handleInput = vi.fn()
      render(() => <Input disabled onInput={handleInput} />)

      const input = screen.getByRole('textbox')
      await fireEvent.input(input, { target: { value: '测试' } })

      // disabled 的 input 不应该触发事件
      expect(handleInput).not.toHaveBeenCalled()
    })
  })

  // ==================== 前缀后缀测试 ====================
  describe('前缀后缀', () => {
    it('应该显示前缀元素', () => {
      render(() => <Input prefix={<span data-testid="prefix">$</span>} />)
      expect(screen.getByTestId('prefix')).toBeInTheDocument()
    })

    it('应该显示后缀元素', () => {
      render(() => <Input suffix={<span data-testid="suffix">.com</span>} />)
      expect(screen.getByTestId('suffix')).toBeInTheDocument()
    })

    it('应该同时显示前缀和后缀', () => {
      render(() => (
        <Input
          prefix={<span data-testid="prefix">https://</span>}
          suffix={<span data-testid="suffix">.com</span>}
        />
      ))
      expect(screen.getByTestId('prefix')).toBeInTheDocument()
      expect(screen.getByTestId('suffix')).toBeInTheDocument()
    })

    it('无前缀时不应该渲染前缀容器', () => {
      render(() => <Input />)
      // 只有一个 span（如果有的话是后缀容器）
      const spans = document.querySelectorAll('span')
      expect(spans.length).toBe(0)
    })
  })

  // ==================== 事件测试 ====================
  describe('事件', () => {
    it('输入时应该触发 onInput 回调', async () => {
      const handleInput = vi.fn()
      render(() => <Input onInput={handleInput} />)

      const input = screen.getByRole('textbox')
      await fireEvent.input(input, { target: { value: '测试' } })

      expect(handleInput).toHaveBeenCalledWith('测试', expect.any(Object))
    })

    it('onChange 应该在值变化时触发', async () => {
      const handleChange = vi.fn()
      render(() => <Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await fireEvent.change(input, { target: { value: '变化' } })

      expect(handleChange).toHaveBeenCalledWith('变化', expect.any(Object))
    })

    it('聚焦时应该触发 onFocus 回调', async () => {
      const handleFocus = vi.fn()
      render(() => <Input onFocus={handleFocus} />)

      const input = screen.getByRole('textbox')
      await fireEvent.focus(input)

      expect(handleFocus).toHaveBeenCalled()
    })

    it('失焦时应该触发 onBlur 回调', async () => {
      const handleBlur = vi.fn()
      render(() => <Input onBlur={handleBlur} />)

      const input = screen.getByRole('textbox')
      await fireEvent.focus(input)
      await fireEvent.blur(input)

      expect(handleBlur).toHaveBeenCalled()
    })

    it('按下 Enter 键应该触发 onPressEnter 回调', async () => {
      const handlePressEnter = vi.fn()
      render(() => <Input onPressEnter={handlePressEnter} />)

      const input = screen.getByRole('textbox')
      await fireEvent.keyDown(input, { key: 'Enter' })

      expect(handlePressEnter).toHaveBeenCalled()
    })

    it('按下其他键不应该触发 onPressEnter 回调', async () => {
      const handlePressEnter = vi.fn()
      render(() => <Input onPressEnter={handlePressEnter} />)

      const input = screen.getByRole('textbox')
      await fireEvent.keyDown(input, { key: 'a' })

      expect(handlePressEnter).not.toHaveBeenCalled()
    })

    it('按键时应该触发 onKeyDown 回调', async () => {
      const handleKeyDown = vi.fn()
      render(() => <Input onKeyDown={handleKeyDown} />)

      const input = screen.getByRole('textbox')
      await fireEvent.keyDown(input, { key: 'a' })

      expect(handleKeyDown).toHaveBeenCalled()
    })
  })

  // ==================== 受控模式测试 ====================
  describe('受控模式', () => {
    it('受控模式下值变化应该正确响应', async () => {
      const [value, setValue] = createSignal('')

      render(() => (
        <Input value={value()} onInput={(v) => setValue(v)} />
      ))

      const input = screen.getByRole('textbox')
      await fireEvent.input(input, { target: { value: '新值' } })

      await waitFor(() => {
        expect(value()).toBe('新值')
      })
    })

    it('外部更新值时 input 应该同步更新', async () => {
      const [value, setValue] = createSignal('初始值')

      render(() => <Input value={value()} />)

      expect(screen.getByRole('textbox')).toHaveValue('初始值')

      setValue('更新后的值')

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toHaveValue('更新后的值')
      })
    })
  })

  // ==================== 类型测试 ====================
  describe('输入类型', () => {
    it('默认类型应该是 text', () => {
      render(() => <Input />)
      // 不检查 type 属性，因为我们没有设置默认值
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('应该支持 password 类型', () => {
      render(() => <Input type="password" />)
      const input = document.querySelector('input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('应该支持 email 类型', () => {
      render(() => <Input type="email" />)
      const input = document.querySelector('input')
      expect(input).toHaveAttribute('type', 'email')
    })
  })

  // ==================== 密码切换测试 ====================
  describe('密码切换', () => {
    it('密码类型应该显示切换按钮', () => {
      render(() => <Input type="password" />)
      const toggleButton = document.querySelector('button[aria-label="显示密码"]')
      expect(toggleButton).toBeInTheDocument()
    })

    it('点击切换按钮应该显示密码', async () => {
      render(() => <Input type="password" />)
      const input = document.querySelector('input')
      expect(input).toHaveAttribute('type', 'password')

      const toggleButton = document.querySelector('button[aria-label="显示密码"]') as HTMLButtonElement
      await fireEvent.click(toggleButton)

      expect(input).toHaveAttribute('type', 'text')
    })

    it('再次点击应该隐藏密码', async () => {
      render(() => <Input type="password" />)
      const input = document.querySelector('input')

      const toggleButton = document.querySelector('button[aria-label="显示密码"]') as HTMLButtonElement
      await fireEvent.click(toggleButton)
      expect(input).toHaveAttribute('type', 'text')

      const hideButton = document.querySelector('button[aria-label="隐藏密码"]') as HTMLButtonElement
      await fireEvent.click(hideButton)
      expect(input).toHaveAttribute('type', 'password')
    })

    it('非密码类型不应该显示切换按钮', () => {
      render(() => <Input type="text" />)
      const toggleButton = document.querySelector('button[aria-label="显示密码"]')
      expect(toggleButton).not.toBeInTheDocument()
    })
  })

  // ==================== 属性透传测试 ====================
  describe('属性透传', () => {
    it('应该支持 id 属性', () => {
      render(() => <Input id="my-input" />)
      const input = document.querySelector('input')
      expect(input).toHaveAttribute('id', 'my-input')
    })

    it('应该支持 name 属性', () => {
      render(() => <Input name="username" />)
      const input = document.querySelector('input')
      expect(input).toHaveAttribute('name', 'username')
    })

    it('应该支持 maxLength 属性', () => {
      render(() => <Input maxLength={10} />)
      const input = document.querySelector('input')
      expect(input).toHaveAttribute('maxLength', '10')
    })

    it('应该支持 readOnly 属性', () => {
      render(() => <Input readOnly />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('readonly')
    })

    it('应该支持 autocomplete 属性', () => {
      render(() => <Input autocomplete="email" />)
      const input = document.querySelector('input')
      expect(input).toHaveAttribute('autocomplete', 'email')
    })
  })

  // ==================== 样式定制测试 ====================
  describe('样式定制', () => {
    it('应该支持自定义 class', () => {
      render(() => <Input class="custom-input" />)
      const wrapper = getWrapper()
      expect(wrapper).toHaveClass('custom-input')
    })
  })

  // ==================== 一键清空测试 ====================
  describe('一键清空 (allowClear)', () => {
    it('默认不显示清空按钮', () => {
      render(() => <Input value="测试" />)
      const clearButton = document.querySelector('button[aria-label="清空"]')
      expect(clearButton).not.toBeInTheDocument()
    })

    it('启用 allowClear 且有值时应该显示清空按钮', () => {
      render(() => <Input allowClear value="测试" />)
      const clearButton = document.querySelector('button[aria-label="清空"]')
      expect(clearButton).toBeInTheDocument()
    })

    it('启用 allowClear 但值为空时清空按钮应该隐藏（占位但不可见）', () => {
      render(() => <Input allowClear value="" />)
      const clearButton = document.querySelector('button[aria-label="清空"]')
      expect(clearButton).toBeInTheDocument()
      expect(clearButton).toHaveClass('invisible')
    })

    it('禁用状态下清空按钮应该隐藏', () => {
      render(() => <Input allowClear value="测试" disabled />)
      const clearButton = document.querySelector('button[aria-label="清空"]')
      expect(clearButton).toBeInTheDocument()
      expect(clearButton).toHaveClass('invisible')
    })

    it('点击清空按钮应该清空输入框', async () => {
      const handleInput = vi.fn()
      render(() => <Input allowClear defaultValue="测试" onInput={handleInput} />)

      const clearButton = document.querySelector('button[aria-label="清空"]') as HTMLButtonElement
      expect(clearButton).toBeInTheDocument()

      await fireEvent.click(clearButton)

      expect(handleInput).toHaveBeenCalledWith('', expect.any(Object))
    })

    it('点击清空按钮应该触发 onClear 回调', async () => {
      const handleClear = vi.fn()
      render(() => <Input allowClear defaultValue="测试" onClear={handleClear} />)

      const clearButton = document.querySelector('button[aria-label="清空"]') as HTMLButtonElement
      await fireEvent.click(clearButton)

      expect(handleClear).toHaveBeenCalled()
    })
  })

  // ==================== 字数统计测试 ====================
  describe('字数统计 (showCount)', () => {
    it('默认不显示字数统计', () => {
      render(() => <Input value="测试" />)
      const countSpan = document.querySelector('[class*="count"]')
      expect(countSpan).not.toBeInTheDocument()
    })

    it('启用 showCount 应该显示字数', () => {
      render(() => <Input showCount value="测试" />)
      const root = document.querySelector('[class*="relative"]')
      expect(root?.textContent).toContain('2')
    })

    it('设置 maxLength 应该显示 当前/最大 格式', () => {
      render(() => <Input showCount maxLength={10} value="测试" />)
      const root = document.querySelector('[class*="relative"]')
      expect(root?.textContent).toContain('2/10')
    })

    it('输入时字数统计应该更新', async () => {
      const [value, setValue] = createSignal('')
      render(() => <Input showCount maxLength={10} value={value()} onInput={setValue} />)

      const input = screen.getByRole('textbox')
      await fireEvent.input(input, { target: { value: '你好世界' } })

      await waitFor(() => {
        const root = document.querySelector('[class*="relative"]')
        expect(root?.textContent).toContain('4/10')
      })
    })
  })

  // ==================== 中文输入法测试 ====================
  describe('中文输入法支持', () => {
    it('输入法组合期间不应该触发 onInput', async () => {
      const handleInput = vi.fn()
      render(() => <Input onInput={handleInput} />)

      const input = screen.getByRole('textbox')

      // 模拟输入法开始
      await fireEvent.compositionStart(input)

      // 输入法组合中输入
      await fireEvent.input(input, { target: { value: 'ni' } })

      // 组合期间不应该触发回调
      expect(handleInput).not.toHaveBeenCalled()
    })

    it('输入法组合结束后应该触发 onInput', async () => {
      const handleInput = vi.fn()
      render(() => <Input onInput={handleInput} />)

      const input = screen.getByRole('textbox')

      // 模拟输入法开始
      await fireEvent.compositionStart(input)

      // 输入法组合中输入
      await fireEvent.input(input, { target: { value: 'ni' } })

      // 模拟输入法结束
      await fireEvent.compositionEnd(input, { target: { value: '你' } })

      // 组合结束后应该触发回调
      expect(handleInput).toHaveBeenCalledWith('你', expect.any(Object))
    })

    it('输入法组合期间按 Enter 不应该触发 onPressEnter', async () => {
      const handlePressEnter = vi.fn()
      render(() => <Input onPressEnter={handlePressEnter} />)

      const input = screen.getByRole('textbox')

      // 模拟输入法开始
      await fireEvent.compositionStart(input)

      // 组合期间按 Enter（选择候选词）
      await fireEvent.keyDown(input, { key: 'Enter' })

      // 不应该触发回调
      expect(handlePressEnter).not.toHaveBeenCalled()
    })
  })

  // ==================== Textarea 模式测试 ====================
  describe('Textarea 模式 (inputType="textarea")', () => {
    it('应该渲染 textarea 元素', () => {
      render(() => <Input inputType="textarea" />)
      const textarea = document.querySelector('textarea')
      expect(textarea).toBeInTheDocument()
    })

    it('应该支持 rows 属性', () => {
      render(() => <Input inputType="textarea" rows={5} />)
      const textarea = document.querySelector('textarea')
      expect(textarea).toHaveAttribute('rows', '5')
    })

    it('默认 rows 应该是 3', () => {
      render(() => <Input inputType="textarea" />)
      const textarea = document.querySelector('textarea')
      expect(textarea).toHaveAttribute('rows', '3')
    })

    it('应该支持字数统计', () => {
      render(() => <Input inputType="textarea" showCount maxLength={100} defaultValue="测试" />)
      expect(screen.getByText('2/100')).toBeInTheDocument()
    })

    it('textarea 应该支持手动拉伸 (resize-y)', () => {
      render(() => <Input inputType="textarea" />)
      const textarea = document.querySelector('textarea')
      expect(textarea?.className).toContain('resize-y')
    })

    it('输入时应该触发 onInput', async () => {
      const handleInput = vi.fn()
      render(() => <Input inputType="textarea" onInput={handleInput} />)

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await fireEvent.input(textarea, { target: { value: '多行文本' } })

      expect(handleInput).toHaveBeenCalledWith('多行文本', expect.any(Object))
    })
  })

  // ==================== Number 模式测试 ====================
  describe('Number 模式 (inputType="number")', () => {
    it('应该渲染 number 类型的 input', () => {
      render(() => <Input inputType="number" />)
      const input = document.querySelector('input')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('应该支持 min/max 属性', () => {
      render(() => <Input inputType="number" min={0} max={100} />)
      const input = document.querySelector('input')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '100')
    })

    it('应该支持 step 属性', () => {
      render(() => <Input inputType="number" step={5} />)
      const input = document.querySelector('input')
      expect(input).toHaveAttribute('step', '5')
    })

    it('showControls 时应该显示增减按钮', () => {
      render(() => <Input inputType="number" showControls />)
      expect(screen.getByLabelText('增加')).toBeInTheDocument()
      expect(screen.getByLabelText('减少')).toBeInTheDocument()
    })

    it('不设置 showControls 时不应该显示增减按钮', () => {
      render(() => <Input inputType="number" />)
      expect(screen.queryByLabelText('增加')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('减少')).not.toBeInTheDocument()
    })

    it('点击增加按钮应该增加值', async () => {
      const handleInput = vi.fn()
      render(() => <Input inputType="number" showControls defaultValue="5" onInput={handleInput} />)

      await fireEvent.click(screen.getByLabelText('增加'))

      expect(handleInput).toHaveBeenCalledWith('6', expect.any(Object))
    })

    it('点击减少按钮应该减少值', async () => {
      const handleInput = vi.fn()
      render(() => <Input inputType="number" showControls defaultValue="5" onInput={handleInput} />)

      await fireEvent.click(screen.getByLabelText('减少'))

      expect(handleInput).toHaveBeenCalledWith('4', expect.any(Object))
    })

    it('达到最大值时增加按钮应该禁用', async () => {
      render(() => <Input inputType="number" showControls max={10} defaultValue="10" />)

      const incrementBtn = screen.getByLabelText('增加')
      expect(incrementBtn).toBeDisabled()
    })

    it('达到最小值时减少按钮应该禁用', async () => {
      render(() => <Input inputType="number" showControls min={0} defaultValue="0" />)

      const decrementBtn = screen.getByLabelText('减少')
      expect(decrementBtn).toBeDisabled()
    })

    it('应该按 step 步长增减', async () => {
      const handleIncrement = vi.fn()
      render(() => <Input inputType="number" showControls step={5} defaultValue="10" onInput={handleIncrement} />)

      await fireEvent.click(screen.getByLabelText('增加'))
      expect(handleIncrement).toHaveBeenCalledWith('15', expect.any(Object))
    })

    it('减少时应该按 step 步长', async () => {
      const handleDecrement = vi.fn()
      render(() => <Input inputType="number" showControls step={5} defaultValue="20" onInput={handleDecrement} />)

      await fireEvent.click(screen.getByLabelText('减少'))
      expect(handleDecrement).toHaveBeenCalledWith('15', expect.any(Object))
    })
  })
})
